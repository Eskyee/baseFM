'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  className?: string;
}

export function Breadcrumb({ items, showBackButton = true, className = '' }: BreadcrumbProps) {
  const router = useRouter();

  const handleBack = () => {
    // Use router.back() for proper history navigation
    router.back();
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      {/* Back button */}
      {showBackButton && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#171717] transition-all duration-150 -ml-2"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
      )}

      {/* Breadcrumb trail */}
      <div className="hidden sm:flex items-center gap-1.5 text-[#737373]">
        <Link
          href="/"
          className="hover:text-white transition-colors p-1"
          aria-label="Home"
        >
          <Home className="w-3.5 h-3.5" />
        </Link>

        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-[#525252]" />
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[#A3A3A3] truncate max-w-[200px]">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Mobile: Show current page only */}
      <div className="sm:hidden flex items-center gap-1.5 text-[#737373] ml-1">
        {items.length > 1 && (
          <>
            <span className="text-[#525252]">/</span>
            <span className="text-[#A3A3A3] truncate max-w-[150px]">
              {items[items.length - 1].label}
            </span>
          </>
        )}
      </div>
    </nav>
  );
}

// Pre-configured breadcrumb helpers for common pages
export function EventBreadcrumb({ eventName }: { eventName: string }) {
  return (
    <Breadcrumb
      items={[
        { label: 'Events', href: '/events' },
        { label: eventName }
      ]}
    />
  );
}

export function DJBreadcrumb({ djName }: { djName: string }) {
  return (
    <Breadcrumb
      items={[
        { label: 'DJs', href: '/djs' },
        { label: djName }
      ]}
    />
  );
}

export function StreamBreadcrumb({ streamTitle }: { streamTitle: string }) {
  return (
    <Breadcrumb
      items={[
        { label: 'Live', href: '/live' },
        { label: streamTitle }
      ]}
    />
  );
}

export function ArchiveBreadcrumb({ showName }: { showName: string }) {
  return (
    <Breadcrumb
      items={[
        { label: 'Archive', href: '/archive' },
        { label: showName }
      ]}
    />
  );
}

export function GuideBreadcrumb({ sectionName }: { sectionName?: string }) {
  const items: BreadcrumbItem[] = [{ label: 'Guide', href: '/guide' }];
  if (sectionName) {
    items.push({ label: sectionName });
  }
  return <Breadcrumb items={items} />;
}
