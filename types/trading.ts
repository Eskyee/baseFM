// Trading Agent Types (Bankr-style autonomous trading)

export type TradingLogType =
  | 'prompt'
  | 'response'
  | 'trade'
  | 'error'
  | 'balance_update'
  | 'analysis'
  | 'scanning'
  | 'system';

export type TradeStatus = 'pending' | 'completed' | 'failed';

export interface TradingLog {
  id: string;
  createdAt: string;
  agentId: string;
  type: TradingLogType;
  content: string;
  rawData?: Record<string, unknown>;
  jobId?: string;
  threadId?: string;
}

export interface TradingLogRow {
  id: string;
  created_at: string;
  agent_id: string;
  type: TradingLogType;
  content: string;
  raw_data: Record<string, unknown> | null;
  job_id: string | null;
  thread_id: string | null;
}

export function tradingLogFromRow(row: TradingLogRow): TradingLog {
  return {
    id: row.id,
    createdAt: row.created_at,
    agentId: row.agent_id,
    type: row.type,
    content: row.content,
    rawData: row.raw_data || undefined,
    jobId: row.job_id || undefined,
    threadId: row.thread_id || undefined,
  };
}

export interface Trade {
  id: string;
  createdAt: string;
  agentId: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut?: string;
  status: TradeStatus;
  jobId?: string;
  txHash?: string;
  rawResponse?: Record<string, unknown>;
}

export interface TradeRow {
  id: string;
  created_at: string;
  agent_id: string;
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string | null;
  status: TradeStatus;
  job_id: string | null;
  tx_hash: string | null;
  raw_response: Record<string, unknown> | null;
}

export function tradeFromRow(row: TradeRow): Trade {
  return {
    id: row.id,
    createdAt: row.created_at,
    agentId: row.agent_id,
    tokenIn: row.token_in,
    tokenOut: row.token_out,
    amountIn: row.amount_in,
    amountOut: row.amount_out || undefined,
    status: row.status,
    jobId: row.job_id || undefined,
    txHash: row.tx_hash || undefined,
    rawResponse: row.raw_response || undefined,
  };
}

export interface TradingBalance {
  id: string;
  createdAt: string;
  agentId: string;
  totalUsd: number;
  breakdown: Record<string, number>;
}

export interface TradingBalanceRow {
  id: string;
  created_at: string;
  agent_id: string;
  total_usd: number;
  breakdown: Record<string, number>;
}

export function tradingBalanceFromRow(row: TradingBalanceRow): TradingBalance {
  return {
    id: row.id,
    createdAt: row.created_at,
    agentId: row.agent_id,
    totalUsd: row.total_usd,
    breakdown: row.breakdown || {},
  };
}

export interface TradingStatus {
  uptime: string;
  cycleCount: number;
  lastCycleAt?: string;
  currentBalance?: TradingBalance;
  totalTrades: number;
  winRate: number;
}

export interface CreateTradingLogInput {
  agentId: string;
  type: TradingLogType;
  content: string;
  rawData?: Record<string, unknown>;
  jobId?: string;
  threadId?: string;
}

export interface CreateTradeInput {
  agentId: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut?: string;
  status?: TradeStatus;
  jobId?: string;
  txHash?: string;
  rawResponse?: Record<string, unknown>;
}

export interface UpdateTradeInput {
  status?: TradeStatus;
  amountOut?: string;
  txHash?: string;
  rawResponse?: Record<string, unknown>;
}

export interface CreateBalanceInput {
  agentId: string;
  totalUsd: number;
  breakdown: Record<string, number>;
}
