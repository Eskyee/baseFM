/**
 * Bankr Agent Configuration
 *
 * Based on official Bankr documentation:
 * - https://docs.bankr.bot
 * - https://github.com/BankrBot/claude-plugins
 *
 * Agent Flow:
 *   Scan → Decide → Execute → Balance
 */

// ============================================================
// Bankr API Configuration
// ============================================================

export const BANKR_API_BASE = 'https://api.bankr.bot';

// API endpoints
export const BANKR_ENDPOINTS = {
  prompt: '/agent/prompt',
  job: (jobId: string) => `/agent/job/${jobId}`,
  balances: '/balances',
} as const;

// ============================================================
// Agent Trading Configuration
// ============================================================

export const AGENT_CONFIG = {
  // Milliseconds between trading cycles (default: 3 minutes)
  intervalMs: parseInt(process.env.AGENT_INTERVAL_MS || '180000', 10),

  // Maximum percentage of USDC balance per trade (default: 1%)
  maxTradePct: parseFloat(process.env.AGENT_MAX_TRADE_PCT || '1'),

  // Poll interval for job status (ms)
  jobPollInterval: 2000,

  // Maximum poll attempts before timeout
  maxPollAttempts: 60,

  // Stablecoins to skip when deciding
  skipTokens: ['USDC', 'USDT', 'DAI', 'FRAX', 'ETH', 'WETH'],
} as const;

// ============================================================
// Conviction Levels
// ============================================================

export type ConvictionLevel = 'high' | 'medium' | 'low';

export interface TokenPick {
  token: string;
  direction: 'up' | 'down';
  conviction: ConvictionLevel;
}

// ============================================================
// Bankr API Response Types
// ============================================================

export interface BankrPromptResponse {
  jobId: string;
  threadId: string;
}

export interface BankrJobResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  response?: string;
  transactions?: BankrTransaction[];
  error?: string;
}

export interface BankrTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface BankrBalance {
  symbol: string;
  token?: string;
  amount: string;
  usdValue?: string;
  valueUsd?: string;
}

export interface BankrBalanceResponse {
  balances: BankrBalance[];
  totalUsd?: number;
}

// ============================================================
// Agent Log Types (matches trading_logs table)
// ============================================================

export type AgentLogType =
  | 'trade'
  | 'response'
  | 'analysis'
  | 'error'
  | 'balance_update'
  | 'scanning'
  | 'system';

export interface AgentLog {
  type: AgentLogType;
  content: string;
  metadata?: Record<string, unknown>;
}

// ============================================================
// Trade Decision
// ============================================================

export interface TradeDecision {
  shouldTrade: boolean;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  reason: string;
}

// ============================================================
// Scan Prompts
// ============================================================

export const SCAN_PROMPTS = {
  // Default scan for trending tokens
  trending: 'What are the top trending tokens on Base right now? Give me your picks with conviction levels (high/medium/low) and direction (up/down).',

  // Specific analysis
  analysis: (token: string) =>
    `Analyze ${token} on Base. What's the current trend and your conviction level?`,

  // Portfolio check
  portfolio: 'Check my portfolio balance on Base.',

  // Swap command
  swap: (amount: string, from: string, to: string) =>
    `swap ${amount} ${from} to ${to} on base`,
} as const;

// ============================================================
// Environment Helpers
// ============================================================

export function getBankrApiKey(): string {
  const key = process.env.BANKR_API_KEY;
  if (!key) {
    throw new Error('BANKR_API_KEY environment variable is not set');
  }
  return key;
}

export function isBankrConfigured(): boolean {
  return Boolean(process.env.BANKR_API_KEY);
}

// ============================================================
// Token Pick Parser
// ============================================================

/**
 * Parse Bankr's response to extract token picks.
 * Expected format: "TOKEN - up/down - high/medium/low"
 *
 * Example response:
 * "Based on my analysis, here are my picks:
 *  - BNKR - up - high
 *  - DEGEN - up - medium
 *  - BRETT - down - low"
 */
export function parseTokenPicks(response: string): TokenPick[] {
  const picks: TokenPick[] = [];

  // Match patterns like: TOKEN - up/down - high/medium/low
  const pattern = /([A-Z0-9]+)\s*[-–]\s*(up|down)\s*[-–]\s*(high|medium|low)/gi;
  let match;

  while ((match = pattern.exec(response)) !== null) {
    const [, token, direction, conviction] = match;
    picks.push({
      token: token.toUpperCase(),
      direction: direction.toLowerCase() as 'up' | 'down',
      conviction: conviction.toLowerCase() as ConvictionLevel,
    });
  }

  return picks;
}

/**
 * Filter picks for trading:
 * - Direction must be "up"
 * - Conviction must be "high" or "medium"
 * - Token must not be in skip list
 */
export function filterTradablePicks(picks: TokenPick[]): TokenPick[] {
  return picks.filter(
    (pick) =>
      pick.direction === 'up' &&
      ['high', 'medium'].includes(pick.conviction) &&
      !AGENT_CONFIG.skipTokens.includes(pick.token)
  );
}
