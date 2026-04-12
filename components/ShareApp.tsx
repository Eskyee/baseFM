'use client';

import { useState } from 'react';

const APP_URL = 'https://basefm.space';
const BASE_SOCIAL_URL = 'https://base.app/profile/raveculture';
const BASE_SOCIAL_COFOUNDER = 'https://base.app/profile/maximnoize';
const APP_NAME = 'baseFM';
const APP_DESCRIPTION = 'The onchain radio platform on Base. Listen to live DJ sets, discover underground music, and tip artists with crypto.';

interface ShareAppProps {
  variant?: 'inline' | 'compact' | 'full';
  className?: string;
  url?: string;
  text?: string;
  title?: string;
  useCurrentUrl?: boolean;
}

type ShareLink = {
  href: string;
  label: string;
  title: string;
  icon: React.ReactNode;
};

function actionClass(compact = false) {
  return compact
    ? 'border border-zinc-800 bg-black p-2.5 text-white hover:bg-zinc-950 hover:border-zinc-600 transition-colors'
    : 'inline-flex items-center gap-1.5 px-3 py-2 border border-zinc-800 bg-black text-white text-xs uppercase tracking-wider hover:bg-zinc-950 hover:border-zinc-600 transition-colors';
}

export function ShareApp({
  variant = 'inline',
  className = '',
  url,
  text,
  title,
  useCurrentUrl = false,
}: ShareAppProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (useCurrentUrl && typeof window !== 'undefined') {
      return window.location.href;
    }
    return APP_URL;
  };

  const shareUrl = typeof window !== 'undefined' ? getShareUrl() : APP_URL;
  const shareText = text || APP_DESCRIPTION;
  const shareTitle = title || APP_NAME;

  const links: ShareLink[] = [
    {
      href: BASE_SOCIAL_URL,
      label: 'raveculture',
      title: 'Follow raveculture on Base',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 111 111" fill="currentColor">
          <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" />
        </svg>
      ),
    },
    {
      href: BASE_SOCIAL_COFOUNDER,
      label: 'maximnoize',
      title: 'Follow maximnoize on Base',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 111 111" fill="currentColor">
          <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" />
        </svg>
      ),
    },
    {
      href: `https://warpcast.com/~/compose?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      label: 'Farcaster',
      title: 'Share on Farcaster',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.24 4.315l-6.24 15.63-2.385-6.15L3.465 11.4l14.775-7.085zm.255-.63L3.21 10.77a.75.75 0 00-.135 1.29l6.855 2.67 2.67 6.855a.75.75 0 001.29-.135l7.085-14.775a.75.75 0 00-.93-.99z" />
        </svg>
      ),
    },
    {
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      label: 'X',
      title: 'Share on X',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      label: 'WhatsApp',
      title: 'Share on WhatsApp',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      label: 'Telegram',
      title: 'Share on Telegram',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
    } catch {
      // Share dismissed.
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={actionClass(true)}
            title={link.title}
          >
            {link.icon}
          </a>
        ))}
        <button onClick={handleCopyLink} className={actionClass(true)} title="Copy link">
          {copied ? (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          )}
        </button>
        {'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="border border-white bg-white p-2.5 text-black hover:bg-zinc-200 hover:border-zinc-200 transition-colors"
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
      <div className={`basefm-panel p-6 ${className}`}>
        <div className="text-center mb-6">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-2">Share baseFM</h3>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Help grow the onchain radio community</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 border border-zinc-800 bg-black text-white text-sm hover:bg-zinc-950 hover:border-zinc-600 transition-colors"
            >
              {link.icon}
              {link.label}
            </a>
          ))}

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 py-3 border border-zinc-800 bg-black text-white text-sm hover:bg-zinc-950 hover:border-zinc-600 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
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
              className="flex items-center justify-center gap-2 py-3 border border-white bg-white text-black text-sm hover:bg-zinc-200 hover:border-zinc-200 transition-colors"
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

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-zinc-500 text-[10px] uppercase tracking-widest mr-1">Share</span>
      {links.slice(0, 4).map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClass(false)}
        >
          {link.icon}
          {link.label}
        </a>
      ))}
      <button onClick={handleCopyLink} className={actionClass(false)}>
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied
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
