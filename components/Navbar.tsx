'use client';

import { useState, useRef, useEffect } from 'react';
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
  UsersRound,
  MessageCircle,
  Briefcase,
  Disc3,
  Wallet,
  Mail,
  LayoutGrid,
  BookOpen,
  Ticket,
  Cast,
  Rss,
  QrCode,
  Megaphone,
  ChevronDown,
  Sparkles,
  Music,
  Store,
  Zap,
  TrendingUp
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Organized menu structure
  const menuGroups = [
    {
      id: 'discover',
      label: 'Discover',
      Icon: Sparkles,
      featured: false,
      links: [
        { href: '/schedule', label: 'Schedule', Icon: Calendar },
        { href: '/events', label: 'Events', Icon: Ticket },
        { href: '/djs', label: 'DJs', Icon: Disc3 },
        { href: '/gallery', label: 'Gallery', Icon: Image },
        { href: '/archive', label: 'Archive', Icon: Archive },
      ]
    },
    {
      id: 'community',
      label: 'Community',
      Icon: Users,
      featured: false,
      links: [
        { href: '/community', label: 'Community', Icon: Users },
        { href: '/collectives', label: 'Collectives', Icon: UsersRound },
        { href: '/threads', label: 'Threads', Icon: MessageCircle },
        { href: '/farcaster', label: 'Farcaster', Icon: Cast },
      ]
    },
    {
      id: 'create',
      label: 'Create',
      Icon: Zap,
      featured: true,
      links: [
        { href: '/aicloud', label: 'AI Cloud', Icon: Cloud },
        { href: '/aicloud/feed', label: 'Ravefeed', Icon: Rss },
        { href: '/aicloud/trading', label: 'Trading', Icon: TrendingUp },
        { href: '/tools', label: 'Tools', Icon: Wrench },
      ]
    },
    {
      id: 'business',
      label: 'Business',
      Icon: Store,
      featured: false,
      links: [
        { href: '/agency', label: 'Agency', Icon: Briefcase },
        { href: 'https://shop.basefm.space', label: 'Shop', Icon: ShoppingBag, external: true },
      ]
    },
  ];

  // Connected user menu
  const connectedGroup = isConnected ? {
    id: 'account',
    label: 'Account',
    Icon: LayoutGrid,
    featured: false,
    links: [
      { href: '/dashboard', label: 'Dashboard', Icon: LayoutGrid },
      { href: '/wallet', label: 'Wallet', Icon: Wallet },
      { href: '/messages', label: 'Messages', Icon: Mail },
      { href: '/promoter', label: 'Promoter', Icon: Megaphone },
      { href: '/pos', label: 'POS', Icon: QrCode },
    ]
  } : null;

  const allGroups = connectedGroup ? [...menuGroups, connectedGroup] : menuGroups;

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-40 bg-black"
        style={{ height: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
        aria-hidden="true"
      />
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-black border-b"
        style={{ 
          paddingTop: 'env(safe-area-inset-top, 0px)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
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

            {/* Desktop Navigation - Dropdown Menus */}
            <nav className="hidden md:flex items-center gap-1" ref={dropdownRef}>
              {/* Home */}
              <Link
                href="/"
                className={`p-2 rounded-lg transition-all duration-150 ${
                  pathname === '/' 
                    ? 'text-white bg-[#171717]' 
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
                }`}
              >
                <Home className="w-5 h-5" />
              </Link>

              {/* Dropdown Groups */}
              {allGroups.map((group) => {
                const isOpen = openDropdown === group.id;
                const isActive = group.links.some(link => pathname === link.href);
                const isFeatured = group.featured;

                return (
                  <div key={group.id} className="relative">
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-150 ${
                        isActive || isOpen
                          ? 'text-white bg-[#171717]'
                          : isFeatured
                          ? 'text-[#0070F3] hover:text-[#0761D1] hover:bg-[rgba(0,112,243,0.1)]'
                          : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
                      }`}
                    >
                      <group.Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{group.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-48 bg-black rounded-lg py-1 animate-slide-down"
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                        }}
                      >                        {group.links.map((link) => {
                          const Icon = link.Icon;
                          const isLinkActive = pathname === link.href;
                          const isExternal = 'external' in link && link.external;

                          const linkClasses = `flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150 ${
                            isLinkActive
                              ? 'text-white bg-[#171717]'
                              : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
                          }`;

                          return isExternal ? (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={linkClasses}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <Icon className="w-4 h-4" />
                              {link.label}
                            </a>
                          ) : (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={linkClasses}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <Icon className="w-4 h-4" />
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Guide */}
              <Link
                href="/guide"
                className={`p-2 rounded-lg transition-all duration-150 ${
                  pathname === '/guide' 
                    ? 'text-white bg-[#171717]' 
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </Link>
            </nav>

            {/* Right: Wallet + Mobile Menu */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <WalletConnect />

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 sm:p-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#171717] transition-all duration-150 flex-shrink-0"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav
            className="fixed z-50 bg-black overflow-y-auto md:hidden animate-slide-in-right"
            style={{
              top: 'var(--navbar-height)',
              height: 'calc(100dvh - var(--navbar-height))',
              right: 'env(safe-area-inset-right, 0px)',
              width: 'min(16rem, 70vw)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="p-3 space-y-4">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  pathname === '/' 
                    ? 'text-white bg-[#171717]' 
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
                }`}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>

              {/* Mobile Groups */}
              {allGroups.map((group) => (
                <div key={group.id} className="space-y-1">
                  <div className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                    group.featured ? 'text-[#0070F3]' : 'text-[#737373]'
                  }`}>
                    <group.Icon className="w-3.5 h-3.5" />
                    {group.label}
                  </div>
                  {group.links.map((link) => {
                    const Icon = link.Icon;
                    const isActive = pathname === link.href;
                    const isExternal = 'external' in link && link.external;

                    const linkClasses = `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                      isActive 
                        ? 'text-white bg-[#171717]' 
                        : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
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
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={linkClasses}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ))}

              {/* Guide */}
              <Link
                href="/guide"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  pathname === '/guide' 
                    ? 'text-white bg-[#171717]' 
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Guide
              </Link>
            </div>

            {/* Mobile Footer */}
            <div 
              className="absolute bottom-0 left-0 right-0 p-3 bg-black"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center justify-center gap-3 text-xs text-[#737373]">
                <a href="https://talent.app/raveculture.base.eth" target="_blank" rel="noopener noreferrer" className="hover:text-[#A3A3A3] transition-colors">
                  RaveCulture
                </a>
                <span>·</span>
                <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#A3A3A3] transition-colors">
                  Base
                </a>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
