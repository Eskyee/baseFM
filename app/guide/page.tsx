'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * User Guide Page
 *
 * A beginner-friendly guide to help new users understand and use baseFM.
 * Written in simple English with clear steps and visual cues.
 *
 * Key sections:
 * 1. What is baseFM? (Bird's eye overview)
 * 2. Getting Started (Connect wallet)
 * 3. Listening to Shows (Finding and playing streams)
 * 4. For DJs (Starting to stream)
 * 5. Community Features (Tipping, events, etc.)
 */

export default function GuidePage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Hero Header */}
        <header className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/25">
            <Image src="/logo.png" alt="baseFM" width={48} height={48} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-3">
            Welcome to baseFM
          </h1>
          <p className="text-[#888] text-lg">
            Your guide to onchain radio
          </p>
        </header>

        {/* ============================================================= */}
        {/* SECTION 1: Bird's Eye Overview */}
        {/* ============================================================= */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5]">What is baseFM?</h2>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 space-y-4">
            <p className="text-[#CCC] leading-relaxed">
              <strong className="text-white">baseFM is like internet radio, but better.</strong> DJs stream live music, you listen for free, and everything runs on crypto (the Base network).
            </p>

            {/* Simple visual breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-[#0A0A0A] rounded-xl">
                <span className="text-3xl mb-2 block">🎧</span>
                <p className="text-[#F5F5F5] font-medium">Listen</p>
                <p className="text-[#666] text-sm">Free live music</p>
              </div>
              <div className="text-center p-4 bg-[#0A0A0A] rounded-xl">
                <span className="text-3xl mb-2 block">💜</span>
                <p className="text-[#F5F5F5] font-medium">Support</p>
                <p className="text-[#666] text-sm">Tip DJs directly</p>
              </div>
              <div className="text-center p-4 bg-[#0A0A0A] rounded-xl">
                <span className="text-3xl mb-2 block">🎪</span>
                <p className="text-[#F5F5F5] font-medium">Connect</p>
                <p className="text-[#666] text-sm">Join events</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 2: Getting Started */}
        {/* ============================================================= */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5]">Getting Started</h2>
          </div>

          {/* Step 1 */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-white">
                1
              </div>
              <div>
                <h3 className="text-[#F5F5F5] font-semibold mb-2">Get a Wallet</h3>
                <p className="text-[#888] mb-4">
                  You need a crypto wallet to use all features. Don't worry - it's free and easy!
                </p>
                <div className="bg-[#0A0A0A] rounded-xl p-4">
                  <p className="text-[#888] text-sm mb-3">We recommend Coinbase Wallet:</p>
                  <ol className="text-[#CCC] text-sm space-y-2 list-decimal list-inside">
                    <li>Download the Coinbase app on your phone</li>
                    <li>Create a wallet (it's free)</li>
                    <li>That's it! You're ready</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-white">
                2
              </div>
              <div>
                <h3 className="text-[#F5F5F5] font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-[#888] mb-4">
                  Tap the wallet button in the top corner of baseFM. Sign in with your Coinbase Wallet.
                </p>
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <span>No password needed - just tap to connect!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-white">
                3
              </div>
              <div>
                <h3 className="text-[#F5F5F5] font-semibold mb-2">Start Exploring!</h3>
                <p className="text-[#888] mb-4">
                  Now you can listen to shows, tip DJs, buy event tickets, and more.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/" className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition-colors">
                    Go to Homepage
                  </Link>
                  <Link href="/djs" className="px-4 py-2 bg-[#2A2A2A] text-[#F5F5F5] rounded-full text-sm font-medium hover:bg-[#333] transition-colors">
                    Browse DJs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 3: Listening to Shows */}
        {/* ============================================================= */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5]">Listening to Shows</h2>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 space-y-6">
            {/* Finding shows */}
            <div>
              <h3 className="text-[#F5F5F5] font-semibold mb-3 flex items-center gap-2">
                <span className="text-green-400">●</span>
                Finding Live Shows
              </h3>
              <p className="text-[#888] mb-3">
                When a DJ is live, you'll see them on the homepage with a red "LIVE" badge. Just tap to listen!
              </p>
              <div className="bg-[#0A0A0A] rounded-xl p-4">
                <p className="text-[#666] text-sm">
                  <strong className="text-[#888]">Pro tip:</strong> Check the Schedule page to see when your favorite DJs are playing next.
                </p>
              </div>
            </div>

            {/* Player */}
            <div>
              <h3 className="text-[#F5F5F5] font-semibold mb-3 flex items-center gap-2">
                <span className="text-blue-400">●</span>
                Using the Player
              </h3>
              <p className="text-[#888]">
                The player bar appears at the bottom of your screen. Hit play, and the music starts! You can keep browsing while listening.
              </p>
            </div>

            {/* Chat */}
            <div>
              <h3 className="text-[#F5F5F5] font-semibold mb-3 flex items-center gap-2">
                <span className="text-purple-400">●</span>
                Live Chat
              </h3>
              <p className="text-[#888]">
                Chat with other listeners and the DJ while the show is live. Just connect your wallet and start typing!
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 4: Supporting DJs */}
        {/* ============================================================= */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <span className="text-2xl">💜</span>
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5]">Supporting DJs</h2>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6">
            <p className="text-[#888] mb-6">
              Love what you're hearing? Send a tip directly to the DJ's wallet. They get 100% of it - no middleman!
            </p>

            {/* Tip options */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#0A0A0A] rounded-xl p-4 text-center">
                <span className="text-xl">⟠</span>
                <p className="text-[#F5F5F5] font-medium mt-1">ETH</p>
                <p className="text-[#666] text-xs">Ethereum</p>
              </div>
              <div className="bg-[#0A0A0A] rounded-xl p-4 text-center">
                <span className="text-xl text-blue-400">$</span>
                <p className="text-[#F5F5F5] font-medium mt-1">USDC</p>
                <p className="text-[#666] text-xs">US Dollar Coin</p>
              </div>
              <div className="bg-[#0A0A0A] rounded-xl p-4 text-center">
                <span className="text-xl">🎵</span>
                <p className="text-[#F5F5F5] font-medium mt-1">RAVE</p>
                <p className="text-[#666] text-xs">Community Token</p>
              </div>
              <div className="bg-[#0A0A0A] rounded-xl p-4 text-center">
                <span className="text-xl text-orange-400">₿</span>
                <p className="text-[#F5F5F5] font-medium mt-1">cbBTC</p>
                <p className="text-[#666] text-xs">Coinbase Bitcoin</p>
              </div>
            </div>

            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <p className="text-[#888] text-sm">
                <strong className="text-[#F5F5F5]">How to tip:</strong> On any DJ's profile or live stream, tap the "Tip" button, choose an amount, and confirm in your wallet. Done!
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 5: Events & Tickets */}
        {/* ============================================================= */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <span className="text-2xl">🎪</span>
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5]">Events & Tickets</h2>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 space-y-4">
            <p className="text-[#888]">
              baseFM hosts real-world events! Buy tickets directly with your wallet - no sign-ups, no fees, money goes straight to the promoter.
            </p>

            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/20">
              <h4 className="text-[#F5F5F5] font-semibold mb-2">How it works:</h4>
              <ol className="text-[#888] text-sm space-y-2 list-decimal list-inside">
                <li>Find an event you like</li>
                <li>Tap "Get Tickets"</li>
                <li>Pay with USDC from your wallet</li>
                <li>Your ticket is saved to your wallet!</li>
              </ol>
            </div>

            <Link
              href="/events"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#0A0A0A] text-[#F5F5F5] rounded-xl font-medium hover:bg-[#111] transition-colors"
            >
              <span>Browse Events</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 6: For DJs */}
        {/* ============================================================= */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <span className="text-2xl">🎛️</span>
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5]">For DJs</h2>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 space-y-4">
            <p className="text-[#888]">
              Want to stream on baseFM? You need <strong className="text-purple-400">5,000 RAVE tokens</strong> to unlock DJ access.
            </p>

            <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-3">
              <h4 className="text-[#F5F5F5] font-semibold">What you get:</h4>
              <ul className="text-[#888] text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Live streaming to your audience
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Receive tips directly to your wallet
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Your own DJ profile page
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Schedule your shows
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              <span>Go to DJ Dashboard</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 7: Quick Links */}
        {/* ============================================================= */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5]">Quick Links</h2>
          </div>

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
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 8: Need Help? */}
        {/* ============================================================= */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/20 text-center">
            <h2 className="text-[#F5F5F5] font-bold text-xl mb-3">Need Help?</h2>
            <p className="text-[#888] mb-4">
              Join our community or reach out to us directly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/community"
                className="px-6 py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                Join Community
              </Link>
              <Link
                href="https://github.com/Eskyee/baseFM"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-[#1A1A1A] text-[#F5F5F5] rounded-full font-medium hover:bg-[#222] transition-colors flex items-center gap-2"
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
