/**
 * LoadingState - Full-page or container loading placeholder
 */

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  /** Loading message to display */
  message?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Fill container height */
  fullHeight?: boolean
  /** Additional class names */
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  fullHeight = true,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullHeight && 'min-h-[400px]',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Loader2
        className={cn(
          'animate-spin text-stone-400 dark:text-stone-500',
          sizeClasses[size]
        )}
      />
      <p
        className={cn(
          'text-stone-500 dark:text-stone-400',
          textSizeClasses[size]
        )}
      >
        {message}
      </p>
    </div>
  )
}

/**
 * PageLoadingState - Full-page loading placeholder
 * Use this for route-level loading states
 */
export function PageLoadingState({ message = 'Loading page...' }: { message?: string }) {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <LoadingState message={message} size="lg" fullHeight={false} />
    </div>
  )
}
