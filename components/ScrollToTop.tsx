'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed z-40 p-3 bg-[#171717] hover:bg-[#252525] text-white rounded-full shadow-lg border border-[#333] transition-all duration-200 animate-fade-in ios-press"
      style={{
        bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
        right: 'max(16px, env(safe-area-inset-right, 0px))'
      }}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
