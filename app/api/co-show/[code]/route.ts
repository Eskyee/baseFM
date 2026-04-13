import { NextRequest, NextResponse } from 'next/server';
import { getCoShowByInviteCode } from '@/lib/db/co-show';

export async function GET(
  _request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const coShow = await getCoShowByInviteCode(params.code);

    if (!coShow) {
      return NextResponse.json({ error: 'Co-show not found' }, { status: 404 });
    }

    // Check expiry
    if (new Date(coShow.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });
    }

    // Return safe fields only — no stream keys
    return NextResponse.json({
      id: coShow.id,
      hostName: coShow.hostName,
      status: coShow.status,
      expiresAt: coShow.expiresAt,
      inviteCode: coShow.inviteCode,
    });
  } catch (error) {
    console.error('Error getting co-show invite:', error);
    return NextResponse.json(
      { error: 'Failed to get co-show info' },
      { status: 500 }
    );
  }
}
