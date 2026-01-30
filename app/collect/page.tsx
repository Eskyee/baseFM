'use client';

import { useState, useEffect } from 'react';
import { ShowNFT } from '@/types/nft';
import { CollectibleCard } from '@/components/CollectibleCard';

export default function CollectPage() {
  const [nfts, setNfts] = useState<ShowNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    async function fetchNFTs() {
      try {
        const res = await fetch('/api/nfts');
        if (res.ok) {
          const data = await res.json();
          setNfts(data.nfts || []);
        }
      } catch (err) {
        console.error('Failed to fetch NFTs:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNFTs();
  }, []);

  const filteredNfts = nfts.filter((nft) => {
    if (filter === 'free') return nft.isFree;
    if (filter === 'paid') return !nft.isFree;
    return true;
  });

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-2">
            Collectibles
          </h1>
          <p className="text-[#888]">
            Collect show recordings as NFTs
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'free', label: 'Free Mints' },
            { value: 'paid', label: 'Paid' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* NFT Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-xl overflow-hidden">
                <div className="aspect-square skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 skeleton rounded" />
                  <div className="h-4 w-1/2 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNfts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#F5F5F5] mb-2">No collectibles yet</h3>
            <p className="text-[#888] text-sm">
              DJs can mint their shows as NFTs after streaming
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNfts.map((nft) => (
              <CollectibleCard key={nft.id} nft={nft} />
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-12 p-6 bg-[#1A1A1A] rounded-xl">
          <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">How it works</h3>
          <div className="grid sm:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <span className="text-purple-400 font-bold">1</span>
              </div>
              <h4 className="text-[#F5F5F5] font-medium mb-1">DJ Creates</h4>
              <p className="text-[#888]">After a show ends, DJs can mint it as a limited edition collectible</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <span className="text-purple-400 font-bold">2</span>
              </div>
              <h4 className="text-[#F5F5F5] font-medium mb-1">Fans Collect</h4>
              <p className="text-[#888]">Collect your favorite shows. Free or paid editions available</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <h4 className="text-[#F5F5F5] font-medium mb-1">Own Forever</h4>
              <p className="text-[#888]">Your collection is stored onchain on Base forever</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
