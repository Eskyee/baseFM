'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { DJ } from '@/types/dj';

const GENRE_OPTIONS = [
  'House', 'Techno', 'Drum & Bass', 'Trance', 'Dubstep',
  'Hip Hop', 'R&B', 'Lo-Fi', 'Ambient', 'Disco',
  'Garage', 'Jungle', 'Breakbeat', 'Electro', 'Other'
];

export default function DJProfileEditorPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<DJ | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
    coverImageUrl: '',
    genres: [] as string[],
    // Social
    twitterUrl: '',
    instagramUrl: '',
    farcasterUrl: '',
    // Creator platforms
    soundcloudUrl: '',
    mixcloudUrl: '',
    youtubeUrl: '',
    spotifyUrl: '',
    appleMusicUrl: '',
    bandcampUrl: '',
    websiteUrl: '',
  });

  useEffect(() => {
    if (!isConnected || !address) {
      setIsLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch('/api/djs/me', {
          headers: { 'x-wallet-address': address! },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.dj) {
            setExistingProfile(data.dj);
            setFormData({
              name: data.dj.name || '',
              bio: data.dj.bio || '',
              avatarUrl: data.dj.avatarUrl || '',
              coverImageUrl: data.dj.coverImageUrl || '',
              genres: data.dj.genres || [],
              twitterUrl: data.dj.twitterUrl || '',
              instagramUrl: data.dj.instagramUrl || '',
              farcasterUrl: data.dj.farcasterUrl || '',
              soundcloudUrl: data.dj.soundcloudUrl || '',
              mixcloudUrl: data.dj.mixcloudUrl || '',
              youtubeUrl: data.dj.youtubeUrl || '',
              spotifyUrl: data.dj.spotifyUrl || '',
              appleMusicUrl: data.dj.appleMusicUrl || '',
              bandcampUrl: data.dj.bandcampUrl || '',
              websiteUrl: data.dj.websiteUrl || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">DJ Profile</h1>
          <p className="text-[#888] mb-8">Connect your wallet to edit your profile</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/djs/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setExistingProfile(data.dj);
      setSuccess(data.created ? 'Profile created successfully!' : 'Profile updated successfully!');

      // Redirect to profile after a short delay
      setTimeout(() => {
        router.push(`/djs/${data.dj.slug}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#1A1A1A] rounded w-48" />
            <div className="h-64 bg-[#1A1A1A] rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="text-[#888] hover:text-[#F5F5F5] mb-4 inline-flex items-center gap-1 text-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <h1 className="text-xl font-bold text-[#F5F5F5] mb-1">
          {existingProfile ? 'Edit Profile' : 'Create Profile'}
        </h1>
        <p className="text-[#888] text-xs mb-5">
          {existingProfile ? 'Update your info' : 'Set up your public DJ profile'}
        </p>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="bg-[#1A1A1A] rounded-2xl p-4 space-y-4">
            <h2 className="text-sm font-semibold text-[#888]">BASIC INFO</h2>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                DJ Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                placeholder="Your DJ name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] resize-none text-sm"
                placeholder="Tell listeners about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-xl text-sm transition-all active:scale-[0.97] ${
                      formData.genres.includes(genre)
                        ? 'bg-white text-black font-semibold'
                        : 'bg-[#2C2C2E] text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#1A1A1A] rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Images</h2>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                placeholder="https://example.com/avatar.jpg"
              />
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
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-[#1A1A1A] rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Social Links</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Twitter/X
                </label>
                <input
                  type="url"
                  name="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Farcaster
                </label>
                <input
                  type="url"
                  name="farcasterUrl"
                  value={formData.farcasterUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                  placeholder="https://warpcast.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Creator Platforms */}
          <div className="bg-[#1A1A1A] rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-2">Creator Platforms</h2>
            <p className="text-sm text-[#666] mb-4">Link your music and content channels for listeners to find more of your work</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  YouTube
                </label>
                <input
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                  placeholder="https://youtube.com/@channel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  SoundCloud
                </label>
                <input
                  type="url"
                  name="soundcloudUrl"
                  value={formData.soundcloudUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                  placeholder="https://soundcloud.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Mixcloud
                </label>
                <input
                  type="url"
                  name="mixcloudUrl"
                  value={formData.mixcloudUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                  placeholder="https://mixcloud.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Spotify
                </label>
                <input
                  type="url"
                  name="spotifyUrl"
                  value={formData.spotifyUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Apple Music
                </label>
                <input
                  type="url"
                  name="appleMusicUrl"
                  value={formData.appleMusicUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                  placeholder="https://music.apple.com/artist/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Bandcamp
                </label>
                <input
                  type="url"
                  name="bandcampUrl"
                  value={formData.bandcampUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#3B82F6] text-sm"
                  placeholder="https://username.bandcamp.com"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3.5 bg-white text-black rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E5E5E5] active:scale-[0.98]"
            >
              {isSaving ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
            </button>

            {existingProfile && (
              <Link
                href={`/djs/${existingProfile.slug}`}
                className="px-6 py-3.5 bg-[#2C2C2E] text-white rounded-xl hover:bg-[#3C3C3E] transition-all font-semibold text-center active:scale-[0.98]"
              >
                View Profile
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
