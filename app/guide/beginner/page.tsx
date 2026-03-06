'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * Beginner Guide Page
 *
 * Super simple guide for people who are new to crypto and baseFM.
 * Written in plain English with no jargon. Step-by-step instructions.
 */

export default function BeginnerGuidePage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <header className="text-center mb-10">
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 text-sm text-[#666] hover:text-[#888] mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to guides
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-2">
            Beginner&apos;s Guide
          </h1>
          <p className="text-[#888]">
            New to crypto? No problem. Let&apos;s get you started!
          </p>
        </header>

        {/* What is baseFM - Simple explanation */}
        <section className="mb-8">
          <div className="bg-[#1A1A1A] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
              <span className="text-xl">📻</span>
              What is baseFM?
            </h2>
            <div className="space-y-4 text-[#888]">
              <p>
                <strong className="text-[#F5F5F5]">Think of baseFM like an internet radio station</strong> where DJs play live music and you can listen for free.
              </p>
              <p>
                The difference? Everything runs on your <strong className="text-[#F5F5F5]">digital wallet</strong> instead of a username and password. Your wallet is like your ID, bank account, and login all in one.
              </p>
              <p>
                No email needed. No passwords to remember. Just connect your wallet and you&apos;re in!
              </p>
            </div>
          </div>
        </section>

        {/* Step 1: Get a Wallet */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              1
            </div>
            <h2 className="text-lg font-bold text-[#F5F5F5]">Get a Wallet (2 minutes)</h2>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-5 space-y-4">
            <p className="text-[#888]">
              A wallet is like a digital keychain. It keeps your money and ID safe. We use <strong className="text-[#F5F5F5]">Base Wallet</strong> - it&apos;s free and easy.
            </p>

            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <h3 className="text-[#F5F5F5] font-medium mb-3">On your phone:</h3>
              <ol className="space-y-2 text-sm text-[#888]">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-medium">1.</span>
                  <span>Go to <strong className="text-[#F5F5F5]">wallet.coinbase.com</strong> on your phone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-medium">2.</span>
                  <span>Tap &quot;Get Started&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-medium">3.</span>
                  <span>Create your wallet with Face ID or fingerprint</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-medium">4.</span>
                  <span>Done! Your wallet is ready</span>
                </li>
              </ol>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <p className="text-yellow-400 text-sm font-medium mb-1">Important!</p>
              <p className="text-[#888] text-sm">
                Write down your recovery phrase and keep it somewhere safe. If you lose your phone, this is the only way to get your wallet back.
              </p>
            </div>
          </div>
        </section>

        {/* Step 2: Connect to baseFM */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              2
            </div>
            <h2 className="text-lg font-bold text-[#F5F5F5]">Connect to baseFM (30 seconds)</h2>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-5">
            <ol className="space-y-3 text-[#888]">
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-medium">1.</span>
                <span>Go to <strong className="text-[#F5F5F5]">basefm.space</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-medium">2.</span>
                <span>Tap the <strong className="text-[#F5F5F5]">Connect</strong> button in the top corner</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-medium">3.</span>
                <span>Your wallet app will open - tap <strong className="text-[#F5F5F5]">Approve</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-medium">4.</span>
                <span>That&apos;s it! You&apos;re connected!</span>
              </li>
            </ol>

            <div className="mt-4 pt-4 border-t border-[#333]">
              <p className="text-sm text-[#666]">
                You&apos;ll see a small circle with your avatar appear. That means you&apos;re logged in.
              </p>
            </div>
          </div>
        </section>

        {/* Step 3: Listen to Music */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              3
            </div>
            <h2 className="text-lg font-bold text-[#F5F5F5]">Listen to Music (Free!)</h2>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-5">
            <div className="space-y-4">
              <p className="text-[#888]">
                When a DJ is live, you&apos;ll see a card with <span className="text-red-400 font-medium">LIVE</span> on it. Just tap to start listening!
              </p>

              <div className="grid gap-3">
                <div className="bg-[#0A0A0A] rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">🎵</span>
                  <div>
                    <p className="text-[#F5F5F5] font-medium">Listening is free</p>
                    <p className="text-[#666] text-sm">No money needed</p>
                  </div>
                </div>
                <div className="bg-[#0A0A0A] rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="text-[#F5F5F5] font-medium">Chat with others</p>
                    <p className="text-[#666] text-sm">Say hi during live shows</p>
                  </div>
                </div>
                <div className="bg-[#0A0A0A] rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-[#F5F5F5] font-medium">Check the schedule</p>
                    <p className="text-[#666] text-sm">See what&apos;s coming up</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Optional: Tip a DJ */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              +
            </div>
            <h2 className="text-lg font-bold text-[#F5F5F5]">Optional: Tip a DJ</h2>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-5">
            <p className="text-[#888] mb-4">
              Love a set? You can send a tip directly to the DJ. It&apos;s like buying them a drink!
            </p>

            <div className="bg-[#0A0A0A] rounded-xl p-4 mb-4">
              <h3 className="text-[#F5F5F5] font-medium mb-2">First, add money to your wallet:</h3>
              <ol className="space-y-2 text-sm text-[#888]">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-medium">1.</span>
                  <span>Go to the <Link href="/wallet" className="text-blue-400 underline">Wallet page</Link></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-medium">2.</span>
                  <span>Tap &quot;Buy Crypto&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-medium">3.</span>
                  <span>Use your card to buy some ETH or USDC</span>
                </li>
              </ol>
            </div>

            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <h3 className="text-[#F5F5F5] font-medium mb-2">Then tip the DJ:</h3>
              <ol className="space-y-2 text-sm text-[#888]">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-medium">1.</span>
                  <span>While listening, tap the <strong className="text-[#F5F5F5]">Tip</strong> button</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-medium">2.</span>
                  <span>Pick how much to send</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-medium">3.</span>
                  <span>Confirm in your wallet</span>
                </li>
              </ol>
            </div>

            <p className="text-[#666] text-sm mt-4">
              100% of your tip goes to the DJ. No fees!
            </p>
          </div>
        </section>

        {/* Understanding Crypto Money - Simple */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
            <span className="text-xl">💰</span>
            Understanding Crypto Money (Simple Version)
          </h2>

          <div className="space-y-3">
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#F5F5F5] font-medium">ETH (Ethereum)</span>
                <span className="text-blue-400 text-sm">Main currency</span>
              </div>
              <p className="text-[#888] text-sm">
                Like dollars on the internet. Used to pay for things and send tips.
              </p>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#F5F5F5] font-medium">USDC</span>
                <span className="text-green-400 text-sm">Digital dollars</span>
              </div>
              <p className="text-[#888] text-sm">
                Always worth $1. Good for buying tickets or sending exact amounts.
              </p>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#F5F5F5] font-medium">RAVE</span>
                <span className="text-purple-400 text-sm">baseFM token</span>
              </div>
              <p className="text-[#888] text-sm">
                Our community token. Hold 5,000 RAVE to unlock special features and become a DJ.
              </p>
            </div>
          </div>
        </section>

        {/* Common Questions */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
            <span className="text-xl">❓</span>
            Common Questions
          </h2>

          <div className="space-y-3">
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <p className="text-[#F5F5F5] font-medium mb-2">Is it safe?</p>
              <p className="text-[#888] text-sm">
                Yes! Your wallet is secured by your phone&apos;s Face ID or fingerprint. Nobody can access it without your device.
              </p>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <p className="text-[#F5F5F5] font-medium mb-2">Do I need money to use baseFM?</p>
              <p className="text-[#888] text-sm">
                No! Listening and chatting is free. You only need money if you want to tip DJs, buy tickets, or unlock premium features.
              </p>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <p className="text-[#F5F5F5] font-medium mb-2">What if I lose my phone?</p>
              <p className="text-[#888] text-sm">
                Use your recovery phrase to restore your wallet on a new phone. That&apos;s why it&apos;s important to write it down!
              </p>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <p className="text-[#F5F5F5] font-medium mb-2">Can I use baseFM on my computer?</p>
              <p className="text-[#888] text-sm">
                Yes! Works on any device with a browser. Just go to basefm.space.
              </p>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <p className="text-[#F5F5F5] font-medium mb-2">How do I become a DJ?</p>
              <p className="text-[#888] text-sm">
                Get 5,000 RAVE tokens in your wallet, then you can access the DJ dashboard. Check out the <Link href="/guide/advanced" className="text-purple-400 underline">advanced guide</Link> for streaming setup.
              </p>
            </div>
          </div>
        </section>

        {/* Install the App */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-3 flex items-center gap-2">
              <span className="text-xl">📱</span>
              Install the App
            </h2>
            <p className="text-[#888] mb-4">
              Add baseFM to your home screen for the best experience:
            </p>
            <div className="space-y-3">
              <div className="bg-[#0A0A0A] rounded-xl p-4">
                <p className="text-[#F5F5F5] font-medium mb-2">iPhone:</p>
                <p className="text-[#888] text-sm">
                  Safari → Share button → &quot;Add to Home Screen&quot;
                </p>
              </div>
              <div className="bg-[#0A0A0A] rounded-xl p-4">
                <p className="text-[#F5F5F5] font-medium mb-2">Android:</p>
                <p className="text-[#888] text-sm">
                  Chrome menu → &quot;Add to Home Screen&quot; or &quot;Install App&quot;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ready for more? */}
        <section className="mb-8">
          <div className="text-center bg-[#1A1A1A] rounded-2xl p-6">
            <span className="text-3xl mb-3 block">🎉</span>
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-2">You&apos;re all set!</h2>
            <p className="text-[#888] mb-4">
              That&apos;s everything you need to start using baseFM.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Start Listening
              </Link>
              <Link
                href="/guide/advanced"
                className="px-6 py-2.5 bg-[#0A0A0A] text-[#888] rounded-full font-medium hover:text-[#F5F5F5] transition-colors"
              >
                Ready for Advanced Guide?
              </Link>
            </div>
          </div>
        </section>

        {/* Back to guide */}
        <div className="text-center">
          <Link
            href="/guide"
            className="text-[#888] text-sm hover:text-[#F5F5F5] transition-colors"
          >
            ← Back to Guide
          </Link>
        </div>

      </div>
    </div>
  );
}
