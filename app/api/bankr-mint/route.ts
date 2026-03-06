import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { createServerClient } from '@/lib/supabase/client';

// ============================================================
// Bankr Mint API Route — Server Only
// Pattern: BANKR-INTEGRATION-SPEC.md §6
//
// - Private keys NEVER leave server
// - Prompts are whitelisted templates — no user free text
// - Address is validated before any execution
// ============================================================

// Whitelisted prompt templates
// Only these patterns are allowed. The SDK prompt is assembled server-side.
const PROMPT_TEMPLATES = {
  ravepass: (address: string) =>
    `mint an NFT called RavePass for ${address} on base`,
  eventpass: (address: string, eventName: string) =>
    `mint an NFT called ${eventName} for ${address} on base`,
  drop: (address: string, dropName: string) =>
    `mint an NFT called ${dropName} for ${address} on base`,
} as const;

type PromptType = keyof typeof PROMPT_TEMPLATES;

const VALID_PROMPT_TYPES = Object.keys(PROMPT_TEMPLATES) as PromptType[];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, promptType, assetName } = body as {
      walletAddress?: string;
      promptType?: string;
      assetName?: string;
    };

    // ---- Validate wallet address ----
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!isAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // ---- Validate prompt type ----
    if (!promptType || !VALID_PROMPT_TYPES.includes(promptType as PromptType)) {
      return NextResponse.json(
        { error: `Invalid prompt type. Allowed: ${VALID_PROMPT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // ---- Build the prompt from template ----
    let prompt: string;
    const type = promptType as PromptType;

    if (type === 'ravepass') {
      prompt = PROMPT_TEMPLATES.ravepass(walletAddress);
    } else if (type === 'eventpass' || type === 'drop') {
      if (!assetName || typeof assetName !== 'string' || assetName.length > 64) {
        return NextResponse.json(
          { error: 'assetName is required for this prompt type (max 64 chars)' },
          { status: 400 }
        );
      }
      // Sanitize asset name — alphanumeric, spaces, hyphens, underscores only
      const sanitized = assetName.replace(/[^a-zA-Z0-9 _-]/g, '').trim();
      if (!sanitized) {
        return NextResponse.json(
          { error: 'assetName contains no valid characters' },
          { status: 400 }
        );
      }
      prompt = PROMPT_TEMPLATES[type](walletAddress, sanitized);
    } else {
      return NextResponse.json({ error: 'Unknown prompt type' }, { status: 400 });
    }

    // ---- Validate env vars ----
    // Use BANKR_API_KEY (server-only) for security, NOT NEXT_PUBLIC_ prefix
    const apiKey = process.env.BANKR_API_KEY;
    const privateKey = process.env.BANKR_PRIVATE_KEY;

    if (!apiKey || !privateKey) {
      console.error('Bankr credentials not configured');
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // ---- Execute via Bankr SDK ----
    // NOTE: @bankr/sdk is alpha — import dynamically to handle missing package gracefully
    // Using 'any' type because this is an optional, dynamically imported third-party SDK
    let BankrClient: any;
    try {
      const bankrModule = await import('@bankr/sdk');
      BankrClient = bankrModule.BankrClient ?? bankrModule.default;
    } catch {
      console.error('Bankr SDK not installed or failed to load');
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    if (!BankrClient) {
      console.error('BankrClient not available in imported module');
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const bankr = new BankrClient({
      apiKey,
      privateKey,
      network: 'base',
    });

    const response = await bankr.promptAndWait({ prompt });

    // ---- Log the mint to Supabase ----
    try {
      const db = createServerClient();
      await db.from('mint_logs').insert({
        wallet: walletAddress.toLowerCase(),
        event_id: null,
        tx_hash: response?.txHash ?? response?.hash ?? 'unknown',
        timestamp: Math.floor(Date.now() / 1000),
        status: 'success',
      });
    } catch (logError) {
      // Non-fatal — mint succeeded even if logging fails
      console.error('Failed to log mint:', logError);
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Mint failed';
    console.error('Bankr mint error:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
