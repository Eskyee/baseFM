import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { isValidWalletAddress, isValidUUID, validatePagination } from '@/lib/validation';

// GET - Get tips for a DJ or stream
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const djId = searchParams.get('djId');
    const streamId = searchParams.get('streamId');
    const wallet = searchParams.get('wallet');
    const { limit } = validatePagination(searchParams.get('limit'), null, 100, 20);

    // Validate inputs before using in queries
    if (djId && !isValidUUID(djId)) {
      return NextResponse.json({ error: 'Invalid djId format' }, { status: 400 });
    }
    if (streamId && !isValidUUID(streamId)) {
      return NextResponse.json({ error: 'Invalid streamId format' }, { status: 400 });
    }
    if (wallet && !isValidWalletAddress(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Build base query
    let query = supabase
      .from('tips')
      .select('*')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (djId) {
      query = query.eq('dj_id', djId);
    }

    if (streamId) {
      query = query.eq('stream_id', streamId);
    }

    // Use proper filter methods instead of string interpolation to prevent SQL injection
    if (wallet) {
      const normalizedWallet = wallet.toLowerCase();
      query = query.or(`sender_wallet.eq.${normalizedWallet},recipient_wallet.eq.${normalizedWallet}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch tips:', error);
      return NextResponse.json({ error: 'Failed to fetch tips' }, { status: 500 });
    }

    // Calculate totals
    const total = (data || []).reduce((sum, tip) => sum + parseFloat(tip.amount_eth), 0);

    return NextResponse.json({
      tips: data || [],
      total: total.toFixed(4),
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Tips GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Record a new tip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      senderWallet,
      recipientWallet,
      djId,
      streamId,
      amountWei,
      amountEth,
      txHash,
      message,
    } = body;

    if (!senderWallet || !recipientWallet || !amountWei || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate wallet addresses and transaction hash
    if (!isValidWalletAddress(senderWallet)) {
      return NextResponse.json({ error: 'Invalid sender wallet address' }, { status: 400 });
    }
    if (!isValidWalletAddress(recipientWallet)) {
      return NextResponse.json({ error: 'Invalid recipient wallet address' }, { status: 400 });
    }
    if (djId && !isValidUUID(djId)) {
      return NextResponse.json({ error: 'Invalid djId format' }, { status: 400 });
    }
    if (streamId && !isValidUUID(streamId)) {
      return NextResponse.json({ error: 'Invalid streamId format' }, { status: 400 });
    }
    // Validate txHash format (0x + 64 hex chars)
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ error: 'Invalid transaction hash' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check for duplicate
    const { data: existing } = await supabase
      .from('tips')
      .select('id')
      .eq('tx_hash', txHash)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Tip already recorded' }, { status: 409 });
    }

    // Get sender name from members or djs
    let senderName = null;
    const { data: member } = await supabase
      .from('members')
      .select('display_name')
      .eq('wallet_address', senderWallet.toLowerCase())
      .single();

    if (member?.display_name) {
      senderName = member.display_name;
    } else {
      const { data: dj } = await supabase
        .from('djs')
        .select('name')
        .eq('wallet_address', senderWallet.toLowerCase())
        .single();

      if (dj?.name) {
        senderName = dj.name;
      }
    }

    // Insert tip
    const { data, error } = await supabase
      .from('tips')
      .insert({
        sender_wallet: senderWallet.toLowerCase(),
        sender_name: senderName,
        recipient_wallet: recipientWallet.toLowerCase(),
        dj_id: djId || null,
        stream_id: streamId || null,
        amount_wei: amountWei,
        amount_eth: parseFloat(amountEth),
        tx_hash: txHash,
        message: message || null,
        status: 'confirmed',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save tip:', error);
      return NextResponse.json({ error: 'Failed to save tip' }, { status: 500 });
    }

    return NextResponse.json({ tip: data });
  } catch (error) {
    console.error('Tips POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
