// Notification types

export interface Favorite {
  id: string;
  walletAddress: string;
  djId: string;
  createdAt: string;
}

export interface PushSubscription {
  id: string;
  walletAddress: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface FavoriteRow {
  id: string;
  wallet_address: string;
  dj_id: string;
  created_at: string;
}

export function favoriteFromRow(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    djId: row.dj_id,
    createdAt: row.created_at,
  };
}
