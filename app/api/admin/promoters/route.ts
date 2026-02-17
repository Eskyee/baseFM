import { NextRequest, NextResponse } from 'next/server';
import { isAdminWallet } from '@/lib/admin/config';
import {
  getAllPromotersAdmin,
  setPromoterVerified,
  setPromoterFeatured,
  setPromoterBanned,
  deletePromoter,
} from '@/lib/db/promoters';

// GET all promoters (including banned) - admin only
export async function GET() {
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
  try {
    const body = await request.json();
    const { walletAddress, promoterId, action, value } = body;

    // Check admin authorization
    if (!isAdminWallet(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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
  try {
    const body = await request.json();
    const { walletAddress, promoterId } = body;

    // Check admin authorization
    if (!isAdminWallet(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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
