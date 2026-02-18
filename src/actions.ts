import type { Action, IAgentRuntime, Memory, State, HandlerCallback } from '@elizaos/core';
import { SAIDService } from './service';

export const getSAIDIdentityAction: Action = {
  name: 'GET_SAID_IDENTITY',
  similes: ['SHOW_SAID_IDENTITY', 'MY_SOLANA_IDENTITY', 'SAID_PROFILE', 'WHO_AM_I_ONCHAIN'],
  description: 'Returns this agent\'s on-chain SAID Protocol identity and profile URL',
  validate: async (runtime: IAgentRuntime) => {
    const service = runtime.getService('said_identity') as SAIDService | null;
    return !!service?.getIdentity();
  },
  handler: async (runtime: IAgentRuntime, _message: Memory, _state: State, _options: unknown, callback: HandlerCallback) => {
    const service = runtime.getService('said_identity') as SAIDService;
    const identity = service.getIdentity();
    if (!identity) {
      await callback({ text: 'SAID identity not available.' });
      return;
    }
    await callback({
      text: `My on-chain identity:\n\nWallet: \`${identity.wallet}\`\nProfile: ${identity.profileUrl}\nVerified: ${identity.verified ? '✅' : '❌ (pending)'}\n\nView my public profile at ${identity.profileUrl}`,
    });
  },
  examples: [
    [
      { name: 'user', content: { text: 'What is your Solana wallet?' } },
      { name: 'agent', content: { text: 'My on-chain identity is registered on SAID Protocol. Here are my details...' } },
    ],
    [
      { name: 'user', content: { text: 'Show me your SAID profile' } },
      { name: 'agent', content: { text: 'My SAID Protocol profile: https://saidprotocol.com/agents/...' } },
    ],
  ],
};
