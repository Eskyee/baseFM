import { describe, expect, it } from 'vitest';
import { createStreamActionMessage } from '@/lib/auth/wallet';

describe('createStreamActionMessage', () => {
  it('formats setup requests with stream metadata', () => {
    expect(
      createStreamActionMessage(
        'setup',
        'stream-123',
        'nonce-1',
        '2026-04-21T10:00:00.000Z'
      )
    ).toBe(
      'Generate credentials for baseFM stream stream-123\nNonce: nonce-1\nTimestamp: 2026-04-21T10:00:00.000Z'
    );
  });

  it('formats stop requests with stream metadata', () => {
    expect(
      createStreamActionMessage(
        'stop',
        'stream-123',
        'nonce-2',
        '2026-04-21T11:00:00.000Z'
      )
    ).toBe(
      'Stop baseFM stream stream-123\nNonce: nonce-2\nTimestamp: 2026-04-21T11:00:00.000Z'
    );
  });
});
