'use client';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm text-red-300 truncate">{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium rounded-lg transition-colors active:scale-[0.97]"
          >
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">{title}</h3>
      <p className="text-sm text-[#888] mb-6 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#252525] text-[#F5F5F5] text-sm font-medium rounded-full transition-colors active:scale-[0.97]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
