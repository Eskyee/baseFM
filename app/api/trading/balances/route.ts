import { NextResponse } from 'next/server';

const BANKR_API_BASE = 'https://api.bankr.bot';

/**
 * GET /api/trading/balances
 * Fetches trading agent balance from Bankr API using prompt system
 */
export async function GET() {
  const apiKey = process.env.BANKR_API_KEY;

  if (!apiKey) {
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
    return NextResponse.json({
      id: 'error',
      totalUsd: 0,
      breakdown: {},
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
