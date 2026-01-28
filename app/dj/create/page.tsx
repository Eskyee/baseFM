'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';

export default function CreateStreamPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Create Stream</h1>
        <p className="text-gray-400 mb-8">
          Connect your wallet to create a stream
        </p>
        <WalletConnect />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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
          requiredTokenAddress: formData.isGated ? formData.requiredTokenAddress : undefined,
          requiredTokenAmount: formData.isGated ? parseInt(formData.requiredTokenAmount, 10) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create stream');
      }

      const { stream } = await response.json();
      router.push(`/dj/stream/${stream.id}`);
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/dj"
        className="text-gray-400 hover:text-white mb-6 inline-flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Create New Stream</h1>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stream Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-base-blue"
              placeholder="My Awesome Stream"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              DJ Name *
            </label>
            <input
              type="text"
              name="djName"
              value={formData.djName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-base-blue"
              placeholder="DJ Awesome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-base-blue resize-none"
              placeholder="Tell listeners what this stream is about..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genre
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-base-blue"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-base-blue"
                placeholder="chill, vibes, late night"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-base-blue"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Token Gating */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Token Gating</h2>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isGated"
              id="isGated"
              checked={formData.isGated}
              onChange={handleChange}
              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-base-blue focus:ring-base-blue"
            />
            <label htmlFor="isGated" className="text-gray-300">
              Require tokens to access this stream
            </label>
          </div>

          {formData.isGated && (
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Contract Address *
                </label>
                <input
                  type="text"
                  name="requiredTokenAddress"
                  value={formData.requiredTokenAddress}
                  onChange={handleChange}
                  required={formData.isGated}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-base-blue font-mono text-sm"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Required Amount *
                </label>
                <input
                  type="number"
                  name="requiredTokenAmount"
                  value={formData.requiredTokenAmount}
                  onChange={handleChange}
                  required={formData.isGated}
                  min="1"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-base-blue"
                  placeholder="1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-base-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Stream'}
        </button>
      </form>
    </div>
  );
}
