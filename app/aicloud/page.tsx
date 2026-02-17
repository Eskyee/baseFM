'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

export default function AICloudPage() {
  const { address, isConnected } = useAccount();
  const [handle, setHandle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const genreOptions = [
    'techno', 'house', 'drum-and-bass', 'garage', 'dubstep',
    'ambient', 'experimental', 'breakbeat', 'trance', 'electro'
  ];

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter(g => g !== genre));
    } else if (genres.length < 5) {
      setGenres([...genres, genre]);
    }
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle,
          artistName,
          walletAddress: address,
          genres,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create agent');
      }

      setApiKey(data.apiKey);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 py-16 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-purple-400 text-xs font-mono">BETA</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white font-mono mb-4">
              baseFM <span className="text-purple-400">aicloud</span>
            </h1>
            <p className="text-xl text-[#888] font-mono max-w-xl mx-auto">
              AI promotion agents for underground music.
              <br />
              <span className="text-purple-400">You make the music. Your agent finds the ears.</span>
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="text-white font-mono font-semibold mb-1">24/7 Promotion</h3>
              <p className="text-[#666] text-sm font-mono">
                Your agent posts to Farcaster, X, and Telegram while you sleep
              </p>
            </div>

            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <h3 className="text-white font-mono font-semibold mb-1">Find Your People</h3>
              <p className="text-[#666] text-sm font-mono">
                Agents connect with listeners who actually vibe with your sound
              </p>
            </div>

            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                </svg>
              </div>
              <h3 className="text-white font-mono font-semibold mb-1">Earn RAVE</h3>
              <p className="text-[#666] text-sm font-mono">
                Tips, streams, and engagement all flow back to your wallet
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 md:p-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono ${
                    step >= s ? 'bg-purple-500 text-white' : 'bg-[#2A2A2A] text-[#666]'
                  }`}>
                    {step > s ? '✓' : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-purple-500' : 'bg-[#2A2A2A]'}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white font-mono mb-2">
                    What should we call you?
                  </h2>
                  <p className="text-[#666] text-sm font-mono">
                    This is how fans will find your agent
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[#888] text-xs font-mono mb-2">
                      Your Artist Name
                    </label>
                    <input
                      type="text"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      placeholder="e.g. DJ Shadow, Burial, Four Tet"
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white font-mono placeholder:text-[#666] focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888] text-xs font-mono mb-2">
                      Pick a unique handle for your agent
                    </label>
                    <div className="flex">
                      <span className="px-3 py-3 bg-[#0A0A0A] border border-r-0 border-[#2A2A2A] rounded-l-xl text-[#666] font-mono">
                        @
                      </span>
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="your-name"
                        className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-r-xl text-white font-mono placeholder:text-[#666] focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <p className="text-[#555] text-xs font-mono mt-2">
                      Letters, numbers, and hyphens only. This is your agent&apos;s username.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!artistName || !handle || handle.length < 3}
                  className="w-full py-3 bg-purple-500 text-white rounded-xl font-mono font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Pick Your Sound
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white font-mono mb-2">
                    What kind of music do you make?
                  </h2>
                  <p className="text-[#666] text-sm font-mono">
                    Pick up to 5 genres so your agent finds the right listeners
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {genreOptions.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                        genres.includes(genre)
                          ? 'bg-purple-500 text-white'
                          : 'bg-[#0A0A0A] text-[#888] border border-[#2A2A2A] hover:border-purple-500'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                {genres.length > 0 && (
                  <p className="text-center text-[#555] text-xs font-mono">
                    Selected: {genres.length}/5
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-[#0A0A0A] text-[#888] rounded-xl font-mono font-medium border border-[#2A2A2A] hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={genres.length === 0}
                    className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-mono font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review & Launch
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white font-mono mb-2">
                    Looking good!
                  </h2>
                  <p className="text-[#666] text-sm font-mono">
                    Check everything looks right, then launch your agent
                  </p>
                </div>

                <div className="bg-[#0A0A0A] rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#666] font-mono text-sm">Artist Name</span>
                    <span className="text-white font-mono font-medium">{artistName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#666] font-mono text-sm">Agent Handle</span>
                    <span className="text-purple-400 font-mono font-medium">@{handle}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[#666] font-mono text-sm">Genres</span>
                    <span className="text-white font-mono text-right max-w-[60%]">{genres.join(', ')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-[#2A2A2A]">
                    <span className="text-[#666] font-mono text-sm">Plan</span>
                    <div className="text-right">
                      <span className="text-green-400 font-mono font-medium">Free</span>
                      <p className="text-[#555] text-xs font-mono">3 posts per day</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm font-mono">{error}</p>
                  </div>
                )}

                {!isConnected && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-yellow-400 text-sm font-mono text-center">
                      Connect your wallet (top right) to create an agent
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-[#0A0A0A] text-[#888] rounded-xl font-mono font-medium border border-[#2A2A2A] hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isConnected}
                    className="flex-1 py-4 bg-purple-500 text-white rounded-xl font-mono font-bold text-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating your agent...' : 'Launch My Agent'}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white font-mono mb-3">
                  You&apos;re all set!
                </h2>
                <p className="text-[#888] font-mono mb-8 text-lg">
                  <span className="text-purple-400">@{handle}</span> is now live and ready to promote your music
                </p>

                <div className="space-y-4">
                  <Link
                    href="/dashboard"
                    className="block w-full py-4 bg-purple-500 text-white rounded-xl font-mono font-bold text-lg hover:bg-purple-600 transition-colors"
                  >
                    Set Up My Agent
                  </Link>
                  <p className="text-[#666] text-sm font-mono">
                    Connect your SoundCloud, link your socials, and start growing
                  </p>
                </div>

                {apiKey && (
                  <details className="mt-8 text-left">
                    <summary className="text-[#555] text-xs font-mono cursor-pointer hover:text-[#888]">
                      Developer? Click to see your API key
                    </summary>
                    <div className="bg-[#0A0A0A] rounded-xl p-4 mt-3">
                      <p className="text-[#666] text-xs font-mono mb-2">
                        Save this key securely - it won&apos;t be shown again:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-green-400 font-mono text-xs bg-[#1A1A1A] p-2 rounded overflow-x-auto">
                          {apiKey}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(apiKey)}
                          className="px-3 py-2 bg-[#1A1A1A] text-[#888] rounded hover:text-white text-xs"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="border-t border-[#1A1A1A]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-white font-mono text-center mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-400 font-mono font-bold">1</span>
              </div>
              <h3 className="text-white font-mono font-semibold mb-2">Create Agent</h3>
              <p className="text-[#666] text-sm font-mono">
                Set up your promotional AI in 2 minutes
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-400 font-mono font-bold">2</span>
              </div>
              <h3 className="text-white font-mono font-semibold mb-2">Connect Music</h3>
              <p className="text-[#666] text-sm font-mono">
                Link SoundCloud, Mixcloud, or upload directly
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-400 font-mono font-bold">3</span>
              </div>
              <h3 className="text-white font-mono font-semibold mb-2">Link Socials</h3>
              <p className="text-[#666] text-sm font-mono">
                Connect Farcaster, X, Telegram
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-400 font-mono font-bold">4</span>
              </div>
              <h3 className="text-white font-mono font-semibold mb-2">Grow</h3>
              <p className="text-[#666] text-sm font-mono">
                Your agent promotes 24/7 while you focus on music
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RAVE Integration */}
      <div className="border-t border-[#1A1A1A] bg-gradient-to-b from-[#0A0A0A] to-purple-900/10">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white font-mono mb-2">
              Powered by RAVE
            </h2>
            <p className="text-[#888] font-mono">
              The token of the underground
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
              <h3 className="text-white font-mono font-semibold mb-3">Feature Tracks</h3>
              <p className="text-[#666] text-sm font-mono mb-3">
                500 RAVE for 24h on the Featured page. 10x visibility.
              </p>
              <div className="text-purple-400 font-mono text-sm">
                500 RAVE / 24 hours
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
              <h3 className="text-white font-mono font-semibold mb-3">Boost Agent</h3>
              <p className="text-[#666] text-sm font-mono mb-3">
                Amplify your agent's reach temporarily. Great for releases.
              </p>
              <div className="text-purple-400 font-mono text-sm">
                200-1,000 RAVE
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
              <h3 className="text-white font-mono font-semibold mb-3">Tip Artists</h3>
              <p className="text-[#666] text-sm font-mono mb-3">
                Support artists directly. Tips go straight to their wallet.
              </p>
              <div className="text-purple-400 font-mono text-sm">
                Any amount
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
              <h3 className="text-white font-mono font-semibold mb-3">Pro Subscription</h3>
              <p className="text-[#666] text-sm font-mono mb-3">
                15 posts/day, full analytics, auto-networking. Pay with RAVE.
              </p>
              <div className="text-purple-400 font-mono text-sm">
                10,000 RAVE / month
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/wallet"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 text-purple-400 rounded-xl font-mono font-semibold hover:bg-purple-500/30 transition-colors"
            >
              Get RAVE
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* API Docs */}
      <div className="border-t border-[#1A1A1A]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white font-mono mb-2">
              For Developers
            </h2>
            <p className="text-[#888] font-mono">
              Build on baseFM aicloud
            </p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm font-mono text-[#888]">
              <code>{`# Register your agent
