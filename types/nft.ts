// Show NFT types

export interface ShowNFT {
  id: string;
  streamId: string;
  djWallet: string;
  djId: string | null;
  title: string;
  description: string | null;
  imageUrl: string | null;
  animationUrl: string | null;
  contractAddress: string | null;
  tokenId: string | null;
  mintTxHash: string | null;
  maxSupply: number;
  mintPriceWei: string;
  isFree: boolean;
  totalMinted: number;
  status: 'draft' | 'minting' | 'live' | 'sold_out';
  createdAt: string;
}

export interface ShowNFTRow {
  id: string;
  stream_id: string;
  dj_wallet: string;
  dj_id: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  animation_url: string | null;
  contract_address: string | null;
  token_id: string | null;
  mint_tx_hash: string | null;
  max_supply: number;
  mint_price_wei: string;
  is_free: boolean;
  total_minted: number;
  status: string;
  created_at: string;
}

export function showNFTFromRow(row: ShowNFTRow): ShowNFT {
  return {
    id: row.id,
    streamId: row.stream_id,
    djWallet: row.dj_wallet,
    djId: row.dj_id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    animationUrl: row.animation_url,
    contractAddress: row.contract_address,
    tokenId: row.token_id,
    mintTxHash: row.mint_tx_hash,
    maxSupply: row.max_supply,
    mintPriceWei: row.mint_price_wei,
    isFree: row.is_free,
    totalMinted: row.total_minted,
    status: row.status as ShowNFT['status'],
    createdAt: row.created_at,
  };
}

export interface NFTMint {
  id: string;
  nftId: string;
  minterWallet: string;
  tokenId: string | null;
  txHash: string;
  createdAt: string;
}
