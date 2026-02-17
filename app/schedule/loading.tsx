import { ScheduleSkeleton } from '@/components/ui/Skeleton';

export default function ScheduleLoading() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="h-8 w-32 bg-[#1A1A1A] rounded-lg animate-pulse mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ScheduleSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
