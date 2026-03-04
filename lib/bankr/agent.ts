/**
 * Bankr Trading Agent Service
 *
 * Implements the Scan → Decide → Execute → Balance workflow
 * as documented at https://docs.bankr.bot
 *
 * Flow:
 *   1. Scan — Ask Bankr for trending tokens
 *   2. Decide — Parse response and filter for tradable picks
 *   3. Execute — Send swap command via Bankr
 *   4. Balance — Update portfolio display
 */

import {
  BANKR_API_BASE,
  BANKR_ENDPOINTS,
  AGENT_CONFIG,
  SCAN_PROMPTS,
  getBankrApiKey,
  parseTokenPicks,
  filterTradablePicks,
  type BankrPromptResponse,
  type BankrJobResponse,
  type BankrBalanceResponse,
  type TokenPick,
  type TradeDecision,
  type AgentLog,
} from './config';
import { createServerClient } from '@/lib/supabase/client';

// ============================================================
// Bankr API Client
// ============================================================

/**
 * Submit a prompt to Bankr and get job details.
 * Returns jobId and threadId for polling.
 */
export async function submitPrompt(prompt: string): Promise<BankrPromptResponse> {
  const apiKey = getBankrApiKey();

  const response = await fetch(`${BANKR_API_BASE}${BANKR_ENDPOINTS.prompt}`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bankr prompt failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Poll a job until completion or timeout.
 */
export async function waitForJob(jobId: string): Promise<BankrJobResponse> {
  const apiKey = getBankrApiKey();
  let attempts = 0;

  while (attempts < AGENT_CONFIG.maxPollAttempts) {
    const response = await fetch(
      `${BANKR_API_BASE}${BANKR_ENDPOINTS.job(jobId)}`,
      {
        headers: {
          'X-API-Key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Bankr job poll failed: ${response.status}`);
    }

    const job: BankrJobResponse = await response.json();

    if (job.status === 'completed') {
      return job;
    }

    if (job.status === 'failed') {
      throw new Error(job.error || 'Bankr job failed');
    }

    // Wait before next poll
    await new Promise((resolve) =>
      setTimeout(resolve, AGENT_CONFIG.jobPollInterval)
    );
    attempts++;
  }

  throw new Error('Bankr job polling timeout');
}

/**
 * Submit prompt and wait for completion.
 * Combines submitPrompt and waitForJob.
 */
export async function promptAndWait(prompt: string): Promise<BankrJobResponse> {
  const { jobId } = await submitPrompt(prompt);
  return waitForJob(jobId);
}

/**
 * Fetch current wallet balances from Bankr.
 */
export async function fetchBalances(): Promise<BankrBalanceResponse> {
  const apiKey = getBankrApiKey();

  const response = await fetch(`${BANKR_API_BASE}${BANKR_ENDPOINTS.balances}`, {
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Bankr balances failed: ${response.status}`);
  }

  return response.json();
}

// ============================================================
// Logging Helpers
// ============================================================

async function logToSupabase(log: AgentLog): Promise<void> {
  try {
    const db = createServerClient();
    await db.from('trading_logs').insert({
      type: log.type,
      content: log.content,
      metadata: log.metadata || null,
    });
  } catch (error) {
    // Non-fatal — don't let logging failures break the agent
    console.error('Failed to log to Supabase:', error);
  }
}

async function recordTrade(
  tokenIn: string,
  tokenOut: string,
  status: 'pending' | 'completed' | 'failed',
  txHash?: string
): Promise<void> {
  try {
    const db = createServerClient();
    await db.from('trading_trades').insert({
      token_in: tokenIn,
      token_out: tokenOut,
      status,
      tx_hash: txHash || null,
    });
  } catch (error) {
    console.error('Failed to record trade:', error);
  }
}

// ============================================================
// Agent Workflow Steps
// ============================================================

/**
 * STEP 1: Scan
 * Ask Bankr for trending tokens on Base.
 * Returns the raw response for decision making.
 */
export async function scan(): Promise<string> {
  await logToSupabase({
    type: 'scanning',
    content: 'Scanning for trending tokens on Base...',
  });

  const result = await promptAndWait(SCAN_PROMPTS.trending);

  if (!result.response) {
    throw new Error('No response from Bankr scan');
  }

  await logToSupabase({
    type: 'response',
    content: `Scan complete: ${result.response.substring(0, 200)}...`,
    metadata: { fullResponse: result.response },
  });

  return result.response;
}

/**
 * STEP 2: Decide
 * Parse the scan response and decide what to trade.
 */
export async function decide(scanResponse: string): Promise<TradeDecision> {
  // Parse picks from response
  const allPicks = parseTokenPicks(scanResponse);
  const tradablePicks = filterTradablePicks(allPicks);

  await logToSupabase({
    type: 'analysis',
    content: `Found ${allPicks.length} picks, ${tradablePicks.length} tradable`,
    metadata: { allPicks, tradablePicks },
  });

  if (tradablePicks.length === 0) {
    return {
      shouldTrade: false,
      tokenIn: '',
      tokenOut: '',
      amount: '',
      reason: 'No high/medium conviction upward picks found',
    };
  }

  // Get the highest conviction pick
  const bestPick = tradablePicks.sort((a, b) => {
    const convictionOrder = { high: 0, medium: 1, low: 2 };
    return convictionOrder[a.conviction] - convictionOrder[b.conviction];
  })[0];

  // Calculate trade amount based on config
  const tradeAmount = `${AGENT_CONFIG.maxTradePct.toFixed(2)}`;

  return {
    shouldTrade: true,
    tokenIn: 'USDC',
    tokenOut: bestPick.token,
    amount: tradeAmount,
    reason: `${bestPick.conviction} conviction ${bestPick.direction} on ${bestPick.token}`,
  };
}

/**
 * STEP 3: Execute
 * Send swap command to Bankr.
 */
export async function execute(decision: TradeDecision): Promise<string | null> {
  if (!decision.shouldTrade) {
    await logToSupabase({
      type: 'system',
      content: `Skipping trade: ${decision.reason}`,
    });
    return null;
  }

  const swapPrompt = SCAN_PROMPTS.swap(
    decision.amount,
    decision.tokenIn,
    decision.tokenOut
  );

  await logToSupabase({
    type: 'trade',
    content: `Executing: swap ${decision.amount} ${decision.tokenIn} to ${decision.tokenOut}`,
  });

  // Record pending trade
  await recordTrade(decision.tokenIn, decision.tokenOut, 'pending');

  try {
    const result = await promptAndWait(swapPrompt);

    // Extract transaction hash from response
    const txHash =
      result.transactions?.[0]?.hash ||
      extractTxHash(result.response || '');

    if (txHash) {
      await recordTrade(decision.tokenIn, decision.tokenOut, 'completed', txHash);
      await logToSupabase({
        type: 'trade',
        content: `Trade completed: ${txHash}`,
        metadata: { txHash, transactions: result.transactions },
      });
      return txHash;
    }

    await logToSupabase({
      type: 'response',
      content: `Trade response: ${result.response?.substring(0, 200) || 'No response'}`,
    });

    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Trade failed';
    await recordTrade(decision.tokenIn, decision.tokenOut, 'failed');
    await logToSupabase({
      type: 'error',
      content: `Trade failed: ${message}`,
    });
    throw error;
  }
}

/**
 * STEP 4: Balance
 * Update portfolio display with current balances.
 */
export async function checkBalance(): Promise<{
  totalUsd: number;
  breakdown: Record<string, number>;
}> {
  try {
    const data = await fetchBalances();

    let totalUsd = 0;
    const breakdown: Record<string, number> = {};

    if (data.balances && Array.isArray(data.balances)) {
      for (const balance of data.balances) {
        const symbol = balance.symbol || balance.token || 'UNKNOWN';
        const usdValue = parseFloat(balance.usdValue || balance.valueUsd || '0');
        if (usdValue > 0) {
          breakdown[symbol] = (breakdown[symbol] || 0) + usdValue;
          totalUsd += usdValue;
        }
      }
    }

    // Save balance snapshot
    try {
      const db = createServerClient();
      await db.from('trading_balances').insert({
        total_usd: totalUsd,
        breakdown,
      });
    } catch {
      // Non-fatal
    }

    await logToSupabase({
      type: 'balance_update',
      content: `Portfolio: $${totalUsd.toFixed(2)}`,
      metadata: { totalUsd, breakdown },
    });

    return { totalUsd, breakdown };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Balance check failed';
    await logToSupabase({
      type: 'error',
      content: `Balance check failed: ${message}`,
    });
    throw error;
  }
}

// ============================================================
// Full Agent Cycle
// ============================================================

/**
 * Run a complete trading cycle:
 * Scan → Decide → Execute → Balance
 */
export async function runTradingCycle(): Promise<{
  decision: TradeDecision;
  txHash: string | null;
  balance: { totalUsd: number; breakdown: Record<string, number> };
}> {
  await logToSupabase({
    type: 'system',
    content: 'Starting trading cycle...',
  });

  // Step 1: Scan
  const scanResponse = await scan();

  // Step 2: Decide
  const decision = await decide(scanResponse);

  // Step 3: Execute
  const txHash = await execute(decision);

  // Step 4: Balance
  const balance = await checkBalance();

  await logToSupabase({
    type: 'system',
    content: `Cycle complete. Portfolio: $${balance.totalUsd.toFixed(2)}`,
  });

  return { decision, txHash, balance };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Extract transaction hash from response text.
 * Looks for patterns like: 0x[64 hex chars]
 */
function extractTxHash(text: string): string | null {
  const match = text.match(/0x[a-fA-F0-9]{64}/);
  return match ? match[0] : null;
}

/**
 * Analyze a specific token.
 */
export async function analyzeToken(token: string): Promise<TokenPick | null> {
  const result = await promptAndWait(SCAN_PROMPTS.analysis(token));

  if (!result.response) {
    return null;
  }

  const picks = parseTokenPicks(result.response);
  return picks.find((p) => p.token === token.toUpperCase()) || null;
}
