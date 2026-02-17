'use client';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#333] border-t-[#0052FF] animate-spin" />
          <img
            src="/logo.png"
            alt="baseFM"
            className="absolute inset-1 w-10 h-10 rounded-full"
          />
        </div>
        <div className="h-1 w-24 bg-[#1A1A1A] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#0052FF] to-purple-500 animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}
