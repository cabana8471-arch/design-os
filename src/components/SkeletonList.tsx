/**
 * SkeletonList - Loading placeholder for list items
 */

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SkeletonListProps {
  /** Number of items to show */
  count?: number
  /** Show icon placeholder */
  showIcon?: boolean
  /** Show badge placeholder */
  showBadge?: boolean
  /** Additional class names */
  className?: string
}

export function SkeletonList({
  count = 3,
  showIcon = true,
  showBadge = false,
  className,
}: SkeletonListProps) {
  return (
    <div
      className={cn('space-y-3', className)}
      role="status"
      aria-label="Loading list"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-800"
        >
          {showIcon && <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showBadge && <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />}
        </div>
      ))}
    </div>
  )
}
