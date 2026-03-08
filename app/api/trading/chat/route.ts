import { NextRequest, NextResponse } from 'next/server';
import { isBankrConfigured, promptAndWait } from '@/lib/bankr';
import { isAdminWallet } from '@/lib/admin/config';

/**
 * POST /api/trading/chat
 *
 * Chat endpoint for Bankr AI prompts.
 * Accepts a prompt and returns the AI response.
 * REQUIRES admin wallet for security.
 *
 * Request body: { prompt: string, wallet: string }
 * Response: { response: string, transactions?: array }
 */
export async function POST(req: NextRequest) {
  // Check if Bankr is configured
  if (!isBankrConfigured()) {
    return NextResponse.json(
      {
        error: 'Bankr API not configured',
        response: 'Bankr API is not configured. Please set BANKR_API_KEY in environment variables.',
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { prompt, wallet } = body as { prompt?: string; wallet?: string };

    // Require admin wallet for chat operations (security: prevents unauthorized trades)
    if (!wallet || !isAdminWallet(wallet)) {
      return NextResponse.json(
        { error: 'Admin wallet required', response: 'This feature requires admin access.' },
        { status: 403 }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required', response: 'Please provide a message.' },
        { status: 400 }
      );
    }

    // Sanitize and limit prompt length
    const sanitizedPrompt = prompt.trim().slice(0, 500);

    if (sanitizedPrompt.length === 0) {
      return NextResponse.json(
        { error: 'Empty prompt', response: 'Please provide a message.' },
        { status: 400 }
      );
    }

    // Send prompt to Bankr and wait for response
    const result = await promptAndWait(sanitizedPrompt);

    return NextResponse.json({
      success: true,
      response: result.response || 'No response from Bankr.',
      transactions: result.transactions || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat request failed';
    console.error('Bankr chat error:', message);

    // Return user-friendly error
    let userMessage = 'Sorry, I encountered an error processing your request.';
    if (message.includes('403')) {
      userMessage = 'API key lacks Agent API access. Please enable it at bankr.bot/api';
    } else if (message.includes('timeout')) {
      userMessage = 'Request timed out. Please try again.';
    }

    return NextResponse.json({
      error: message,
      response: userMessage,
    });
  }
}

/**
 * GET /api/trading/chat
 *
 * Returns API status
 */
export async function GET() {
  return NextResponse.json({
    configured: isBankrConfigured(),
    status: isBankrConfigured() ? 'ready' : 'unconfigured',
  });
}
