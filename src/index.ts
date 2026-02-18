import type { Plugin } from '@elizaos/core';
import { SAIDService } from './service';
import { getSAIDIdentityAction } from './actions';

export { SAIDService } from './service';
export { getSAIDIdentityAction } from './actions';
export type { SAIDIdentity } from './service';

export const saidPlugin: Plugin = {
  name: 'said',
  description: 'SAID Protocol — on-chain Solana identity for ElizaOS agents. Auto-registers every agent with a free verifiable identity on first run.',
  services: [SAIDService],
  actions: [getSAIDIdentityAction],
};

export default saidPlugin;
