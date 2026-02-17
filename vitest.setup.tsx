/**
 * Vitest Setup File
 *
 * This file runs before all tests.
 * Configure global mocks and test utilities here.
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// =============================================================================
// GLOBAL MOCKS
// =============================================================================

/**
 * Mock Next.js router
 * Required for components using useRouter
 */
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

/**
 * Mock Next.js Image component
 * Renders as a regular img for testing
 */
vi.mock('next/image', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => <img {...props} />,
}));

/**
 * Mock wagmi hooks
 * Override these in individual tests as needed
 */
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
  }),
  useBalance: () => ({
    data: undefined,
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
  useReadContract: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
}));

/**
 * Mock ResizeObserver
 * Required for components using ResizeObserver
 */
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

/**
 * Mock IntersectionObserver
 * Required for lazy loading and infinite scroll
 */
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

/**
 * Mock fetch globally
 * Override in individual tests as needed
 */
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as unknown as typeof fetch;

/**
 * Mock navigator.share
 * For social sharing tests
 */
Object.defineProperty(navigator, 'share', {
  value: vi.fn().mockResolvedValue(undefined),
  writable: true,
});

/**
 * Mock navigator.clipboard
 * For copy-to-clipboard tests
 */
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
});

/**
 * Mock window.matchMedia
 * For responsive design tests
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
