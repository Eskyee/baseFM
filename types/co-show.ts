export type CoShowStatus = 'pending' | 'active' | 'ended';
export type CoShowMessageType = 'dj' | 'listener';

export interface CoShow {
  id: string;
  streamId: string;
  hostWallet: string;
  hostName: string;
  coDjWallet?: string;
  coDjName?: string;
  inviteCode: string;
  status: CoShowStatus;
  muxStreamKey?: string;
  muxRtmpUrl?: string;
  muxPlaybackId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CoShowRow {
  id: string;
  stream_id: string;
  host_wallet: string;
  host_name: string;
  co_dj_wallet: string | null;
  co_dj_name: string | null;
  invite_code: string;
  status: string;
  mux_stream_key: string | null;
  mux_rtmp_url: string | null;
  mux_playback_id: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface CoShowMessage {
  id: string;
  coShowId: string;
  senderWallet: string;
  senderName: string;
  content: string;
  messageType: CoShowMessageType;
  createdAt: string;
}

export interface CoShowMessageRow {
  id: string;
  co_show_id: string;
  sender_wallet: string;
  sender_name: string;
  content: string;
  message_type: string;
  created_at: string;
}

export function coShowFromRow(row: CoShowRow): CoShow {
  return {
    id: row.id,
    streamId: row.stream_id,
    hostWallet: row.host_wallet,
    hostName: row.host_name,
    coDjWallet: row.co_dj_wallet ?? undefined,
    coDjName: row.co_dj_name ?? undefined,
    inviteCode: row.invite_code,
    status: row.status as CoShowStatus,
    muxStreamKey: row.mux_stream_key ?? undefined,
    muxRtmpUrl: row.mux_rtmp_url ?? undefined,
    muxPlaybackId: row.mux_playback_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
  };
}

export function coShowMessageFromRow(row: CoShowMessageRow): CoShowMessage {
  return {
    id: row.id,
    coShowId: row.co_show_id,
    senderWallet: row.sender_wallet,
    senderName: row.sender_name,
    content: row.content,
    messageType: row.message_type as CoShowMessageType,
    createdAt: row.created_at,
  };
}
