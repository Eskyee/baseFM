export default function EventsLoading() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="h-8 w-24 bg-[#1A1A1A] rounded-lg animate-pulse mb-6" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#1A1A1A] rounded-2xl overflow-hidden">
              <div className="aspect-video bg-[#252525] animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-[#252525] rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-[#252525] rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-[#252525] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
