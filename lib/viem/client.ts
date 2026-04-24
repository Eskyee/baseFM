import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Public client for reading from Base mainnet.
// Used for contract reads (token gating, etc.) and for verifying wallet
// signatures that require an on-chain call (EIP-1271 smart-contract wallets,
// ERC-6492 counterfactual signatures from Coinbase Smart Wallet, etc.).
export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
});
