// Admin configuration
// Set ADMIN_WALLET_ADDRESS in your environment variables

import { verifyMessage } from 'viem';

export function getAdminWallets(): string[] {
  const adminWallet = process.env.ADMIN_WALLET_ADDRESS;
  if (!adminWallet) return [];

  // Support multiple admin wallets separated by comma
  return adminWallet
    .split(',')
    .map(addr => addr.trim().toLowerCase())
    .filter(addr => addr.length > 0);
}

export function isAdminWallet(walletAddress: string | null | undefined): boolean {
  if (!walletAddress) return false;

  const adminWallets = getAdminWallets();
  if (adminWallets.length === 0) {
    console.warn('No admin wallets configured. Set ADMIN_WALLET_ADDRESS env var.');
    return false;
  }

  return adminWallets.includes(walletAddress.toLowerCase());
}

/**
 * Verify a wallet signature for admin authentication.
 * The message should contain a nonce and timestamp to prevent replay attacks.
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

  // Create the message that should have been signed
  const message = `baseFM Admin Authentication\n\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nSign this message to authenticate as an admin.`;

  try {
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    return isValid;
  } catch (error) {
    console.error('Admin signature verification error:', error);
    return false;
  }
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
