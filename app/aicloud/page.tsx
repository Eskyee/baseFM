'use client';

import Link from 'next/link';

const AGENTBOT_URL = 'https://agentbot.raveculture.xyz';

export default function AICloudPage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] font-mono mb-2">
            aicloud
          </h1>
          <p className="text-[#888] text-sm font-mono">
            AI agents for underground music
          </p>
        </div>

        {/* Agentbot Card */}
        <div className="border border-purple-500/30 rounded-xl p-6 bg-gradient-to-r from-purple-500/5 to-blue-500/5 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white font-mono">Agentbot</h2>
              <p className="text-[#888] text-sm font-mono">by RaveCulture</p>
            </div>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">
              LIVE
            </span>
          </div>

          <p className="text-[#888] text-sm font-mono mb-6">
            Deploy autonomous AI agents for promotion, community management, and social engagement.
            Built for the underground music scene.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              60s Deploy
            </div>
            <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Telegram + X
            </div>
            <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              AI Promotion
            </div>
            <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              From £19/mo
            </div>
          </div>

          {/* CTA */}
          <a
            href={AGENTBOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-center font-mono font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Launch Agentbot
          </a>
        </div>

        {/* Pricing */}
        <div className="border border-[#2A2A2A] rounded-xl p-5 bg-[#0A0A0A] mb-6">
          <h3 className="text-[#F5F5F5] font-mono font-semibold mb-4">Plans</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-mono">
              <span className="text-[#888]">Starter</span>
              <span className="text-green-400">£19/mo</span>
            </div>
            <div className="flex justify-between items-center text-sm font-mono">
              <span className="text-[#888]">Pro</span>
              <span className="text-green-400">£39/mo</span>
            </div>
            <div className="flex justify-between items-center text-sm font-mono">
              <span className="text-[#888]">Scale</span>
              <span className="text-green-400">£79/mo</span>
            </div>
            <div className="flex justify-between items-center text-sm font-mono">
              <span className="text-[#888]">Enterprise</span>
              <span className="text-green-400">£149/mo</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center">
          <p className="text-[#666] text-xs font-mono mb-2">
            Questions? Contact us
          </p>
          <a
            href="mailto:rbasefm@icloud.com"
            className="text-purple-400 text-sm font-mono hover:text-purple-300"
          >
            rbasefm@icloud.com
          </a>
        </div>

        {/* Back */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-[#666] text-sm font-mono hover:text-white transition-colors"
          >
            ← Back to baseFM
          </Link>
        </div>
      </div>
    </div>
  );
}
