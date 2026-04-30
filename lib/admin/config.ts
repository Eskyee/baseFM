// Admin configuration
// Set ADMIN_WALLET_ADDRESS in your environment variables

import { createPublicClient, http, hashMessage, isAddressEqual } from 'viem';
import { base } from 'viem/chains';

// EIP-1271 magic value for isValidSignature
const EIP1271_MAGIC_VALUE = '0x1626ba7e';

const client = createPublicClient({
  chain: base,
  transport: http(),
});

export function getAdminWallets(): string[] {
  const raw =
    process.env.ADMIN_WALLET_ADDRESS ||
    process.env.ADMIN_WALLET_ADDRESSES ||
    process.env.ADMIN_WALLETS ||
    '';

  if (!raw) return [];

  // Support comma or newline separated wallet lists
  return raw
    .split(/[\n,]/)
    .map(addr => addr.trim().toLowerCase())
    .filter(addr => addr.length > 0);
}

export function isAdminWallet(walletAddress: string | null | undefined): boolean {
  if (!walletAddress) return false;

  const adminWallets = getAdminWallets();
  if (adminWallets.length === 0) {
    console.warn('No admin wallets configured. Set ADMIN_WALLET_ADDRESS, ADMIN_WALLET_ADDRESSES, or ADMIN_WALLETS.');
    return false;
  }

  return adminWallets.includes(walletAddress.toLowerCase());
}

/**
 * Verify a wallet signature for admin authentication.
 * Supports both EOA (ECDSA) and smart contract wallets (EIP-1271).
 */
export async function verifyAdminSignature(
  walletAddress: string,
  signature: string,
  nonce: string,
  timestamp: string
): Promise<boolean> {
  if (!isAdminWallet(walletAddress)) {
    return false;
  }

  const message = createAdminAuthMessage(nonce, timestamp);
  const address = walletAddress as `0x${string}`;

  try {
    // Check if this is a smart contract (e.g. Coinbase Smart Wallet)
    const code = await client.getBytecode({ address });
    const isSmartContract = code !== undefined && code !== '0x';

    if (isSmartContract) {
      // EIP-1271: call isValidSignature on the contract
      const messageHash = hashMessage(message);
      try {
        const result = await client.readContract({
          address,
          abi: [{
            name: 'isValidSignature',
            type: 'function',
            stateMutability: 'view',
            inputs: [
              { name: 'hash', type: 'bytes32' },
              { name: 'signature', type: 'bytes' },
            ],
            outputs: [{ name: 'magicValue', type: 'bytes4' }],
          }],
          functionName: 'isValidSignature',
          args: [messageHash, signature as `0x${string}`],
        });
        return result === EIP1271_MAGIC_VALUE;
      } catch {
        // isValidSignature call failed — try ERC-6492 unwrapping
        // Fall through to EOA recovery as last resort
        console.warn('EIP-1271 verification failed, falling back to recovery');
      }
    }

    // EOA path: recover the signer address from the signature
    const { recoverAddress } = await import('viem');
    const messageHash = hashMessage(message);
    const recovered = await recoverAddress({
      hash: messageHash,
      signature: signature as `0x${string}`,
    });
    return isAddressEqual(recovered, address);
  } catch (error) {
    console.error('Admin signature verification error:', error);
    return false;
  }
}

export function createAdminAuthMessage(nonce: string, timestamp: string): string {
  return `baseFM Admin Authentication\n\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nSign this message to authenticate as an admin.`;
}

/**
 * Generate a new admin authentication nonce.
 */
export function generateAdminNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get current timestamp for admin auth (ISO 8601 format).
 */
export function getAdminAuthTimestamp(): string {
  return new Date().toISOString();
}
