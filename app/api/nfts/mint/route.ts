import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// POST - Record a mint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nftId, minterWallet, txHash } = body;

    if (!nftId || !minterWallet || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check for duplicate
    const { data: existing } = await supabase
      .from('nft_mints')
      .select('id')
      .eq('tx_hash', txHash)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Mint already recorded' }, { status: 409 });
    }

    // Get current NFT state
    const { data: nft, error: nftError } = await supabase
      .from('show_nfts')
      .select('total_minted, max_supply, status')
      .eq('id', nftId)
      .single();

    if (nftError || !nft) {
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 });
    }

    if (nft.status === 'sold_out') {
      return NextResponse.json({ error: 'NFT is sold out' }, { status: 400 });
    }

    // Record mint
    const { data, error } = await supabase
      .from('nft_mints')
      .insert({
        nft_id: nftId,
        minter_wallet: minterWallet.toLowerCase(),
        tx_hash: txHash,
        token_id: (nft.total_minted + 1).toString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to record mint:', error);
      return NextResponse.json({ error: 'Failed to record mint' }, { status: 500 });
    }

    // Update NFT total minted
    const newTotal = nft.total_minted + 1;
    const newStatus = newTotal >= nft.max_supply ? 'sold_out' : 'live';

    await supabase
      .from('show_nfts')
      .update({
        total_minted: newTotal,
        status: newStatus,
      })
      .eq('id', nftId);

    return NextResponse.json({
      mint: data,
      tokenId: (nft.total_minted + 1).toString(),
      remaining: nft.max_supply - newTotal,
    });
  } catch (error) {
    console.error('NFT mint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
