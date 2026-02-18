// Event & Access types for RaveCulture event system

export type EventStatus = 'draft' | 'active' | 'ended';
export type NFTType = 'ERC721' | 'ERC1155';
export type EventType = 'physical' | 'livestream';

export type Event = {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  slug?: string;
  description?: string;
  location?: string;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  eventType: EventType;
  creator?: string;
  startTime: number;
  endTime: number;
  displayDate?: string;
  maxSupply: number;
  minted: number;
  nftContract?: `0x${string}`;
  nftType: NFTType;
  artistAddress?: `0x${string}`;
  revenueSplitId?: string;
  status: EventStatus;
  streamUrl?: string;
  coverImageUrl?: string;
  imageUrl?: string;
  tags?: string[];
  headliners?: string[];
  ticketUrl?: string;
  ticketPrice?: number;
  isPast?: boolean;
  genres?: string[];
  promoter?: Promoter;
  promoterId?: string;
};

/** Public-safe event (no admin fields like nftContract, artistAddress) */
export type PublicEvent = {
  id: string;
  name: string;
  description?: string;
  location?: string;
  eventType: EventType;
  creator?: string;
  startTime: number;
  endTime: number;
  status: EventStatus;
  spotsLeft: number;
  streamUrl?: string;
};

export type AccessToken = {
  eventId: string;
  wallet: `0x${string}`;
  tokenId?: string;
  issuedAt: number;
  expiresAt?: number;
  consumed: boolean;
};

// Supabase row types (snake_case)
export type EventRow = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  event_type: string | null;
  creator: string | null;
  start_time: number;
  end_time: number;
  max_supply: number;
  minted: number;
  nft_contract: string | null;
  nft_type: string;
  artist_address: string | null;
  revenue_split_id: string | null;
  status: string;
  stream_url: string | null;
  created_at: string;
};

export type AccessTokenRow = {
  id: string;
  event_id: string;
  wallet: string;
  token_id: string | null;
  issued_at: number;
  expires_at: number | null;
  consumed: boolean;
  consumed_at: string | null;
  created_at: string;
};

export type MintLogRow = {
  id: string;
  wallet: string;
  event_id: string;
  tx_hash: string;
  timestamp: number;
  status: string;
  error_message: string | null;
};

// Row → Domain converters
export function eventFromRow(row: EventRow, promoter?: Promoter): Event {
  return {
    id: row.id,
    name: row.name,
    title: (row as EventRowExtended).title ?? row.name,
    subtitle: (row as EventRowExtended).subtitle ?? undefined,
    slug: (row as EventRowExtended).slug ?? undefined,
    description: row.description ?? undefined,
    location: row.location ?? undefined,
    venue: (row as EventRowExtended).venue ?? undefined,
    address: (row as EventRowExtended).address ?? undefined,
    city: (row as EventRowExtended).city ?? undefined,
    country: (row as EventRowExtended).country ?? undefined,
    eventType: (row.event_type as EventType) ?? 'physical',
    creator: row.creator ?? undefined,
    startTime: row.start_time,
    endTime: row.end_time,
    displayDate: (row as EventRowExtended).display_date ?? undefined,
    maxSupply: row.max_supply,
    minted: row.minted,
    nftContract: row.nft_contract as `0x${string}` | undefined,
    nftType: row.nft_type as NFTType,
    artistAddress: row.artist_address as `0x${string}` | undefined,
    revenueSplitId: row.revenue_split_id ?? undefined,
    status: row.status as EventStatus,
    streamUrl: row.stream_url ?? undefined,
    coverImageUrl: (row as EventRowExtended).cover_image_url ?? undefined,
    imageUrl: (row as EventRowExtended).image_url ?? undefined,
    tags: (row as EventRowExtended).tags ?? undefined,
    headliners: (row as EventRowExtended).headliners ?? undefined,
    ticketUrl: (row as EventRowExtended).ticket_url ?? undefined,
    ticketPrice: (row as EventRowExtended).ticket_price ?? undefined,
    isPast: row.end_time ? row.end_time < Date.now() / 1000 : undefined,
    genres: (row as EventRowExtended).genres ?? undefined,
    promoter,
    promoterId: (row as EventRowExtended).promoter_id ?? undefined,
  };
}

