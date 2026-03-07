/**
 * Bankr Ecosystem Profiles
 *
 * Browse and fetch profiles from the Bankr ecosystem.
 * Profiles include agents, projects, and top traders.
 */

import {
  BANKR_API_BASE,
  BANKR_PROFILES_ENDPOINT,
  BankrProfile,
  BankrProfilesResponse,
  BankrProfileFilter,
  getBankrApiKey,
  isBankrConfigured,
} from './config';

// ============================================================
// Fetch Profiles from Bankr Ecosystem
// ============================================================

export interface FetchProfilesOptions {
  filter?: BankrProfileFilter;
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
}

/**
 * Fetch profiles from the Bankr ecosystem
 */
export async function fetchBankrProfiles(
  options: FetchProfilesOptions = {}
): Promise<BankrProfilesResponse> {
  const { filter = 'all', page = 1, limit = 20, search, tags } = options;

  // If Bankr API is not configured, return mock data for development
  if (!isBankrConfigured()) {
    console.warn('Bankr API not configured, using mock profiles');
    return getMockProfiles(filter, page, limit, search);
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filter !== 'all') {
    params.set('filter', filter);
  }

  if (search) {
    params.set('search', search);
  }

  if (tags && tags.length > 0) {
    params.set('tags', tags.join(','));
  }

  try {
    const response = await fetch(
      `${BANKR_API_BASE}${BANKR_PROFILES_ENDPOINT}?${params.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getBankrApiKey()}`,
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );

    if (!response.ok) {
      // If endpoint doesn't exist yet, fall back to mock data
      if (response.status === 404) {
        console.warn('Bankr profiles endpoint not found, using mock data');
        return getMockProfiles(filter, page, limit, search);
      }
      throw new Error(`Failed to fetch profiles: ${response.status}`);
    }

    const data = await response.json();
    return data as BankrProfilesResponse;
  } catch (error) {
    console.error('Error fetching Bankr profiles:', error);
    // Fall back to mock data on error
    return getMockProfiles(filter, page, limit, search);
  }
}

/**
 * Fetch a single profile by handle
 */
export async function fetchBankrProfile(
  handle: string
): Promise<BankrProfile | null> {
  if (!isBankrConfigured()) {
    const mockProfiles = getMockProfiles('all', 1, 50);
    return mockProfiles.profiles.find((p) => p.handle === handle) || null;
  }

  try {
    const response = await fetch(
      `${BANKR_API_BASE}${BANKR_PROFILES_ENDPOINT}/${handle}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getBankrApiKey()}`,
        },
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    return (await response.json()) as BankrProfile;
  } catch (error) {
    console.error('Error fetching Bankr profile:', error);
    return null;
  }
}

// ============================================================
// Mock Data for Development
// ============================================================

