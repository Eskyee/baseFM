export interface DJ {
  id: string;
  walletAddress: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  genres: string[];

  // Social links
  twitterUrl?: string;
  instagramUrl?: string;
  farcasterUrl?: string;

  // Creator/Music platforms
  soundcloudUrl?: string;
  mixcloudUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  bandcampUrl?: string;
  websiteUrl?: string;

  // Status
  isResident: boolean;
  isVerified: boolean;
  isBanned: boolean;

  // Stats
  totalShows: number;
  totalListeners: number;

  createdAt: string;
  updatedAt: string;
}

export interface DJRow {
  id: string;
  wallet_address: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  genres: string[];
  twitter_url: string | null;
  instagram_url: string | null;
  farcaster_url: string | null;
  soundcloud_url: string | null;
  mixcloud_url: string | null;
  youtube_url: string | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  bandcamp_url: string | null;
  website_url: string | null;
  is_resident: boolean;
  is_verified: boolean;
  is_banned: boolean;
  total_shows: number;
  total_listeners: number;
  created_at: string;
  updated_at: string;
}

export function djFromRow(row: DJRow): DJ {
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    name: row.name,
    slug: row.slug,
    bio: row.bio || undefined,
    avatarUrl: row.avatar_url || undefined,
    coverImageUrl: row.cover_image_url || undefined,
    genres: row.genres || [],
    twitterUrl: row.twitter_url || undefined,
    instagramUrl: row.instagram_url || undefined,
    farcasterUrl: row.farcaster_url || undefined,
    soundcloudUrl: row.soundcloud_url || undefined,
    mixcloudUrl: row.mixcloud_url || undefined,
    youtubeUrl: row.youtube_url || undefined,
    spotifyUrl: row.spotify_url || undefined,
    appleMusicUrl: row.apple_music_url || undefined,
    bandcampUrl: row.bandcamp_url || undefined,
    websiteUrl: row.website_url || undefined,
    isResident: row.is_resident,
    isVerified: row.is_verified,
    isBanned: row.is_banned,
    totalShows: row.total_shows,
    totalListeners: row.total_listeners,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateDJInput {
  walletAddress: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  genres?: string[];
  twitterUrl?: string;
  instagramUrl?: string;
  farcasterUrl?: string;
  soundcloudUrl?: string;
  mixcloudUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  bandcampUrl?: string;
  websiteUrl?: string;
}

export interface UpdateDJInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  genres?: string[];
  twitterUrl?: string;
  instagramUrl?: string;
  farcasterUrl?: string;
  soundcloudUrl?: string;
  mixcloudUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  bandcampUrl?: string;
  websiteUrl?: string;
}
