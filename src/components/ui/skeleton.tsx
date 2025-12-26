/**
 * Skeleton Component - Standardized Loading State
 *
 * Design OS uses a consistent loading pattern across all dynamic content:
 *
 * ## Loading State Pattern
 *
 * 1. **React.Suspense**: Used for lazy-loaded components (screen designs, shell preview)
 *    - Wraps lazy components with `<Suspense fallback={<LoadingSkeleton />}>`
 *    - Provides automatic loading state while component loads
 *
 * 2. **Skeleton Components**: Used for content that loads asynchronously
 *    - Use `<Skeleton className="h-4 w-[200px]" />` for text placeholders
 *    - Match skeleton dimensions to expected content
 *
 * 3. **Loading Spinners**: Used for actions (save, export, etc.)
 *    - Use `<Loader2 className="animate-spin" />` from lucide-react
 *
 * ## Where Loading States Are Used
 * - ScreenDesignPage: Suspense for lazy-loaded screen design components
 * - ShellDesignPage: Suspense for shell preview component
 * - ProductPage: Skeleton for product overview loading
 * - SectionPage: Skeleton for section data loading
 *
 * ## Consistency Guidelines
 * - Always use Skeleton for content placeholders (not spinners)
 * - Match skeleton shapes to actual content (text = narrow, card = wider)
 * - Use `animate-pulse` for skeleton animation (built into component)
 */
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
