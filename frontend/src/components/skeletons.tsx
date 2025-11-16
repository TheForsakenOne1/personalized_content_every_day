export function ContentCardSkeleton() {
  return (
    <article className="group relative animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="relative aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
        <div className="absolute top-3 right-3 w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-2">
        {/* Category & Source */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-1 w-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-1 w-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    </article>
  );
}

export function TrendingCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse">
      {/* Ranking Badge Skeleton */}
      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div>

      {/* Content Skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div className="h-1 w-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function TopicCardSkeleton() {
  return (
    <div className="relative p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gray-200 dark:bg-gray-800 w-14 h-14"></div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
