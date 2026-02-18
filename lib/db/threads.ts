import { createServerClient } from '@/lib/supabase/client';
import { Thread, ThreadRow, threadFromRow, CreateThreadInput } from '@/types/thread';

export async function getThreads(options?: {
  limit?: number;
  offset?: number;
  parentId?: string | null;
  authorWallet?: string;
  viewerWallet?: string;
}): Promise<{ threads: Thread[]; total: number }> {
  const supabase = createServerClient();

  let query = supabase
    .from('threads')
    .select('*', { count: 'exact' })
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  // Filter by parent (null = top-level threads only)
  if (options?.parentId === null) {
    query = query.is('parent_id', null);
  } else if (options?.parentId) {
    query = query.eq('parent_id', options.parentId);
  }

  if (options?.authorWallet) {
    query = query.eq('author_wallet', options.authorWallet.toLowerCase());
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error || !data) return { threads: [], total: 0 };

  // Get likes for viewer
  let likedThreadIds: Set<string> = new Set();
  if (options?.viewerWallet) {
    const { data: likes } = await supabase
      .from('thread_likes')
      .select('thread_id')
      .eq('wallet_address', options.viewerWallet.toLowerCase())
      .in('thread_id', data.map((t: ThreadRow) => t.id));

    if (likes) {
      likedThreadIds = new Set(likes.map((l: { thread_id: string }) => l.thread_id));
    }
  }

  // Fetch member data for authors
  const authorWallets = [...new Set(data.map((t: ThreadRow) => t.author_wallet.toLowerCase()))];
  const { data: members } = await supabase
    .from('members')
    .select('wallet_address, display_name, avatar_url, base_name, ens_name, is_verified')
    .in('wallet_address', authorWallets);

  const memberMap = new Map(
    (members || []).map((m: { wallet_address: string; display_name?: string; avatar_url?: string; base_name?: string; ens_name?: string; is_verified?: boolean }) => [
      m.wallet_address.toLowerCase(),
      m,
    ])
  );

  const threads = data.map((row: ThreadRow) => {
    const thread = threadFromRow(row);
    const member = memberMap.get(row.author_wallet.toLowerCase());
    if (member) {
      thread.author = {
        displayName: member.display_name || undefined,
        avatarUrl: member.avatar_url || undefined,
        baseName: member.base_name || undefined,
        ensName: member.ens_name || undefined,
        isVerified: member.is_verified || false,
      };
    }
    thread.isLikedByMe = likedThreadIds.has(thread.id);
    return thread;
  });

  return { threads, total: count || 0 };
}

export async function getThreadById(id: string, viewerWallet?: string): Promise<Thread | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error || !data) return null;

  const thread = threadFromRow(data as ThreadRow);

  // Get author info from members table
  const { data: member } = await supabase
    .from('members')
    .select('display_name, avatar_url, base_name, ens_name, is_verified')
    .eq('wallet_address', data.author_wallet.toLowerCase())
    .single();

  if (member) {
    thread.author = {
      displayName: member.display_name || undefined,
      avatarUrl: member.avatar_url || undefined,
      baseName: member.base_name || undefined,
      ensName: member.ens_name || undefined,
      isVerified: member.is_verified || false,
    };
  }

  // Check if viewer liked
  if (viewerWallet) {
    const { data: like } = await supabase
      .from('thread_likes')
      .select('id')
      .eq('thread_id', id)
      .eq('wallet_address', viewerWallet.toLowerCase())
      .single();

    thread.isLikedByMe = !!like;
  }

  return thread;
}

export async function createThread(input: CreateThreadInput): Promise<Thread> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('threads')
    .insert({
      author_wallet: input.authorWallet.toLowerCase(),
      content: input.content,
      media_urls: input.mediaUrls || [],
      parent_id: input.parentId || null,
      repost_id: input.repostId || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return threadFromRow(data as ThreadRow);
}

export async function deleteThread(id: string, authorWallet: string): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('threads')
    .update({ is_deleted: true })
    .eq('id', id)
    .eq('author_wallet', authorWallet.toLowerCase());

  if (error) throw new Error(error.message);
}

export async function likeThread(threadId: string, walletAddress: string): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('thread_likes')
    .insert({
      thread_id: threadId,
      wallet_address: walletAddress.toLowerCase(),
    });

  // Ignore duplicate likes
  if (error && error.code !== '23505') throw new Error(error.message);
}

export async function unlikeThread(threadId: string, walletAddress: string): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('thread_likes')
    .delete()
    .eq('thread_id', threadId)
    .eq('wallet_address', walletAddress.toLowerCase());

  if (error) throw new Error(error.message);
}

export async function getThreadReplies(parentId: string, viewerWallet?: string): Promise<Thread[]> {
  const { threads } = await getThreads({
    parentId,
    viewerWallet,
    limit: 50,
  });
  return threads;
}

export async function pinThread(id: string, isPinned: boolean): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('threads')
    .update({ is_pinned: isPinned })
    .eq('id', id);

  if (error) throw new Error(error.message);
}
