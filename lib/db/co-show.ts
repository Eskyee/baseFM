import { createServerClient } from '@/lib/supabase/client';
import {
  CoShow,
  CoShowRow,
  CoShowMessage,
  CoShowMessageRow,
  CoShowMessageType,
  coShowFromRow,
  coShowMessageFromRow,
} from '@/types/co-show';

const supabase = createServerClient();

export async function createCoShow(input: {
  streamId: string;
  hostWallet: string;
  hostName: string;
  muxStreamKey: string;
  muxRtmpUrl: string;
  muxPlaybackId: string;
}): Promise<CoShow> {
  const { data, error } = await supabase
    .from('co_shows')
    .insert({
      stream_id: input.streamId,
      host_wallet: input.hostWallet.toLowerCase(),
      host_name: input.hostName,
      mux_stream_key: input.muxStreamKey,
      mux_rtmp_url: input.muxRtmpUrl,
      mux_playback_id: input.muxPlaybackId,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create co-show: ${error.message}`);
  return coShowFromRow(data as CoShowRow);
}

export async function getCoShowByInviteCode(code: string): Promise<CoShow | null> {
  const { data, error } = await supabase
    .from('co_shows')
    .select('*')
    .eq('invite_code', code)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get co-show: ${error.message}`);
  }

  return coShowFromRow(data as CoShowRow);
}

export async function getCoShowByStreamId(streamId: string): Promise<CoShow | null> {
  const { data, error } = await supabase
    .from('co_shows')
    .select('*')
    .eq('stream_id', streamId)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get co-show by stream: ${error.message}`);
  }

  return coShowFromRow(data as CoShowRow);
}

export async function claimCoShow(
  id: string,
  coDjWallet: string,
  coDjName: string
): Promise<CoShow> {
  const { data, error } = await supabase
    .from('co_shows')
    .update({
      co_dj_wallet: coDjWallet.toLowerCase(),
      co_dj_name: coDjName,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to claim co-show: ${error.message}`);
  return coShowFromRow(data as CoShowRow);
}

export async function endCoShow(id: string): Promise<void> {
  const { error } = await supabase
    .from('co_shows')
    .update({
      status: 'ended',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(`Failed to end co-show: ${error.message}`);
}

export async function getCoShowMessages(
  coShowId: string,
  limit: number = 50
): Promise<CoShowMessage[]> {
  const { data, error } = await supabase
    .from('co_show_messages')
    .select('*')
    .eq('co_show_id', coShowId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to get co-show messages: ${error.message}`);
  return (data as CoShowMessageRow[]).map(coShowMessageFromRow);
}

export async function saveCoShowMessage(input: {
  coShowId: string;
  senderWallet: string;
  senderName: string;
  content: string;
  messageType: CoShowMessageType;
}): Promise<CoShowMessage> {
  const { data, error } = await supabase
    .from('co_show_messages')
    .insert({
      co_show_id: input.coShowId,
      sender_wallet: input.senderWallet.toLowerCase(),
      sender_name: input.senderName,
      content: input.content,
      message_type: input.messageType,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save co-show message: ${error.message}`);
  return coShowMessageFromRow(data as CoShowMessageRow);
}
