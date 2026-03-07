/**
 * Bankr Agent SDK Integration
 *
 * Re-exports all Bankr functionality for easy imports.
 *
 * Usage:
 *   import { runTradingCycle, checkBalance } from '@/lib/bankr';
 *
 * Documentation:
 *   - https://docs.bankr.bot
 *   - https://docs.bankr.bot/llm (LLM-friendly docs)
 *   - https://docs.bankr.bot/api (API reference)
 */

// Configuration and types
export {
  BANKR_API_BASE,
  BANKR_ENDPOINTS,
  BANKR_PROFILES_ENDPOINT,
  AGENT_CONFIG,
  SCAN_PROMPTS,
  getBankrApiKey,
  isBankrConfigured,
  parseTokenPicks,
  filterTradablePicks,
  type ConvictionLevel,
  type TokenPick,
  type BankrPromptResponse,
  type BankrJobResponse,
  type BankrTransaction,
  type BankrBalance,
  type BankrBalanceResponse,
  type AgentLogType,
  type AgentLog,
  type TradeDecision,
  type BankrProfile,
  type BankrProfilesResponse,
  type BankrProfileFilter,
} from './config';

// Agent workflow functions
export {
  submitPrompt,
  waitForJob,
  promptAndWait,
  fetchBalances,
  scan,
  decide,
  execute,
  checkBalance,
  runTradingCycle,
  analyzeToken,
} from './agent';

// Profiles browsing
export {
  fetchBankrProfiles,
  fetchBankrProfile,
  type FetchProfilesOptions,
} from './profiles';