const MOCK_PROFILES: BankrProfile[] = [
  {
    id: 'bankr-1',
    handle: 'bankr',
    displayName: 'Bankr',
    bio: 'The official Bankr trading agent. Building the future of onchain AI trading.',
    avatarUrl: 'https://pbs.twimg.com/profile_images/1234567890/bankr_400x400.jpg',
    type: 'project',
    verified: true,
    stats: {
      trades: 15420,
      followers: 12500,
      following: 150,
      portfolioValueUsd: 250000,
      pnlPercent: 45.2,
      winRate: 68,
    },
    tags: ['trading', 'ai', 'base', 'defi'],
    socialLinks: {
      twitter: 'bankrbot',
      farcaster: 'bankr',
      website: 'https://bankr.bot',
    },
    createdAt: '2024-01-15T00:00:00Z',
    lastActiveAt: '2024-03-07T12:00:00Z',
  },
  {
    id: 'degen-whale-1',
    handle: 'degen-whale',
    displayName: 'Degen Whale',
    bio: 'Top trader on Base. Finding alpha in the depths.',
    avatarUrl: undefined,
    type: 'agent',
    verified: true,
    stats: {
      trades: 8750,
      followers: 5200,
      following: 89,
      portfolioValueUsd: 180000,
      pnlPercent: 127.5,
      winRate: 72,
    },
    tags: ['whale', 'degen', 'memecoins'],
    socialLinks: {
      farcaster: 'degenwhale',
    },
    createdAt: '2024-02-01T00:00:00Z',
    lastActiveAt: '2024-03-07T11:30:00Z',
  },
  {
    id: 'base-trader-1',
    handle: 'base-alpha',
    displayName: 'Base Alpha',
    bio: 'AI-powered trading agent specializing in Base ecosystem tokens.',
    type: 'agent',
    verified: false,
    stats: {
      trades: 3200,
      followers: 1800,
      following: 45,
      portfolioValueUsd: 45000,
      pnlPercent: 32.1,
      winRate: 61,
    },
    tags: ['base', 'ai', 'trading'],
    socialLinks: {
      twitter: 'basealpha_agent',
    },
    createdAt: '2024-02-15T00:00:00Z',
    lastActiveAt: '2024-03-07T10:45:00Z',
  },
  {
    id: 'rave-agent-1',
    handle: 'rave-bot',
    displayName: 'RAVE Bot',
    bio: 'Community trading agent for baseFM. Powered by RAVE token.',
    type: 'agent',
    verified: true,
    stats: {
      trades: 1250,
      followers: 890,
      following: 120,
      portfolioValueUsd: 15000,
      pnlPercent: 18.5,
      winRate: 58,
    },
    tags: ['rave', 'basefm', 'music', 'community'],
    socialLinks: {
      farcaster: 'ravebot',
      website: 'https://basefm.space',
    },
    createdAt: '2024-03-01T00:00:00Z',
    lastActiveAt: '2024-03-07T09:00:00Z',
  },
  {
    id: 'clanker-1',
    handle: 'clanker',
    displayName: 'Clanker',
    bio: 'Token deployment and trading automation on Base.',
    type: 'project',
    verified: true,
    stats: {
      trades: 25000,
      followers: 18000,
      following: 200,
      portfolioValueUsd: 500000,
      pnlPercent: 89.3,
      winRate: 65,
    },
    tags: ['tokens', 'deployment', 'base', 'automation'],
    socialLinks: {
      twitter: 'caboranern',
      farcaster: 'clanker',
      website: 'https://clanker.world',
    },
    createdAt: '2024-01-01T00:00:00Z',
    lastActiveAt: '2024-03-07T12:30:00Z',
  },
  {
    id: 'brett-fan-1',
    handle: 'brett-maxi',
    displayName: 'Brett Maxi',
    bio: 'All in on $BRETT. Diamond hands only.',
    type: 'user',
    verified: false,
    stats: {
      trades: 450,
      followers: 320,
      following: 180,
      portfolioValueUsd: 8500,
      pnlPercent: -12.3,
      winRate: 42,
    },
    tags: ['brett', 'memecoin', 'holder'],
    createdAt: '2024-02-20T00:00:00Z',
    lastActiveAt: '2024-03-06T18:00:00Z',
  },
  {
    id: 'nft-hunter-1',
    handle: 'nft-scout',
    displayName: 'NFT Scout',
    bio: 'Finding undervalued NFT collections on Base.',
    type: 'agent',
    verified: false,
    stats: {
      trades: 890,
      followers: 650,
      following: 75,
      portfolioValueUsd: 22000,
      pnlPercent: 55.8,
      winRate: 64,
    },
    tags: ['nft', 'base', 'collections'],
    socialLinks: {
      farcaster: 'nftscout',
    },
    createdAt: '2024-02-10T00:00:00Z',
    lastActiveAt: '2024-03-07T08:15:00Z',
  },
  {
    id: 'defi-yield-1',
    handle: 'yield-farmer',
    displayName: 'Yield Farmer Pro',
    bio: 'Automated yield optimization across Base DeFi protocols.',
    type: 'agent',
    verified: true,
    stats: {
      trades: 12000,
      followers: 4500,
      following: 60,
      portfolioValueUsd: 125000,
      pnlPercent: 28.9,
      winRate: 71,
    },
    tags: ['defi', 'yield', 'farming', 'automation'],
    socialLinks: {
      twitter: 'yieldfarmerpro',
      website: 'https://yieldfarm.pro',
    },
    createdAt: '2024-01-20T00:00:00Z',
    lastActiveAt: '2024-03-07T11:00:00Z',
  },
];

function getMockProfiles(
  filter: BankrProfileFilter,
  page: number,
  limit: number,
  search?: string
): BankrProfilesResponse {
  let filtered = [...MOCK_PROFILES];

  // Apply filter
  if (filter === 'agents') {
    filtered = filtered.filter((p) => p.type === 'agent');
  } else if (filter === 'projects') {
    filtered = filtered.filter((p) => p.type === 'project');
  } else if (filter === 'top-traders') {
    filtered = filtered
      .filter((p) => (p.stats.pnlPercent || 0) > 0)
      .sort((a, b) => (b.stats.pnlPercent || 0) - (a.stats.pnlPercent || 0));
  } else if (filter === 'new') {
    filtered = filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Apply search
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.handle.toLowerCase().includes(searchLower) ||
        p.displayName.toLowerCase().includes(searchLower) ||
        p.bio?.toLowerCase().includes(searchLower) ||
        p.tags.some((t) => t.toLowerCase().includes(searchLower))
    );
  }

  // Paginate
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);

  return {
    profiles: paginated,
    total: filtered.length,
    page,
    limit,
    hasMore: end < filtered.length,
  };
}
