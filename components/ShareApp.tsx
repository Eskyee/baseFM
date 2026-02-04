'use client';

import { useState } from 'react';

const APP_URL = 'https://basefm.xyz';
const APP_NAME = 'baseFM';
const APP_DESCRIPTION = 'The onchain radio platform on Base. Listen to live DJ sets, discover underground music, and tip artists with crypto.';

interface ShareAppProps {
  variant?: 'inline' | 'compact' | 'full';
  className?: string;
}

export function ShareApp({ variant = 'inline', className = '' }: ShareAppProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `${APP_DESCRIPTION}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(APP_URL)}`;
  const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(`${shareText}\n\n${APP_URL}`)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: APP_NAME,
          text: APP_DESCRIPTION,
          url: APP_URL,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled');
      }
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-[#2C2C2E] text-white rounded-full hover:bg-[#3C3C3E] transition-all active:scale-[0.97]"
          title="Share on X"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a
          href={farcasterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-[#2C2C2E] text-white rounded-full hover:bg-[#3C3C3E] transition-all active:scale-[0.97]"
          title="Share on Farcaster"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.24 4.315l-6.24 15.63-2.385-6.15L3.465 11.4l14.775-7.085zm.255-.63L3.21 10.77a.75.75 0 00-.135 1.29l6.855 2.67 2.67 6.855a.75.75 0 001.29-.135l7.085-14.775a.75.75 0 00-.93-.99z"/>
          </svg>
        </a>
        <button
          onClick={handleCopyLink}
          className="p-2.5 bg-[#2C2C2E] text-white rounded-full hover:bg-[#3C3C3E] transition-all active:scale-[0.97]"
          title="Copy link"
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          )}
        </button>
        {'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="p-2.5 bg-white text-black rounded-full hover:bg-[#E5E5E5] transition-all active:scale-[0.97]"
            title="Share"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`p-6 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-2xl border border-[#2C2C2E] ${className}`}>
        <div className="text-center mb-4">
          <h3 className="text-[#F5F5F5] text-lg font-bold mb-1">Share baseFM</h3>
          <p className="text-[#888] text-sm">Help us grow the onchain radio community</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2C2C2E] text-white rounded-full text-sm font-semibold hover:bg-[#3C3C3E] transition-all active:scale-[0.97]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </a>

          <a
            href={farcasterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2C2C2E] text-white rounded-full text-sm font-semibold hover:bg-[#3C3C3E] transition-all active:scale-[0.97]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.24 4.315l-6.24 15.63-2.385-6.15L3.465 11.4l14.775-7.085zm.255-.63L3.21 10.77a.75.75 0 00-.135 1.29l6.855 2.67 2.67 6.855a.75.75 0 001.29-.135l7.085-14.775a.75.75 0 00-.93-.99z"/>
            </svg>
            Share on Farcaster
          </a>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2C2C2E] text-white rounded-full text-sm font-semibold hover:bg-[#3C3C3E] transition-all active:scale-[0.97]"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Copy Link
              </>
            )}
          </button>

          {'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-[#E5E5E5] transition-all active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-[#888] text-sm mr-1">Share:</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C2C2E] text-white rounded-full text-xs font-medium hover:bg-[#3C3C3E] transition-all active:scale-[0.97]"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        X
      </a>
      <a
        href={farcasterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C2C2E] text-white rounded-full text-xs font-medium hover:bg-[#3C3C3E] transition-all active:scale-[0.97]"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.24 4.315l-6.24 15.63-2.385-6.15L3.465 11.4l14.775-7.085zm.255-.63L3.21 10.77a.75.75 0 00-.135 1.29l6.855 2.67 2.67 6.855a.75.75 0 001.29-.135l7.085-14.775a.75.75 0 00-.93-.99z"/>
        </svg>
        Farcaster
      </a>
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C2C2E] text-white rounded-full text-xs font-medium hover:bg-[#3C3C3E] transition-all active:scale-[0.97]"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Link
          </>
        )}
      </button>
    </div>
  );
}
