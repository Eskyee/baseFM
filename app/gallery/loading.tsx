export default function GalleryLoading() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="h-8 w-24 bg-[#1A1A1A] rounded-lg animate-pulse mb-6" />
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="mb-4 break-inside-avoid bg-[#1A1A1A] rounded-xl animate-pulse"
              style={{ height: `${200 + (i % 3) * 100}px`, animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
