import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Image
          src="/logo.png"
          alt="baseFM"
          width={80}
          height={80}
          className="mx-auto mb-6 opacity-50"
        />

        <h1 className="text-6xl font-bold text-[#333] mb-4">404</h1>
        <h2 className="text-xl font-semibold text-[#F5F5F5] mb-3">Page not found</h2>
        <p className="text-[#888] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go home
          </Link>
          <Link
            href="/schedule"
            className="px-6 py-3 bg-[#1A1A1A] text-[#F5F5F5] rounded-lg hover:bg-[#222] transition-colors font-medium"
          >
            View schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
