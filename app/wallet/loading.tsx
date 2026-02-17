export default function WalletLoading() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {/* Balance Card Skeleton */}
        <div className="bg-[#1A1A1A] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#252525] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-[#252525] rounded animate-pulse" />
              <div className="h-3 w-32 bg-[#252525] rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#252525] animate-pulse" />
                <div className="space-y-1">
                  <div className="h-4 w-12 bg-[#252525] rounded animate-pulse" />
                  <div className="h-3 w-16 bg-[#252525] rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-16 bg-[#252525] rounded animate-pulse" />
            </div>
            <div className="border-t border-[#252525]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#252525] animate-pulse" />
                <div className="space-y-1">
                  <div className="h-4 w-12 bg-[#252525] rounded animate-pulse" />
                  <div className="h-3 w-16 bg-[#252525] rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-16 bg-[#252525] rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Action Cards Skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#1A1A1A] rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#252525] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-[#252525] rounded animate-pulse" />
                <div className="h-3 w-32 bg-[#252525] rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
