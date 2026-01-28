import { NextRequest, NextResponse } from 'next/server';
import { checkTokenAccess } from '@/lib/token/tokenGate';
import { isValidWalletAddress } from '@/lib/auth/wallet';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tokenAddress = searchParams.get('tokenAddress');
    const walletAddress = searchParams.get('walletAddress');
    const requiredAmount = searchParams.get('requiredAmount');
    const tokenType = searchParams.get('tokenType') as 'ERC20' | 'ERC721' | null;

    // Validate required params
    if (!tokenAddress || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: tokenAddress, walletAddress' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Check token access
    const result = await checkTokenAccess(
      tokenAddress,
      walletAddress,
      requiredAmount ? parseInt(requiredAmount, 10) : 1,
      tokenType || 'ERC20'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking token access:', error);
    return NextResponse.json(
      { error: 'Failed to check token access' },
      { status: 500 }
    );
  }
}
