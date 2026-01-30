'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BaseAd } from './BaseAd';

export function Footer() {
  return (
    <footer className="border-t border-[#1A1A1A] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="baseFM"
              width={24}
              height={24}
              className="rounded"
            />
            <span className="text-[#888] text-sm">
              Onchain Radio on Base
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              href="https://base.app/profile/raveculture"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#888] text-sm hover:text-[#F5F5F5] transition-colors"
            >
              RaveCulture
            </Link>
            <Link
              href="https://base.meme/coin/base:0x1DBf2954FFEC96a333ae20F00c0bC40471ad8888"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#888] text-sm hover:text-purple-400 transition-colors flex items-center gap-1"
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
              className="text-[#888] text-sm hover:text-blue-400 transition-colors"
            >
              Built on Base
            </Link>
          </div>
        </div>

        {/* DIY tagline */}
        <div className="mt-6 pt-6 border-t border-[#1A1A1A] text-center">
          <p className="text-xs text-[#666]">
            Do it yourself with community backing · Created by RaveCulture for Base Builders
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
