import { createClient } from '@supabase/supabase-js';

/**
 * Headliner profiles — public read, admin write.
 *
 * Mirrors the headliner invite-code system: admin curates the list, the
 * /headliners page renders whatever is published. Until anything is
 * published, the page shows the "Stay Tuned" empty state.
 */

export interface HeadlinerSocials {
  instagram?: string;
  soundcloud?: string;
  mixcloud?: string;
  x?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
}

export interface HeadlinerProfile {
  id: string;
  slug: string;
  displayName: string;
  tagline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  genres: string[];
  city: string | null;
  walletAddress: string | null;
  ensName: string | null;
  farcasterFid: number | null;
  farcasterHandle: string | null;
  socials: HeadlinerSocials;
  nextShowAt: string | null;
  nextShowUrl: string | null;
  isPublished: boolean;
  featuredRank: number | null;
  createdAt: string;
  updatedAt: string;
}

function readClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  // Anon key is fine for reads — the table is filtered by is_published in RLS
  // when policies are configured; here we filter explicitly in the query.
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) throw new Error('Supabase credentials missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) throw new Error('Supabase service role credentials missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Public read: published profiles, ordered by featured rank then recency. */
export async function listPublishedHeadliners(): Promise<HeadlinerProfile[]> {
  const supabase = readClient();
  const { data, error } = await supabase
    .from('headliner_profiles')
    .select('*')
    .eq('is_published', true)
    .order('featured_rank', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

/** Public read: single published profile by slug. */
export async function getHeadlinerBySlug(slug: string): Promise<HeadlinerProfile | null> {
  const supabase = readClient();
  const { data, error } = await supabase
    .from('headliner_profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) return null;
  return data ? mapRow(data) : null;
}

/** Admin write: insert or update a profile. Auth handled at the route level. */
export async function upsertHeadlinerProfile(input: {
  id?: string;
  slug: string;
  displayName: string;
  tagline?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  genres?: string[];
  city?: string;
  walletAddress?: string;
  ensName?: string;
  farcasterFid?: number;
  farcasterHandle?: string;
  socials?: HeadlinerSocials;
  nextShowAt?: string;
  nextShowUrl?: string;
  isPublished?: boolean;
  featuredRank?: number;
  createdBy?: string;
}): Promise<HeadlinerProfile> {
  const supabase = adminClient();
  const payload = {
    id: input.id,
    slug: input.slug.toLowerCase().trim(),
    display_name: input.displayName,
    tagline: input.tagline ?? null,
    bio: input.bio ?? null,
    avatar_url: input.avatarUrl ?? null,
    banner_url: input.bannerUrl ?? null,
    genres: input.genres ?? [],
    city: input.city ?? null,
    wallet_address: input.walletAddress?.toLowerCase() ?? null,
    ens_name: input.ensName ?? null,
    farcaster_fid: input.farcasterFid ?? null,
    farcaster_handle: input.farcasterHandle ?? null,
    socials: input.socials ?? {},
    next_show_at: input.nextShowAt ?? null,
    next_show_url: input.nextShowUrl ?? null,
    is_published: input.isPublished ?? false,
    featured_rank: input.featuredRank ?? null,
    created_by: input.createdBy ?? null,
  };

  const { data, error } = await supabase
    .from('headliner_profiles')
    .upsert(payload, { onConflict: 'slug' })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Upsert failed');
  return mapRow(data);
}

/** Admin write: delete a profile. */
export async function deleteHeadlinerProfile(idOrSlug: string): Promise<void> {
  const supabase = adminClient();
  const { error } = await supabase
    .from('headliner_profiles')
    .delete()
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
  if (error) throw new Error(error.message);
}

interface ProfileRow {
  id: string;
  slug: string;
  display_name: string;
  tagline: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  genres: string[] | null;
  city: string | null;
  wallet_address: string | null;
  ens_name: string | null;
  farcaster_fid: number | null;
  farcaster_handle: string | null;
  socials: HeadlinerSocials | null;
  next_show_at: string | null;
  next_show_url: string | null;
  is_published: boolean;
  featured_rank: number | null;
  created_at: string;
  updated_at: string;
}

function mapRow(r: ProfileRow): HeadlinerProfile {
  return {
    id: r.id,
    slug: r.slug,
    displayName: r.display_name,
    tagline: r.tagline,
    bio: r.bio,
    avatarUrl: r.avatar_url,
    bannerUrl: r.banner_url,
    genres: r.genres ?? [],
    city: r.city,
    walletAddress: r.wallet_address,
    ensName: r.ens_name,
    farcasterFid: r.farcaster_fid,
    farcasterHandle: r.farcaster_handle,
    socials: r.socials ?? {},
    nextShowAt: r.next_show_at,
    nextShowUrl: r.next_show_url,
    isPublished: r.is_published,
    featuredRank: r.featured_rank,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
