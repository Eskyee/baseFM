import { NextRequest, NextResponse } from 'next/server';
import { getDJBySlug, getDJByWallet, updateDJ } from '@/lib/db/djs';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check if slug is a wallet address
    const isWallet = params.slug.startsWith('0x') && params.slug.length === 42;

    const dj = isWallet
      ? await getDJByWallet(params.slug)
      : await getDJBySlug(params.slug);

    if (!dj) {
      return NextResponse.json(
        { error: 'DJ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ dj });
  } catch (error) {
    console.error('Error fetching DJ:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DJ' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();

    // Get DJ by slug first to verify it exists
    const existingDJ = await getDJBySlug(params.slug);
    if (!existingDJ) {
      return NextResponse.json(
        { error: 'DJ not found' },
        { status: 404 }
      );
    }

    // Verify ownership - wallet address must match
    if (body.walletAddress?.toLowerCase() !== existingDJ.walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: you can only update your own profile' },
        { status: 403 }
      );
    }

    const dj = await updateDJ(existingDJ.walletAddress, {
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

    return NextResponse.json({ dj });
  } catch (error) {
    console.error('Error updating DJ:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update DJ: ${errorMessage}` },
      { status: 500 }
    );
  }
}
