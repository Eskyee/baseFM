import { createServerClient } from '@/lib/supabase/client';
import {
  TradingLog,
  TradingLogRow,
  tradingLogFromRow,
  Trade,
  TradeRow,
  tradeFromRow,
  TradingBalance,
  TradingBalanceRow,
  tradingBalanceFromRow,
  CreateTradingLogInput,
  CreateTradeInput,
  UpdateTradeInput,
  CreateBalanceInput,
  TradingLogType,
} from '@/types/trading';

// Log operations
export async function createTradingLog(input: CreateTradingLogInput): Promise<TradingLog> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('trading_logs')
    .insert({
      agent_id: input.agentId,
      type: input.type,
      content: input.content,
      raw_data: input.rawData || null,
      job_id: input.jobId || null,
      thread_id: input.threadId || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return tradingLogFromRow(data as TradingLogRow);
}

export async function getTradingLogs(
  agentId: string,
  options?: {
    after?: string;
    type?: TradingLogType;
    limit?: number;
  }
): Promise<TradingLog[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('trading_logs')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: true });

  if (options?.after) {
    query = query.gt('created_at', options.after);
  } else {
    query = query.limit(options?.limit || 100);
  }

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map((row) => tradingLogFromRow(row as TradingLogRow));
}

export async function getLatestTradingLogs(
  options?: {
    limit?: number;
    after?: string;
  }
): Promise<TradingLog[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('trading_logs')
    .select('*')
    .order('created_at', { ascending: true });

  if (options?.after) {
    query = query.gt('created_at', options.after);
  } else {
    query = query.limit(options?.limit || 100);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map((row) => tradingLogFromRow(row as TradingLogRow));
}

// Trade operations
export async function createTrade(input: CreateTradeInput): Promise<Trade> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('trading_trades')
    .insert({
      agent_id: input.agentId,
      token_in: input.tokenIn,
      token_out: input.tokenOut,
      amount_in: input.amountIn,
      amount_out: input.amountOut || null,
      status: input.status || 'pending',
      job_id: input.jobId || null,
      tx_hash: input.txHash || null,
      raw_response: input.rawResponse || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return tradeFromRow(data as TradeRow);
}

export async function updateTrade(
  tradeId: string,
  input: UpdateTradeInput
): Promise<Trade> {
  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};
  if (input.status !== undefined) updateData.status = input.status;
  if (input.amountOut !== undefined) updateData.amount_out = input.amountOut;
  if (input.txHash !== undefined) updateData.tx_hash = input.txHash;
  if (input.rawResponse !== undefined) updateData.raw_response = input.rawResponse;

  const { data, error } = await supabase
    .from('trading_trades')
    .update(updateData)
    .eq('id', tradeId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return tradeFromRow(data as TradeRow);
}

export async function getTrades(
  agentId?: string,
  options?: {
    status?: string;
    limit?: number;
  }
): Promise<Trade[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('trading_trades')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options?.limit || 10);

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map((row) => tradeFromRow(row as TradeRow));
}

export async function getLatestTrades(
  options?: {
    limit?: number;
  }
): Promise<Trade[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('trading_trades')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options?.limit || 10);

  if (error || !data) return [];
  return data.map((row) => tradeFromRow(row as TradeRow));
}

// Balance operations
export async function createBalance(input: CreateBalanceInput): Promise<TradingBalance> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('trading_balances')
    .insert({
      agent_id: input.agentId,
      total_usd: input.totalUsd,
      breakdown: input.breakdown,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return tradingBalanceFromRow(data as TradingBalanceRow);
}

export async function getLatestBalance(agentId?: string): Promise<TradingBalance | null> {
  const supabase = createServerClient();

  let query = supabase
    .from('trading_balances')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (agentId) {
    query = supabase
      .from('trading_balances')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
  }

  const { data, error } = await query;

  // PGRST116 = no rows found
  if (error && error.code !== 'PGRST116') {
    console.error('[trading] Failed to get balance:', error.message);
  }

  if (!data) return null;
  return tradingBalanceFromRow(data as TradingBalanceRow);
}

export async function getBalanceHistory(
  agentId: string,
  options?: {
    limit?: number;
  }
): Promise<TradingBalance[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('trading_balances')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(options?.limit || 24);

  if (error || !data) return [];
  return data.map((row) => tradingBalanceFromRow(row as TradingBalanceRow));
}

// Stats
export async function getTradingStats(agentId?: string): Promise<{
  totalTrades: number;
  completedTrades: number;
  failedTrades: number;
  winRate: number;
}> {
  const supabase = createServerClient();

  let query = supabase
    .from('trading_trades')
    .select('status', { count: 'exact' });

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  const { data, count, error } = await query;

  if (error || !data) {
    return { totalTrades: 0, completedTrades: 0, failedTrades: 0, winRate: 0 };
  }

  const completed = data.filter((t) => t.status === 'completed').length;
  const failed = data.filter((t) => t.status === 'failed').length;
  const total = count || 0;
  const nonPending = completed + failed;
  const winRate = nonPending > 0 ? Math.round((completed / nonPending) * 100) : 0;

  return {
    totalTrades: total,
    completedTrades: completed,
    failedTrades: failed,
    winRate,
  };
}