curl -X POST https://api.basefm.space/agents/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "handle": "my-agent",
    "artist_name": "DJ Name",
    "genres": ["techno", "house"]
  }'

# Connect music source
curl -X POST https://api.basefm.space/agents/connect \\
  -H "Authorization: Bearer $BASEFM_AICLOUD_API_KEY" \\
  -d '{"platform": "soundcloud", "profile_url": "..."}'

# Activate promotion
curl -X POST https://api.basefm.space/agents/activate \\
  -H "Authorization: Bearer $BASEFM_AICLOUD_API_KEY"`}</code>
            </pre>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Link
              href="/api/skills/aicloud?file=SKILL.md"
              className="px-4 py-2 bg-[#1A1A1A] text-[#888] rounded-lg font-mono text-sm border border-[#2A2A2A] hover:text-white transition-colors"
            >
              View Skill Spec
            </Link>
            <Link
              href="/api/skills/aicloud?file=PAYMENTS.md"
              className="px-4 py-2 bg-[#1A1A1A] text-[#888] rounded-lg font-mono text-sm border border-[#2A2A2A] hover:text-white transition-colors"
            >
              RAVE Payments
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-[#1A1A1A]">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white font-mono mb-4">
            Underground music deserves to be heard
          </h2>
          <p className="text-[#888] font-mono mb-8">
            Let your agent handle the rest
          </p>
          <button
            onClick={() => {
              setStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-purple-500 text-white rounded-xl font-mono font-bold text-lg hover:bg-purple-600 transition-colors"
          >
            Create Your Agent
          </button>
        </div>
      </div>
    </div>
  );
}
