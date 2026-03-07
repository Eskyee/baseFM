import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-auth';
import { createServerClient } from '@/lib/supabase/client';
import { djFromRow, DJRow } from '@/types/dj';
import { setDJResident, setDJVerified, setDJBanned } from '@/lib/db/djs';

// GET all DJs (including banned) - admin only
export async function GET(request: NextRequest) {
  // Check admin authorization with signature verification
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('djs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch DJs:', error);
      return NextResponse.json({ error: 'Failed to fetch DJs' }, { status: 500 });
    }

    const djs = (data || []).map((row) => djFromRow(row as DJRow));

    return NextResponse.json({ djs });
  } catch (error) {
    console.error('Admin DJs GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - update DJ status (resident, verified, banned)
export async function PATCH(request: NextRequest) {
  // Check admin authorization with signature verification
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { djWalletAddress, action, value } = body;

    if (!djWalletAddress || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let dj;

    switch (action) {
      case 'setResident':
        dj = await setDJResident(djWalletAddress, value);
        break;
      case 'setVerified':
        dj = await setDJVerified(djWalletAddress, value);
        break;
      case 'setBanned':
        dj = await setDJBanned(djWalletAddress, value);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ dj });
  } catch (error) {
    console.error('Admin DJs PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
