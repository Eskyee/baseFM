import { createServerClient } from '@/lib/supabase/client';
import { Member, MemberRow, memberFromRow, JoinCommunityInput, UpdateMemberInput } from '@/types/member';

// Get all community members (with minimum token balance)
export async function getMembers(minBalance: number = 5000): Promise<Member[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .gte('token_balance', minBalance)
    .order('token_balance', { ascending: false });

  if (error) {
    console.error('Failed to fetch members:', error);
    return [];
  }

  return (data || []).map((row) => memberFromRow(row as MemberRow));
}

// Get featured members
export async function getFeaturedMembers(): Promise<Member[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('is_featured', true)
    .gte('token_balance', 5000)
    .order('token_balance', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Failed to fetch featured members:', error);
    return [];
  }

  return (data || []).map((row) => memberFromRow(row as MemberRow));
}

// Get member by wallet address
export async function getMemberByWallet(walletAddress: string): Promise<Member | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  return memberFromRow(data as MemberRow);
}

// Join community (create member)
export async function joinCommunity(input: JoinCommunityInput): Promise<Member | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('members')
    .insert({
      wallet_address: input.walletAddress.toLowerCase(),
      display_name: input.displayName || null,
      bio: input.bio || null,
      token_balance: 0, // Will be updated by token check
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to join community:', error);
    return null;
  }

  return memberFromRow(data as MemberRow);
}

// Update member profile
export async function updateMember(
  walletAddress: string,
  input: UpdateMemberInput
): Promise<Member | null> {
  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};
  if (input.displayName !== undefined) updateData.display_name = input.displayName;
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.twitterUrl !== undefined) updateData.twitter_url = input.twitterUrl;
  if (input.farcasterUrl !== undefined) updateData.farcaster_url = input.farcasterUrl;
  if (input.favoriteGenres !== undefined) updateData.favorite_genres = input.favoriteGenres;

  const { data, error } = await supabase
    .from('members')
    .update(updateData)
    .eq('wallet_address', walletAddress.toLowerCase())
    .select()
    .single();

  if (error) {
    console.error('Failed to update member:', error);
    return null;
  }

  return memberFromRow(data as MemberRow);
}

// Update member token balance
export async function updateMemberBalance(
  walletAddress: string,
  balance: number
): Promise<void> {
  const supabase = createServerClient();

  await supabase
    .from('members')
    .update({
      token_balance: balance,
      last_balance_check: new Date().toISOString(),
    })
    .eq('wallet_address', walletAddress.toLowerCase());
}

// Update member onchain names (ENS, Base name)
export async function updateMemberOnchainNames(
  walletAddress: string,
  ensName: string | null,
  baseName: string | null
): Promise<void> {
  const supabase = createServerClient();

  await supabase
    .from('members')
    .update({
      ens_name: ensName,
      base_name: baseName,
    })
    .eq('wallet_address', walletAddress.toLowerCase());
}
