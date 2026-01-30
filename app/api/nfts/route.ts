import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { showNFTFromRow, ShowNFTRow } from '@/types/nft';

// GET - Get NFTs (all live ones, or for a specific stream/DJ)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');
    const djId = searchParams.get('djId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = createServerClient();

    let query = supabase
      .from('show_nfts')
      .select('*')
      .in('status', ['live', 'sold_out'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (streamId) {
      query = query.eq('stream_id', streamId);
    }

    if (djId) {
      query = query.eq('dj_id', djId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch NFTs:', error);
      return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 });
    }

    const nfts = (data || []).map((row) => showNFTFromRow(row as ShowNFTRow));

    return NextResponse.json({ nfts });
  } catch (error) {
    console.error('NFTs GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new NFT for a show
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      streamId,
      djWallet,
      djId,
      title,
      description,
      imageUrl,
      animationUrl,
      maxSupply,
      mintPriceWei,
      isFree,
    } = body;

    if (!streamId || !djWallet || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check if NFT already exists for this stream
    const { data: existing } = await supabase
      .from('show_nfts')
      .select('id')
      .eq('stream_id', streamId)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'NFT already exists for this show' }, { status: 409 });
    }

    // Create NFT
    const { data, error } = await supabase
      .from('show_nfts')
      .insert({
        stream_id: streamId,
        dj_wallet: djWallet.toLowerCase(),
        dj_id: djId || null,
        title,
        description: description || null,
        image_url: imageUrl || null,
        animation_url: animationUrl || null,
        max_supply: maxSupply || 100,
        mint_price_wei: mintPriceWei || '0',
        is_free: isFree !== false,
        status: 'live',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create NFT:', error);
      return NextResponse.json({ error: 'Failed to create NFT' }, { status: 500 });
    }

    return NextResponse.json({ nft: showNFTFromRow(data as ShowNFTRow) });
  } catch (error) {
    console.error('NFTs POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
