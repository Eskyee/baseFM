import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSignature, getAdminWallets } from '@/lib/admin/config';

const ADMIN_WALLETS = process.env.ADMIN_WALLET_ADDRESS?.split(',').map(w => w.toLowerCase()) || [];

/**
 * Admin authentication middleware with cryptographic signature verification.
 * 
 * Required headers:
 * - x-wallet-address: The admin wallet address
 * - x-signature: The cryptographic signature
 * - x-nonce: Random nonce used in signature
 * - x-timestamp: ISO 8601 timestamp when signature was created
 * 
 * The signature is verified against a message format:
 * "baseFM Admin Authentication\n\nNonce: {nonce}\nTimestamp: {timestamp}\n\nSign this message to authenticate as an admin."
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const wallet = request.headers.get('x-wallet-address')?.toLowerCase();
  const signature = request.headers.get('x-signature');
  const nonce = request.headers.get('x-nonce');
  const timestamp = request.headers.get('x-timestamp');
  
  if (!wallet) {
    return NextResponse.json(
      { error: 'Unauthorized - Wallet address required' },
      { status: 401 }
    );
  }

  // First check if wallet is in admin list
  const adminWallets = getAdminWallets();
  if (!adminWallets.includes(wallet)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  // Require signature verification for admin operations
  // Skip signature check only in development mode if explicitly enabled
  const skipSignatureInDev = process.env.SKIP_ADMIN_SIGNATURE_VERIFICATION === 'true';
  
  if (!skipSignatureInDev) {
    if (!signature || !nonce || !timestamp) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing signature credentials. Required headers: x-signature, x-nonce, x-timestamp' },
        { status: 401 }
      );
    }

    // Verify the signature
    const isValidSignature = await verifyAdminSignature(wallet, signature, nonce, timestamp);
    if (!isValidSignature) {
      console.warn(`Invalid admin signature attempt from wallet: ${wallet}`);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid signature' },
        { status: 401 }
      );
    }

    // Check timestamp to prevent replay attacks (allow 5 minute window)
    const requestTime = new Date(timestamp).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (Math.abs(now - requestTime) > fiveMinutes) {
      return NextResponse.json(
        { error: 'Unauthorized - Request timestamp expired. Please refresh and try again.' },
        { status: 401 }
      );
    }
  }
  
  return null;
}

export function isAdmin(walletAddress: string): boolean {
  return ADMIN_WALLETS.includes(walletAddress.toLowerCase());
}
