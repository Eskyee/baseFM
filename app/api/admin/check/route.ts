import { NextRequest, NextResponse } from 'next/server';
import { isAdminWallet } from '@/lib/admin/config';

/**
 * GET /api/admin/check?wallet=0x...
 * Quick check if a wallet is an admin wallet.
 */
export async function GET(req: NextRequest) {
  const wallet = new URL(req.url).searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ isAdmin: false });
  }

  return NextResponse.json({ isAdmin: isAdminWallet(wallet) });
}
