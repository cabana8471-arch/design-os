/**
 * Progress bar component for showing operation progress
 */

import { cn } from '@/lib/utils'

interface ProgressProps {
  /** Current progress value (0-100) */
  value: number
  /** Maximum value (default: 100) */
  max?: number
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show percentage label */
  showLabel?: boolean
  /** Additional class names */
  className?: string
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Progress: ${Math.round(percentage)}%`}
      >
        <div
          className={cn(
            'h-full bg-lime-500 dark:bg-lime-400 transition-all duration-300 ease-out',
            percentage === 100 && 'bg-green-500 dark:bg-green-400'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Indeterminate progress bar for unknown duration operations
 */
export function IndeterminateProgress({
  size = 'md',
  className,
}: Pick<ProgressProps, 'size' | 'className'>) {
  return (
    <div
      className={cn(
        'w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden',
        sizeClasses[size],
        className
      )}
      role="progressbar"
      aria-label="Loading"
    >
      <div
        className={cn(
          'h-full bg-lime-500 dark:bg-lime-400',
          'animate-[indeterminate_1.5s_ease-in-out_infinite]'
        )}
        style={{ width: '30%' }}
      />
      <style>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  )
}
