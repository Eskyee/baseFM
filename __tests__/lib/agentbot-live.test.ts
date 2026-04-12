import { describe, expect, it } from 'vitest'
import { mapAgentbotDjToBasefmStream } from '@/lib/agentbot/live'

describe('agentbot live mapping', () => {
  it('maps Agentbot live payloads into baseFM stream shape', () => {
    const stream = mapAgentbotDjToBasefmStream({
      id: 'mux-stream-1',
      name: 'DJ Escaba',
      wallet: '0xabc',
      playbackId: 'playback-1',
      status: 'active',
      startedAt: '2026-04-12T19:00:00.000Z',
      hlsUrl: 'https://stream.mux.com/playback-1.m3u8',
    })

    expect(stream).toMatchObject({
      id: 'agentbot-mux-stream-1',
      title: 'DJ Escaba',
      djName: 'DJ Escaba',
      djWalletAddress: '0xabc',
      status: 'LIVE',
      muxLiveStreamId: 'mux-stream-1',
      muxPlaybackId: 'playback-1',
      hlsPlaybackUrl: 'https://stream.mux.com/playback-1.m3u8',
      actualStartTime: '2026-04-12T19:00:00.000Z',
    })
  })
})
