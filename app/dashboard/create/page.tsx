'use client';

import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';

const balanceOfAbi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function CreateStreamPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check RAVE token balance for premium tier
  const { data: balanceData } = useReadContract({
    address: DJ_TOKEN_CONFIG.address,
    abi: balanceOfAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const tokenBalance = balanceData
    ? Number(balanceData / BigInt(10 ** DJ_TOKEN_CONFIG.decimals))
    : 0;

  // Premium tier = 1 billion+ RAVE tokens
  const isPremium = tokenBalance >= DJ_TOKEN_CONFIG.premiumAmount;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    djName: '',
    genre: '',
    tags: '',
    coverImageUrl: '',
    isGated: false,
    requiredTokenAddress: '',
    requiredTokenAmount: '',
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Create Stream</h1>
          <p className="text-[#888] mb-8">
            Connect your wallet to create a stream
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Determine token address based on premium status
    const tokenAddress = isPremium
      ? formData.requiredTokenAddress
      : DJ_TOKEN_CONFIG.address;

    try {
      const response = await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          djName: formData.djName,
          djWalletAddress: address,
          genre: formData.genre || undefined,
          tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : undefined,
          coverImageUrl: formData.coverImageUrl || undefined,
          isGated: formData.isGated,
          requiredTokenAddress: formData.isGated ? tokenAddress : undefined,
          requiredTokenAmount: formData.isGated ? parseInt(formData.requiredTokenAmount, 10) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create stream');
      }

      const { stream } = await response.json();
      router.push(`/dashboard/stream/${stream.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="text-[#888] hover:text-[#F5F5F5] mb-6 inline-flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-[#F5F5F5] mb-8">Create New Stream</h1>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-[#1A1A1A] rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Basic Info</h2>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                Stream Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                placeholder="My Awesome Stream"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                DJ Name *
              </label>
              <input
                type="text"
                name="djName"
                value={formData.djName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                placeholder="DJ Awesome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] resize-none text-sm"
                placeholder="Tell listeners what this stream is about..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Genre
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                >
                  <option value="">Select genre</option>
                  <option value="House">House</option>
                  <option value="Techno">Techno</option>
                  <option value="Drum & Bass">Drum & Bass</option>
                  <option value="Trance">Trance</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="Lo-Fi">Lo-Fi</option>
                  <option value="Ambient">Ambient</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                  placeholder="chill, vibes"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Token Gating */}
          <div className="bg-[#1A1A1A] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#F5F5F5]">Token Gating</h2>
              {isPremium && (
                <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  PREMIUM
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isGated"
                id="isGated"
                checked={formData.isGated}
                onChange={handleChange}
                className="w-4 h-4 rounded bg-[#0A0A0A] border-[#333] text-[#3B82F6] focus:ring-[#3B82F6]"
              />
              <label htmlFor="isGated" className="text-[#888] text-sm">
                Require tokens to access this stream
              </label>
            </div>

            {formData.isGated && (
              <div className="space-y-4 pt-4 border-t border-[#333]">
                {isPremium ? (
                  <>
                    {/* Premium: Custom token option */}
                    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-purple-300 text-sm mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        Premium Feature: Use your own token
                      </p>
                      <p className="text-gray-400 text-xs">
                        As a premium member with {(DJ_TOKEN_CONFIG.premiumAmount / 1_000_000_000).toFixed(0)}B+ {DJ_TOKEN_CONFIG.symbol}, you can gate streams with any token.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888] mb-2">
                        Token Contract Address *
                      </label>
                      <input
                        type="text"
                        name="requiredTokenAddress"
                        value={formData.requiredTokenAddress}
                        onChange={handleChange}
                        required={formData.isGated}
                        className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] font-mono text-sm"
                        placeholder="0x..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888] mb-2">
                        Required Amount *
                      </label>
                      <input
                        type="number"
                        name="requiredTokenAmount"
                        value={formData.requiredTokenAmount}
                        onChange={handleChange}
                        required={formData.isGated}
                        min="1"
                        className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                        placeholder="1"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Standard: Uses RAVE token only */}
                    <div className="bg-[#0A0A0A] border border-[#333] rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                          <span className="text-purple-400 font-bold text-sm">{DJ_TOKEN_CONFIG.symbol}</span>
                        </div>
                        <div>
                          <p className="text-[#F5F5F5] font-medium text-sm">{DJ_TOKEN_CONFIG.name} Token</p>
                          <p className="text-[#888] text-xs">Your stream will require {DJ_TOKEN_CONFIG.symbol} to access</p>
                        </div>
                      </div>
                      <div className="text-xs text-[#666] font-mono truncate">
                        {DJ_TOKEN_CONFIG.address}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888] mb-2">
                        Required {DJ_TOKEN_CONFIG.symbol} Amount *
                      </label>
                      <input
                        type="number"
                        name="requiredTokenAmount"
                        value={formData.requiredTokenAmount}
                        onChange={handleChange}
                        required={formData.isGated}
                        min="1"
                        className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                        placeholder="1000"
                      />
                    </div>

                    {/* Premium upgrade prompt */}
                    <div className="bg-gradient-to-r from-purple-900/10 to-blue-900/10 border border-purple-500/20 rounded-lg p-4">
                      <p className="text-[#888] text-xs mb-2">
                        <span className="text-purple-400 font-semibold">Want to use your own token?</span>
                      </p>
                      <p className="text-[#666] text-xs">
                        Hold {(DJ_TOKEN_CONFIG.premiumAmount / 1_000_000_000).toFixed(0)} billion {DJ_TOKEN_CONFIG.symbol} to unlock custom token gating and other premium features.
                      </p>
                      <p className="text-purple-400/60 text-xs mt-2">
                        Your balance: {tokenBalance.toLocaleString()} {DJ_TOKEN_CONFIG.symbol}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Stream'}
          </button>
        </form>
      </div>
    </div>
  );
}
