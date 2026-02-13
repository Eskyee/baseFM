'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { WalletConnect } from './WalletConnect';

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
    { href: '/schedule', label: 'Schedule', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z' },
    { href: '/gallery', label: 'Gallery', icon: 'M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z' },
    { href: '/archive', label: 'Archive', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z' },
    { href: 'https://shop.basefm.space', label: 'Shop', icon: 'M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z', external: true },
    { href: '/agency', label: 'Agency', icon: 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z' },
    { href: '/community', label: 'Community', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
    { href: '/djs', label: 'DJs', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
  ];

  // Only show these links if wallet is connected
  const connectedLinks = isConnected
    ? [
        { href: '/wallet', label: 'Wallet', icon: 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' },
        { href: '/messages', label: 'Messages', icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z' },
        { href: '/dashboard', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
      ]
    : [];

  const allLinks = [...navLinks, ...connectedLinks];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-[#1A1A1A] safe-area-top overflow-hidden">
        <div
          className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8"
          style={{
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
          }}
        >
          <div className="flex items-center justify-between h-14 landscape:h-11 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <img
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

            {/* Navigation Links - Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {allLinks.map((link) =>
                'external' in link && link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-[#888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]/50"
                  >
                    {link.label}
                  </a>
                ) : (
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
                )
              )}
            </nav>

            {/* Right: Wallet + Mobile Menu */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <WalletConnect />

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 sm:p-2 rounded-lg text-[#888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors flex-shrink-0"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <nav
        className={`fixed z-50 bg-[#0A0A0A]/95 backdrop-blur-lg border-l border-[#1A1A1A] overflow-y-auto transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          top: 'var(--navbar-height)',
          height: 'calc(100dvh - var(--navbar-height))',
          right: 'env(safe-area-inset-right, 0px)',
          width: 'min(14rem, 60vw)',
          maxWidth: 'calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px) - 60px)',
        }}
      >
        <div className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100% - 50px)' }}>
          {allLinks.map((link) =>
            'external' in link && link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-[#888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]/50 active:scale-[0.98]"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d={link.icon} />
                </svg>
                <span className="truncate">{link.label}</span>
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors active:scale-[0.98] ${
                  pathname === link.href
                    ? 'text-[#F5F5F5] bg-[#1A1A1A]'
                    : 'text-[#888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]/50'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d={link.icon} />
                </svg>
                <span className="truncate">{link.label}</span>
              </Link>
            )
          )}
        </div>

        {/* Mobile Footer Links */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#1A1A1A] bg-[#0A0A0A]">
          <div className="flex items-center justify-center gap-3 text-xs text-[#666]">
            <a
              href="https://talent.app/raveculture.base.eth"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#888]"
            >
              RaveCulture
            </a>
            <span>·</span>
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#888]"
            >
              Base
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
