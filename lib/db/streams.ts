import { createServerClient } from '@/lib/supabase/client';
import {
  Stream,
  StreamRow,
  CreateStreamInput,
  UpdateStreamInput,
  StreamStatus,
  streamFromRow,
} from '@/types/stream';

const supabase = createServerClient();

export async function createStream(input: CreateStreamInput): Promise<Stream> {
  const { data, error } = await supabase
    .from('streams')
    .insert({
      title: input.title,
      description: input.description,
      dj_name: input.djName,
      dj_wallet_address: input.djWalletAddress.toLowerCase(),
      status: 'CREATED' as StreamStatus,
      scheduled_start_time: input.scheduledStartTime,
      is_gated: input.isGated ?? false,
      required_token_address: input.requiredTokenAddress,
      required_token_amount: input.requiredTokenAmount,
      cover_image_url: input.coverImageUrl,
      genre: input.genre,
      tags: input.tags,
      x_handle: input.xHandle,
      farcaster_fid: input.farcasterFid,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create stream: ${error.message}`);
  return streamFromRow(data as StreamRow);
}

export async function getStreamById(id: string): Promise<Stream | null> {
  const { data, error } = await supabase
    .from('streams')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to get stream: ${error.message}`);
  }

  return streamFromRow(data as StreamRow);
}

export async function getStreams(filters?: {
  status?: StreamStatus | StreamStatus[];
  djWalletAddress?: string;
  limit?: number;
}): Promise<Stream[]> {
  let query = supabase.from('streams').select('*');

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status);
    } else {
      query = query.eq('status', filters.status);
    }
  }

  if (filters?.djWalletAddress) {
    query = query.eq('dj_wallet_address', filters.djWalletAddress.toLowerCase());
  }

  query = query.order('created_at', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to get streams: ${error.message}`);
  return (data as StreamRow[]).map(streamFromRow);
}

export async function getLiveStreams(): Promise<Stream[]> {
  return getStreams({ status: 'LIVE' });
}

export async function updateStream(
  id: string,
  input: UpdateStreamInput
): Promise<Stream> {
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.scheduledStartTime !== undefined)
    updateData.scheduled_start_time = input.scheduledStartTime;
  if (input.isGated !== undefined) updateData.is_gated = input.isGated;
  if (input.requiredTokenAddress !== undefined)
    updateData.required_token_address = input.requiredTokenAddress;
  if (input.requiredTokenAmount !== undefined)
    updateData.required_token_amount = input.requiredTokenAmount;
  if (input.coverImageUrl !== undefined)
    updateData.cover_image_url = input.coverImageUrl;
  if (input.genre !== undefined) updateData.genre = input.genre;
  if (input.tags !== undefined) updateData.tags = input.tags;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('streams')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update stream: ${error.message}`);
  return streamFromRow(data as StreamRow);
}

export async function updateStreamStatus(
  id: string,
  status: StreamStatus
): Promise<Stream> {
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'LIVE') {
    updateData.actual_start_time = new Date().toISOString();
  } else if (status === 'ENDED') {
    updateData.actual_end_time = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('streams')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update stream status: ${error.message}`);
  return streamFromRow(data as StreamRow);
}

export async function updateStreamWithMuxDetails(
  id: string,
  muxDetails: {
    muxLiveStreamId: string;
    muxStreamKey: string;
    muxPlaybackId: string;
    rtmpUrl: string;
    hlsPlaybackUrl: string;
  }
): Promise<Stream> {
  const { data, error } = await supabase
    .from('streams')
    .update({
      mux_live_stream_id: muxDetails.muxLiveStreamId,
      mux_stream_key: muxDetails.muxStreamKey,
      mux_playback_id: muxDetails.muxPlaybackId,
      rtmp_url: muxDetails.rtmpUrl,
      hls_playback_url: muxDetails.hlsPlaybackUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update stream with Mux details: ${error.message}`);
  return streamFromRow(data as StreamRow);
}

export async function deleteStream(id: string): Promise<void> {
  const { error } = await supabase.from('streams').delete().eq('id', id);

  if (error) throw new Error(`Failed to delete stream: ${error.message}`);
}
