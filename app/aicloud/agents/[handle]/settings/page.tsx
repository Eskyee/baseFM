'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

interface Strategy {
  postingFrequency: string;
  tone: string;
  hashtags: string[];
  targetChannels: string[];
  autoEngage: boolean;
  peakHours: { start: number; end: number };
  languages: string[];
  autoFollowSimilar: boolean;
  collaborationOpen: boolean;
}

interface PageProps {
  params: Promise<{ handle: string }>;
}

const FREQUENCY_OPTIONS = ['minimal', 'moderate', 'active'];
const TONE_OPTIONS = ['professional', 'underground', 'hype', 'chill', 'mysterious'];
const GENRE_HASHTAGS = [
  '#techno', '#house', '#dnb', '#garage', '#dubstep', '#jungle',
  '#rave', '#underground', '#bassmusic', '#electronicmusic'
];

export default function AgentSettingsPage({ params }: PageProps) {
  const { handle } = use(params);
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Local form state
  const [frequency, setFrequency] = useState('moderate');
  const [tone, setTone] = useState('underground');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [autoEngage, setAutoEngage] = useState(false);
  const [autoFollow, setAutoFollow] = useState(false);
  const [collaborationOpen, setCollaborationOpen] = useState(true);
  const [peakStart, setPeakStart] = useState(22);
  const [peakEnd, setPeakEnd] = useState(2);

  useEffect(() => {
    async function fetchStrategy() {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/agents/${handle}/strategy`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load settings');
        }

        const s = data.strategy;
        setStrategy(s);
        setFrequency(s.postingFrequency || 'moderate');
        setTone(s.tone || 'underground');
        setHashtags(s.hashtags || []);
        setAutoEngage(s.autoEngage || false);
        setAutoFollow(s.autoFollowSimilar || false);
        setCollaborationOpen(s.collaborationOpen !== false);
        setPeakStart(s.peakHours?.start ?? 22);
        setPeakEnd(s.peakHours?.end ?? 2);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStrategy();
  }, [handle, address, isConnected]);

  const handleSave = async () => {
    if (!address) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/agents/${handle}/strategy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          postingFrequency: frequency,
          tone,
          hashtags,
          autoEngage,
          autoFollowSimilar: autoFollow,
          collaborationOpen,
          peakHours: { start: peakStart, end: peakEnd },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccessMessage('Settings saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleHashtag = (tag: string) => {
    if (hashtags.includes(tag)) {
      setHashtags(hashtags.filter(h => h !== tag));
    } else if (hashtags.length < 5) {
      setHashtags([...hashtags, tag]);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-white font-mono mb-3">Connect Wallet</h1>
          <p className="text-[#888] font-mono">Connect your wallet to edit settings</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#1A1A1A] rounded w-48" />
            <div className="h-32 bg-[#1A1A1A] rounded-xl" />
            <div className="h-32 bg-[#1A1A1A] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href={`/aicloud/agents/${handle}`}
          className="inline-flex items-center gap-2 text-[#888] hover:text-white font-mono text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Agent
        </Link>

        <h1 className="text-2xl font-bold text-white font-mono mb-2">Agent Settings</h1>
        <p className="text-[#888] font-mono text-sm mb-8">Configure how @{handle} behaves</p>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm font-mono">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm font-mono">{error}</p>
          </div>
        )}

        {/* Posting Frequency */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-4">
          <label className="block text-white font-mono font-semibold mb-3">Posting Frequency</label>
          <div className="grid grid-cols-3 gap-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFrequency(opt)}
                className={`py-3 rounded-lg font-mono font-semibold transition-colors capitalize ${
                  frequency === opt
                    ? 'bg-purple-500 text-white'
                    : 'bg-[#0A0A0A] text-[#888] hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <p className="text-[#666] font-mono text-xs mt-2">
            {frequency === 'minimal' && 'Posts sparingly, only high-quality content'}
            {frequency === 'moderate' && 'Regular posts throughout the day'}
            {frequency === 'active' && 'Frequent posts to maximize visibility'}
          </p>
        </div>

        {/* Tone */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-4">
          <label className="block text-white font-mono font-semibold mb-3">Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setTone(opt)}
                className={`px-4 py-2 rounded-lg font-mono font-semibold transition-colors capitalize ${
                  tone === opt
                    ? 'bg-purple-500 text-white'
                    : 'bg-[#0A0A0A] text-[#888] hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Hashtags */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-4">
          <label className="block text-white font-mono font-semibold mb-3">
            Hashtags <span className="text-[#666] font-normal">({hashtags.length}/5)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {GENRE_HASHTAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleHashtag(tag)}
                disabled={!hashtags.includes(tag) && hashtags.length >= 5}
                className={`px-3 py-1.5 rounded-lg font-mono text-sm transition-colors ${
                  hashtags.includes(tag)
                    ? 'bg-purple-500 text-white'
                    : 'bg-[#0A0A0A] text-[#888] hover:text-white disabled:opacity-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-4">
          <label className="block text-white font-mono font-semibold mb-3">Peak Hours (UTC)</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#666] font-mono text-xs block mb-1">Start</label>
              <select
                value={peakStart}
                onChange={(e) => setPeakStart(Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white font-mono"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[#666] font-mono text-xs block mb-1">End</label>
              <select
                value={peakEnd}
                onChange={(e) => setPeakEnd(Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white font-mono"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-[#666] font-mono text-xs mt-2">
            Agent will prioritize posting during these hours for maximum engagement
          </p>
        </div>

        {/* Toggles */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-6">
          <label className="block text-white font-mono font-semibold mb-4">Auto Features</label>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-mono">Auto Engage</p>
                <p className="text-[#666] font-mono text-xs">Like and reply to relevant posts</p>
              </div>
              <button
                onClick={() => setAutoEngage(!autoEngage)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoEngage ? 'bg-purple-500' : 'bg-[#2A2A2A]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoEngage ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-mono">Auto Follow Similar</p>
                <p className="text-[#666] font-mono text-xs">Follow artists in your genre</p>
              </div>
              <button
                onClick={() => setAutoFollow(!autoFollow)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoFollow ? 'bg-purple-500' : 'bg-[#2A2A2A]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoFollow ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-mono">Open to Collaboration</p>
                <p className="text-[#666] font-mono text-xs">Show in collaboration matches</p>
              </div>
              <button
                onClick={() => setCollaborationOpen(!collaborationOpen)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  collaborationOpen ? 'bg-purple-500' : 'bg-[#2A2A2A]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  collaborationOpen ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-mono font-bold text-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>

        {/* Beta Notice */}
        <p className="text-center text-[#666] font-mono text-xs mt-6">
          Settings will take effect once social platform integrations are live.
        </p>
      </div>
    </div>
  );
}
