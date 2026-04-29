// app/headliners/[slug]/page.tsx
//
// Individual headliner profile page. Renders bio, socials, next show,
// and a tip / follow CTA tied to the headliner's wallet if present.

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getHeadlinerBySlug, type HeadlinerSocials } from '@/lib/headliners/profiles';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const profile = await getHeadlinerBySlug(params.slug).catch(() => null);
  if (!profile) return { title: 'Headliner — baseFM' };
  return {
    title: `${profile.displayName} — baseFM Headliner`,
    description: profile.tagline ?? profile.bio?.slice(0, 160) ?? `${profile.displayName} on baseFM.`,
    openGraph: {
      title: `${profile.displayName} — baseFM`,
      description: profile.tagline ?? undefined,
      images: profile.bannerUrl ?? profile.avatarUrl ?? undefined,
    },
  };
}

export default async function HeadlinerProfilePage({ params }: Props) {
  const h = await getHeadlinerBySlug(params.slug).catch(() => null);
  if (!h) notFound();

  const nextShow = h.nextShowAt ? new Date(h.nextShowAt) : null;
  const isUpcoming = !!nextShow && nextShow > new Date();

  return (
    <div className="min-h-screen pb-20">
      {/* Banner */}
      <div className="relative h-48 sm:h-72 bg-gradient-to-br from-purple-900/40 to-pink-900/40 overflow-hidden">
        {h.bannerUrl && (
          <Image
            src={h.bannerUrl}
            alt={`${h.displayName} banner`}
            fill
            sizes="100vw"
            className="object-cover opacity-70"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative">
        <Link
          href="/headliners"
          className="inline-flex items-center gap-1 text-sm text-[#888] hover:text-[#F5F5F5] mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All headliners
        </Link>

        {/* Avatar + name block */}
        <div className="flex items-end gap-4 mb-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-[#0A0A0A] bg-[#1A1A1A] overflow-hidden relative flex-shrink-0">
            {h.avatarUrl ? (
              <Image src={h.avatarUrl} alt={h.displayName} fill sizes="128px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#444]">
                {h.displayName.charAt(0)}
              </div>
            )}
          </div>
          <div className="pb-2">
            <h1 className="text-2xl sm:text-4xl font-bold text-[#F5F5F5]">{h.displayName}</h1>
            {h.tagline && <p className="text-[#888] text-sm sm:text-base mt-1">{h.tagline}</p>}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-2 mb-6">
          {h.city && (
            <span className="px-3 py-1 rounded-full bg-[#1A1A1A] text-[#CCC] text-xs">📍 {h.city}</span>
          )}
          {h.ensName && (
            <span className="px-3 py-1 rounded-full bg-[#1A1A1A] text-purple-300 text-xs font-mono">{h.ensName}</span>
          )}
          {h.farcasterHandle && (
            <a
              href={`https://warpcast.com/${h.farcasterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-mono hover:bg-purple-500/20"
            >
              @{h.farcasterHandle}
            </a>
          )}
          {h.genres.map((g) => (
            <span key={g} className="px-3 py-1 rounded-full bg-[#1A1A1A] text-[#888] text-xs font-mono">
              {g}
            </span>
          ))}
        </div>

        {/* Next show */}
        {isUpcoming && nextShow && (
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-pink-300 text-xs font-mono uppercase tracking-wider mb-1">Next live</p>
                <p className="text-[#F5F5F5] font-bold text-lg">
                  {nextShow.toLocaleString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric',
                    hour: 'numeric', minute: '2-digit',
                  })}
                </p>
              </div>
              {h.nextShowUrl && (
                <a
                  href={h.nextShowUrl}
                  className="px-5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white text-sm font-semibold hover:opacity-90"
                >
                  Set reminder
                </a>
              )}
            </div>
          </div>
        )}

        {/* Bio */}
        {h.bio && (
          <section className="bg-[#1A1A1A] rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-bold text-[#F5F5F5] mb-3">About</h2>
            <p className="text-[#CCC] text-sm whitespace-pre-line leading-relaxed">{h.bio}</p>
          </section>
        )}

        {/* Socials */}
        {hasSocials(h.socials) && (
          <section className="bg-[#1A1A1A] rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-bold text-[#F5F5F5] mb-3">Find {h.displayName}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {socialEntries(h.socials).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0A0A0A] hover:bg-[#151515] rounded-lg px-3 py-2.5 text-sm text-[#CCC] hover:text-[#F5F5F5] transition-colors flex items-center justify-between"
                >
                  <span className="capitalize">{key}</span>
                  <svg className="w-3 h-3 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Onchain */}
        {h.walletAddress && (
          <section className="bg-[#1A1A1A] rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-bold text-[#F5F5F5] mb-3">Onchain</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#666]">Wallet</span>
                <a
                  href={`https://basescan.org/address/${h.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 font-mono text-xs break-all hover:underline"
                >
                  {h.walletAddress.slice(0, 6)}…{h.walletAddress.slice(-4)}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666]">Network</span>
                <span className="text-[#F5F5F5]">Base</span>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

function hasSocials(s: HeadlinerSocials): boolean {
  return Object.values(s).some(Boolean);
}

function socialEntries(s: HeadlinerSocials): Array<[string, string]> {
  return Object.entries(s).filter(([, v]): v is string => typeof v === 'string' && v.length > 0);
}
