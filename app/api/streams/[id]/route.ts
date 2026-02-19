import { NextRequest, NextResponse } from 'next/server';
import { getStreamById, updateStream, deleteStream } from '@/lib/db/streams';
import { deleteMuxLiveStream } from '@/lib/streaming/mux';
import { verifyWalletSignature } from '@/lib/auth/wallet';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stream = await getStreamById(params.id);

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ stream });
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Verify stream exists
    const existingStream = await getStreamById(params.id);
    if (!existingStream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Verify DJ owns stream
    if (body.djWalletAddress &&
        body.djWalletAddress.toLowerCase() !== existingStream.djWalletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Verify signature if provided (recommended for production)
    if (body.djWalletAddress && body.signature && body.message) {
      const isValidSignature = await verifyWalletSignature(
        body.djWalletAddress,
        body.message,
        body.signature
      );
      
      if (!isValidSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        );
      }
    }

    const updatedStream = await updateStream(params.id, {
      title: body.title,
      description: body.description,
      scheduledStartTime: body.scheduledStartTime,
      isGated: body.isGated,
      requiredTokenAddress: body.requiredTokenAddress,
      requiredTokenAmount: body.requiredTokenAmount,
      coverImageUrl: body.coverImageUrl,
      genre: body.genre,
      tags: body.tags,
    });

    return NextResponse.json({ stream: updatedStream });
  } catch (error) {
    console.error('Error updating stream:', error);
    return NextResponse.json(
      { error: 'Failed to update stream' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify stream exists
    const stream = await getStreamById(params.id);
    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Delete Mux live stream if exists
    if (stream.muxLiveStreamId) {
      await deleteMuxLiveStream(stream.muxLiveStreamId);
    }

    // Delete from database
    await deleteStream(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting stream:', error);
    return NextResponse.json(
      { error: 'Failed to delete stream' },
      { status: 500 }
    );
  }
}
