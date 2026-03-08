import { NextResponse } from 'next/server';
import { isBankrConfigured, BANKR_API_BASE, BANKR_ENDPOINTS } from '@/lib/bankr';

/**
 * GET /api/trading/status
 *
 * Diagnostic endpoint to check Bankr configuration
 */
export async function GET() {
  const apiKeySet = Boolean(process.env.BANKR_API_KEY);
  const publicKeySet = Boolean(process.env.NEXT_PUBLIC_BANKR_API_KEY);
  const agentWallet = process.env.NEXT_PUBLIC_TRADING_AGENT_WALLET;

  // Test API connection if key is set
  let apiTest = { success: false, error: '' };
  if (apiKeySet) {
    try {
      const res = await fetch(`${BANKR_API_BASE}${BANKR_ENDPOINTS.prompt}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.BANKR_API_KEY!,
        },
        body: JSON.stringify({ prompt: 'ping' }),
      });
      if (res.ok) {
        apiTest = { success: true, error: '' };
      } else {
        const text = await res.text();
        apiTest = { success: false, error: `${res.status}: ${text}` };
      }
    } catch (err) {
      apiTest = { success: false, error: err instanceof Error ? err.message : 'Connection failed' };
    }
  }

  return NextResponse.json({
    configured: isBankrConfigured(),
    env: {
      BANKR_API_KEY: apiKeySet ? '✓ Set' : '✗ Missing',
      NEXT_PUBLIC_BANKR_API_KEY: publicKeySet ? '✓ Set' : '✗ Missing',
      NEXT_PUBLIC_TRADING_AGENT_WALLET: agentWallet ? `✓ ${agentWallet.slice(0, 6)}...` : '✗ Missing',
    },
    apiTest: apiKeySet ? apiTest : { skipped: 'No API key' },
    endpoints: {
      prompt: `${BANKR_API_BASE}${BANKR_ENDPOINTS.prompt}`,
      job: `${BANKR_API_BASE}/agent/job/{jobId}`,
    },
  });
}
