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
 * GET /api/trading/balances
 * Fetches trading agent balance - prioritizes on-chain for reliability
 */
export async function GET(request: Request) {
  // Allow passing wallet address via query param or use env var
  const url = new URL(request.url);
  const walletParam = url.searchParams.get('wallet');
  const wallet = (walletParam || AGENT_WALLET) as `0x${string}` | undefined;

  // Prioritize on-chain balances (direct, reliable)
  if (wallet) {
    try {
      const onChainData = await fetchOnChainBalancesForWallet(wallet);
      if (onChainData.totalUsd > 0 || Object.keys(onChainData.breakdown).length > 0) {
        return NextResponse.json({
          id: Date.now().toString(),
          source: 'onchain',
          wallet,
          ...onChainData,
        });
      }
    } catch (err) {
      console.error('On-chain balance fetch failed:', err);
    }
  }

  // Try Bankr as fallback
  const apiKey = process.env.BANKR_API_KEY;
  if (apiKey) {
    try {
      const bankrData = await fetchBankrBalances(apiKey);
      if (bankrData && (bankrData.totalUsd > 0 || Object.keys(bankrData.breakdown).length > 0)) {
        return NextResponse.json({
          id: Date.now().toString(),
          source: 'bankr',
          ...bankrData,
        });
      }
    } catch (err) {
      console.error('Bankr balance fetch failed:', err);
    }
  }

  // No wallet configured
  if (!wallet && !apiKey) {
    return NextResponse.json({
      id: 'unconfigured',
      totalUsd: 0,
      breakdown: {},
      error: 'No wallet or API key configured',
    });
  }

  // Return empty but configured
  return NextResponse.json({
    id: Date.now().toString(),
    source: wallet ? 'onchain' : 'bankr',
    totalUsd: 0,
    breakdown: {},
    amounts: {},
  });
}

/**
 * Fetch on-chain balances for a specific wallet
 */
async function fetchOnChainBalancesForWallet(wallet: `0x${string}`): Promise<{
  totalUsd: number;
  breakdown: Record<string, number>;
  amounts: Record<string, string>;
}> {
  const breakdown: Record<string, number> = {};
  const amounts: Record<string, string> = {};
  let totalUsd = 0;

  // Fetch prices first
  const prices = await fetchTokenPrices();

  // Fetch ETH balance
  const ethBalance = await publicClient.getBalance({ address: wallet });
  const ethAmount = parseFloat(formatEther(ethBalance));
  if (ethAmount > 0.0001) {
    const ethUsd = ethAmount * (prices['ETH'] || 2000);
    amounts['ETH'] = ethAmount.toFixed(4);
    breakdown['ETH'] = ethUsd;
    totalUsd += ethUsd;
  }

  // Fetch ERC20 balances in parallel
  const [usdcBalance, wethBalance, basefmBalance, raveBalance] = await Promise.all([
    publicClient.readContract({
      address: BASE_TOKENS.USDC.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [wallet],
    }),
    publicClient.readContract({
      address: BASE_TOKENS.WETH.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [wallet],
    }),
    publicClient.readContract({
      address: BASE_TOKENS.BASEFM.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [wallet],
    }),
    publicClient.readContract({
      address: BASE_TOKENS.RAVE.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [wallet],
    }),
  ]);

  // Process USDC
  const usdcAmount = parseFloat(formatUnits(usdcBalance, BASE_TOKENS.USDC.decimals));
  if (usdcAmount > 0.01) {
    amounts['USDC'] = usdcAmount.toFixed(2);
    breakdown['USDC'] = usdcAmount;
    totalUsd += usdcAmount;
  }

  // Process WETH
  const wethAmount = parseFloat(formatUnits(wethBalance, BASE_TOKENS.WETH.decimals));
  if (wethAmount > 0.0001) {
    const wethUsd = wethAmount * (prices['WETH'] || 2000);
    amounts['WETH'] = wethAmount.toFixed(4);
    breakdown['WETH'] = wethUsd;
    totalUsd += wethUsd;
  }

  // Process BASEFM
  const basefmAmount = parseFloat(formatUnits(basefmBalance, BASE_TOKENS.BASEFM.decimals));
  if (basefmAmount > 0) {
    const basefmUsd = basefmAmount * (prices['BASEFM'] || 0);
    amounts['BASEFM'] = basefmAmount.toFixed(4);
    if (basefmUsd > 0) {
      breakdown['BASEFM'] = basefmUsd;
      totalUsd += basefmUsd;
    }
  }

  // Process RAVE
  const raveAmount = parseFloat(formatUnits(raveBalance, BASE_TOKENS.RAVE.decimals));
  if (raveAmount > 0) {
    const raveUsd = raveAmount * (prices['RAVE'] || 0);
    amounts['RAVE'] = raveAmount.toFixed(4);
    if (raveUsd > 0) {
      breakdown['RAVE'] = raveUsd;
      totalUsd += raveUsd;
    }
  }

  return { totalUsd, breakdown, amounts };
}

/**
 * Fetch balances from Bankr API
 */
async function fetchBankrBalances(apiKey: string): Promise<{
  totalUsd: number;
  breakdown: Record<string, number>;
} | null> {
  const promptRes = await fetch(`${BANKR_API_BASE}/agent/prompt`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: 'Show my portfolio balance on Base' }),
  });

  if (!promptRes.ok) {
    console.error('Bankr prompt error:', promptRes.status);
    return null;
  }

  const { jobId } = await promptRes.json();

  // Poll for job completion (max 20 seconds)
  for (let i = 0; i < 10; i++) {
    const jobRes = await fetch(`${BANKR_API_BASE}/agent/job/${jobId}`, {
      headers: { 'X-API-Key': apiKey },
    });

    if (!jobRes.ok) return null;

    const job = await jobRes.json();

    if (job.status === 'completed') {
      return parseBalanceResponse(job.response || '');
    }

    if (job.status === 'failed') {
      console.error('Bankr job failed:', job.error);
      return null;
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  return null;
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
