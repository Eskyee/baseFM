import { NextRequest, NextResponse } from 'next/server';
import {
  getScheduleSlotById,
  updateScheduleSlot,
  deleteScheduleSlot,
} from '@/lib/db/schedule';
import { isAdminWallet } from '@/lib/admin/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slot = await getScheduleSlotById(params.id);

    if (!slot) {
      return NextResponse.json(
        { error: 'Schedule slot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ slot });
  } catch (error) {
    console.error('Error fetching schedule slot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule slot' },
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

    // Verify admin access
    if (!isAdminWallet(body.walletAddress)) {
      return NextResponse.json(
        { error: 'Unauthorized: admin access required' },
        { status: 403 }
      );
    }

    // Check if slot exists
    const existing = await getScheduleSlotById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Schedule slot not found' },
        { status: 404 }
      );
    }

    const slot = await updateScheduleSlot(params.id, {
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      endTime: body.endTime,
      showName: body.showName,
      description: body.description,
      genre: body.genre,
      coverImageUrl: body.coverImageUrl,
      djId: body.djId,
      djWalletAddress: body.djWalletAddress,
      isRecurring: body.isRecurring,
      isActive: body.isActive,
    });

    return NextResponse.json({ slot });
  } catch (error) {
    console.error('Error updating schedule slot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update schedule slot: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));

    // Verify admin access
    if (!isAdminWallet(body.walletAddress)) {
      return NextResponse.json(
        { error: 'Unauthorized: admin access required' },
        { status: 403 }
      );
    }

    // Check if slot exists
    const existing = await getScheduleSlotById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Schedule slot not found' },
        { status: 404 }
      );
    }

    await deleteScheduleSlot(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule slot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete schedule slot: ${errorMessage}` },
      { status: 500 }
    );
  }
}
