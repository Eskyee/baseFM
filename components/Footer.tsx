'use client';

import Link from 'next/link';
import Image from 'next/image';

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
          <div className="flex items-center gap-6">
            <Link
              href="https://talent.app/raveculture.base.eth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#888] text-sm hover:text-[#F5F5F5] transition-colors"
            >
              RaveCulture
            </Link>
            <Link
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#888] text-sm hover:text-[#F5F5F5] transition-colors"
            >
              Built on Base
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
