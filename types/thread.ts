export interface Thread {
  id: string;
  authorWallet: string;
  content: string;
  mediaUrls: string[];
  parentId?: string;
  repostId?: string;
  replyCount: number;
  likeCount: number;
  repostCount: number;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  // Joined data (optional)
  author?: {
    displayName?: string;
    avatarUrl?: string;
    baseName?: string;
    ensName?: string;
    isVerified: boolean;
  };
  parent?: Thread;
  repost?: Thread;
  isLikedByMe?: boolean;
  isRepostedByMe?: boolean;
}

export interface ThreadRow {
  id: string;
  author_wallet: string;
  content: string;
  media_urls: string[];
  parent_id: string | null;
  repost_id: string | null;
  reply_count: number;
  like_count: number;
  repost_count: number;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export function threadFromRow(row: ThreadRow): Thread {
  return {
    id: row.id,
    authorWallet: row.author_wallet,
    content: row.content,
    mediaUrls: row.media_urls || [],
    parentId: row.parent_id || undefined,
    repostId: row.repost_id || undefined,
    replyCount: row.reply_count,
    likeCount: row.like_count,
    repostCount: row.repost_count,
    isPinned: row.is_pinned,
    isDeleted: row.is_deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateThreadInput {
  authorWallet: string;
  content: string;
  mediaUrls?: string[];
  parentId?: string;
  repostId?: string;
}

export interface ThreadLike {
  id: string;
  threadId: string;
  walletAddress: string;
  createdAt: string;
}
