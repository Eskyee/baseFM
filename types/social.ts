// Social types: Connections, Conversations, Messages

// ============================================
// USER CONNECTIONS
// ============================================
export interface UserConnection {
  id: string;
  followerWallet: string;
  followingWallet: string;
  createdAt: string;
}

export interface UserConnectionRow {
  id: string;
  follower_wallet: string;
  following_wallet: string;
  created_at: string;
}

export function connectionFromRow(row: UserConnectionRow): UserConnection {
  return {
    id: row.id,
    followerWallet: row.follower_wallet,
    followingWallet: row.following_wallet,
    createdAt: row.created_at,
  };
}

// ============================================
// CONVERSATIONS
// ============================================
export type ConversationType = 'dm' | 'group';
export type ConversationPrivacy = 'private' | 'public';
export type ParticipantRole = 'owner' | 'admin' | 'member';

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  description: string | null;
  avatarUrl: string | null;
  ownerWallet: string | null;
  privacy: ConversationPrivacy;
  participantOne: string | null;
  participantTwo: string | null;
  lastMessageAt: string;
  createdAt: string;
  // Joined from participants
  participants?: ConversationParticipant[];
  // Last message preview
  lastMessage?: DirectMessage | null;
  // Unread count for current user
  unreadCount?: number;
}

export interface ConversationRow {
  id: string;
  type: string;
  name: string | null;
  description: string | null;
  avatar_url: string | null;
  owner_wallet: string | null;
  privacy: string;
  participant_one: string | null;
  participant_two: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export function conversationFromRow(row: ConversationRow): Conversation {
  return {
    id: row.id,
    type: row.type as ConversationType,
    name: row.name,
    description: row.description,
    avatarUrl: row.avatar_url,
    ownerWallet: row.owner_wallet,
    privacy: row.privacy as ConversationPrivacy,
    participantOne: row.participant_one,
    participantTwo: row.participant_two,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
  };
}

// ============================================
// CONVERSATION PARTICIPANTS
// ============================================
export interface ConversationParticipant {
  id: string;
  conversationId: string;
  walletAddress: string;
  role: ParticipantRole;
  isMuted: boolean;
  lastReadAt: string;
  joinedAt: string;
  // Joined info
  displayName?: string;
  avatarUrl?: string;
}

export interface ConversationParticipantRow {
  id: string;
  conversation_id: string;
  wallet_address: string;
  role: string;
  is_muted: boolean;
  last_read_at: string;
  joined_at: string;
}

export function participantFromRow(row: ConversationParticipantRow): ConversationParticipant {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    walletAddress: row.wallet_address,
    role: row.role as ParticipantRole,
    isMuted: row.is_muted,
    lastReadAt: row.last_read_at,
    joinedAt: row.joined_at,
  };
}

// ============================================
// DIRECT MESSAGES
// ============================================
export interface DirectMessage {
  id: string;
  conversationId: string;
  senderWallet: string;
  content: string;
  replyToId: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  // Joined info
  senderName?: string;
  senderAvatar?: string;
  replyTo?: DirectMessage | null;
}

export interface DirectMessageRow {
  id: string;
  conversation_id: string;
  sender_wallet: string;
  content: string;
  reply_to_id: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export function messageFromRow(row: DirectMessageRow): DirectMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderWallet: row.sender_wallet,
    content: row.content,
    replyToId: row.reply_to_id,
    isEdited: row.is_edited,
    isDeleted: row.is_deleted,
    createdAt: row.created_at,
  };
}

// ============================================
// INPUT TYPES
// ============================================
export interface CreateGroupInput {
  name: string;
  description?: string;
  avatarUrl?: string;
  privacy?: ConversationPrivacy;
  ownerWallet: string;
  memberWallets?: string[];
}

export interface SendMessageInput {
  conversationId: string;
  senderWallet: string;
  content: string;
  replyToId?: string;
}

export interface UpdateMessageInput {
  content: string;
}
