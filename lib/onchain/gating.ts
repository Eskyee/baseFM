import { publicClient } from '@/lib/viem/client';
import { parseAbi, type Address } from 'viem';
import { createServerClient } from '@/lib/supabase/client';
import type { AccessTokenRow, EventRow } from '@/types/event';

// ============================================================
// Token Gating — Base Chain Only
//
// All reads use viem publicClient (Base mainnet).
// No wallet interaction. No signing. Read-only.
//
// Used by:
//   - API route guards
//   - UI visibility checks
//   - Clanker room admission
//   - Event access validation
// ============================================================

// ABI fragments for balance/ownership checks
const ERC721_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
]);

const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
]);

const ERC1155_ABI = parseAbi([
  'function balanceOf(address owner, uint256 id) view returns (uint256)',
]);

/**
 * Check if an address owns at least one ERC-721 token from a contract.
 * Returns true if balance >= 1.
 */
export async function ownsToken(
  address: Address,
  contractAddress: Address
): Promise<boolean> {
  try {
    const balance = await publicClient.readContract({
      address: contractAddress,
      abi: ERC721_ABI,
      functionName: 'balanceOf',
      args: [address],
    });

    return balance > 0n;
  } catch (error) {
    console.error(
      `ownsToken check failed for ${address} on ${contractAddress}:`,
      error
    );
    return false;
  }
}

/**
 * Check if an address holds at least `minAmount` of an ERC-20 token.
 * `minAmount` is in human-readable units (e.g. 100 means 100 tokens).
 */
export async function hasMinBalance(
  address: Address,
  contractAddress: Address,
  minAmount: number
): Promise<boolean> {
  try {
    const [balance, decimals] = await Promise.all([
      publicClient.readContract({
        address: contractAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
    ]);

    const required = BigInt(minAmount) * 10n ** BigInt(decimals);
    return balance >= required;
  } catch (error) {
    console.error(
      `hasMinBalance check failed for ${address} on ${contractAddress}:`,
      error
    );
    return false;
  }
}

/**
 * Check if an address has valid (non-consumed, non-expired) access for an event.
 *
 * Two-layer check:
 *   1. Database access_tokens table (primary)
 *   2. Onchain NFT ownership (if event has nftContract configured)
 *
 * Either is sufficient — onchain ownership always grants access.
 */
export async function isValidEventAccess(
  address: Address,
  eventId: string
): Promise<boolean> {
  try {
    const db = createServerClient();

    // Layer 1: Database check
    const { data: accessRow } = await db
      .from('access_tokens')
      .select('*')
      .eq('event_id', eventId)
      .eq('wallet', address.toLowerCase())
      .eq('consumed', false)
      .maybeSingle<AccessTokenRow>();

    if (accessRow) {
      // Check expiry
      if (accessRow.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (accessRow.expires_at < now) {
          // Expired — fall through to onchain check
        } else {
          return true;
        }
      } else {
        // No expiry set — access is valid
        return true;
      }
    }

    // Layer 2: Onchain check
    const { data: eventRow } = await db
      .from('events')
      .select('nft_contract, nft_type')
      .eq('id', eventId)
      .single<Pick<EventRow, 'nft_contract' | 'nft_type'>>();

    if (!eventRow?.nft_contract) {
      return false;
    }

    const contract = eventRow.nft_contract as Address;

    if (eventRow.nft_type === 'ERC1155') {
      // For ERC-1155, the eventId is used as the token ID
      // This follows the SMART-CONTRACT-REQUIREMENTS spec §2A
      try {
        const balance = await publicClient.readContract({
          address: contract,
          abi: ERC1155_ABI,
          functionName: 'balanceOf',
          args: [address, BigInt(eventId)],
        });
        return balance > 0n;
      } catch {
        // eventId might not be numeric — fall back to ERC-721 check
        return ownsToken(address, contract);
      }
    }

    // ERC-721 — just check ownership
    return ownsToken(address, contract);
  } catch (error) {
    console.error(
      `isValidEventAccess failed for ${address} / event ${eventId}:`,
      error
    );
    return false;
  }
}

/**
 * Check ERC-1155 balance for a specific token ID.
 */
export async function hasERC1155Token(
  address: Address,
  contractAddress: Address,
  tokenId: bigint,
  minAmount: bigint = 1n
): Promise<boolean> {
  try {
    const balance = await publicClient.readContract({
      address: contractAddress,
      abi: ERC1155_ABI,
      functionName: 'balanceOf',
      args: [address, tokenId],
    });

    return balance >= minAmount;
  } catch (error) {
    console.error(
      `hasERC1155Token check failed for ${address} on ${contractAddress}:`,
      error
    );
    return false;
  }
}

/**
 * Gate helper — check if wallet has RavePass (identity token).
 * Uses RAVECULTURE_IDENTITY_CONTRACT env var.
 */
export async function hasRavePass(address: Address): Promise<boolean> {
  const contract = process.env.RAVECULTURE_IDENTITY_CONTRACT as Address | undefined;
  if (!contract) {
    console.warn('RAVECULTURE_IDENTITY_CONTRACT not configured');
    return false;
  }
  return ownsToken(address, contract);
}

/**
 * Gate helper — check if wallet holds minimum RAVE token balance.
 * Uses RAVECULTURE_TOKEN_ADDRESS env var.
 */
export async function hasMinRaveBalance(
  address: Address,
  minAmount: number
): Promise<boolean> {
  const contract = process.env.RAVECULTURE_TOKEN_ADDRESS as Address | undefined;
  if (!contract) {
    console.warn('RAVECULTURE_TOKEN_ADDRESS not configured');
    return false;
  }
  return hasMinBalance(address, contract, minAmount);
}
