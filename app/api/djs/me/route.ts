import { NextRequest, NextResponse } from 'next/server';
import { getDJByWallet, updateDJ, createDJ } from '@/lib/db/djs';
import { isValidWalletAddress } from '@/lib/auth/wallet';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.headers.get('x-wallet-address');

    if (!walletAddress || !isValidWalletAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Missing or invalid wallet address header' },
        { status: 400 }
      );
    }

    const dj = await getDJByWallet(walletAddress);

    if (!dj) {
      return NextResponse.json(
        { error: 'DJ profile not found', exists: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ dj, exists: true });
  } catch (error) {
    console.error('Error fetching DJ profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DJ profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const walletAddress = body.walletAddress;

    if (!walletAddress || !isValidWalletAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Missing or invalid wallet address' },
        { status: 400 }
      );
    }

    // Check if DJ exists
    const existingDJ = await getDJByWallet(walletAddress);

    let dj;
    if (existingDJ) {
      // Update existing profile
      dj = await updateDJ(walletAddress, {
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
    } else {
      // Create new profile
      if (!body.name) {
        return NextResponse.json(
          { error: 'Name is required to create a profile' },
          { status: 400 }
        );
      }

      dj = await createDJ({
        walletAddress,
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
    }

    return NextResponse.json({ dj, created: !existingDJ });
  } catch (error) {
    console.error('Error saving DJ profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to save DJ profile: ${errorMessage}` },
      { status: 500 }
    );
  }
}
