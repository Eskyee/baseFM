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
                  You need a crypto wallet to use all features. Don&apos;t worry - it&apos;s free and easy!
                </p>
                <div className="bg-[#0A0A0A] rounded-xl p-4">
                  <p className="text-[#888] text-sm mb-3">We recommend Base Wallet:</p>
                  <ol className="text-[#CCC] text-sm space-y-2 list-decimal list-inside">
                    <li>Download the Base Wallet app on your phone</li>
                    <li>Create a wallet (it&apos;s free)</li>
                    <li>That&apos;s it! You&apos;re ready</li>
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
                  Tap the wallet button in the top corner of baseFM. Sign in with your Base Wallet.
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
                When a DJ is live, you&apos;ll see them on the homepage with a red &quot;LIVE&quot; badge. Just tap to listen!
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
                Persistent Player (Browse While Listening!)
              </h3>
              <p className="text-[#888] mb-3">
                baseFM has a global player that keeps playing even when you navigate to different pages. Start a stream, then explore the app - your music never stops!
              </p>
              <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-[#888] text-sm">Click any live show to start playing</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-[#888] text-sm">Mini player bar stays at the bottom</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-[#888] text-sm">Browse DJs, events, community - music keeps playing</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-[#888] text-sm">Tap the player bar to expand full controls</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#F5F5F5] mb-2">
                Beginner Guide
              </h2>
              <p className="text-[#888] text-sm mb-4">
                New to crypto? Start here! Simple steps to get you listening in minutes.
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
              Love what you&apos;re hearing? Send a tip directly to the DJ&apos;s wallet. They get 100% of it - no middleman!
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
                <p className="text-[#666] text-xs">Wrapped Bitcoin</p>
              </div>
            </div>

            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <p className="text-[#888] text-sm">
                <strong className="text-[#F5F5F5]">How to tip:</strong> On any DJ&apos;s profile or live stream, tap the &quot;Tip&quot; button, choose an amount, and confirm in your wallet. Done!
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
                <li>Tap &quot;Get Tickets&quot;</li>
                <li>Pay with USDC from your wallet</li>
                <li>Your ticket is saved to your wallet!</li>
              </ol>
            </div>

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
            <Link href="/aicloud" className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-colors">
              <span className="text-xl mb-2 block">🤖</span>
              <p className="text-[#F5F5F5] font-medium">AI Cloud</p>
              <p className="text-[#666] text-xs">Agentbot</p>
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

            {/* Streaming Guide for DJs - COMPREHENSIVE */}
            <div className="bg-[#1A1A1A] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📡</span>
                <h3 className="text-[#F5F5F5] font-semibold">DJ Streaming Guide</h3>
              </div>
              <p className="text-[#888] text-sm mb-4">
                Everything you need to go live on baseFM - from first-timers to seasoned pros.
              </p>

              {/* Step 1: Get Your Stream Key */}
              <div className="border-l-2 border-purple-500 pl-4 mb-6">
                <h4 className="text-[#F5F5F5] font-semibold mb-2">Step 1: Get Your Stream Key</h4>
                <ol className="text-[#888] text-sm space-y-2 list-decimal list-inside">
                  <li>Make sure you have <span className="text-purple-400">5,000 RAVE</span> in your wallet</li>
                  <li>Go to <Link href="/dashboard" className="text-blue-400 underline">DJ Dashboard</Link></li>
                  <li>Click &quot;Create Stream&quot; and fill in your show details</li>
                  <li>Click &quot;Setup Mux&quot; to generate your RTMP credentials</li>
                  <li>Copy your <strong className="text-[#F5F5F5]">RTMP URL</strong> and <strong className="text-[#F5F5F5]">Stream Key</strong></li>
                </ol>
              </div>

              {/* Step 2: Choose Your Software */}
              <div className="border-l-2 border-blue-500 pl-4 mb-6">
                <h4 className="text-[#F5F5F5] font-semibold mb-3">Step 2: Choose Your Streaming Software</h4>

                {/* OBS Studio */}
                <div className="bg-[#0A0A0A] rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🖥️</span>
                    <h5 className="text-[#F5F5F5] font-medium">OBS Studio (Desktop - Recommended)</h5>
                  </div>
                  <p className="text-[#666] text-xs mb-3">Free, powerful, works on Mac/Windows/Linux</p>
                  <ol className="text-[#888] text-sm space-y-1.5 list-decimal list-inside">
                    <li>Download from <span className="text-blue-400">obsproject.com</span></li>
                    <li>Go to Settings → Stream</li>
                    <li>Service: Select &quot;Custom...&quot;</li>
                    <li>Server: Paste your RTMP URL</li>
                    <li>Stream Key: Paste your stream key</li>
                    <li>Go to Settings → Output → set Audio Bitrate to 320kbps</li>
                    <li>Add your audio source (microphone, soundcard, etc.)</li>
                    <li>Click &quot;Start Streaming&quot;</li>
                  </ol>
                </div>

                {/* Larix Broadcaster */}
                <div className="bg-[#0A0A0A] rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📱</span>
                    <h5 className="text-[#F5F5F5] font-medium">Larix Broadcaster (Mobile)</h5>
                  </div>
                  <p className="text-[#666] text-xs mb-3">Free app for iPhone and Android - stream from anywhere</p>
                  <ol className="text-[#888] text-sm space-y-1.5 list-decimal list-inside">
                    <li>Download Larix Broadcaster from App Store / Play Store</li>
                    <li>Tap the gear icon → Connections</li>
                    <li>Tap + to add new connection</li>
                    <li>Name: &quot;baseFM&quot;</li>
                    <li>URL: Paste your full RTMP URL with stream key</li>
                    <li>Format: rtmp://...your-url.../your-stream-key</li>
                    <li>Save and tap the red record button to go live</li>
                  </ol>
                </div>

                {/* Butt */}
                <div className="bg-[#0A0A0A] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎚️</span>
                    <h5 className="text-[#F5F5F5] font-medium">BUTT (Audio-only, lightweight)</h5>
                  </div>
                  <p className="text-[#666] text-xs mb-3">Simple audio streamer - &quot;Broadcast Using This Tool&quot;</p>
                  <ol className="text-[#888] text-sm space-y-1.5 list-decimal list-inside">
                    <li>Download from <span className="text-blue-400">danielnoethen.de/butt</span></li>
                    <li>Settings → Main → Server: Add</li>
                    <li>Type: Icecast, Address: your RTMP server</li>
                    <li>Port: 1935, Password: your stream key</li>
                    <li>Set audio input device and bitrate</li>
                    <li>Click Play to start streaming</li>
                  </ol>
                </div>
              </div>

              {/* Step 3: Recommended Settings */}
              <div className="border-l-2 border-green-500 pl-4 mb-6">
                <h4 className="text-[#F5F5F5] font-semibold mb-3">Step 3: Recommended Audio Settings</h4>
                <div className="bg-[#0A0A0A] rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[#666]">Audio Bitrate</span>
                      <p className="text-[#F5F5F5] font-mono">128-320 kbps</p>
                    </div>
                    <div>
                      <span className="text-[#666]">Sample Rate</span>
                      <p className="text-[#F5F5F5] font-mono">44.1 kHz</p>
                    </div>
                    <div>
                      <span className="text-[#666]">Channels</span>
                      <p className="text-[#F5F5F5] font-mono">Stereo</p>
                    </div>
                    <div>
                      <span className="text-[#666]">Codec</span>
                      <p className="text-[#F5F5F5] font-mono">AAC</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#1A1A1A]">
                    <p className="text-[#666] text-xs">
                      <strong className="text-[#888]">Pro tip:</strong> 256kbps is the sweet spot for quality vs. bandwidth. Go 320kbps if you want maximum fidelity.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4: Go Live */}
              <div className="border-l-2 border-red-500 pl-4 mb-4">
                <h4 className="text-[#F5F5F5] font-semibold mb-2">Step 4: Go Live!</h4>
                <ol className="text-[#888] text-sm space-y-2 list-decimal list-inside">
                  <li>Start streaming from your software</li>
                  <li>baseFM automatically detects when you go live</li>
                  <li>Your show appears on the homepage with a LIVE badge</li>
                  <li>When done, stop streaming and click &quot;End Stream&quot; in dashboard</li>
                </ol>
              </div>

              {/* Troubleshooting */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <h4 className="text-yellow-400 font-semibold text-sm mb-2">Troubleshooting</h4>
                <ul className="text-[#888] text-xs space-y-1.5">
                  <li><strong className="text-[#F5F5F5]">Stream not showing?</strong> Wait 10-30 seconds for Mux to detect it</li>
                  <li><strong className="text-[#F5F5F5]">Connection failed?</strong> Check your RTMP URL and stream key are correct</li>
                  <li><strong className="text-[#F5F5F5]">Audio cutting out?</strong> Lower your bitrate or check your internet connection</li>
                  <li><strong className="text-[#F5F5F5]">No audio?</strong> Make sure your audio input device is selected in your streaming software</li>
                </ul>
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

        {/* ============================================================= */}
        {/* SECTION 10: Feature Summary */}
        {/* ============================================================= */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5]">All Features</h2>
          </div>

          <div className="space-y-4">
            {/* Core Platform */}
            <div className="bg-[#1A1A1A] rounded-2xl p-5">
              <h3 className="text-[#F5F5F5] font-semibold mb-3 flex items-center gap-2">
                <span className="text-red-400">●</span> Core Platform
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[#888]">Live Streaming (Mux)</div>
                <div className="text-[#888]">Listen While Browsing</div>
                <div className="text-[#888]">Show Schedule</div>
                <div className="text-[#888]">Show Archive</div>
                <div className="text-[#888]">Live Chat</div>
                <div className="text-[#888]">Push Notifications</div>
              </div>
            </div>

            {/* Community & Social */}
            <div className="bg-[#1A1A1A] rounded-2xl p-5">
              <h3 className="text-[#F5F5F5] font-semibold mb-3 flex items-center gap-2">
                <span className="text-purple-400">●</span> Community & Social
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[#888]">Threads (Token-gated)</div>
                <div className="text-[#888]">Community Directory</div>
                <div className="text-[#888]">Collectives & Promoters</div>
                <div className="text-[#888]">Create Profile</div>
                <div className="text-[#888]">Follow DJs</div>
                <div className="text-[#888]">Direct Messages</div>
                <div className="text-[#888]">Farcaster Integration</div>
                <div className="text-[#888]">Gallery</div>
              </div>
            </div>

            {/* Events & Tickets */}
            <div className="bg-[#1A1A1A] rounded-2xl p-5">
              <h3 className="text-[#F5F5F5] font-semibold mb-3 flex items-center gap-2">
                <span className="text-orange-400">●</span> Events & Tickets
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[#888]">Events Listing</div>
                <div className="text-[#888]">Submit Events</div>
                <div className="text-[#888]">Onchain Ticket Sales</div>
                <div className="text-[#888]">Multiple Ticket Tiers</div>
                <div className="text-[#888]">Direct USDC Payments</div>
                <div className="text-[#888]">POS / Ticket Scanner</div>
              </div>
            </div>

            {/* Wallet & Tokens */}
            <div className="bg-[#1A1A1A] rounded-2xl p-5">
              <h3 className="text-[#F5F5F5] font-semibold mb-3 flex items-center gap-2">
                <span className="text-green-400">●</span> Wallet & Tokens
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[#888]">Base Wallet Integration</div>
                <div className="text-[#888]">RAVE Token</div>
                <div className="text-[#888]">Token Balances</div>
                <div className="text-[#888]">Swap / Trade</div>
                <div className="text-[#888]">Tip DJs (ETH/USDC/RAVE/cbBTC)</div>
                <div className="text-[#888]">RAVE Price Chart</div>
              </div>
            </div>

            {/* DJ Tools */}
            <div className="bg-[#1A1A1A] rounded-2xl p-5">
              <h3 className="text-[#F5F5F5] font-semibold mb-3 flex items-center gap-2">
                <span className="text-blue-400">●</span> DJ Tools
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[#888]">DJ Dashboard</div>
                <div className="text-[#888]">Stream Setup (OBS/Larix/BUTT)</div>
                <div className="text-[#888]">Token-Gated Streams</div>
                <div className="text-[#888]">DJ Profiles</div>
                <div className="text-[#888]">Analytics</div>
                <div className="text-[#888]">Show Scheduling</div>
              </div>
            </div>

            {/* AI & Experimental */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-5">
              <h3 className="text-[#F5F5F5] font-semibold mb-3 flex items-center gap-2">
                <span className="text-purple-400">●</span> AI & Experimental
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">NEW</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[#888]">aicloud - AI Agents</div>
                <div className="text-[#888]">ravefeed - Agent Timeline</div>
                <div className="text-[#888]">Agent Registration</div>
                <div className="text-[#888]">Auto-posting to Socials</div>
              </div>
            </div>

            {/* Promoter Tools */}
            <div className="bg-[#1A1A1A] rounded-2xl p-5">
              <h3 className="text-[#F5F5F5] font-semibold mb-3 flex items-center gap-2">
                <span className="text-yellow-400">●</span> Promoter Tools
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[#888]">Promoter Dashboard</div>
                <div className="text-[#888]">Crew Management (35+ roles)</div>
                <div className="text-[#888]">Event Submissions</div>
                <div className="text-[#888]">Revenue Tracking</div>
                <div className="text-[#888]">Collective Profiles</div>
                <div className="text-[#888]">Slack Notifications</div>
              </div>
            </div>

            {/* Platform */}
            <div className="bg-[#1A1A1A] rounded-2xl p-5">
              <h3 className="text-[#F5F5F5] font-semibold mb-3 flex items-center gap-2">
                <span className="text-cyan-400">●</span> Platform
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-[#888]">PWA (Install on mobile)</div>
                <div className="text-[#888]">Mobile-First Design</div>
                <div className="text-[#888]">Base Network (Chain 8453)</div>
                <div className="text-[#888]">Cloudinary CDN</div>
                <div className="text-[#888]">Real-time Updates</div>
                <div className="text-[#888]">External Shop</div>
              </div>
            </div>
          </div>

          {/* Tech Specs - For the super nerds */}
          <div className="mt-8 pt-6 border-t border-[#333]">
            <button
              onClick={() => {
                const el = document.getElementById('tech-specs');
                if (el) el.classList.toggle('hidden');
              }}
              className="flex items-center gap-2 text-sm text-[#666] hover:text-[#888] transition-colors"
            >
              <span>🤓</span>
              <span>Tech Specs (for the nerds)</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div id="tech-specs" className="hidden mt-4 space-y-3 text-xs font-mono">
              <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-2">
                <div className="text-purple-400 font-semibold mb-2">{`// Stack`}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-[#666]">Framework</span>
                  <span className="text-[#888]">Next.js 14 (App Router)</span>
                  <span className="text-[#666]">Language</span>
                  <span className="text-[#888]">TypeScript</span>
                  <span className="text-[#666]">Styling</span>
                  <span className="text-[#888]">Tailwind CSS</span>
                  <span className="text-[#666]">Database</span>
                  <span className="text-[#888]">Supabase (Postgres)</span>
                  <span className="text-[#666]">Streaming</span>
                  <span className="text-[#888]">Mux (RTMP→HLS)</span>
                  <span className="text-[#666]">Images</span>
                  <span className="text-[#888]">Cloudinary CDN</span>
                  <span className="text-[#666]">Hosting</span>
                  <span className="text-[#888]">Vercel Edge</span>
                </div>
              </div>

              <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-2">
                <div className="text-green-400 font-semibold mb-2">{`// Onchain`}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-[#666]">Network</span>
                  <span className="text-[#888]">Base (Chain ID: 8453)</span>
                  <span className="text-[#666]">Wallet</span>
                  <span className="text-[#888]">Coinbase Smart Wallet</span>
                  <span className="text-[#666]">Web3</span>
                  <span className="text-[#888]">wagmi v2 + viem</span>
                  <span className="text-[#666]">Identity</span>
                  <span className="text-[#888]">OnchainKit</span>
                  <span className="text-[#666]">RAVE Token</span>
                  <span className="text-[#888] break-all">0xdf3c...86f5</span>
                  <span className="text-[#666]">USDC</span>
                  <span className="text-[#888] break-all">0x8335...2913</span>
                </div>
              </div>

              <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-2">
                <div className="text-cyan-400 font-semibold mb-2">{`// Stats`}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-[#666]">API Routes</span>
                  <span className="text-[#888]">50+</span>
                  <span className="text-[#666]">Components</span>
                  <span className="text-[#888]">40+</span>
                  <span className="text-[#666]">Database Tables</span>
                  <span className="text-[#888]">13</span>
                  <span className="text-[#666]">Test Coverage</span>
                  <span className="text-[#888]">55+ unit tests</span>
                  <span className="text-[#666]">Crew Roles</span>
                  <span className="text-[#888]">35+</span>
                  <span className="text-[#666]">PWA Cache</span>
                  <span className="text-[#888]">v4</span>
                </div>
              </div>

              <div className="text-center text-[#444] mt-4">
                Built with ❤️ on Base
              </div>
            </div>
          </div>
        </section>

        {/* Developer Notice */}
        <div className="mb-8 p-5 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">👩‍💻</span>
            </div>
            <div>
              <h3 className="text-[#F5F5F5] font-semibold mb-2">New Developers Welcome!</h3>
              <p className="text-[#888] text-sm leading-relaxed mb-3">
                Want to build on Base? We&apos;re starting monthly meetups at a workshop cafe in Oxford.
                Come learn, collaborate, and build with fellow Base builders over coffee.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">Base Builders</span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">Oxford</span>
                <span className="px-2 py-1 bg-[#1A1A1A] text-[#888] rounded-full">Monthly</span>
              </div>
            </div>
          </div>
        </div>

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
