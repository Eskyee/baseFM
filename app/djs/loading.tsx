import { DJCardSkeleton } from '@/components/ui/Skeleton';

export default function DJsLoading() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="h-8 w-16 bg-[#1A1A1A] rounded-lg animate-pulse mb-6" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <DJCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
