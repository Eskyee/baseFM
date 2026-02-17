import { createServerClient } from '@/lib/supabase/client';

export interface DJStats {
  totalShows: number;
  totalListeners: number;
  totalTipsEth: number;
  totalTipsCount: number;
  followerCount: number;
  followingCount: number;
  memberSince: string;
  lastActive: string | null;
  mixCount: number;
  avgShowDuration: number | null;
}

export async function getDJStats(djId: string): Promise<DJStats> {
  const supabase = createServerClient();

  // Get basic DJ info
  const { data: dj } = await supabase
    .from('djs')
    .select('total_shows, total_listeners, created_at, updated_at')
    .eq('id', djId)
    .single();

  // Get follower count
  const { count: followerCount } = await supabase
    .from('dj_followers')
    .select('*', { count: 'exact', head: true })
    .eq('dj_id', djId);

  // Get tips stats
  const { data: tips } = await supabase
    .from('tips')
    .select('amount_eth')
    .eq('dj_id', djId)
    .eq('status', 'confirmed');

  const totalTipsEth = tips?.reduce((sum, t) => sum + Number(t.amount_eth), 0) || 0;

  // Get mix count
  const { count: mixCount } = await supabase
    .from('dj_mixes')
    .select('*', { count: 'exact', head: true })
    .eq('dj_id', djId)
    .eq('is_public', true);

  // Get last stream time
  const { data: lastStream } = await supabase
    .from('streams')
    .select('created_at')
    .eq('dj_id', djId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    totalShows: dj?.total_shows || 0,
    totalListeners: dj?.total_listeners || 0,
    totalTipsEth,
    totalTipsCount: tips?.length || 0,
    followerCount: followerCount || 0,
    followingCount: 0, // Could add if DJs can follow each other
    memberSince: dj?.created_at || new Date().toISOString(),
    lastActive: lastStream?.created_at || dj?.updated_at || null,
    mixCount: mixCount || 0,
    avgShowDuration: null, // Could calculate from streams
  };
}

export async function getDJOfTheDay(): Promise<{
  dj: {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string | null;
    genres: string[];
    isVerified: boolean;
    totalShows: number;
  };
  reason: string;
} | null> {
  const supabase = createServerClient();

  // Get today's DJ of the day
  const today = new Date().toISOString().split('T')[0];

  const { data: dotd } = await supabase
    .from('dj_of_the_day')
    .select(`
      reason,
      djs (
        id,
        name,
        slug,
        avatar_url,
        genres,
        is_verified,
        total_shows
      )
    `)
    .eq('featured_date', today)
    .single();

  if (!dotd?.djs) return null;

  // Supabase returns single joined record as object
  const dj = dotd.djs as unknown as {
    id: string;
    name: string;
    slug: string;
    avatar_url: string | null;
    genres: string[];
    is_verified: boolean;
    total_shows: number;
  };

  return {
    dj: {
      id: dj.id,
      name: dj.name,
      slug: dj.slug,
      avatarUrl: dj.avatar_url,
      genres: dj.genres || [],
      isVerified: dj.is_verified,
      totalShows: dj.total_shows,
    },
    reason: dotd.reason || 'Featured DJ',
  };
}

export async function followDJ(djId: string, followerWallet: string): Promise<void> {
  const supabase = createServerClient();

  await supabase.from('dj_followers').insert({
    dj_id: djId,
    follower_wallet: followerWallet.toLowerCase(),
  });
}

export async function unfollowDJ(djId: string, followerWallet: string): Promise<void> {
  const supabase = createServerClient();

  await supabase
    .from('dj_followers')
    .delete()
    .eq('dj_id', djId)
    .eq('follower_wallet', followerWallet.toLowerCase());
}

export async function isFollowingDJ(djId: string, followerWallet: string): Promise<boolean> {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('dj_followers')
    .select('id')
    .eq('dj_id', djId)
    .eq('follower_wallet', followerWallet.toLowerCase())
    .single();

  return !!data;
}

export async function getTopDJs(limit: number = 10): Promise<{
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  genres: string[];
  isVerified: boolean;
  isResident: boolean;
  totalShows: number;
  totalListeners: number;
}[]> {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('djs')
    .select('id, name, slug, avatar_url, genres, is_verified, is_resident, total_shows, total_listeners')
    .eq('is_banned', false)
    .order('total_shows', { ascending: false })
    .order('total_listeners', { ascending: false })
    .limit(limit);

  return (data || []).map((dj) => ({
    id: dj.id,
    name: dj.name,
    slug: dj.slug,
    avatarUrl: dj.avatar_url,
    genres: dj.genres || [],
    isVerified: dj.is_verified,
    isResident: dj.is_resident,
    totalShows: dj.total_shows,
    totalListeners: dj.total_listeners,
  }));
}
