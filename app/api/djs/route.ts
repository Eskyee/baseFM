import { NextRequest, NextResponse } from 'next/server';
import { getAllDJs, createDJ, getDJByWallet } from '@/lib/db/djs';
import { isValidWalletAddress } from '@/lib/auth/wallet';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const residentsOnly = searchParams.get('residents') === 'true';
    const limit = searchParams.get('limit');

    const djs = await getAllDJs({
      residentsOnly,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json({ djs });
  } catch (error) {
    console.error('Error fetching DJs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DJs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: name, walletAddress' },
        { status: 400 }
      );
    }

    // Validate wallet address
    if (!isValidWalletAddress(body.walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Check if DJ already exists
    const existingDJ = await getDJByWallet(body.walletAddress);
    if (existingDJ) {
      return NextResponse.json(
        { error: 'DJ profile already exists for this wallet', dj: existingDJ },
        { status: 409 }
      );
    }

    const dj = await createDJ({
      walletAddress: body.walletAddress,
      name: body.name,
      bio: body.bio,
      avatarUrl: body.avatarUrl,
      coverImageUrl: body.coverImageUrl,
      genres: body.genres,
      twitterUrl: body.twitterUrl,
      instagramUrl: body.instagramUrl,
      soundcloudUrl: body.soundcloudUrl,
      mixcloudUrl: body.mixcloudUrl,
      websiteUrl: body.websiteUrl,
    });

    return NextResponse.json({ dj }, { status: 201 });
  } catch (error) {
    console.error('Error creating DJ:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create DJ: ${errorMessage}` },
      { status: 500 }
    );
  }
}
