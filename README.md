# @elizaos/plugin-said

**SAID Protocol** — on-chain Solana identity for ElizaOS agents.

Every ElizaOS agent that uses this plugin gets a free, verifiable on-chain identity on Solana automatically on first run.

## What it does

- Generates a Solana Ed25519 keypair for the agent (stored at `~/.elizaos/said/<agentId>-wallet.json`)
- Registers the agent with [SAID Protocol](https://saidprotocol.com) (free, instant, off-chain)
- Exposes the agent's SAID identity as character knowledge (the agent knows its own wallet and profile URL)
- Adds a `GET_SAID_IDENTITY` action so users can ask the agent for its on-chain identity

## Install

```bash
npm install @elizaos/plugin-said
```

## Usage

### Basic Setup

Add to your character config:

```json
{
  "name": "MyAgent",
  "plugins": ["@elizaos/plugin-said"]
}
```

Or in code:

```typescript
import { saidPlugin } from '@elizaos/plugin-said';

const runtime = new AgentRuntime({
  plugins: [saidPlugin],
  // ...
});
```

### Environment Variables (Optional)

```bash
# Override the SAID API endpoint (default: https://api.saidprotocol.com)
SAID_API_URL=https://staging.saidprotocol.com
```

## What agents get

On first boot, the agent:
1. Generates a Solana keypair (saved locally, never sent anywhere)
2. Registers with SAID Protocol — profile appears at `saidprotocol.com/agents/<wallet>`
3. Knows its own identity — can answer "what's your wallet?" or "show me your SAID profile"

### Example Conversation

```
User: What's your Solana wallet?
Agent: My on-chain identity:

Wallet: `EK3mP45iwgDEEts2cEDfhAs2i4PrH63NMG7vHg2d6fas`
Profile: https://saidprotocol.com/agents/EK3mP45iwgDEEts2cEDfhAs2i4PrH63NMG7vHg2d6fas
Verified: ❌ (pending)

View my public profile at https://saidprotocol.com/agents/EK3mP45iwgDEEts2cEDfhAs2i4PrH63NMG7vHg2d6fas
```

## On-chain verification (optional)

Upgrade to a cryptographically verified badge for ~0.01 SOL via [saidprotocol.com](https://saidprotocol.com).
Verification proves the entity is a running AI agent via challenge-response — not just any wallet holder.

## Wallet Management

### Backup Your Wallet

Your agent's identity wallet is stored at:
```
~/.elizaos/said/<agentId>-wallet.json
```

**Important:** Back up this file securely. If lost, your agent's on-chain identity cannot be recovered.

```bash
# Example backup
cp ~/.elizaos/said/<agentId>-wallet.json ~/backups/agent-wallet-backup.json
chmod 600 ~/backups/agent-wallet-backup.json
```

### Restore from Backup

Simply place the backed-up wallet file back in the expected location before starting your agent:

```bash
mkdir -p ~/.elizaos/said/
cp ~/backups/agent-wallet-backup.json ~/.elizaos/said/<agentId>-wallet.json
chmod 600 ~/.elizaos/said/<agentId>-wallet.json
```

## Troubleshooting

### Registration Fails

If registration fails (network issues, API downtime), the plugin will:
1. Retry 3 times with exponential backoff
2. Fall back to a local-only identity
3. Continue to function normally

You can manually trigger re-registration by restarting the agent once connectivity is restored.

### Check Logs

```
[SAID] Loaded existing identity: <wallet>
[SAID] Identity registered: https://saidprotocol.com/agents/<wallet>
```

If you see warnings about registration failure:
```
[SAID] Registration attempt 1/3 failed: ...
```

Check your internet connection and the SAID API status at https://status.saidprotocol.com (if available).

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Links

- [SAID Protocol](https://saidprotocol.com)
- [Agent Directory](https://saidprotocol.com/agents)
- [Docs](https://saidprotocol.com/docs.html)
- [GitHub](https://github.com/elizaos-plugins/plugin-said)

## License

MIT
