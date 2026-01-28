import { verifyMessage } from 'viem';

export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function normalizeWalletAddress(address: string): string {
  return address.toLowerCase();
}

export async function verifyWalletSignature(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    return isValid;
  } catch (error) {
    console.error('Error verifying wallet signature:', error);
    return false;
  }
}

export function createAuthMessage(nonce: string): string {
  return `Sign this message to authenticate with baseFM.\n\nNonce: ${nonce}`;
}

export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}
