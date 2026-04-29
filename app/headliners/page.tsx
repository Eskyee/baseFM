// app/headliners/page.tsx
//
// Public Headliners page — "Stay Tuned" empty state until profiles are
// published, then a grid of HeadlinerCards. Server Component: fetches
// profiles on every request from Supabase via the headliners lib.

import Link from 'next/link';
import Image from 'next/image';
import { listPublishedHeadliners, type HeadlinerProfile } from '@/lib/headliners/profiles';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // cache lightly — admin updates surface within a minute

export const metadata = {
  title: 'Headliners — baseFM',
  description: 'Featured DJs streaming on baseFM. Stay tuned for the lineup.',
};

export default async function HeadlinersPage() {
  let headliners: HeadlinerProfile[] = [];
  let loadError: string | null = null;

  try {
    headliners = await listPublishedHeadliners();
  } catch (e) {
    loadError = (e as Error).message;
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <header className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#666] hover:text-[#888] mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to baseFM
          </Link>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-600 via-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#F5F5F5] mb-3">
            Headliners
          </h1>
          <p className="text-[#888] text-lg max-w-2xl mx-auto">
            Curated DJs streaming live on baseFM. Bringing the world's best onchain.
          </p>
        </header>

        {/* Body — empty state OR grid */}
        {loadError ? (
          <ErrorState message={loadError} />
        ) : headliners.length === 0 ? (
          <StayTunedState />
        ) : (
          <HeadlinerGrid headliners={headliners} />
        )}

        {/* Footer info */}
        <div className="mt-16 pt-8 border-t border-[#222] text-center">
          <p className="text-[#666] text-sm">
            Are you a headliner? <Link href="/guide/advanced" className="text-purple-400 hover:underline">Learn about invite codes</Link> for free streaming access.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Empty state ─────────────── */

function StayTunedState() {
  return (
    <div className="bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-blue-500/10 border border-[#222] rounded-3xl p-10 sm:p-16 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-400"></span>
        </span>
        <span className="text-pink-300 text-xs font-mono uppercase tracking-wider">Coming soon</span>
      </div>

      <h2 className="text-2xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">
        Stay Tuned
      </h2>
      <p className="text-[#888] text-base sm:text-lg mb-8 max-w-xl mx-auto">
        We're putting together the lineup. The first wave of baseFM headliners
        will land here soon — profiles, sets, and "next show" times for each one.
      </p>

      <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto mb-8">
        <FeatureCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
          title="Live sets"
          body="Real-time HLS streams from the booth, no middleman."
        />
        <FeatureCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          title="DJ profiles"
          body="Bio, genres, socials, wallet — everything you need to follow."
        />
        <FeatureCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Show calendar"
          body="See exactly when each headliner is going live next."
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <Link
          href="/"
          className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Listen now
        </Link>
        <Link
          href="/guide/advanced"
          className="px-6 py-2.5 bg-[#1A1A1A] border border-[#333] rounded-full text-[#F5F5F5] text-sm font-medium hover:bg-[#222] transition-colors"
        >
          DJ on baseFM
        </Link>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-[#1A1A1A]/60 border border-[#222] rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center mb-3 text-purple-400">
        {icon}
      </div>
      <p className="text-[#F5F5F5] font-medium text-sm mb-1">{title}</p>
      <p className="text-[#888] text-xs">{body}</p>
    </div>
  );
}

/* ─────────────── Error state ─────────────── */

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-[#1A1A1A] border border-red-500/30 rounded-2xl p-8 text-center">
      <p className="text-red-400 font-medium mb-2">Couldn't load headliners</p>
      <p className="text-[#666] text-sm font-mono break-all">{message}</p>
    </div>
  );
}

/* ─────────────── Populated grid ─────────────── */

function HeadlinerGrid({ headliners }: { headliners: HeadlinerProfile[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {headliners.map((h) => (
        <HeadlinerCard key={h.id} h={h} />
      ))}
    </div>
  );
}

function HeadlinerCard({ h }: { h: HeadlinerProfile }) {
  const nextShow = h.nextShowAt ? new Date(h.nextShowAt) : null;
  const showLabel =
    nextShow && nextShow > new Date()
      ? nextShow.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : null;

  return (
    <Link
      href={`/headliners/${h.slug}`}
      className="group bg-[#1A1A1A] border border-[#222] hover:border-purple-500/40 rounded-2xl overflow-hidden transition-colors"
    >
      {/* Banner / avatar */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-purple-900/40 to-pink-900/40 overflow-hidden">
        {h.bannerUrl ? (
          <Image
            src={h.bannerUrl}
            alt={`${h.displayName} banner`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : h.avatarUrl ? (
          <Image
            src={h.avatarUrl}
            alt={`${h.displayName} avatar`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover opacity-90"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-[#444]">{h.displayName.charAt(0)}</span>
          </div>
        )}
        {showLabel && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/70 backdrop-blur text-pink-300 text-[10px] font-mono">
            NEXT • {showLabel}
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-[#F5F5F5] font-bold text-base mb-0.5 truncate">{h.displayName}</p>
        {h.tagline && <p className="text-[#888] text-xs mb-2 line-clamp-1">{h.tagline}</p>}

        {h.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {h.genres.slice(0, 3).map((g) => (
              <span key={g} className="px-2 py-0.5 rounded-md bg-[#0A0A0A] text-[#888] text-[10px] font-mono">
                {g}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#666] truncate">{h.city ?? (h.ensName ? h.ensName : 'baseFM')}</span>
          <span className="text-purple-400 group-hover:text-pink-400 transition-colors">View →</span>
        </div>
      </div>
    </Link>
  );
}
