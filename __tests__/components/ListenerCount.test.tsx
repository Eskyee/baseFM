import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ListenerCount } from '@/components/ListenerCount';

describe('ListenerCount', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    vi.mocked(global.fetch).mockReset();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ count: 3 }),
    } as Response);
    vi.mocked(navigator.sendBeacon).mockClear();
    vi.mocked(navigator.sendBeacon).mockReturnValue(true);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  it('registers a listener on mount', async () => {
    await act(async () => {
      root.render(<ListenerCount streamId="stream-123" />);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/viewers',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ streamId: 'stream-123', action: 'join' }),
      })
    );
  });

  it('sends a leave beacon once when the page is hidden', async () => {
    await act(async () => {
      root.render(<ListenerCount streamId="stream-123" />);
    });

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      root.unmount();
    });

    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
    expect(navigator.sendBeacon).toHaveBeenCalledWith(
      '/api/viewers',
      expect.any(Blob)
    );
  });
});
