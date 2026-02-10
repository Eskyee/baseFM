// Event & Access types for RaveCulture event system

export type EventStatus = 'draft' | 'active' | 'ended';
export type NFTType = 'ERC721' | 'ERC1155';

export type Event = {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  maxSupply: number;
  minted: number;
  nftContract?: `0x${string}`;
  nftType: NFTType;
  artistAddress?: `0x${string}`;
  revenueSplitId?: string;
  status: EventStatus;
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
  start_time: number;
  end_time: number;
  max_supply: number;
  minted: number;
  nft_contract: string | null;
  nft_type: string;
  artist_address: string | null;
  revenue_split_id: string | null;
  status: string;
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
    startTime: row.start_time,
    endTime: row.end_time,
    maxSupply: row.max_supply,
    minted: row.minted,
    nftContract: row.nft_contract as `0x${string}` | undefined,
    nftType: row.nft_type as NFTType,
    artistAddress: row.artist_address as `0x${string}` | undefined,
    revenueSplitId: row.revenue_split_id ?? undefined,
    status: row.status as EventStatus,
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
