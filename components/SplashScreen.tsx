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
        className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-300 font-mono ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="basefm-kicker text-blue-500 mb-8">baseFM by Agentbot</div>

        <div className="border border-zinc-800 p-4 animate-fade-in">
          <Image
            src="/logo.png"
            alt="baseFM"
            width={96}
            height={96}
            className="border border-zinc-900"
            priority
          />
        </div>

        <h1 className="mt-8 text-3xl font-bold text-white tracking-tighter uppercase">
          baseFM
        </h1>
        <p className="mt-3 text-[10px] uppercase tracking-widest text-zinc-500">
          Onchain radio on Base
        </p>

        <div className="mt-8 flex gap-2">
          <div className="h-2 w-2 bg-zinc-600 animate-pulse" />
          <div className="h-2 w-2 bg-zinc-500 animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-blue-500 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>

        <div className="absolute bottom-8 flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600">
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
