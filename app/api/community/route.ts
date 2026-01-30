import { NextRequest, NextResponse } from 'next/server';
import { getMembers, getFeaturedMembers, joinCommunity } from '@/lib/db/members';
import { publicClient } from '@/lib/viem/client';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';

// ERC-20 balanceOf ABI
const balanceOfAbi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// GET - List community members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';

    const members = featured
      ? await getFeaturedMembers()
      : await getMembers();

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Community GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Join community
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, displayName, bio } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    // Check token balance
    let tokenBalance = 0;
    try {
      const balance = await publicClient.readContract({
        address: DJ_TOKEN_CONFIG.address,
        abi: balanceOfAbi,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`],
      });

      tokenBalance = Number(balance / BigInt(10 ** DJ_TOKEN_CONFIG.decimals));
    } catch (err) {
      console.error('Failed to check token balance:', err);
    }

    // Must hold minimum tokens to join
    if (tokenBalance < DJ_TOKEN_CONFIG.requiredAmount) {
      return NextResponse.json({
        error: `Must hold at least ${DJ_TOKEN_CONFIG.requiredAmount} ${DJ_TOKEN_CONFIG.symbol} tokens to join`,
        currentBalance: tokenBalance,
        required: DJ_TOKEN_CONFIG.requiredAmount,
      }, { status: 403 });
    }

    // Create member
    const member = await joinCommunity({
      walletAddress,
      displayName,
      bio,
    });

    if (!member) {
      return NextResponse.json({ error: 'Failed to join community' }, { status: 500 });
    }

    return NextResponse.json({ member, tokenBalance });
  } catch (error) {
    console.error('Community POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
