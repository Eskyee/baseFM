'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * User Guide Landing Page
 *
 * Lets users choose between beginner and advanced guides.
 *
 * Routes:
 * - /guide/beginner - Simple guide for crypto newbies
 * - /guide/advanced - Technical deep-dive for developers
 */

export default function GuidePage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Hero Header */}
        <header className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/25">
            <Image src="/logo.png" alt="baseFM" width={48} height={48} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-3">
            baseFM Guides
          </h1>
          <p className="text-[#888] text-lg">
            Choose your path
          </p>
        </header>

        {/* What is baseFM - Quick intro */}
        <section className="mb-10">
          <div className="bg-[#1A1A1A] rounded-2xl p-6">
            <p className="text-[#CCC] leading-relaxed text-center">
              <strong className="text-white">baseFM is like internet radio, but better.</strong>
              <br />
              DJs stream live music, you listen for free, and everything runs on crypto.
            </p>
          </div>
        </section>

        {/* Guide Chooser Cards */}
        <section className="space-y-4">

          {/* Beginner Guide Card */}
          <Link
            href="/guide/beginner"
            className="group block bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                <span className="text-3xl">🌱</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#F5F5F5] mb-2">
                  Beginner Guide
                </h2>
                <p className="text-[#888] text-sm mb-4">
                  New to crypto? Start here. Simple step-by-step instructions.
                </p>
                <ul className="text-xs text-[#666] space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">&#10003;</span>
                    What is baseFM?
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">&#10003;</span>
                    Setting up your wallet
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">&#10003;</span>
                    Getting RAVE tokens
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">&#10003;</span>
                    Tipping DJs & buying tickets
                  </li>
                </ul>
              </div>
              <div className="text-[#666] group-hover:text-[#888] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Advanced Guide Card */}
          <Link
            href="/guide/advanced"
            className="group block bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-colors">
                <span className="text-3xl">🤓</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#F5F5F5] mb-2">
                  Advanced Guide
                </h2>
                <p className="text-[#888] text-sm mb-4">
                  For developers and power users. Technical deep-dive.
                </p>
                <ul className="text-xs text-[#666] space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400">&#10003;</span>
                    Tech stack & architecture
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400">&#10003;</span>
                    Smart contract details
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400">&#10003;</span>
                    Streaming setup (OBS, Mux)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400">&#10003;</span>
                    API reference & webhooks
                  </li>
                </ul>
              </div>
              <div className="text-[#666] group-hover:text-[#888] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

        </section>

        {/* Quick Links */}
        <section className="mt-10">
          <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wider mb-4 text-center">
            Quick Links
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/" className="bg-[#1A1A1A] rounded-xl p-4 text-center hover:bg-[#222] transition-colors">
              <span className="text-xl block mb-1">🏠</span>
              <span className="text-xs text-[#888]">Home</span>
            </Link>
            <Link href="/schedule" className="bg-[#1A1A1A] rounded-xl p-4 text-center hover:bg-[#222] transition-colors">
              <span className="text-xl block mb-1">📅</span>
              <span className="text-xs text-[#888]">Schedule</span>
            </Link>
            <Link href="/events" className="bg-[#1A1A1A] rounded-xl p-4 text-center hover:bg-[#222] transition-colors">
              <span className="text-xl block mb-1">🎪</span>
              <span className="text-xs text-[#888]">Events</span>
            </Link>
            <Link href="/wallet" className="bg-[#1A1A1A] rounded-xl p-4 text-center hover:bg-[#222] transition-colors">
              <span className="text-xl block mb-1">💰</span>
              <span className="text-xs text-[#888]">Wallet</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
