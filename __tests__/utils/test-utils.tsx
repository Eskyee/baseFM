/**
 * Test Utilities for baseFM
 *
 * This file provides common utilities, mocks, and helpers for testing.
 * Import these in your test files to set up consistent test environments.
 *
 * Usage:
 *   import { renderWithProviders, mockWallet } from '@/__tests__/utils/test-utils';
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// =============================================================================
// MOCK DATA
// =============================================================================

/**
 * Mock wallet addresses for testing
 * Use these consistent addresses across tests
 */
export const mockWallets = {
  user: '0x1234567890123456789012345678901234567890' as const,
  dj: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as const,
  promoter: '0x9876543210987654321098765432109876543210' as const,
  admin: '0xadminadminadminadminadminadminadminadmin' as const,
};

/**
 * Mock DJ data for testing
 */
export const mockDJ = {
  id: 'dj-123',
  name: 'Test DJ',
  slug: 'test-dj',
  walletAddress: mockWallets.dj,
  avatarUrl: 'https://example.com/avatar.jpg',
  coverImageUrl: 'https://example.com/cover.jpg',
  bio: 'A test DJ for unit testing',
  genres: ['House', 'Techno'],
  isVerified: true,
  isResident: false,
  createdAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock event data for testing
 */
export const mockEvent = {
  id: 'event-123',
  slug: 'test-event',
  title: 'Test Event',
  subtitle: 'A test event for unit testing',
  description: 'This is a test event description',
  date: '2024-12-31',
  displayDate: 'December 31, 2024',
  venue: 'Test Venue',
  city: 'Test City',
  country: 'Test Country',
  imageUrl: 'https://example.com/event.jpg',
  tags: ['Techno', 'Underground'],
  headliners: ['DJ One', 'DJ Two'],
  isPast: false,
  status: 'approved',
};

/**
 * Mock ticket data for testing
 */
export const mockTicket = {
  id: 'ticket-123',
  eventId: 'event-123',
  name: 'General Admission',
  description: 'Standard entry ticket',
  priceUsdc: 25.0,
  totalQuantity: 100,
  soldCount: 10,
  isAvailable: true,
  remaining: 90,
  promoterWallet: mockWallets.promoter,
  promoterName: 'Test Promoter',
};

/**
 * Mock stream data for testing
 */
export const mockStream = {
  id: 'stream-123',
  title: 'Test Stream',
  djName: 'Test DJ',
  djId: 'dj-123',
  status: 'LIVE',
  genre: 'House',
  coverImageUrl: 'https://example.com/stream.jpg',
  isGated: false,
  playbackUrl: 'https://stream.mux.com/test.m3u8',
};

// =============================================================================
// MOCK PROVIDERS
// =============================================================================

/**
 * Mock wagmi hooks
 * Use vi.mock('wagmi') in your test file with these values
 */
export const mockWagmiHooks = {
  useAccount: () => ({
    address: mockWallets.user,
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
  }),
  useBalance: () => ({
    data: { value: BigInt(1000000000000000000), decimals: 18, symbol: 'ETH' },
    isLoading: false,
    isError: false,
  }),
  useWriteContract: () => ({
    writeContract: vi.fn(),
    data: undefined,
    isPending: false,
    error: null,
  }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: false,
  }),
};

/**
 * Create a disconnected wallet state for testing
 */
export const mockDisconnectedWallet = {
  useAccount: () => ({
    address: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
  }),
};

// =============================================================================
// RENDER HELPERS
// =============================================================================

/**
 * Custom render function that wraps components with necessary providers
 *
 * Usage:
 *   const { getByText } = renderWithProviders(<MyComponent />);
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here as needed
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  // For now, render without providers since we mock wagmi hooks
  // Add providers here as needed (e.g., React Query, Theme)
  return render(ui, options);
}

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

/**
 * Check if an element has specific Tailwind classes
 * Useful for testing styling
 */
export function hasClasses(element: HTMLElement, classes: string[]): boolean {
  return classes.every((cls) => element.classList.contains(cls));
}

/**
 * Wait for async operations to complete
 * Use when testing components with useEffect or async state updates
 */
export async function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =============================================================================
// FETCH MOCKS
// =============================================================================

/**
 * Create a mock fetch response
 *
 * Usage:
 *   global.fetch = vi.fn().mockResolvedValue(mockFetchResponse({ data: 'test' }));
 */
export function mockFetchResponse<T>(data: T, status: number = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

/**
 * Create a mock fetch error
 */
export function mockFetchError(message: string = 'Network error') {
  return Promise.reject(new Error(message));
}

// =============================================================================
// SUPABASE MOCKS
// =============================================================================

/**
 * Mock Supabase client for testing database operations
 */
export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      order: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
  rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
};

// =============================================================================
// TOKEN HELPERS
// =============================================================================

/**
 * USDC token config for testing
 */
export const USDC_CONFIG = {
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  decimals: 6,
  symbol: 'USDC',
};

/**
 * RAVE token config for testing
 */
export const RAVE_CONFIG = {
  address: '0xdf3c79a5759eeedb844e7481309a75037b8e86f5',
  decimals: 18,
  symbol: 'RAVE',
};

/**
 * Parse token amount to BigInt
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
