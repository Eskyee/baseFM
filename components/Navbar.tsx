'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { WalletConnect } from './WalletConnect';
import {
  Home,
  Calendar,
  Cloud,
  Wrench,
  Image,
  Archive,
  ShoppingBag,
  Users,
  MessageCircle,
  Briefcase,
  Disc3,
  Wallet,
  Mail,
  LayoutGrid,
  BookOpen,
  Ticket,
  Cast,
  QrCode,
  Megaphone
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Nav links organized by category for better UX
  // Order: Core > Content > Social > Featured > Commerce > Help
  const navLinks = [
    // Core navigation - what users need most
    { href: '/', label: 'Home', Icon: Home },
    { href: '/schedule', label: 'Schedule', Icon: Calendar },
    { href: '/events', label: 'Events', Icon: Ticket },
    { href: '/djs', label: 'DJs', Icon: Disc3 },
    // Content - media & archives
    { href: '/gallery', label: 'Gallery', Icon: Image },
    { href: '/archive', label: 'Archive', Icon: Archive },
    // Social - community & connections
    { href: '/community', label: 'Community', Icon: Users },
    { href: '/collectives', label: 'Collectives', Icon: Users },
    { href: '/farcaster', label: 'Farcaster', Icon: Cast },
    { href: '/threads', label: 'Threads', Icon: MessageCircle, featured: true },
    // Featured tools
    { href: '/aicloud', label: 'AI Cloud', Icon: Cloud, featured: true },
    { href: '/aicloud/feed', label: 'Ravefeed', Icon: Cast, featured: true },
    { href: '/tools', label: 'Tools', Icon: Wrench },
    // Business & commerce
    { href: '/agency', label: 'Agency', Icon: Briefcase },
    { href: 'https://shop.basefm.space', label: 'Shop', Icon: ShoppingBag, external: true },
    // Help
    { href: '/guide', label: 'Guide', Icon: BookOpen },
  ];

  // Only show these links if wallet is connected
  const connectedLinks = isConnected
    ? [
        { href: '/wallet', label: 'Wallet', Icon: Wallet },
        { href: '/pos', label: 'POS', Icon: QrCode },
        { href: '/promoter', label: 'Promoter', Icon: Megaphone },
        { href: '/messages', label: 'Messages', Icon: Mail },
        { href: '/dashboard', label: 'Dashboard', Icon: LayoutGrid },
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

            {/* Navigation Links - Desktop (icons only) */}
            <nav className="hidden md:flex items-center gap-0.5">
              {allLinks.map((link) => {
                const Icon = link.Icon;
                const isActive = pathname === link.href;
                const isFeatured = 'featured' in link && link.featured;
                const isExternal = 'external' in link && link.external;

                const iconClasses = `p-2 rounded-lg transition-colors relative group ${
                  isActive
                    ? 'text-[#F5F5F5] bg-[#1A1A1A]'
                    : isFeatured
                    ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                    : 'text-[#888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]/50'
                }`;

                const tooltip = (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1A1A1A] text-[#F5F5F5] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-[#333]">
                    {link.label}
                  </span>
                );

                return isExternal ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={iconClasses}
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5" />
                    {tooltip}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={iconClasses}
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5" />
                    {tooltip}
                  </Link>
                );
              })}
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
          {allLinks.map((link) => {
            const Icon = link.Icon;
            const isActive = pathname === link.href;
            const isFeatured = 'featured' in link && link.featured;
            const isExternal = 'external' in link && link.external;

            const linkClasses = `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors active:scale-[0.98] ${
              isActive
                ? 'text-[#F5F5F5] bg-[#1A1A1A]'
                : isFeatured
                ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                : 'text-[#888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]/50'
            }`;

            return isExternal ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className={linkClasses}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={linkClasses}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
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
