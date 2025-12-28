/**
 * Shell Components
 *
 * Utility components for building application shells:
 * - SkipLink: Accessibility skip-to-content link
 * - ShellErrorBoundary: Error boundary for shell secondary components
 * - LogoArea: Customizable logo/branding area
 * - ThemeToggle: Light/dark/system theme switcher
 * - ShellSkeleton: Loading skeletons for shell
 * - ShellFooter: Optional footer with version/links
 */

// HIGH PRIORITY - Accessibility
export { SkipLink } from './SkipLink'
export { ShellErrorBoundary } from './ShellErrorBoundary'

// MEDIUM PRIORITY - UI Components
export { LogoArea } from './LogoArea'
export { ThemeToggle } from './ThemeToggle'
export {
  ShellSkeleton,
  SidebarSkeleton,
  ContentSkeleton,
  NotificationsDrawerSkeleton,
  ListItemSkeleton,
} from './ShellSkeleton'

// LOW PRIORITY - Optional
export { ShellFooter } from './ShellFooter'
