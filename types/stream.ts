export type StreamStatus = 'CREATED' | 'PREPARING' | 'LIVE' | 'ENDING' | 'ENDED';

export interface Stream {
  id: string;

  // Basic Info
  title: string;
  description?: string;
  djName: string;
  djWalletAddress: string;

  // Streaming
  status: StreamStatus;
  muxLiveStreamId?: string;
  muxStreamKey?: string;
  muxPlaybackId?: string;
  rtmpUrl?: string;
  hlsPlaybackUrl?: string;

  // Scheduling
  scheduledStartTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;

  // Token Gating
  isGated: boolean;
  requiredTokenAddress?: string;
  requiredTokenAmount?: number;

  // Metadata
  coverImageUrl?: string;
  genre?: string;
  tags?: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateStreamInput {
  title: string;
  description?: string;
  djName: string;
  djWalletAddress: string;
  scheduledStartTime?: string;
  isGated?: boolean;
  requiredTokenAddress?: string;
  requiredTokenAmount?: number;
  coverImageUrl?: string;
  genre?: string;
  tags?: string[];
}

export interface UpdateStreamInput {
  title?: string;
  description?: string;
  status?: StreamStatus;
  scheduledStartTime?: string;
  isGated?: boolean;
  requiredTokenAddress?: string;
  requiredTokenAmount?: number;
  coverImageUrl?: string;
  genre?: string;
  tags?: string[];
}

export interface StreamActivity {
  id: string;
  streamId: string;
  eventType: 'STREAM_STARTED' | 'STREAM_ENDED' | 'LISTENER_JOINED' | 'LISTENER_LEFT';
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Database row types (snake_case from Supabase)
export interface StreamRow {
  id: string;
  title: string;
  description: string | null;
  dj_name: string;
  dj_wallet_address: string;
  status: StreamStatus;
  mux_live_stream_id: string | null;
  mux_stream_key: string | null;
  mux_playback_id: string | null;
  rtmp_url: string | null;
  hls_playback_url: string | null;
  scheduled_start_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  is_gated: boolean;
  required_token_address: string | null;
  required_token_amount: number | null;
  cover_image_url: string | null;
  genre: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

// Convert database row to frontend type
export function streamFromRow(row: StreamRow): Stream {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    djName: row.dj_name,
    djWalletAddress: row.dj_wallet_address,
    status: row.status,
    muxLiveStreamId: row.mux_live_stream_id ?? undefined,
    muxStreamKey: row.mux_stream_key ?? undefined,
    muxPlaybackId: row.mux_playback_id ?? undefined,
    rtmpUrl: row.rtmp_url ?? undefined,
    hlsPlaybackUrl: row.hls_playback_url ?? undefined,
    scheduledStartTime: row.scheduled_start_time ?? undefined,
    actualStartTime: row.actual_start_time ?? undefined,
    actualEndTime: row.actual_end_time ?? undefined,
    isGated: row.is_gated,
    requiredTokenAddress: row.required_token_address ?? undefined,
    requiredTokenAmount: row.required_token_amount ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    genre: row.genre ?? undefined,
    tags: row.tags ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
