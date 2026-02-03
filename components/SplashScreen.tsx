'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Minimum display time for splash (800ms) + fade animation
    const minDisplayTime = setTimeout(() => {
      setFadeOut(true);
      // After fade animation completes, hide splash
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, 800);

    return () => clearTimeout(minDisplayTime);
  }, []);

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Splash Screen */}
      <div
        className={`fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col items-center justify-center transition-opacity duration-300 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Logo with pulse animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <Image
            src="/logo.png"
            alt="baseFM"
            width={120}
            height={120}
            className="relative z-10 rounded-2xl animate-[pulse_2s_ease-in-out_infinite]"
            priority
          />
        </div>

        {/* Brand name */}
        <h1 className="mt-6 text-2xl font-bold text-[#F5F5F5] tracking-tight">
          baseFM
        </h1>
        <p className="mt-2 text-sm text-[#888]">
          Onchain Radio
        </p>

        {/* Loading indicator */}
        <div className="mt-8 flex gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Powered by */}
        <div className="absolute bottom-8 flex items-center gap-2 text-xs text-[#666]">
          <span>Powered by</span>
          <svg className="w-4 h-4" viewBox="0 0 111 111" fill="none">
            <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" fill="#0052FF"/>
          </svg>
          <span>Base</span>
        </div>
      </div>

      {/* Preload content behind splash */}
      <div className="opacity-0 pointer-events-none">
        {children}
      </div>
    </>
  );
}
