export default function DJsLoading() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 bg-[#1A1A1A] rounded w-24 mb-2" />
            <div className="h-4 bg-[#1A1A1A] rounded w-48" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-[#1A1A1A] rounded-xl w-16" />
            <div className="h-10 bg-[#1A1A1A] rounded-xl w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-[#1A1A1A] rounded-xl mb-3" />
              <div className="h-5 bg-[#1A1A1A] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[#1A1A1A] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
