/**
 * ShellSkeleton - Loading states for shell and secondary components
 *
 * Provides skeleton loaders that match the shell's structure:
 * - ShellSkeleton: Full shell layout with sidebar and content
 * - SidebarSkeleton: Just the sidebar portion
 * - ContentSkeleton: Just the content area
 * - NotificationsDrawerSkeleton: For notifications loading state
 * - ListItemSkeleton: Reusable list item skeleton
 *
 * Usage:
 * <Suspense fallback={<ShellSkeleton />}>
 *   <AppShell>...</AppShell>
 * </Suspense>
 */

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ShellSkeletonProps {
  /** Whether to show the sidebar (default: true) */
  showSidebar?: boolean
  /** Sidebar width class (default: "w-64") */
  sidebarWidth?: string
  /** Additional class names */
  className?: string
}

export function ShellSkeleton({
  showSidebar = true,
  sidebarWidth = 'w-64',
  className,
}: ShellSkeletonProps) {
  return (
    <div className={cn('flex h-screen bg-stone-50 dark:bg-stone-950', className)}>
      {showSidebar && <SidebarSkeleton className={sidebarWidth} />}
      <div className="flex-1 flex flex-col">
        <HeaderSkeleton />
        <ContentSkeleton />
      </div>
    </div>
  )
}

interface SidebarSkeletonProps {
  className?: string
}

export function SidebarSkeleton({ className }: SidebarSkeletonProps) {
  return (
    <div className={cn('border-r border-stone-200 dark:border-stone-800 p-4 space-y-6', className)}>
      {/* Logo area */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Nav items */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" style={{ width: `${60 + (i * 10) % 30}%` }} />
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User area */}
      <div className="flex items-center gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      </div>
    </div>
  )
}

function HeaderSkeleton() {
  return (
    <div className="h-14 border-b border-stone-200 dark:border-stone-800 px-6 flex items-center justify-between">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header actions */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}

interface ContentSkeletonProps {
  className?: string
}

export function ContentSkeleton({ className }: ContentSkeletonProps) {
  return (
    <div className={cn('flex-1 p-6 space-y-6', className)}>
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-3"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>

      {/* Content lines */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

interface NotificationsDrawerSkeletonProps {
  /** Number of notification items to show (default: 5) */
  count?: number
  className?: string
}

export function NotificationsDrawerSkeleton({
  count = 5,
  className,
}: NotificationsDrawerSkeletonProps) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Notification items */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface ListItemSkeletonProps {
  /** Show avatar/icon on the left (default: true) */
  showAvatar?: boolean
  /** Show action on the right (default: false) */
  showAction?: boolean
  /** Number of text lines (default: 2) */
  lines?: number
  className?: string
}

export function ListItemSkeleton({
  showAvatar = true,
  showAction = false,
  lines = 2,
  className,
}: ListItemSkeletonProps) {
  return (
    <div className={cn('flex items-start gap-3 p-2', className)}>
      {showAvatar && <Skeleton className="h-10 w-10 rounded-full shrink-0" />}
      <div className="flex-1 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-3', i === 0 ? 'w-3/4' : 'w-full')}
          />
        ))}
      </div>
      {showAction && <Skeleton className="h-8 w-8 rounded-md shrink-0" />}
    </div>
  )
}
