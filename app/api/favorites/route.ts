import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET - Get user's favorite DJs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        dj_id,
        created_at,
        djs (
          id,
          name,
          slug,
          avatar_url,
          is_resident
        )
      `)
      .eq('wallet_address', walletAddress.toLowerCase());

    if (error) {
      console.error('Failed to fetch favorites:', error);
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }

    return NextResponse.json({ favorites: data || [] });
  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add DJ to favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, djId } = body;

    if (!walletAddress || !djId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        dj_id: djId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already following this DJ' }, { status: 409 });
      }
      console.error('Failed to add favorite:', error);
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }

    return NextResponse.json({ favorite: data });
  } catch (error) {
    console.error('Favorites POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove DJ from favorites
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const djId = searchParams.get('djId');

    if (!walletAddress || !djId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('dj_id', djId);

    if (error) {
      console.error('Failed to remove favorite:', error);
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorites DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