// Extended row type for additional fields
type EventRowExtended = EventRow & {
  title?: string;
  subtitle?: string;
  slug?: string;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  display_date?: string;
  cover_image_url?: string;
  image_url?: string;
  tags?: string[];
  headliners?: string[];
  ticket_url?: string;
  ticket_price?: number;
  genres?: string[];
  promoter_id?: string;
};

/** Convert Event → PublicEvent (strips admin/onchain fields) */
export function toPublicEvent(event: Event): PublicEvent {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    eventType: event.eventType,
    creator: event.creator,
    startTime: event.startTime,
    endTime: event.endTime,
    status: event.status,
    spotsLeft: Math.max(0, event.maxSupply - event.minted),
    streamUrl: event.eventType === 'livestream' ? event.streamUrl : undefined,
  };
}

export function accessTokenFromRow(row: AccessTokenRow): AccessToken {
  return {
    eventId: row.event_id,
    wallet: row.wallet as `0x${string}`,
    tokenId: row.token_id ?? undefined,
    issuedAt: row.issued_at,
    expiresAt: row.expires_at ?? undefined,
    consumed: row.consumed,
  };
}

// =============================================================================
// PROMOTER TYPES
// =============================================================================

export type PromoterType = 'promoter' | 'collective' | 'venue' | 'label' | 'artist' | 'organization';

export type Promoter = {
  id: string;
  walletAddress?: string;
  slug: string;
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
  type: PromoterType;
  genres: string[];
  isVerified: boolean;
  isFeatured: boolean;
  isBanned: boolean;
  totalEvents: number;
  createdAt: string;
};

export type PromoterRow = {
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
  type: string;
  genres: string[] | null;
  is_verified: boolean;
  is_featured: boolean;
  is_banned: boolean;
  total_events: number;
  created_at: string;
};

export type CreatePromoterInput = {
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
};

export type UpdatePromoterInput = Partial<CreatePromoterInput>;

// =============================================================================
// EVENT INPUT TYPES
// =============================================================================

export type CreateEventInput = {
  title: string;
  subtitle?: string;
  description?: string;
  location?: string;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  eventType?: EventType;
  date?: string;
  startTime?: number;
  endTime?: number;
  displayDate?: string;
  maxSupply?: number;
  nftType?: NFTType;
  streamUrl?: string;
  coverImageUrl?: string;
  imageUrl?: string;
  tags?: string[];
  headliners?: string[];
  ticketUrl?: string;
  ticketPrice?: number;
  genres?: string[];
  promoterId?: string;
  createdByWallet?: string;
  // Onchain ticket sales
  enableTicketSales?: boolean;
  promoterWallet?: string;
  ticketTiers?: Array<{
    name: string;
    priceUsdc: number;
    quantity?: number;
    description?: string;
  }>;
};

export type UpdateEventInput = Partial<CreateEventInput> & {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  isFeatured?: boolean;
};

export function promoterFromRow(row: PromoterRow): Promoter {
  return {
    id: row.id,
    walletAddress: row.wallet_address ?? undefined,
    slug: row.slug,
    name: row.name,
    bio: row.bio ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    email: row.email ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    twitterUrl: row.twitter_url ?? undefined,
    instagramUrl: row.instagram_url ?? undefined,
    farcasterUrl: row.farcaster_url ?? undefined,
    city: row.city ?? undefined,
    country: row.country ?? undefined,
    type: row.type as PromoterType,
    genres: row.genres ?? [],
    isVerified: row.is_verified,
    isFeatured: row.is_featured,
    isBanned: row.is_banned,
    totalEvents: row.total_events,
    createdAt: row.created_at,
  };
}
