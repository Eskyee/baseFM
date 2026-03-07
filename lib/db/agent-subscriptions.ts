import { createServerClient } from '@/lib/supabase/client';
import {
  AgentDJSubscription,
  AgentDJSubscriptionRow,
  AgentStreamSession,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  subscriptionFromRow,
  ListenMode,
} from '@/types/agent';

// Get all subscriptions for an agent
export async function getAgentSubscriptions(agentId: string): Promise<AgentDJSubscription[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_dj_subscriptions')
    .select(`
      *,
      djs:dj_id (id, name, slug, avatar_url)
    `)
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((row) => subscriptionFromRow(row as AgentDJSubscriptionRow));
}

// Get a specific subscription
export async function getSubscription(
  agentId: string,
  djId: string
): Promise<AgentDJSubscription | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_dj_subscriptions')
    .select(`
      *,
      djs:dj_id (id, name, slug, avatar_url)
    `)
    .eq('agent_id', agentId)
    .eq('dj_id', djId)
    .single();

  if (error || !data) return null;
  return subscriptionFromRow(data as AgentDJSubscriptionRow);
}

// Subscribe an agent to a DJ
export async function subscribeAgentToDJ(
  input: CreateSubscriptionInput
): Promise<AgentDJSubscription> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_dj_subscriptions')
    .insert({
      agent_id: input.agentId,
      dj_id: input.djId,
      notify_on_live: input.notifyOnLive ?? true,
      auto_promote: input.autoPromote ?? false,
      listen_mode: input.listenMode ?? 'notify',
    })
    .select(`
      *,
      djs:dj_id (id, name, slug, avatar_url)
    `)
    .single();

  if (error) throw new Error(`Failed to subscribe: ${error.message}`);

  // Log activity
  await supabase.from('agent_activity').insert({
    agent_id: input.agentId,
    action_type: 'subscribe_dj',
    target_id: input.djId,
    metadata: { listen_mode: input.listenMode ?? 'notify' },
  });

  return subscriptionFromRow(data as AgentDJSubscriptionRow);
}

// Update subscription settings
export async function updateSubscription(
  agentId: string,
  djId: string,
  input: UpdateSubscriptionInput
): Promise<AgentDJSubscription> {
  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};
  if (input.notifyOnLive !== undefined) updateData.notify_on_live = input.notifyOnLive;
  if (input.autoPromote !== undefined) updateData.auto_promote = input.autoPromote;
  if (input.listenMode !== undefined) updateData.listen_mode = input.listenMode;

  const { data, error } = await supabase
    .from('agent_dj_subscriptions')
    .update(updateData)
    .eq('agent_id', agentId)
    .eq('dj_id', djId)
    .select(`
      *,
      djs:dj_id (id, name, slug, avatar_url)
    `)
    .single();

  if (error) throw new Error(`Failed to update subscription: ${error.message}`);
  return subscriptionFromRow(data as AgentDJSubscriptionRow);
}

// Unsubscribe agent from a DJ
export async function unsubscribeAgentFromDJ(agentId: string, djId: string): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('agent_dj_subscriptions')
    .delete()
    .eq('agent_id', agentId)
    .eq('dj_id', djId);

  if (error) throw new Error(`Failed to unsubscribe: ${error.message}`);

  // Log activity
  await supabase.from('agent_activity').insert({
    agent_id: agentId,
    action_type: 'unsubscribe_dj',
    target_id: djId,
  });
}

// Get all agents subscribed to a DJ (for notifications when DJ goes live)
export async function getAgentsSubscribedToDJ(djId: string): Promise<{
  agentId: string;
  agentHandle: string;
  ownerWalletAddress: string;
  listenMode: ListenMode;
  autoPromote: boolean;
}[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase.rpc('get_agents_subscribed_to_dj', {
    p_dj_id: djId,
  });

  if (error || !data) return [];
  return data.map((row: { agent_id: string; agent_handle: string; owner_wallet_address: string; listen_mode: ListenMode; auto_promote: boolean }) => ({
    agentId: row.agent_id,
    agentHandle: row.agent_handle,
    ownerWalletAddress: row.owner_wallet_address,
    listenMode: row.listen_mode,
    autoPromote: row.auto_promote,
  }));
}

// Record agent joining a stream
export async function agentJoinStream(
  agentId: string,
  streamId: string
): Promise<string> {
  const supabase = createServerClient();

  const { data, error } = await supabase.rpc('agent_join_stream', {
    p_agent_id: agentId,
    p_stream_id: streamId,
  });

  if (error) throw new Error(`Failed to join stream: ${error.message}`);
  return data as string;
}

// Record agent leaving a stream
export async function agentLeaveStream(sessionId: string): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase.rpc('agent_leave_stream', {
    p_session_id: sessionId,
  });

  if (error) throw new Error(`Failed to leave stream: ${error.message}`);
}

// Get agent's current stream session
export async function getAgentCurrentSession(agentId: string): Promise<AgentStreamSession | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_stream_sessions')
    .select('*')
    .eq('agent_id', agentId)
    .is('left_at', null)
    .order('joined_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    agentId: data.agent_id,
    streamId: data.stream_id,
    subscriptionId: data.subscription_id || undefined,
    joinedAt: data.joined_at,
    leftAt: data.left_at || undefined,
    durationSeconds: data.duration_seconds || undefined,
    promoted: data.promoted,
    promotionPostId: data.promotion_post_id || undefined,
    createdAt: data.created_at,
  };
}

// Get agent's stream listening history
export async function getAgentStreamHistory(
  agentId: string,
  limit = 20
): Promise<AgentStreamSession[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_stream_sessions')
    .select('*')
    .eq('agent_id', agentId)
    .order('joined_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    agentId: row.agent_id,
    streamId: row.stream_id,
    subscriptionId: row.subscription_id || undefined,
    joinedAt: row.joined_at,
    leftAt: row.left_at || undefined,
    durationSeconds: row.duration_seconds || undefined,
    promoted: row.promoted,
    promotionPostId: row.promotion_post_id || undefined,
    createdAt: row.created_at,
  }));
}

// Mark subscription as notified (called when DJ goes live)
export async function markSubscriptionNotified(
  agentId: string,
  djId: string
): Promise<void> {
  const supabase = createServerClient();

  await supabase
    .from('agent_dj_subscriptions')
    .update({
      streams_notified: supabase.rpc('increment', { x: 1 }),
      last_notified_at: new Date().toISOString(),
    })
    .eq('agent_id', agentId)
    .eq('dj_id', djId);
}

// Mark subscription as promoted (called when agent auto-promotes a stream)
export async function markSubscriptionPromoted(
  agentId: string,
  djId: string
): Promise<void> {
  const supabase = createServerClient();

  await supabase
    .from('agent_dj_subscriptions')
    .update({
      streams_promoted: supabase.rpc('increment', { x: 1 }),
      last_promoted_at: new Date().toISOString(),
    })
    .eq('agent_id', agentId)
    .eq('dj_id', djId);
}

// Create a notification for the agent owner
export async function createAgentNotification(
  agentId: string,
  type: 'dj_live' | 'stream_promoted' | 'subscription_added',
  title: string,
  body?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = createServerClient();

  await supabase.from('agent_notifications').insert({
    agent_id: agentId,
    type,
    title,
    body,
    metadata: metadata || {},
  });
}
