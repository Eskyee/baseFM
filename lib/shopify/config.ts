// RaveCulture Shopify Store Configuration

export const SHOPIFY_CONFIG = {
  // Store domain (e.g., 'raveculture.myshopify.com')
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN || '',

  // Storefront API access token (public, read-only)
  storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',

  // Admin API credentials (server-side only)
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecret: process.env.SHOPIFY_API_SECRET || '',

  // API versions
  storefrontApiVersion: '2024-01',
  adminApiVersion: '2024-01',
};

// Storefront API endpoint
export const STOREFRONT_API_URL = `https://${SHOPIFY_CONFIG.storeDomain}/api/${SHOPIFY_CONFIG.storefrontApiVersion}/graphql.json`;

// Admin API endpoint
export const ADMIN_API_URL = `https://${SHOPIFY_CONFIG.storeDomain}/admin/api/${SHOPIFY_CONFIG.adminApiVersion}/graphql.json`;

// Product tag prefixes for onchain perks
export const ONCHAIN_TAG_PREFIX = 'onchain:';
export const ONCHAIN_TAG_PATTERNS = {
  ERC20: /^onchain:erc20:(.+):(\d+)$/, // onchain:erc20:0x...:amount
  ERC721: /^onchain:erc721:(.+)$/, // onchain:erc721:0x...
  ERC1155: /^onchain:erc1155:(.+):(\d+)$/, // onchain:erc1155:0x...:tokenId
};

// Parse onchain tags from product
export function parseOnchainTags(tags: string[]): OnchainPerk[] {
  const perks: OnchainPerk[] = [];

  for (const tag of tags) {
    if (!tag.startsWith(ONCHAIN_TAG_PREFIX)) continue;

    const erc20Match = tag.match(ONCHAIN_TAG_PATTERNS.ERC20);
    if (erc20Match) {
      perks.push({
        type: 'ERC20',
        contractAddress: erc20Match[1] as `0x${string}`,
        amount: BigInt(erc20Match[2]),
      });
      continue;
    }

    const erc721Match = tag.match(ONCHAIN_TAG_PATTERNS.ERC721);
    if (erc721Match) {
      perks.push({
        type: 'ERC721',
        contractAddress: erc721Match[1] as `0x${string}`,
      });
      continue;
    }

    const erc1155Match = tag.match(ONCHAIN_TAG_PATTERNS.ERC1155);
    if (erc1155Match) {
      perks.push({
        type: 'ERC1155',
        contractAddress: erc1155Match[1] as `0x${string}`,
        tokenId: BigInt(erc1155Match[2]),
      });
    }
  }

  return perks;
}

export interface OnchainPerk {
  type: 'ERC20' | 'ERC721' | 'ERC1155';
  contractAddress: `0x${string}`;
  amount?: bigint;
  tokenId?: bigint;
}
