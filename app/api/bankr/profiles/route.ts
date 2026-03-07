import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBankrProfiles,
  fetchBankrProfile,
  type BankrProfileFilter,
} from '@/lib/bankr';

/**
 * GET /api/bankr/profiles
 *
 * Fetch Bankr ecosystem profiles
 *
 * Query params:
 *   - filter: 'all' | 'agents' | 'projects' | 'top-traders' | 'new'
 *   - page: number (default 1)
 *   - limit: number (default 20, max 50)
 *   - search: string (optional search query)
 *   - handle: string (optional - fetch single profile by handle)
 *   - tags: comma-separated tags (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if requesting single profile by handle
    const handle = searchParams.get('handle');
    if (handle) {
      const profile = await fetchBankrProfile(handle);
      if (!profile) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ profile });
    }

    // Parse query params for list request
    const filter = (searchParams.get('filter') || 'all') as BankrProfileFilter;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
    );
    const search = searchParams.get('search') || undefined;
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : undefined;

    // Validate filter
    const validFilters: BankrProfileFilter[] = [
      'all',
      'agents',
      'projects',
      'top-traders',
      'new',
    ];
    if (!validFilters.includes(filter)) {
      return NextResponse.json(
        { error: 'Invalid filter. Must be one of: ' + validFilters.join(', ') },
        { status: 400 }
      );
    }

    // Fetch profiles
    const result = await fetchBankrProfiles({
      filter,
      page,
      limit,
      search,
      tags,
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching Bankr profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}
