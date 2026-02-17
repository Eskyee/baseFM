import { createServerClient } from '@/lib/supabase/client';
import {
  Promoter,
  PromoterRow,
  promoterFromRow,
  CreatePromoterInput,
  UpdatePromoterInput,
  PromoterType,
} from '@/types/event';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getPromoterById(id: string): Promise<Promoter | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('promoters')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return promoterFromRow(data as PromoterRow);
}

export async function getPromoterBySlug(slug: string): Promise<Promoter | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('promoters')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .single();

  if (error || !data) return null;
  return promoterFromRow(data as PromoterRow);
}

export async function getPromoterByWallet(walletAddress: string): Promise<Promoter | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('promoters')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error || !data) return null;
  return promoterFromRow(data as PromoterRow);
}

export async function getAllPromoters(options?: {
  type?: PromoterType;
  verified?: boolean;
  featured?: boolean;
  limit?: number;
}): Promise<Promoter[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('promoters')
    .select('*')
    .eq('is_banned', false)
    .order('is_featured', { ascending: false })
    .order('total_events', { ascending: false });

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.verified) {
    query = query.eq('is_verified', true);
  }

  if (options?.featured) {
    query = query.eq('is_featured', true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map((row) => promoterFromRow(row as PromoterRow));
}

export async function createPromoter(input: CreatePromoterInput): Promise<Promoter> {
  const supabase = createServerClient();

  // Generate unique slug
  let baseSlug = generateSlug(input.name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await getPromoterBySlug(slug);
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const { data, error } = await supabase
    .from('promoters')
    .insert({
      wallet_address: input.walletAddress?.toLowerCase(),
      slug,
      name: input.name,
      bio: input.bio,
      logo_url: input.logoUrl,
      cover_image_url: input.coverImageUrl,
      email: input.email,
      website_url: input.websiteUrl,
      twitter_url: input.twitterUrl,
      instagram_url: input.instagramUrl,
      farcaster_url: input.farcasterUrl,
      city: input.city,
      country: input.country,
      type: input.type || 'promoter',
      genres: input.genres || [],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return promoterFromRow(data as PromoterRow);
}

export async function updatePromoter(id: string, input: UpdatePromoterInput): Promise<Promoter> {
  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) {
    updateData.name = input.name;
    updateData.slug = generateSlug(input.name);
  }
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl;
  if (input.coverImageUrl !== undefined) updateData.cover_image_url = input.coverImageUrl;
  if (input.email !== undefined) updateData.email = input.email;
  if (input.websiteUrl !== undefined) updateData.website_url = input.websiteUrl;
  if (input.twitterUrl !== undefined) updateData.twitter_url = input.twitterUrl;
  if (input.instagramUrl !== undefined) updateData.instagram_url = input.instagramUrl;
  if (input.farcasterUrl !== undefined) updateData.farcaster_url = input.farcasterUrl;
  if (input.city !== undefined) updateData.city = input.city;
  if (input.country !== undefined) updateData.country = input.country;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.genres !== undefined) updateData.genres = input.genres;

  const { data, error } = await supabase
    .from('promoters')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return promoterFromRow(data as PromoterRow);
}

export async function deletePromoter(id: string): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase.from('promoters').delete().eq('id', id);

  if (error) throw new Error(error.message);
}

// Admin functions
export async function setPromoterVerified(id: string, isVerified: boolean): Promise<Promoter> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('promoters')
    .update({ is_verified: isVerified })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return promoterFromRow(data as PromoterRow);
}

export async function setPromoterFeatured(id: string, isFeatured: boolean): Promise<Promoter> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('promoters')
    .update({ is_featured: isFeatured })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return promoterFromRow(data as PromoterRow);
}

export async function setPromoterBanned(id: string, isBanned: boolean): Promise<Promoter> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('promoters')
    .update({ is_banned: isBanned })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return promoterFromRow(data as PromoterRow);
}

// Get all promoters for admin (including banned)
export async function getAllPromotersAdmin(): Promise<Promoter[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('promoters')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((row) => promoterFromRow(row as PromoterRow));
}

export async function incrementPromoterEvents(promoterId: string): Promise<void> {
  const supabase = createServerClient();

  await supabase.rpc('increment_promoter_events', {
    promoter_uuid: promoterId,
  });
}
