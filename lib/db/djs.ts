import { createServerClient } from '@/lib/supabase/client';
import { DJ, DJRow, djFromRow, CreateDJInput, UpdateDJInput } from '@/types/dj';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getDJByWallet(walletAddress: string): Promise<DJ | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('djs')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error || !data) return null;
  return djFromRow(data as DJRow);
}

export async function getDJBySlug(slug: string): Promise<DJ | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('djs')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .single();

  if (error || !data) return null;
  return djFromRow(data as DJRow);
}

export async function getDJById(id: string): Promise<DJ | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('djs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return djFromRow(data as DJRow);
}

export async function getAllDJs(options?: {
  residentsOnly?: boolean;
  limit?: number;
}): Promise<DJ[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('djs')
    .select('*')
    .eq('is_banned', false)
    .order('is_resident', { ascending: false })
    .order('total_shows', { ascending: false });

  if (options?.residentsOnly) {
    query = query.eq('is_resident', true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map((row) => djFromRow(row as DJRow));
}

export async function createDJ(input: CreateDJInput): Promise<DJ> {
  const supabase = createServerClient();

  // Generate unique slug
  let baseSlug = generateSlug(input.name);
  let slug = baseSlug;
  let counter = 1;

  // Check for existing slug and make unique if needed
  while (true) {
    const existing = await getDJBySlug(slug);
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const { data, error } = await supabase
    .from('djs')
    .insert({
      wallet_address: input.walletAddress.toLowerCase(),
      name: input.name,
      slug,
      bio: input.bio,
      avatar_url: input.avatarUrl,
      cover_image_url: input.coverImageUrl,
      genres: input.genres || [],
      twitter_url: input.twitterUrl,
      instagram_url: input.instagramUrl,
      farcaster_url: input.farcasterUrl,
      soundcloud_url: input.soundcloudUrl,
      mixcloud_url: input.mixcloudUrl,
      youtube_url: input.youtubeUrl,
      spotify_url: input.spotifyUrl,
      apple_music_url: input.appleMusicUrl,
      bandcamp_url: input.bandcampUrl,
      website_url: input.websiteUrl,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return djFromRow(data as DJRow);
}

export async function updateDJ(walletAddress: string, input: UpdateDJInput): Promise<DJ> {
  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};

  // Handle name change with unique slug generation
  if (input.name !== undefined) {
    updateData.name = input.name;

    // Generate unique slug for the new name
    const baseSlug = generateSlug(input.name);
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slug (excluding current DJ)
    while (true) {
      const { data: existing } = await supabase
        .from('djs')
        .select('wallet_address')
        .eq('slug', slug)
        .neq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
      // Safety limit to prevent infinite loops
      if (counter > 100) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }

    updateData.slug = slug;
  }
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;
  if (input.coverImageUrl !== undefined) updateData.cover_image_url = input.coverImageUrl;
  if (input.genres !== undefined) updateData.genres = input.genres;
  if (input.twitterUrl !== undefined) updateData.twitter_url = input.twitterUrl;
  if (input.instagramUrl !== undefined) updateData.instagram_url = input.instagramUrl;
  if (input.farcasterUrl !== undefined) updateData.farcaster_url = input.farcasterUrl;
  if (input.soundcloudUrl !== undefined) updateData.soundcloud_url = input.soundcloudUrl;
  if (input.mixcloudUrl !== undefined) updateData.mixcloud_url = input.mixcloudUrl;
  if (input.youtubeUrl !== undefined) updateData.youtube_url = input.youtubeUrl;
  if (input.spotifyUrl !== undefined) updateData.spotify_url = input.spotifyUrl;
  if (input.appleMusicUrl !== undefined) updateData.apple_music_url = input.appleMusicUrl;
  if (input.bandcampUrl !== undefined) updateData.bandcamp_url = input.bandcampUrl;
  if (input.websiteUrl !== undefined) updateData.website_url = input.websiteUrl;

  const { data, error } = await supabase
    .from('djs')
    .update(updateData)
    .eq('wallet_address', walletAddress.toLowerCase())
    .select()
    .single();

  // Handle unique constraint violation gracefully
  if (error?.code === '23505') {
    throw new Error('A DJ with this name already exists. Please choose a different name.');
  }
  if (error) throw new Error(error.message);
  return djFromRow(data as DJRow);
}

export async function incrementDJShowCount(walletAddress: string): Promise<boolean> {
  const supabase = createServerClient();

  const { data, error } = await supabase.rpc('increment_dj_shows', {
    wallet: walletAddress.toLowerCase(),
  });

  if (error) {
    console.error('Failed to increment DJ show count:', error.message);
    return false;
  }

  // RPC returns boolean indicating success
  if (data === false) {
    console.warn(`No DJ found with wallet: ${walletAddress}`);
    return false;
  }

  return true;
}

// Admin functions
export async function setDJResident(walletAddress: string, isResident: boolean): Promise<DJ> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('djs')
    .update({ is_resident: isResident })
    .eq('wallet_address', walletAddress.toLowerCase())
    .select()
    .single();

  if (error) throw new Error(error.message);
  return djFromRow(data as DJRow);
}

export async function setDJBanned(walletAddress: string, isBanned: boolean): Promise<DJ> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('djs')
    .update({ is_banned: isBanned })
    .eq('wallet_address', walletAddress.toLowerCase())
    .select()
    .single();

  if (error) throw new Error(error.message);
  return djFromRow(data as DJRow);
}

export async function setDJVerified(walletAddress: string, isVerified: boolean): Promise<DJ> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('djs')
    .update({ is_verified: isVerified })
    .eq('wallet_address', walletAddress.toLowerCase())
    .select()
    .single();

  if (error) throw new Error(error.message);
  return djFromRow(data as DJRow);
}
