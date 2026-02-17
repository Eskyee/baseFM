// Event Crew Management API
import { NextRequest, NextResponse } from 'next/server';
import {
  getEventCrew,
  addCrewMember,
  removeCrewMember,
  checkInCrewMember,
  isEventCrew,
  type CrewRole,
} from '@/lib/db/crew';

// GET /api/crew?eventId=xxx - Get all crew for an event
// GET /api/crew?eventId=xxx&wallet=xxx - Check if wallet is crew
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const wallet = searchParams.get('wallet');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    // Check single wallet
    if (wallet) {
      const result = await isEventCrew(eventId, wallet);
      return NextResponse.json(result);
    }

    // Get all crew
    const crew = await getEventCrew(eventId);
    return NextResponse.json({ crew });
  } catch (error) {
    console.error('Error fetching crew:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crew' },
      { status: 500 }
    );
  }
}

// POST /api/crew - Add crew member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventId,
      walletAddress,
      role,
      addedBy,
      name,
      contact,
      setTime,
      setDurationMinutes,
      notes,
    } = body;

    if (!eventId || !walletAddress || !role || !addedBy) {
      return NextResponse.json(
        { error: 'eventId, walletAddress, role, and addedBy are required' },
        { status: 400 }
      );
    }

    // Validate role - all valid roles from CREW_ROLE_LABELS
    const validRoles: CrewRole[] = [
      'promoter', 'production_manager', 'stage_manager', 'event_coordinator',
      'door', 'box_office', 'vip_host', 'cloakroom',
      'security', 'medical', 'fire_marshal',
      'sound_engineer', 'monitor_engineer', 'audio_tech',
      'lighting_tech', 'visual_tech', 'laser_tech',
      'stage_build', 'rigging', 'backline', 'decor',
      'artist', 'manager', 'talent_liaison',
      'bar', 'catering', 'hospitality',
      'runner', 'transport', 'parking', 'cleaning',
      'media', 'marketing', 'social_media',
      'volunteer', 'other',
    ];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const crewMember = await addCrewMember(eventId, walletAddress, role, addedBy, {
      name,
      contact,
      setTime,
      setDurationMinutes,
      notes,
    });

    return NextResponse.json({ crewMember }, { status: 201 });
  } catch (error) {
    console.error('Error adding crew member:', error);
    return NextResponse.json(
      { error: 'Failed to add crew member' },
      { status: 500 }
    );
  }
}

// PATCH /api/crew - Check in crew member
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { crewId, action } = body;

    if (!crewId || action !== 'checkin') {
      return NextResponse.json(
        { error: 'crewId and action=checkin are required' },
        { status: 400 }
      );
    }

    const crewMember = await checkInCrewMember(crewId);
    return NextResponse.json({ crewMember });
  } catch (error) {
    console.error('Error checking in crew member:', error);
    return NextResponse.json(
      { error: 'Failed to check in crew member' },
      { status: 500 }
    );
  }
}

// DELETE /api/crew?crewId=xxx - Remove crew member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crewId = searchParams.get('crewId');

    if (!crewId) {
      return NextResponse.json(
        { error: 'crewId is required' },
        { status: 400 }
      );
    }

    await removeCrewMember(crewId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing crew member:', error);
    return NextResponse.json(
      { error: 'Failed to remove crew member' },
      { status: 500 }
    );
  }
}
