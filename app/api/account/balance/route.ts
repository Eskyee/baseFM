import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';

export const dynamic = 'force-dynamic';

// BASEFM token configuration
const BASEFM_TOKEN = {
  address: '0x9a4376bab717ac0a3901eeed8308a420c59c0ba3' as `0x${string}`,
  decimals: 18,
  symbol: 'BASEFM',
  name: 'baseFM',
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

// GET /api/account/balance - Check BASEFM token balance
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

    // Get BASEFM balance
    const balance = await client.readContract({
      address: BASEFM_TOKEN.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    });

    // Get ETH balance
    const ethBalance = await client.getBalance({
      address: walletAddress as `0x${string}`,
    });

    const tokenFormatted = formatUnits(balance, BASEFM_TOKEN.decimals);
    const ethFormatted = formatUnits(ethBalance, 18);

    // Determine tier based on BASEFM holdings
    const tokenAmount = parseFloat(tokenFormatted);
    let tier = 'none';
    if (tokenAmount >= 1_000_000_000) {
      tier = 'premium';
    } else if (tokenAmount >= 100_000) {
      tier = 'label';
    } else if (tokenAmount >= 10_000) {
      tier = 'pro';
    } else if (tokenAmount >= 5_000) {
      tier = 'community';
    }

    return NextResponse.json({
      walletAddress,
      balances: {
        basefm: {
          raw: balance.toString(),
          formatted: tokenFormatted,
          symbol: BASEFM_TOKEN.symbol,
        },
        eth: {
          raw: ethBalance.toString(),
          formatted: ethFormatted,
          symbol: 'ETH',
        },
      },
      tier,
      access: {
        community: tokenAmount >= 5_000,
        djStreaming: tokenAmount >= 5_000,
        pro: tokenAmount >= 10_000,
        label: tokenAmount >= 100_000,
        premium: tokenAmount >= 1_000_000_000,
      },
      tokenInfo: {
        address: BASEFM_TOKEN.address,
        name: BASEFM_TOKEN.name,
        symbol: BASEFM_TOKEN.symbol,
        decimals: BASEFM_TOKEN.decimals,
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
