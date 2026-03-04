/**
 * Trading balance information
 */
export interface TradingBalance {
  /** Unique identifier for this balance snapshot */
  id: string;
  /** Total portfolio value in USD */
  totalUsd: number;
  /** Breakdown by token (token symbol -> USD value) */
  breakdown: Record<string, number>;
}

/**
 * Trade record
 */
export interface Trade {
  /** Unique trade identifier */
  id: string;
  /** Trade status */
  status: 'pending' | 'completed' | 'failed';
  /** Token being swapped from */
  tokenIn: string;
  /** Token being swapped to */
  tokenOut: string;
  /** ISO timestamp of trade creation */
  createdAt: string;
}

/**
 * Trading log entry types
 */
export type TradingLogType =
  | 'trade'
  | 'response'
  | 'analysis'
  | 'error'
  | 'balance_update'
  | 'scanning'
  | 'system';

/**
 * Trading log entry
 */
export interface TradingLog {
  /** Unique log identifier */
  id?: string;
  /** Log entry type */
  type: TradingLogType;
  /** Log message content */
  content: string;
  /** ISO timestamp of log creation */
  createdAt: string;
}
