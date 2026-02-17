import { createServerClient } from '@/lib/supabase/client';
import {
  Event,
  EventRow,
  eventFromRow,
  CreateEventInput,
  UpdateEventInput,
  Promoter,
  PromoterRow,
  promoterFromRow,
} from '@/types/event';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('events')
    .select('*, promoters(*)')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const promoter = data.promoters ? promoterFromRow(data.promoters as PromoterRow) : undefined;
  return eventFromRow(data as EventRow, promoter);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('events')
    .select('*, promoters(*)')
    .eq('slug', slug.toLowerCase())
    .single();

  if (error || !data) return null;

  const promoter = data.promoters ? promoterFromRow(data.promoters as PromoterRow) : undefined;
  return eventFromRow(data as EventRow, promoter);
}

export async function getAllEvents(options?: {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  upcoming?: boolean;
  past?: boolean;
  featured?: boolean;
  promoterId?: string;
  limit?: number;
}): Promise<Event[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('events')
    .select('*, promoters(*)')
    .order('date', { ascending: true });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.upcoming) {
    const today = new Date().toISOString().split('T')[0];
    query = query.gte('date', today);
  }

  if (options?.past) {
    const today = new Date().toISOString().split('T')[0];
    query = query.lt('date', today);
  }

  if (options?.featured) {
    query = query.eq('is_featured', true);
  }

  if (options?.promoterId) {
    query = query.eq('promoter_id', options.promoterId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row) => {
    const promoter = row.promoters ? promoterFromRow(row.promoters as PromoterRow) : undefined;
    return eventFromRow(row as EventRow, promoter);
  });
}

export async function getUpcomingEvents(limit?: number): Promise<Event[]> {
  return getAllEvents({ status: 'approved', upcoming: true, limit });
}

export async function getPastEvents(limit?: number): Promise<Event[]> {
  const supabase = createServerClient();
  const today = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('events')
    .select('*, promoters(*)')
    .eq('status', 'approved')
    .lt('date', today)
    .order('date', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row) => {
    const promoter = row.promoters ? promoterFromRow(row.promoters as PromoterRow) : undefined;
    return eventFromRow(row as EventRow, promoter);
  });
}

export async function getNextUpcomingEvent(): Promise<Event | null> {
  const events = await getUpcomingEvents(1);
  return events[0] || null;
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const supabase = createServerClient();

  // Generate unique slug
  let baseSlug = generateSlug(input.title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await getEventBySlug(slug);
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      slug,
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      display_date: input.displayDate,
      venue: input.venue,
      address: input.address,
      city: input.city,
      country: input.country,
      image_url: input.imageUrl,
      cover_image_url: input.coverImageUrl,
      headliners: input.headliners || [],
      tags: input.tags || [],
      genres: input.genres || [],
      ticket_url: input.ticketUrl,
      ticket_price: input.ticketPrice,
      promoter_id: input.promoterId,
      created_by_wallet: input.createdByWallet,
      status: 'pending',
    })
    .select('*, promoters(*)')
    .single();

  if (error) throw new Error(error.message);

  const promoter = data.promoters ? promoterFromRow(data.promoters as PromoterRow) : undefined;
  return eventFromRow(data as EventRow, promoter);
}

export async function updateEvent(id: string, input: UpdateEventInput): Promise<Event> {
  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) {
    updateData.title = input.title;
    updateData.slug = generateSlug(input.title);
  }
  if (input.subtitle !== undefined) updateData.subtitle = input.subtitle;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.date !== undefined) updateData.date = input.date;
  if (input.startTime !== undefined) updateData.start_time = input.startTime;
  if (input.endTime !== undefined) updateData.end_time = input.endTime;
  if (input.displayDate !== undefined) updateData.display_date = input.displayDate;
  if (input.venue !== undefined) updateData.venue = input.venue;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.city !== undefined) updateData.city = input.city;
  if (input.country !== undefined) updateData.country = input.country;
  if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl;
  if (input.coverImageUrl !== undefined) updateData.cover_image_url = input.coverImageUrl;
  if (input.headliners !== undefined) updateData.headliners = input.headliners;
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.genres !== undefined) updateData.genres = input.genres;
  if (input.ticketUrl !== undefined) updateData.ticket_url = input.ticketUrl;
  if (input.ticketPrice !== undefined) updateData.ticket_price = input.ticketPrice;
  if (input.promoterId !== undefined) updateData.promoter_id = input.promoterId;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.isFeatured !== undefined) updateData.is_featured = input.isFeatured;

  const { data, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)
    .select('*, promoters(*)')
    .single();

  if (error) throw new Error(error.message);

  const promoter = data.promoters ? promoterFromRow(data.promoters as PromoterRow) : undefined;
  return eventFromRow(data as EventRow, promoter);
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) throw new Error(error.message);
}

// Admin functions
export async function setEventStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
): Promise<Event> {
  return updateEvent(id, { status });
}

export async function setEventFeatured(id: string, isFeatured: boolean): Promise<Event> {
  return updateEvent(id, { isFeatured });
}

// Get all events for admin (including pending)
export async function getAllEventsAdmin(): Promise<Event[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('events')
    .select('*, promoters(*)')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const promoter = row.promoters ? promoterFromRow(row.promoters as PromoterRow) : undefined;
    return eventFromRow(row as EventRow, promoter);
  });
}
