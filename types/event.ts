export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;

  // Date & Time
  date: string;
  startTime?: string;
  endTime?: string;
  displayDate: string;

  // Location
  venue: string;
  address?: string;
  city?: string;
  country?: string;

  // Media
  imageUrl?: string;
  coverImageUrl?: string;

  // Details
  headliners: string[];
  tags: string[];
  genres: string[];
  ticketUrl?: string;
  ticketPrice?: string;

  // Relationships
  promoterId?: string;
  promoter?: Promoter;
  createdByWallet?: string;

  // Status
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  isFeatured: boolean;

  // Computed
  isPast: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface EventRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  display_date: string;
  venue: string;
  address: string | null;
  city: string | null;
  country: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  headliners: string[];
  tags: string[];
  genres: string[];
  ticket_url: string | null;
  ticket_price: string | null;
  promoter_id: string | null;
  created_by_wallet: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export function eventFromRow(row: EventRow, promoter?: Promoter): Event {
  const eventDate = new Date(row.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || undefined,
    description: row.description || undefined,
    date: row.date,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
    displayDate: row.display_date,
    venue: row.venue,
    address: row.address || undefined,
    city: row.city || undefined,
    country: row.country || undefined,
    imageUrl: row.image_url || undefined,
    coverImageUrl: row.cover_image_url || undefined,
    headliners: row.headliners || [],
    tags: row.tags || [],
    genres: row.genres || [],
    ticketUrl: row.ticket_url || undefined,
    ticketPrice: row.ticket_price || undefined,
    promoterId: row.promoter_id || undefined,
    promoter,
    createdByWallet: row.created_by_wallet || undefined,
    status: row.status,
    isFeatured: row.is_featured,
    isPast: eventDate < today,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateEventInput {
  title: string;
  subtitle?: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  displayDate: string;
  venue: string;
  address?: string;
  city?: string;
  country?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  headliners?: string[];
  tags?: string[];
  genres?: string[];
  ticketUrl?: string;
  ticketPrice?: string;
  promoterId?: string;
  createdByWallet?: string;
}

export interface UpdateEventInput {
  title?: string;
  subtitle?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  displayDate?: string;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  headliners?: string[];
  tags?: string[];
  genres?: string[];
  ticketUrl?: string;
  ticketPrice?: string;
  promoterId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  isFeatured?: boolean;
}

// Promoter types
export type PromoterType = 'promoter' | 'collective' | 'venue' | 'label' | 'organization';

export interface Promoter {
  id: string;
  walletAddress?: string;
  slug: string;
  name: string;
  bio?: string;

  // Media
  logoUrl?: string;
  coverImageUrl?: string;

  // Contact & Links
  email?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  farcasterUrl?: string;

  // Location
  city?: string;
  country?: string;

  // Type
  type: PromoterType;
  genres: string[];

  // Status
  isVerified: boolean;
  isFeatured: boolean;
  isBanned: boolean;

  // Stats
  totalEvents: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PromoterRow {
  id: string;
  wallet_address: string | null;
  slug: string;
  name: string;
  bio: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  email: string | null;
  website_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  farcaster_url: string | null;
  city: string | null;
  country: string | null;
  type: PromoterType;
  genres: string[];
  is_verified: boolean;
  is_featured: boolean;
  is_banned: boolean;
  total_events: number;
  created_at: string;
  updated_at: string;
}

export function promoterFromRow(row: PromoterRow): Promoter {
  return {
    id: row.id,
    walletAddress: row.wallet_address || undefined,
    slug: row.slug,
    name: row.name,
    bio: row.bio || undefined,
    logoUrl: row.logo_url || undefined,
    coverImageUrl: row.cover_image_url || undefined,
    email: row.email || undefined,
    websiteUrl: row.website_url || undefined,
    twitterUrl: row.twitter_url || undefined,
    instagramUrl: row.instagram_url || undefined,
    farcasterUrl: row.farcaster_url || undefined,
    city: row.city || undefined,
    country: row.country || undefined,
    type: row.type,
    genres: row.genres || [],
    isVerified: row.is_verified,
    isFeatured: row.is_featured,
    isBanned: row.is_banned,
    totalEvents: row.total_events,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreatePromoterInput {
  walletAddress?: string;
  name: string;
  bio?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  email?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  farcasterUrl?: string;
  city?: string;
  country?: string;
  type?: PromoterType;
  genres?: string[];
}

export interface UpdatePromoterInput {
  name?: string;
  bio?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  email?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  farcasterUrl?: string;
  city?: string;
  country?: string;
  type?: PromoterType;
  genres?: string[];
}
