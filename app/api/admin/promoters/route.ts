import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-auth';
import {
  getAllPromotersAdmin,
  setPromoterVerified,
  setPromoterFeatured,
  setPromoterBanned,
  deletePromoter,
} from '@/lib/db/promoters';

// GET all promoters (including banned) - admin only
export async function GET(request: NextRequest) {
  // Check admin authorization with signature verification
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const promoters = await getAllPromotersAdmin();
    return NextResponse.json({ promoters });
  } catch (error) {
    console.error('Admin Promoters GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch promoters' }, { status: 500 });
  }
}

// PATCH - update promoter status (verify, feature, ban)
export async function PATCH(request: NextRequest) {
  // Check admin authorization with signature verification
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { promoterId, action, value } = body;

    if (!promoterId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let promoter;

    switch (action) {
      case 'setVerified':
        promoter = await setPromoterVerified(promoterId, value);
        break;
      case 'setFeatured':
        promoter = await setPromoterFeatured(promoterId, value);
        break;
      case 'setBanned':
        promoter = await setPromoterBanned(promoterId, value);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ promoter });
  } catch (error) {
    console.error('Admin Promoters PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - remove promoter
export async function DELETE(request: NextRequest) {
  // Check admin authorization with signature verification
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { promoterId } = body;

    if (!promoterId) {
      return NextResponse.json({ error: 'Missing promoterId' }, { status: 400 });
    }

    await deletePromoter(promoterId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Promoters DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
