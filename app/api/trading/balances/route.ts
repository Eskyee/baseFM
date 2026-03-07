import { NextResponse } from 'next/server';
import { publicClient } from '@/lib/viem/client';
import { formatEther, formatUnits } from 'viem';

const BANKR_API_BASE = 'https://api.bankr.bot';

// Agent wallet address
const AGENT_WALLET = process.env.NEXT_PUBLIC_TRADING_AGENT_WALLET as `0x${string}` | undefined;

// Common tokens on Base with their addresses and decimals
const BASE_TOKENS = {
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
    decimals: 6,
  },
  WETH: {
    address: '0x4200000000000000000000000000000000000006' as `0x${string}`,
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
 * Fetch on-chain balances for agent wallet
 */
async function fetchOnChainBalances(): Promise<{
  totalUsd: number;
  breakdown: Record<string, number>;
}> {
  if (!AGENT_WALLET) {
    return { totalUsd: 0, breakdown: {} };
  }

  const breakdown: Record<string, number> = {};
  let totalUsd = 0;

  try {
    // Fetch ETH balance
    const ethBalance = await publicClient.getBalance({ address: AGENT_WALLET });
    const ethAmount = parseFloat(formatEther(ethBalance));
    if (ethAmount > 0.0001) {
      // Rough ETH price estimate (could use oracle in future)
      const ethUsd = ethAmount * 3500;
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
      const wethUsd = wethAmount * 3500;
      breakdown['WETH'] = wethUsd;
      totalUsd += wethUsd;
    }
  } catch (err) {
    console.error('Failed to fetch on-chain balances:', err);
  }

  return { totalUsd, breakdown };
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
