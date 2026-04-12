import type { Stream } from '@/types/stream'

interface AgentbotLiveDj {
  id: string
  name: string
  wallet: string | null
  playbackId: string | null
  status: string
  startedAt: string
  hlsUrl: string | null
}

interface AgentbotLiveResponse {
  djs?: AgentbotLiveDj[]
}

const DEFAULT_AGENTBOT_BASEFM_LIVE_URL = 'https://agentbot.sh/api/basefm/live'

export function getAgentbotBasefmLiveUrl() {
  return process.env.AGENTBOT_BASEFM_LIVE_URL || DEFAULT_AGENTBOT_BASEFM_LIVE_URL
}

export function mapAgentbotDjToBasefmStream(dj: AgentbotLiveDj): Stream {
  const startedAt = dj.startedAt || new Date().toISOString()

  return {
    id: `agentbot-${dj.id}`,
    title: dj.name || 'Live on baseFM',
    djName: dj.name || 'Anonymous DJ',
    djWalletAddress: dj.wallet || '0x0000000000000000000000000000000000000000',
    status: 'LIVE',
    muxLiveStreamId: dj.id,
    muxPlaybackId: dj.playbackId || undefined,
    hlsPlaybackUrl: dj.hlsUrl || undefined,
    actualStartTime: startedAt,
    createdAt: startedAt,
    updatedAt: startedAt,
    isGated: false,
  }
}

export async function fetchAgentbotLiveStreams(): Promise<Stream[]> {
  const response = await fetch(getAgentbotBasefmLiveUrl(), {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'baseFM canonical live sync',
    },
    signal: AbortSignal.timeout(6000),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Agentbot live fetch failed: ${response.status} ${errorText}`)
  }

  const payload = (await response.json()) as AgentbotLiveResponse
  const djs = Array.isArray(payload?.djs) ? payload.djs : []
  return djs.map(mapAgentbotDjToBasefmStream)
}
