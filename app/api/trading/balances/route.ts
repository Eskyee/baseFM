import { NextResponse } from 'next/server';
import { publicClient } from '@/lib/viem/client';
import { formatEther, formatUnits } from 'viem';

const BANKR_API_BASE = 'https://api.bankr.bot';
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens';

// Agent wallet address
const AGENT_WALLET = process.env.NEXT_PUBLIC_TRADING_AGENT_WALLET as `0x${string}` | undefined;

// All tokens to track on Base
const BASE_TOKENS = {
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
    decimals: 6,
    stablecoin: true,
  },
  WETH: {
    address: '0x4200000000000000000000000000000000000006' as `0x${string}`,
    decimals: 18,
  },
  BASEFM: {
    address: '0x9a4376bab717ac0a3901eeed8308a420c59c0ba3' as `0x${string}`,
    decimals: 18,
  },
  RAVE: {
    address: '0xdf3c79a5759eeedb844e7481309a75037b8e86f5' as `0x${string}`,
    decimals: 18,
  },
} as const;

// Simple ERC20 balanceOf ABI
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Fetch token prices from DexScreener
 */
async function fetchTokenPrices(): Promise<Record<string, number>> {
  const prices: Record<string, number> = { USDC: 1 };

  try {
    // Fetch ETH price from WETH pairs
    const wethRes = await fetch(`${DEXSCREENER_API}/${BASE_TOKENS.WETH.address}`);
    if (wethRes.ok) {
      const data = await wethRes.json();
      if (data.pairs?.[0]?.priceUsd) {
        prices['ETH'] = parseFloat(data.pairs[0].priceUsd);
        prices['WETH'] = prices['ETH'];
      }
    }

    // Fetch BASEFM price
    const basefmRes = await fetch(`${DEXSCREENER_API}/${BASE_TOKENS.BASEFM.address}`);
    if (basefmRes.ok) {
      const data = await basefmRes.json();
      if (data.pairs?.[0]?.priceUsd) {
        prices['BASEFM'] = parseFloat(data.pairs[0].priceUsd);
      }
    }

    // Fetch RAVE price
    const raveRes = await fetch(`${DEXSCREENER_API}/${BASE_TOKENS.RAVE.address}`);
    if (raveRes.ok) {
      const data = await raveRes.json();
      if (data.pairs?.[0]?.priceUsd) {
        prices['RAVE'] = parseFloat(data.pairs[0].priceUsd);
      }
    }
  } catch (err) {
    console.error('Failed to fetch token prices:', err);
  }

  // Fallback ETH price if not fetched
  if (!prices['ETH']) {
    prices['ETH'] = 2000;
    prices['WETH'] = 2000;
  }

  return prices;
}

/**
 * Fetch on-chain balances for agent wallet
 */
async function fetchOnChainBalances(): Promise<{
  totalUsd: number;
  breakdown: Record<string, number>;
  amounts: Record<string, string>;
}> {
  if (!AGENT_WALLET) {
    return { totalUsd: 0, breakdown: {}, amounts: {} };
  }

  const breakdown: Record<string, number> = {};
  const amounts: Record<string, string> = {};
  let totalUsd = 0;

  try {
    // Fetch prices first
    const prices = await fetchTokenPrices();

    // Fetch ETH balance
    const ethBalance = await publicClient.getBalance({ address: AGENT_WALLET });
    const ethAmount = parseFloat(formatEther(ethBalance));
    if (ethAmount > 0.0001) {
      const ethUsd = ethAmount * (prices['ETH'] || 2000);
      amounts['ETH'] = ethAmount.toFixed(4);
      breakdown['ETH'] = ethUsd;
      totalUsd += ethUsd;
    }

    // Fetch USDC balance
    const usdcBalance = await publicClient.readContract({
      address: BASE_TOKENS.USDC.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [AGENT_WALLET],
    });
    const usdcAmount = parseFloat(formatUnits(usdcBalance, BASE_TOKENS.USDC.decimals));
    if (usdcAmount > 0.01) {
      amounts['USDC'] = usdcAmount.toFixed(2);
      breakdown['USDC'] = usdcAmount;
      totalUsd += usdcAmount;
    }

    // Fetch WETH balance
    const wethBalance = await publicClient.readContract({
      address: BASE_TOKENS.WETH.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [AGENT_WALLET],
    });
    const wethAmount = parseFloat(formatUnits(wethBalance, BASE_TOKENS.WETH.decimals));
    if (wethAmount > 0.0001) {
      const wethUsd = wethAmount * (prices['WETH'] || 2000);
      amounts['WETH'] = wethAmount.toFixed(4);
      breakdown['WETH'] = wethUsd;
      totalUsd += wethUsd;
    }

    // Fetch BASEFM balance
    const basefmBalance = await publicClient.readContract({
      address: BASE_TOKENS.BASEFM.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [AGENT_WALLET],
    });
    const basefmAmount = parseFloat(formatUnits(basefmBalance, BASE_TOKENS.BASEFM.decimals));
    if (basefmAmount > 0) {
      const basefmUsd = basefmAmount * (prices['BASEFM'] || 0);
      amounts['BASEFM'] = basefmAmount.toFixed(4);
      if (basefmUsd > 0) {
        breakdown['BASEFM'] = basefmUsd;
        totalUsd += basefmUsd;
      }
    }

    // Fetch RAVE balance
    const raveBalance = await publicClient.readContract({
      address: BASE_TOKENS.RAVE.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [AGENT_WALLET],
    });
    const raveAmount = parseFloat(formatUnits(raveBalance, BASE_TOKENS.RAVE.decimals));
    if (raveAmount > 0) {
      const raveUsd = raveAmount * (prices['RAVE'] || 0);
      amounts['RAVE'] = raveAmount.toFixed(4);
      if (raveUsd > 0) {
        breakdown['RAVE'] = raveUsd;
        totalUsd += raveUsd;
      }
    }
  } catch (err) {
    console.error('Failed to fetch on-chain balances:', err);
  }

  return { totalUsd, breakdown, amounts };
}

