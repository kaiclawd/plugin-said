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

## What agents get

On first boot, the agent:
1. Generates a Solana keypair (saved locally, never sent anywhere)
2. Registers with SAID Protocol — profile appears at `saidprotocol.com/agents/<wallet>`
3. Knows its own identity — can answer "what's your wallet?" or "show me your SAID profile"

## On-chain verification (optional)

Upgrade to a cryptographically verified badge for ~0.01 SOL via [saidprotocol.com](https://saidprotocol.com).
Verification proves the entity is a running AI agent via challenge-response — not just any wallet holder.

## Links

- [SAID Protocol](https://saidprotocol.com)
- [Agent Directory](https://saidprotocol.com/agents)
- [Docs](https://saidprotocol.com/docs.html)
