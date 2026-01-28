'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { WalletConnect } from './WalletConnect';

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Discover' },
    { href: '/dj', label: 'DJ Dashboard' },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="baseFM"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-white font-bold text-xl">baseFM</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connect */}
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
