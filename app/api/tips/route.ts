import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET - Get tips for a DJ or stream
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const djId = searchParams.get('djId');
    const streamId = searchParams.get('streamId');
    const wallet = searchParams.get('wallet');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = createServerClient();

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

    if (wallet) {
      query = query.or(`sender_wallet.eq.${wallet},recipient_wallet.eq.${wallet}`);
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
