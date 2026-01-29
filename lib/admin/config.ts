// Admin configuration
// Set ADMIN_WALLET_ADDRESS in your environment variables

export function getAdminWallets(): string[] {
  const adminWallet = process.env.ADMIN_WALLET_ADDRESS;
  if (!adminWallet) return [];

  // Support multiple admin wallets separated by comma
  return adminWallet
    .split(',')
    .map(addr => addr.trim().toLowerCase())
    .filter(addr => addr.length > 0);
}

export function isAdminWallet(walletAddress: string | null | undefined): boolean {
  if (!walletAddress) return false;

  const adminWallets = getAdminWallets();
  if (adminWallets.length === 0) {
    console.warn('No admin wallets configured. Set ADMIN_WALLET_ADDRESS env var.');
    return false;
  }

  return adminWallets.includes(walletAddress.toLowerCase());
}
