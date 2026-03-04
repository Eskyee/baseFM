import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';

export const dynamic = 'force-dynamic';

// RAVE token configuration
const RAVE_TOKEN = {
  address: '0xdf3c79a5759eeedb844e7481309a75037b8e86f5' as `0x${string}`,
  decimals: 18,
  symbol: 'RAVE',
  name: 'RaveCulture',
};

// ERC20 balanceOf ABI
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// GET /api/account/balance - Check RAVE token balance
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address required' },
      { status: 400 }
    );
  }

  // Validate wallet address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return NextResponse.json(
      { error: 'Invalid wallet address format' },
      { status: 400 }
    );
  }

  try {
    const client = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    });

    // Get RAVE balance
    const balance = await client.readContract({
      address: RAVE_TOKEN.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    });

    // Get ETH balance
    const ethBalance = await client.getBalance({
      address: walletAddress as `0x${string}`,
    });

    const raveFormatted = formatUnits(balance, RAVE_TOKEN.decimals);
    const ethFormatted = formatUnits(ethBalance, 18);

    // Determine tier based on RAVE holdings
    const raveAmount = parseFloat(raveFormatted);
    let tier = 'none';
    if (raveAmount >= 1_000_000_000) {
      tier = 'premium';
    } else if (raveAmount >= 100_000) {
      tier = 'label';
    } else if (raveAmount >= 10_000) {
      tier = 'pro';
    } else if (raveAmount >= 5_000) {
      tier = 'community';
    }

    return NextResponse.json({
      walletAddress,
      balances: {
        rave: {
          raw: balance.toString(),
          formatted: raveFormatted,
          symbol: RAVE_TOKEN.symbol,
        },
        eth: {
          raw: ethBalance.toString(),
          formatted: ethFormatted,
          symbol: 'ETH',
        },
      },
      tier,
      access: {
        community: raveAmount >= 5_000,
        djStreaming: raveAmount >= 5_000,
        pro: raveAmount >= 10_000,
        label: raveAmount >= 100_000,
        premium: raveAmount >= 1_000_000_000,
      },
      tokenInfo: {
        address: RAVE_TOKEN.address,
        name: RAVE_TOKEN.name,
        symbol: RAVE_TOKEN.symbol,
        decimals: RAVE_TOKEN.decimals,
        chain: 'base',
        chainId: 8453,
      },
    });
  } catch (error) {
    console.error('Error checking balance:', error);
    return NextResponse.json(
      { error: 'Failed to check balance' },
      { status: 500 }
    );
  }
}
