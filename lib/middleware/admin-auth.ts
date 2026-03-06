import { NextRequest, NextResponse } from 'next/server';

const ADMIN_WALLETS = process.env.ADMIN_WALLET_ADDRESSES?.split(',').map(w => w.toLowerCase()) || [];

export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const wallet = request.headers.get('x-wallet-address')?.toLowerCase();
  
  if (!wallet || !ADMIN_WALLETS.includes(wallet)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }
  
  return null;
}

export function isAdmin(walletAddress: string): boolean {
  return ADMIN_WALLETS.includes(walletAddress.toLowerCase());
}
