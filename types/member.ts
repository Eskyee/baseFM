// Community Member types

export interface Member {
  id: string;
  walletAddress: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  ensName: string | null;
  baseName: string | null;
  twitterUrl: string | null;
  farcasterUrl: string | null;
  showsAttended: number;
  favoriteGenres: string[];
  tokenBalance: number;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface MemberRow {
  id: string;
  wallet_address: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  ens_name: string | null;
  base_name: string | null;
  twitter_url: string | null;
  farcaster_url: string | null;
  shows_attended: number;
  favorite_genres: string[];
  token_balance: string;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export function memberFromRow(row: MemberRow): Member {
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    ensName: row.ens_name,
    baseName: row.base_name,
    twitterUrl: row.twitter_url,
    farcasterUrl: row.farcaster_url,
    showsAttended: row.shows_attended || 0,
    favoriteGenres: row.favorite_genres || [],
    tokenBalance: parseFloat(row.token_balance) || 0,
    isVerified: row.is_verified || false,
    isFeatured: row.is_featured || false,
    createdAt: row.created_at,
  };
}

export interface JoinCommunityInput {
  walletAddress: string;
  displayName?: string;
  bio?: string;
}

export interface UpdateMemberInput {
  displayName?: string;
  bio?: string;
  twitterUrl?: string;
  farcasterUrl?: string;
  favoriteGenres?: string[];
}
