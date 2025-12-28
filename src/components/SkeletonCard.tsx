/**
 * SkeletonCard - Loading placeholder for card components
 */

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  /** Number of text lines to show */
  lines?: number
  /** Show header skeleton */
  showHeader?: boolean
  /** Show action button skeleton */
  showAction?: boolean
  /** Additional class names */
  className?: string
}

export function SkeletonCard({
  lines = 3,
  showHeader = true,
  showAction = false,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6',
        className
      )}
      role="status"
      aria-label="Loading content"
    >
      {showHeader && (
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')}
          />
        ))}
      </div>

      {showAction && (
        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
          <Skeleton className="h-9 w-24" />
        </div>
      )}
    </div>
  )
}
