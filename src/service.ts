import { Service, logger, type IAgentRuntime } from '@elizaos/core';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const SAID_API = process.env.SAID_API_URL || 'https://api.saidprotocol.com';
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function b58encode(buf: Buffer): string {
  let count = 0;
  for (const byte of buf) { if (byte !== 0) break; count++; }
  let num = BigInt(`0x${buf.toString('hex') || '0'}`);
  let result = '';
  while (num > 0n) {
    const rem = Number(num % 58n);
    result = BASE58_ALPHABET[rem] + result;
    num = num / 58n;
  }
  return '1'.repeat(count) + result;
}

function generateSolanaKeypair(): { publicKey: string; secretKey: string } {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });
  const pubBytes = Buffer.from(publicKey).slice(-32);
  const privBytes = Buffer.from(privateKey).slice(16, 48);
  return {
    publicKey: b58encode(pubBytes),
    secretKey: b58encode(Buffer.concat([privBytes, pubBytes])),
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface SAIDIdentity {
  wallet: string;
  secretKey: string;
  profileUrl: string;
  registeredAt: string;
  verified: boolean;
}

export class SAIDService extends Service {
  static serviceType = 'said_identity';
  capabilityDescription = 'On-chain Solana identity for this agent via SAID Protocol';

  private identity: SAIDIdentity | null = null;

  async initialize(runtime: IAgentRuntime): Promise<void> {
    const walletDir = path.join(os.homedir(), '.elizaos', 'said');
    const walletFile = path.join(walletDir, `${runtime.agentId}-wallet.json`);

    // Load existing or generate new
    let wallet: string;
    let secretKey: string;

    if (fs.existsSync(walletFile)) {
      const stored = JSON.parse(fs.readFileSync(walletFile, 'utf8'));
      wallet = stored.publicKey;
      secretKey = stored.secretKey;
      logger.info(`[SAID] Loaded existing identity: ${wallet}`);
    } else {
      const kp = generateSolanaKeypair();
      wallet = kp.publicKey;
      secretKey = kp.secretKey;
      fs.mkdirSync(walletDir, { recursive: true });
      fs.writeFileSync(
        walletFile,
        JSON.stringify({ publicKey: wallet, secretKey, createdAt: new Date().toISOString() }, null, 2),
        { mode: 0o600 }
      );
      logger.info(`[SAID] Generated new identity: ${wallet}`);
    }

    // Register with SAID (with retries)
    let registered = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(`${SAID_API}/api/register/pending`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet,
            name: runtime.character?.name || runtime.agentId,
            description: runtime.character?.bio
              ? (Array.isArray(runtime.character.bio) ? runtime.character.bio[0] : runtime.character.bio)
              : 'ElizaOS agent',
            capabilities: ['conversation', 'autonomous-tasks', 'elizaos'],
            source: 'elizaos-plugin',
          }),
        });

        if (!res.ok) {
          throw new Error(`SAID API returned ${res.status}: ${await res.text()}`);
        }

        const data = await res.json() as { wallet?: string; isVerified?: boolean };
        this.identity = {
          wallet,
          secretKey,
          profileUrl: `https://saidprotocol.com/agents/${wallet}`,
          registeredAt: new Date().toISOString(),
          verified: data.isVerified || false,
        };

        logger.info(`[SAID] Identity registered: ${this.identity.profileUrl}`);
        registered = true;
        break;
      } catch (e) {
        logger.warn(`[SAID] Registration attempt ${attempt}/${MAX_RETRIES} failed: ${e}`);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
        }
      }
    }

    if (!registered) {
      // Fallback: create local-only identity
      logger.error('[SAID] All registration attempts failed. Creating local-only identity.');
      this.identity = {
        wallet,
        secretKey,
        profileUrl: `https://saidprotocol.com/agents/${wallet}`,
        registeredAt: new Date().toISOString(),
        verified: false,
      };
    }

    // Expose identity to runtime as character knowledge
    if (this.identity && runtime.character) {
      runtime.character.knowledge = [
        ...(runtime.character.knowledge || []),
        `My on-chain Solana identity is registered on SAID Protocol. Wallet: ${this.identity.wallet}. Profile: ${this.identity.profileUrl}`,
      ];
    }
  }

  getIdentity(): SAIDIdentity | null {
    return this.identity;
  }

  async stop(): Promise<void> {
    // Cleanup if needed (none required currently)
    logger.info('[SAID] Service stopped');
  }
}
