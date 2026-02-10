// Event & Access types for RaveCulture event system

export type EventStatus = 'draft' | 'active' | 'ended';
export type NFTType = 'ERC721' | 'ERC1155';
export type EventType = 'physical' | 'livestream';

export type Event = {
  id: string;
  name: string;
  description?: string;
  location?: string;
  eventType: EventType;
  creator?: string;
  startTime: number;
  endTime: number;
  maxSupply: number;
  minted: number;
  nftContract?: `0x${string}`;
  nftType: NFTType;
  artistAddress?: `0x${string}`;
  revenueSplitId?: string;
  status: EventStatus;
  streamUrl?: string;
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
export function eventFromRow(row: EventRow): Event {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    location: row.location ?? undefined,
    eventType: (row.event_type as EventType) ?? 'physical',
    creator: row.creator ?? undefined,
    startTime: row.start_time,
    endTime: row.end_time,
    maxSupply: row.max_supply,
    minted: row.minted,
    nftContract: row.nft_contract as `0x${string}` | undefined,
    nftType: row.nft_type as NFTType,
    artistAddress: row.artist_address as `0x${string}` | undefined,
    revenueSplitId: row.revenue_split_id ?? undefined,
    status: row.status as EventStatus,
    streamUrl: row.stream_url ?? undefined,
  };
}

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
