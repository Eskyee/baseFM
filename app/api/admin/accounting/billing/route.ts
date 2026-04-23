import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-auth';
import { getBillingTotals } from '@/lib/db/billing';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';
    const days = dateRange === 'all'
      ? null
      : dateRange === '7d'
      ? 7
      : dateRange === '90d'
      ? 90
      : 30;

    const billing = await getBillingTotals(days);
    return NextResponse.json(billing);
  } catch (error) {
    console.error('Error in accounting billing API:', error);
    return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
  }
}
