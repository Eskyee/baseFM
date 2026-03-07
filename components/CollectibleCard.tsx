'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import Image from 'next/image';
import { ShowNFT } from '@/types/nft';
import { formatEther, parseEther } from 'viem';

const DEFAULT_IMAGE = '/logo.png';

interface CollectibleCardProps {
  nft: ShowNFT;
  djName?: string;
}

export function CollectibleCard({ nft, djName }: CollectibleCardProps) {
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const { data: hash, sendTransaction, isPending } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isSoldOut = nft.status === 'sold_out' || nft.totalMinted >= nft.maxSupply;
  const remaining = nft.maxSupply - nft.totalMinted;
  const mintPrice = nft.isFree ? '0' : formatEther(BigInt(nft.mintPriceWei));

  const handleMint = async () => {
    if (!address || isMinting) return;

    setIsMinting(true);
    setError(null);

    try {
      // For paid mints, send transaction to DJ wallet
      if (!nft.isFree) {
        sendTransaction({
          to: nft.djWallet as `0x${string}`,
          value: BigInt(nft.mintPriceWei),
        });
      } else {
        // For free mints, just record it
        const res = await fetch('/api/nfts/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nftId: nft.id,
            minterWallet: address,
            txHash: `free-${nft.id}-${address}-${Date.now()}`,
          }),
        });

        if (res.ok) {
          setMintSuccess(true);
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to mint');
        }
      }
    } catch (err) {
      setError('Failed to mint');
    } finally {
      setIsMinting(false);
    }
  };

  // Record mint when transaction confirms
  const saveMint = async () => {
    if (!hash || !address) return;

    try {
      await fetch('/api/nfts/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nftId: nft.id,
          minterWallet: address,
          txHash: hash,
        }),
      });
      setMintSuccess(true);
    } catch (err) {
      console.error('Failed to save mint:', err);
    }
  };

  if (isSuccess && !mintSuccess) {
    saveMint();
  }

  return (
    <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">
      {/* Image/Video */}
      <div className="relative aspect-square">
        {nft.animationUrl ? (
          <video
            src={nft.animationUrl}
            poster={nft.imageUrl || DEFAULT_IMAGE}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => e.currentTarget.pause()}
          />
        ) : (
          <Image
            src={nft.imageUrl && !imgError ? nft.imageUrl : DEFAULT_IMAGE}
            alt={nft.title}
            fill
            onError={() => setImgError(true)}
            className={nft.imageUrl && !imgError ? 'object-cover' : 'object-contain p-8 opacity-50'}
          />
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Edition badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 rounded text-xs text-white">
          {nft.totalMinted}/{nft.maxSupply}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-[#F5F5F5] font-semibold line-clamp-1">{nft.title}</h3>
        {djName && (
          <p className="text-sm text-[#888] mt-1">by {djName}</p>
        )}

        {nft.description && (
          <p className="text-sm text-[#666] mt-2 line-clamp-2">{nft.description}</p>
        )}

        {/* Price & Mint */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#888]">Price</div>
            <div className="text-[#F5F5F5] font-bold">
              {nft.isFree ? 'FREE' : `${mintPrice} ETH`}
            </div>
          </div>

          {mintSuccess ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Collected!
            </div>
          ) : (
            <button
              onClick={handleMint}
              disabled={!isConnected || isSoldOut || isPending || isConfirming || isMinting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isPending ? 'Confirm...' : 'Minting...'}
                </span>
              ) : isSoldOut ? (
                'Sold Out'
              ) : (
                `Collect${remaining <= 10 ? ` (${remaining} left)` : ''}`
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
