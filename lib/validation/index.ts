/**
 * Input validation utilities for security
 * Validates wallet addresses, UUIDs, and other user inputs
 */

// Ethereum wallet address regex (0x + 40 hex chars)
const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

// UUID v4 regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Transaction hash regex (0x + 64 hex chars)
const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

// Slug regex (alphanumeric + hyphens, 1-100 chars)
const SLUG_REGEX = /^[a-zA-Z0-9-]{1,100}$/;

/**
 * Validate an Ethereum wallet address
 */
export function isValidWalletAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  return WALLET_REGEX.test(address);
}

/**
 * Validate a UUID v4
 */
export function isValidUUID(uuid: string | null | undefined): boolean {
  if (!uuid) return false;
  return UUID_REGEX.test(uuid);
}

/**
 * Validate a transaction hash
 */
export function isValidTxHash(hash: string | null | undefined): boolean {
  if (!hash) return false;
  return TX_HASH_REGEX.test(hash);
}

/**
 * Validate a slug (URL-safe identifier)
 */
export function isValidSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return SLUG_REGEX.test(slug);
}

/**
 * Validate a numeric ID (positive integer)
 */
export function isValidNumericId(id: string | null | undefined): boolean {
  if (!id) return false;
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0 && num.toString() === id;
}

/**
 * Validate pagination parameters
 * Returns sanitized values with bounds checking
 */
export function validatePagination(
  limitParam: string | null,
  offsetParam: string | null,
  maxLimit: number = 100,
  defaultLimit: number = 20
): { limit: number; offset: number } {
  let limit = parseInt(limitParam || '', 10);
  let offset = parseInt(offsetParam || '', 10);

  // Bounds checking
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  if (isNaN(offset) || offset < 0) offset = 0;

  return { limit, offset };
}

/**
 * Normalize wallet address to lowercase
 * Returns null if invalid
 */
export function normalizeWalletAddress(address: string | null | undefined): string | null {
  if (!isValidWalletAddress(address)) return null;
  return address!.toLowerCase();
}

/**
 * Validate and normalize wallet address, throwing if invalid
 */
export function requireValidWallet(address: string | null | undefined, fieldName: string = 'wallet'): string {
  const normalized = normalizeWalletAddress(address);
  if (!normalized) {
    throw new ValidationError(`Invalid ${fieldName} address`);
  }
  return normalized;
}

/**
 * Validate UUID, throwing if invalid
 */
export function requireValidUUID(uuid: string | null | undefined, fieldName: string = 'id'): string {
  if (!isValidUUID(uuid)) {
    throw new ValidationError(`Invalid ${fieldName}`);
  }
  return uuid!;
}

/**
 * Validate transaction hash, throwing if invalid
 */
export function requireValidTxHash(hash: string | null | undefined): string {
  if (!isValidTxHash(hash)) {
    throw new ValidationError('Invalid transaction hash');
  }
  return hash!;
}

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
