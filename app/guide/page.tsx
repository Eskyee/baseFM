'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * User Guide Landing Page
 *
 * Lets users choose between beginner and advanced guides.
 * Also includes quick reference sections for common tasks.
 *
 * Routes:
 * - /guide/beginner - Simple guide for crypto newbies
 * - /guide/advanced - Technical deep-dive for developers
 */

export default function GuidePage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Hero Header */}
        <header className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/25">
            <Image src="/logo.png" alt="baseFM" width={48} height={48} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-3">
            baseFM Guides
          </h1>
          <p className="text-[#888] text-lg">
            Choose your adventure
          </p>
        </header>

        {/* Guide Chooser */}
        <section className="mb-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Beginner Guide Card */}
            <Link
              href="/guide/beginner"
              className="group bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all hover:scale-[1.02]"
            >
              <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
                <span className="text-3xl">🌱</span>
              </div>
              <h2 className="text-xl font-bold text-[#F5F5F5] mb-2">
                Beginner Guide
              </h2>
              <p className="text-[#888] text-sm mb-4">
                New to crypto? Start here! Simple steps to get you listening in minutes.
              </p>
              <ul className="text-xs text-[#666] space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Getting your first wallet
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Connecting to baseFM
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Listening to live shows
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Tipping your favorite DJs
                </li>
              </ul>
              <div className="mt-4 flex items-center text-green-400 text-sm font-medium">
                Get Started
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Advanced Guide Card */}
            <Link
              href="/guide/advanced"
              className="group bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all hover:scale-[1.02]"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <span className="text-3xl">🤓</span>
              </div>
              <h2 className="text-xl font-bold text-[#F5F5F5] mb-2">
                Advanced Guide
              </h2>
              <p className="text-[#888] text-sm mb-4">
                For developers and power users. Technical deep-dive into baseFM.
              </p>
              <ul className="text-xs text-[#666] space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  Tech stack & architecture
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  Smart contract details
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  Streaming setup (OBS, Mux)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  API reference & webhooks
                </li>
              </ul>
              <div className="mt-4 flex items-center text-purple-400 text-sm font-medium">
                Dive Deep
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </section>

        {/* What is baseFM - Quick Overview */}
        <section className="mb-10">
          <div className="bg-[#1A1A1A] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
              <span className="text-xl">📻</span>
              What is baseFM?
            </h2>
            <p className="text-[#888] mb-4">
              <strong className="text-[#F5F5F5]">Internet radio, but onchain.</strong> DJs stream live music, you listen for free, and everything runs on the Base network.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-[#0A0A0A] rounded-xl">
                <span className="text-2xl mb-1 block">🎧</span>
                <p className="text-[#F5F5F5] text-sm font-medium">Listen</p>
              </div>
              <div className="text-center p-3 bg-[#0A0A0A] rounded-xl">
                <span className="text-2xl mb-1 block">💜</span>
                <p className="text-[#F5F5F5] text-sm font-medium">Support</p>
              </div>
              <div className="text-center p-3 bg-[#0A0A0A] rounded-xl">
                <span className="text-2xl mb-1 block">🎪</span>
                <p className="text-[#F5F5F5] text-sm font-medium">Connect</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
            <span className="text-xl">🔗</span>
            Quick Links
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/" className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors">
              <span className="text-xl mb-2 block">🏠</span>
              <p className="text-[#F5F5F5] font-medium">Home</p>
              <p className="text-[#666] text-xs">Live shows</p>
            </Link>
            <Link href="/schedule" className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors">
              <span className="text-xl mb-2 block">📅</span>
              <p className="text-[#F5F5F5] font-medium">Schedule</p>
              <p className="text-[#666] text-xs">Upcoming shows</p>
            </Link>
            <Link href="/djs" className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors">
              <span className="text-xl mb-2 block">🎧</span>
              <p className="text-[#F5F5F5] font-medium">DJs</p>
              <p className="text-[#666] text-xs">All artists</p>
            </Link>
            <Link href="/events" className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors">
              <span className="text-xl mb-2 block">🎪</span>
              <p className="text-[#F5F5F5] font-medium">Events</p>
              <p className="text-[#666] text-xs">Parties & shows</p>
            </Link>
            <Link href="/community" className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors">
              <span className="text-xl mb-2 block">👥</span>
              <p className="text-[#F5F5F5] font-medium">Community</p>
              <p className="text-[#666] text-xs">Join the crew</p>
            </Link>
            <Link href="/wallet" className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors">
              <span className="text-xl mb-2 block">💰</span>
              <p className="text-[#F5F5F5] font-medium">Wallet</p>
              <p className="text-[#666] text-xs">Your balance</p>
            </Link>
            <Link href="/dashboard" className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors">
              <span className="text-xl mb-2 block">🎛️</span>
              <p className="text-[#F5F5F5] font-medium">Dashboard</p>
              <p className="text-[#666] text-xs">For DJs</p>
            </Link>
          </div>
        </section>

        {/* Key Info Cards */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Key Info
          </h2>
          <div className="space-y-3">
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#F5F5F5] font-medium">RAVE Token</span>
                <span className="text-purple-400 text-sm">Community token</span>
              </div>
              <p className="text-[#888] text-sm">Hold 5,000 RAVE to unlock DJ streaming and community features.</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#F5F5F5] font-medium">Network</span>
                <span className="text-blue-400 text-sm">Base (Chain 8453)</span>
              </div>
              <p className="text-[#888] text-sm">Low fees, fast transactions. Use Base Wallet for best experience.</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#F5F5F5] font-medium">Tipping</span>
                <span className="text-green-400 text-sm">4 tokens supported</span>
              </div>
              <p className="text-[#888] text-sm">ETH, USDC, RAVE, or cbBTC. 100% goes to the DJ.</p>
            </div>
          </div>
        </section>

        {/* Need Help CTA */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/20 text-center">
            <h2 className="text-[#F5F5F5] font-bold text-lg mb-2">Need More Help?</h2>
            <p className="text-[#888] mb-4 text-sm">
              Join our community or check out the detailed guides above.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/community"
                className="px-5 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Join Community
              </Link>
              <Link
                href="https://github.com/Eskyee/baseFM"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 bg-[#1A1A1A] text-[#F5F5F5] rounded-full text-sm font-medium hover:bg-[#222] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </Link>
            </div>
          </div>
        </section>

        {/* Back to home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-[#888] text-sm hover:text-[#F5F5F5] transition-colors"
          >
            ← Back to baseFM
          </Link>
        </div>

      </div>
    </div>
  );
}
