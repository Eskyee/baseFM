// Farcaster posting via Neynar API
// Docs: https://docs.neynar.com

const NEYNAR_API_URL = 'https://api.neynar.com/v2';

interface NeynarCastResponse {
  success: boolean;
  cast?: {
    hash: string;
    author: {
      fid: number;
      username: string;
    };
    text: string;
    timestamp: string;
  };
  message?: string;
}

interface PostToFarcasterParams {
  signerUuid: string;
  text: string;
  embeds?: Array<{ url: string }>;
  channelId?: string;
  parentHash?: string;
}

/**
 * Post a cast to Farcaster via Neynar API
 */
export async function postToFarcaster(params: PostToFarcasterParams): Promise<{
  success: boolean;
  castHash?: string;
  castUrl?: string;
  error?: string;
}> {
  const apiKey = process.env.NEYNAR_API_KEY;

  if (!apiKey) {
    console.error('NEYNAR_API_KEY not configured');
    return { success: false, error: 'Farcaster API not configured' };
  }

  try {
    const response = await fetch(`${NEYNAR_API_URL}/farcaster/cast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify({
        signer_uuid: params.signerUuid,
        text: params.text,
        embeds: params.embeds || [],
        channel_id: params.channelId,
        parent: params.parentHash,
      }),
    });

    const data: NeynarCastResponse = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.message || `Neynar API error: ${response.status}`,
      };
    }

    const castHash = data.cast?.hash;
    const username = data.cast?.author.username;
    const castUrl = castHash && username
      ? `https://warpcast.com/${username}/${castHash.slice(0, 10)}`
      : undefined;

    return {
      success: true,
      castHash,
      castUrl,
    };
  } catch (error) {
    console.error('Error posting to Farcaster:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get signer status for a user
 */
export async function getSignerStatus(signerUuid: string): Promise<{
  valid: boolean;
  fid?: number;
  username?: string;
  error?: string;
}> {
  const apiKey = process.env.NEYNAR_API_KEY;

  if (!apiKey) {
    return { valid: false, error: 'Farcaster API not configured' };
  }

  try {
    const response = await fetch(`${NEYNAR_API_URL}/farcaster/signer?signer_uuid=${signerUuid}`, {
      headers: {
        'api_key': apiKey,
      },
    });

    if (!response.ok) {
      return { valid: false, error: `Signer lookup failed: ${response.status}` };
    }

    const data = await response.json();

    if (data.status === 'approved') {
      return {
        valid: true,
        fid: data.fid,
        username: data.username,
      };
    }

    return { valid: false, error: `Signer status: ${data.status}` };
  } catch (error) {
    console.error('Error checking signer status:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a managed signer for an agent
 * This requires Neynar's managed signer service
 */
export async function createManagedSigner(): Promise<{
  success: boolean;
  signerUuid?: string;
  publicKey?: string;
  deepLinkUrl?: string;
  error?: string;
}> {
  const apiKey = process.env.NEYNAR_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'Farcaster API not configured' };
  }

  try {
    const response = await fetch(`${NEYNAR_API_URL}/farcaster/signer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
    });

    if (!response.ok) {
      return { success: false, error: `Failed to create signer: ${response.status}` };
    }

    const data = await response.json();

    return {
      success: true,
      signerUuid: data.signer_uuid,
      publicKey: data.public_key,
      deepLinkUrl: data.signer_approval_url,
    };
  } catch (error) {
    console.error('Error creating signer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Like a cast
 */
export async function likeCast(signerUuid: string, castHash: string): Promise<boolean> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch(`${NEYNAR_API_URL}/farcaster/reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify({
        signer_uuid: signerUuid,
        reaction_type: 'like',
        target: castHash,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Follow a user
 */
export async function followUser(signerUuid: string, targetFid: number): Promise<boolean> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch(`${NEYNAR_API_URL}/farcaster/user/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify({
        signer_uuid: signerUuid,
        target_fids: [targetFid],
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Search for casts by keyword (for engagement)
 */
export async function searchCasts(query: string, limit = 10): Promise<Array<{
  hash: string;
  text: string;
  authorFid: number;
  authorUsername: string;
}>> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `${NEYNAR_API_URL}/farcaster/cast/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: { 'api_key': apiKey },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data.casts || []).map((cast: Record<string, unknown>) => ({
      hash: cast.hash as string,
      text: cast.text as string,
      authorFid: (cast.author as Record<string, unknown>).fid as number,
      authorUsername: (cast.author as Record<string, unknown>).username as string,
    }));
  } catch {
    return [];
  }
}
