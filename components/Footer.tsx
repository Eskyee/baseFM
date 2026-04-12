'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BaseAd } from './BaseAd';

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 mt-auto bg-black font-mono">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* Logo & Tagline */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="baseFM"
                width={24}
                height={24}
                className="border border-zinc-900"
              />
              <span className="text-white text-sm font-bold uppercase tracking-wider">
                baseFM
              </span>
            </div>
            <p className="max-w-sm text-xs uppercase tracking-widest text-zinc-600">
              Open-source radio protocol on Base. Agentbot powers live station control.
            </p>
          </div>

          {/* Links */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-px lg:bg-zinc-900">
            <Link
              href="https://agentbot.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 text-[10px] uppercase tracking-widest hover:text-white transition-colors lg:bg-black lg:p-4"
            >
              Agentbot
            </Link>
            <Link
              href="/guide"
              className="text-zinc-500 text-[10px] uppercase tracking-widest hover:text-white transition-colors lg:bg-black lg:p-4"
            >
              Guide
            </Link>
            <Link
              href="https://talent.app/raveculture.base.eth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 text-[10px] uppercase tracking-widest hover:text-white transition-colors lg:bg-black lg:p-4"
            >
              RaveCulture
            </Link>
            <Link
              href="https://base.meme/coin/base:0x1DBf2954FFEC96a333ae20F00c0bC40471ad8888"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 text-[10px] uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 lg:bg-black lg:p-4"
            >
              <span>Support</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </Link>
            <Link
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 text-[10px] uppercase tracking-widest hover:text-white transition-colors lg:bg-black lg:p-4"
            >
              Built on Base
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-zinc-900 text-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            Created by RaveCulture for baseFM · powered by Agentbot · MIT License · 2026
          </p>
        </div>

        {/* Base Sponsor Logo */}
        <div className="mt-6">
          <BaseAd />
        </div>
      </div>
    </footer>
  );
}
