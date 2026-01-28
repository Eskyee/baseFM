export interface User {
  walletAddress: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface DJ extends User {
  totalStreams: number;
  totalListeners: number;
  isVerified: boolean;
}

export interface TokenAccess {
  hasAccess: boolean;
  balance: string;
  requiredAmount: string;
  tokenAddress: string;
  tokenSymbol?: string;
}
