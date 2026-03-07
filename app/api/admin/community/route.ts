import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-auth';
import { createServerClient } from '@/lib/supabase/client';

// GET - List all members (admin view - no token balance filter)
export async function GET(request: NextRequest) {
  // Check admin authorization with signature verification
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch members:', error);
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }

    const members = (data || []).map(row => ({
      id: row.id,
      walletAddress: row.wallet_address,
      displayName: row.display_name,
      bio: row.bio,
      tokenBalance: Number(row.token_balance) || 0,
      isVerified: row.is_verified || false,
      isFeatured: row.is_featured || false,
      showsAttended: row.shows_attended || 0,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Admin community GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Perform admin actions on members
export async function POST(request: NextRequest) {
  // Check admin authorization with signature verification
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { memberId, action } = body;

    if (!memberId || !action) {
      return NextResponse.json({ error: 'Member ID and action required' }, { status: 400 });
    }

    const supabase = createServerClient();

    switch (action) {
      case 'verify': {
        const { error } = await supabase
          .from('members')
          .update({ is_verified: true })
          .eq('id', memberId);

        if (error) {
          console.error('Failed to verify member:', error);
          return NextResponse.json({ error: 'Failed to verify member' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Member verified' });
      }

      case 'unverify': {
        const { error } = await supabase
          .from('members')
          .update({ is_verified: false })
          .eq('id', memberId);

        if (error) {
          console.error('Failed to unverify member:', error);
          return NextResponse.json({ error: 'Failed to unverify member' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Member unverified' });
      }

      case 'feature': {
        const { error } = await supabase
          .from('members')
          .update({ is_featured: true })
          .eq('id', memberId);

        if (error) {
          console.error('Failed to feature member:', error);
          return NextResponse.json({ error: 'Failed to feature member' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Member featured' });
      }

      case 'unfeature': {
        const { error } = await supabase
          .from('members')
          .update({ is_featured: false })
          .eq('id', memberId);

        if (error) {
          console.error('Failed to unfeature member:', error);
          return NextResponse.json({ error: 'Failed to unfeature member' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Member unfeatured' });
      }

      case 'delete': {
        const { error } = await supabase
          .from('members')
          .delete()
          .eq('id', memberId);

        if (error) {
          console.error('Failed to delete member:', error);
          return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Member deleted' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin community POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
