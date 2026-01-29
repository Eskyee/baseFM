import { NextRequest, NextResponse } from 'next/server';
import {
  getScheduleSlots,
  createScheduleSlot,
  getTodaySchedule,
  getCurrentAndUpcomingSlots,
} from '@/lib/db/schedule';
import { isAdminWallet } from '@/lib/admin/config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dayOfWeek = searchParams.get('day');
    const today = searchParams.get('today') === 'true';
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = searchParams.get('limit');

    let slots;

    if (today) {
      slots = await getTodaySchedule();
    } else if (upcoming) {
      slots = await getCurrentAndUpcomingSlots(limit ? parseInt(limit, 10) : 5);
    } else {
      slots = await getScheduleSlots({
        dayOfWeek: dayOfWeek !== null ? parseInt(dayOfWeek, 10) : undefined,
      });
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify admin access
    if (!isAdminWallet(body.walletAddress)) {
      return NextResponse.json(
        { error: 'Unauthorized: admin access required' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (
      body.dayOfWeek === undefined ||
      !body.startTime ||
      !body.endTime ||
      !body.showName
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: dayOfWeek, startTime, endTime, showName' },
        { status: 400 }
      );
    }

    const slot = await createScheduleSlot({
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
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule slot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create schedule slot: ${errorMessage}` },
      { status: 500 }
    );
  }
}
