export default function CommunityLoading() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="h-8 w-32 bg-[#1A1A1A] rounded-lg animate-pulse mb-6" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#1A1A1A] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#252525] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-[#252525] rounded animate-pulse" />
                  <div className="h-3 w-32 bg-[#252525] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
