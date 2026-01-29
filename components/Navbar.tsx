'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { WalletConnect } from './WalletConnect';

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/djs', label: 'DJs' },
  ];

  // Only show Dashboard link if wallet is connected (DJ access)
  const djLinks = isConnected ? [{ href: '/dashboard', label: 'Dashboard' }] : [];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="baseFM"
              width={32}
              height={32}
              className="rounded-lg transition-transform group-hover:scale-105"
            />
            <span className="text-[#F5F5F5] font-bold text-lg hidden sm:block">
              baseFM
            </span>
          </Link>

          {/* Navigation Links - Center */}
          <nav className="hidden sm:flex items-center gap-1">
            {[...navLinks, ...djLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-[#F5F5F5] bg-[#1A1A1A]'
                    : 'text-[#888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Wallet Connect */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-[#F5F5F5] bg-[#1A1A1A]'
                      : 'text-[#888]'
                  }`}
                >
                  {link.label === 'Home' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
                    </svg>
                  )}
                </Link>
              ))}
            </div>
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
}
