import Mux from '@mux/mux-node';
import crypto from 'crypto';

// Check if Mux credentials are configured
export function isMuxConfigured(): boolean {
  return !!(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);
}

// Lazy initialize Mux client only when needed
function getMuxClient(): Mux {
  if (!isMuxConfigured()) {
    throw new Error('MUX_TOKEN_ID and MUX_TOKEN_SECRET environment variables are required');
  }
  return new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
  });
}

export interface MuxLiveStream {
  id: string;
  streamKey: string;
  playbackId: string;
  rtmpUrl: string;
}

export async function createMuxLiveStream(baseFmStreamId: string): Promise<MuxLiveStream> {
  const mux = getMuxClient();
  const liveStream = await mux.video.liveStreams.create({
    playback_policy: ['public'],
    new_asset_settings: {
      playback_policy: ['public'],
    },
    passthrough: baseFmStreamId, // Store our stream ID for webhook correlation
    latency_mode: 'low',
    reconnect_window: 60,
  });

  const playbackId = liveStream.playback_ids?.[0]?.id || '';

  return {
    id: liveStream.id,
    streamKey: liveStream.stream_key || '',
    playbackId,
    rtmpUrl: `rtmps://global-live.mux.com:443/app/${liveStream.stream_key}`,
  };
}

export async function deleteMuxLiveStream(muxStreamId: string): Promise<void> {
  try {
    const mux = getMuxClient();
    await mux.video.liveStreams.delete(muxStreamId);
  } catch (error) {
    console.error('Failed to delete Mux stream:', error);
  }
}

export async function getMuxLiveStreamStatus(muxStreamId: string) {
  const mux = getMuxClient();
  const liveStream = await mux.video.liveStreams.retrieve(muxStreamId);
  return liveStream.status;
}

export interface MuxLiveStreamSnapshot {
  id: string;
  status: string;
  playbackId: string | null;
  recentAssetIds: string[];
}

// Fetch a richer snapshot of the Mux live stream including the asset IDs Mux
// has produced so far. Used by the per-stream "Check Mux Status" surface and
// by the "End Set" path to know which recordings to drop when archive=false.
export async function getMuxLiveStreamSnapshot(muxStreamId: string): Promise<MuxLiveStreamSnapshot> {
  const mux = getMuxClient();
  const liveStream = await mux.video.liveStreams.retrieve(muxStreamId);
  const playbackId = liveStream.playback_ids?.[0]?.id || null;
  // recent_asset_ids is the canonical "what got recorded this connection" list.
  const recentAssetIds: string[] = Array.isArray((liveStream as { recent_asset_ids?: string[] }).recent_asset_ids)
    ? ((liveStream as { recent_asset_ids?: string[] }).recent_asset_ids as string[])
    : [];
  return {
    id: liveStream.id,
    status: liveStream.status || 'unknown',
    playbackId,
    recentAssetIds,
  };
}

// Delete the recordings produced by a live stream. Called when a DJ chooses
// "End Set" (without saving the replay) so Mux storage doesn't keep billing
// for assets nobody is going to keep.
export async function deleteMuxRecentAssets(muxStreamId: string): Promise<{ deleted: number; errors: number }> {
  const mux = getMuxClient();
  let deleted = 0;
  let errors = 0;
  try {
    const snapshot = await getMuxLiveStreamSnapshot(muxStreamId);
    for (const assetId of snapshot.recentAssetIds) {
      try {
        await mux.video.assets.delete(assetId);
        deleted += 1;
      } catch (err) {
        errors += 1;
        console.warn(`Failed to delete Mux asset ${assetId}:`, err);
      }
    }
  } catch (err) {
    console.warn(`Failed to enumerate Mux assets for ${muxStreamId}:`, err);
    errors += 1;
  }
  return { deleted, errors };
}

export function getMuxPlaybackUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function getMuxThumbnailUrl(playbackId: string): string {
  return `https://image.mux.com/${playbackId}/thumbnail.png`;
}

// Webhook signature verification
export function verifyMuxWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const webhookSecret = process.env.MUX_WEBHOOK_SECRET!;
  const parts = signature.split(',');
  const timestampPart = parts.find((p) => p.startsWith('t='));
  const signaturePart = parts.find((p) => p.startsWith('v1='));

  if (!timestampPart || !signaturePart) return false;

  const timestamp = timestampPart.split('=')[1];
  const expectedSignature = signaturePart.split('=')[1];

  const payload = `${timestamp}.${rawBody}`;
  const computedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(computedSignature)
  );
}

export interface MuxWebhookEvent {
  type: 'stream_active' | 'stream_idle' | 'stream_disconnected' | 'unknown';
  baseFmStreamId: string;
  muxStreamId: string;
}

export async function createMuxCoShowStream(baseFmStreamId: string): Promise<MuxLiveStream> {
  const mux = getMuxClient();
  const liveStream = await mux.video.liveStreams.create({
    playback_policy: ['public'],
    new_asset_settings: { playback_policy: ['public'] },
    passthrough: baseFmStreamId,
    latency_mode: 'low',
    reconnect_window: 120, // 2 min for DJ handoff
    max_continuous_duration: 43200, // 12 hours max
  });
  const playbackId = liveStream.playback_ids?.[0]?.id || '';
  return {
    id: liveStream.id,
    streamKey: liveStream.stream_key || '',
    playbackId,
    rtmpUrl: `rtmps://global-live.mux.com:443/app/${liveStream.stream_key}`,
  };
}

export function parseMuxWebhookEvent(payload: Record<string, unknown>): MuxWebhookEvent {
  const eventType = payload.type as string;
  const data = payload.data as Record<string, unknown>;

  let type: MuxWebhookEvent['type'] = 'unknown';
  if (eventType === 'video.live_stream.active') type = 'stream_active';
  else if (eventType === 'video.live_stream.idle') type = 'stream_idle';
  else if (eventType === 'video.live_stream.disconnected') type = 'stream_disconnected';

  return {
    type,
    baseFmStreamId: (data?.passthrough as string) || '',
    muxStreamId: (data?.id as string) || '',
  };
}