/**
 * GET /api/trading/balances
 * Fetches trading agent balance from Bankr API or on-chain
 */
export async function GET() {
  const apiKey = process.env.BANKR_API_KEY;

  // If no API key, try to fetch on-chain balances directly
  if (!apiKey) {
    if (AGENT_WALLET) {
      const onChainData = await fetchOnChainBalances();
      return NextResponse.json({
        id: Date.now().toString(),
        source: 'onchain',
        ...onChainData,
      });
    }
    return NextResponse.json({
      id: 'unconfigured',
      totalUsd: 0,
      breakdown: {},
    });
  }

  try {
    // Submit balance check prompt
    const promptRes = await fetch(`${BANKR_API_BASE}/agent/prompt`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'Show my portfolio balance on Base' }),
    });

    if (!promptRes.ok) {
      const errorText = await promptRes.text();
      console.error('Bankr prompt error:', promptRes.status, errorText);
      return NextResponse.json({
        id: 'error',
        totalUsd: 0,
        breakdown: {},
        error: promptRes.status === 403 ? 'API key lacks Agent API access' : 'API error',
      });
    }

    const { jobId } = await promptRes.json();

    // Poll for job completion (max 30 seconds)
    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
      const jobRes = await fetch(`${BANKR_API_BASE}/agent/job/${jobId}`, {
        headers: { 'X-API-Key': apiKey },
      });

      if (!jobRes.ok) {
        console.error('Bankr job poll error:', jobRes.status);
        return NextResponse.json({
          id: 'error',
          totalUsd: 0,
          breakdown: {},
        });
      }

      const job = await jobRes.json();

      if (job.status === 'completed') {
        // Parse balance from response text
        const { totalUsd, breakdown } = parseBalanceResponse(job.response || '');
        return NextResponse.json({
          id: Date.now().toString(),
          source: 'bankr',
          totalUsd,
          breakdown,
        });
      }

      if (job.status === 'failed') {
        console.error('Bankr job failed:', job.error);
        return NextResponse.json({
          id: 'error',
          totalUsd: 0,
          breakdown: {},
        });
      }

      // Wait 2 seconds before next poll
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
    }

    // Timeout
    return NextResponse.json({
      id: 'timeout',
      totalUsd: 0,
      breakdown: {},
    });
  } catch (err) {
    console.error('Failed to fetch Bankr balances:', err);
    // Fall back to on-chain balances
    if (AGENT_WALLET) {
      const onChainData = await fetchOnChainBalances();
      return NextResponse.json({
        id: Date.now().toString(),
        source: 'onchain-fallback',
        ...onChainData,
      });
    }
    return NextResponse.json({
      id: 'error',
      totalUsd: 0,
      breakdown: {},
      error: 'Network error connecting to Bankr API',
    });
  }
}

/**
 * Parse balance info from Bankr natural language response
 * Looks for patterns like: "USDC: $100.50" or "ETH: 0.5 ($1,200)"
 */
function parseBalanceResponse(response: string): {
  totalUsd: number;
  breakdown: Record<string, number>;
} {
  const breakdown: Record<string, number> = {};
  let totalUsd = 0;

  // Match patterns like "TOKEN: $X.XX" or "TOKEN: X.XX ($Y.YY)"
  const tokenPattern = /([A-Z]{2,10}):\s*\$?([\d,]+\.?\d*)/gi;
  let match;

  while ((match = tokenPattern.exec(response)) !== null) {
    const [, symbol, value] = match;
    const usdValue = parseFloat(value.replace(/,/g, ''));
    if (!isNaN(usdValue) && usdValue > 0) {
      breakdown[symbol.toUpperCase()] = usdValue;
      totalUsd += usdValue;
    }
  }

  // Also look for "Total: $X" pattern
  const totalMatch = response.match(/total[:\s]*\$?([\d,]+\.?\d*)/i);
  if (totalMatch) {
    const parsedTotal = parseFloat(totalMatch[1].replace(/,/g, ''));
    if (!isNaN(parsedTotal) && parsedTotal > totalUsd) {
      totalUsd = parsedTotal;
    }
  }

  return { totalUsd, breakdown };
}
