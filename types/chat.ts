// Chat Message types

export interface ChatMessage {
  id: string;
  streamId: string;
  walletAddress: string;
  message: string;
  senderName: string | null;
  senderAvatar: string | null;
  isDj: boolean;
  isMod: boolean;
  createdAt: string;
}

export interface ChatMessageRow {
  id: string;
  stream_id: string;
  wallet_address: string;
  message: string;
  sender_name: string | null;
  sender_avatar: string | null;
  is_dj: boolean;
  is_mod: boolean;
  created_at: string;
}

export function chatMessageFromRow(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    streamId: row.stream_id,
    walletAddress: row.wallet_address,
    message: row.message,
    senderName: row.sender_name,
    senderAvatar: row.sender_avatar,
    isDj: row.is_dj || false,
    isMod: row.is_mod || false,
    createdAt: row.created_at,
  };
}

export interface SendMessageInput {
  streamId: string;
  walletAddress: string;
  message: string;
  senderName?: string;
  senderAvatar?: string;
  isDj?: boolean;
}
