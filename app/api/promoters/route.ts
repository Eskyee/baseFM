import { NextRequest, NextResponse } from 'next/server';
import { getAllPromoters, createPromoter, getPromoterByWallet } from '@/lib/db/promoters';
import { PromoterType } from '@/types/event';

// GET all promoters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as PromoterType | null;
    const verified = searchParams.get('verified') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const wallet = searchParams.get('wallet');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // If requesting by wallet, return single promoter
    if (wallet) {
      const promoter = await getPromoterByWallet(wallet);
      if (!promoter) {
        return NextResponse.json({ promoter: null });
      }
      return NextResponse.json({ promoter });
    }

    const promoters = await getAllPromoters({
      type: type || undefined,
      verified: verified || undefined,
      featured: featured || undefined,
      limit,
    });

    return NextResponse.json({ promoters });
  } catch (error) {
    console.error('Promoters GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch promoters' }, { status: 500 });
  }
}

// POST create new promoter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      walletAddress,
      name,
      bio,
      logoUrl,
      coverImageUrl,
      email,
      websiteUrl,
      twitterUrl,
      instagramUrl,
      farcasterUrl,
      city,
      country,
      type,
      genres,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // Check if promoter with wallet already exists
    if (walletAddress) {
      const existing = await getPromoterByWallet(walletAddress);
      if (existing) {
        return NextResponse.json(
          { error: 'Promoter with this wallet already exists', promoter: existing },
          { status: 409 }
        );
      }
    }

    const promoter = await createPromoter({
      walletAddress,
      name,
      bio,
      logoUrl,
      coverImageUrl,
      email,
      websiteUrl,
      twitterUrl,
      instagramUrl,
      farcasterUrl,
      city,
      country,
      type,
      genres,
    });

    return NextResponse.json({ promoter }, { status: 201 });
  } catch (error) {
    console.error('Promoters POST error:', error);
    return NextResponse.json({ error: 'Failed to create promoter' }, { status: 500 });
  }
}
