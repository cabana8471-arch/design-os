/**
 * LogoArea - Customizable logo/branding component for shell
 *
 * Displays the product logo with optional brand name.
 * Supports collapsed state for sidebar-with-toggle patterns.
 *
 * Usage:
 * <LogoArea
 *   logo="/logo.svg"
 *   logoCollapsed="/logo-icon.svg"
 *   brandName="Product Name"
 *   isCollapsed={isSidebarCollapsed}
 * />
 */

import { cn } from '@/lib/utils'

interface LogoAreaProps {
  /** Path to the full logo image */
  logo?: string
  /** Path to the collapsed/icon logo (fallback to logo) */
  logoCollapsed?: string
  /** Brand name text to display */
  brandName?: string
  /** Whether to show the brand name (default: true) */
  showBrandName?: boolean
  /** Whether sidebar is collapsed (affects logo + text visibility) */
  isCollapsed?: boolean
  /** Logo height class (default: "h-8") */
  logoHeight?: string
  /** Click handler for logo area */
  onClick?: () => void
  /** Additional class names */
  className?: string
}

export function LogoArea({
  logo,
  logoCollapsed,
  brandName = 'Product Name',
  showBrandName = true,
  isCollapsed = false,
  logoHeight = 'h-8',
  onClick,
  className,
}: LogoAreaProps) {
  const currentLogo = isCollapsed ? (logoCollapsed || logo) : logo
  const shouldShowName = showBrandName && !isCollapsed && brandName

  const content = (
    <>
      {currentLogo && (
        <img
          src={currentLogo}
          alt={brandName || 'Logo'}
          className={cn(logoHeight, 'w-auto')}
        />
      )}
      {!currentLogo && (
        <div
          className={cn(
            'flex items-center justify-center rounded-lg bg-lime-500 text-white font-bold',
            isCollapsed ? 'h-8 w-8 text-sm' : 'h-8 w-8 text-sm'
          )}
        >
          {brandName?.charAt(0) || 'P'}
        </div>
      )}
      {shouldShowName && (
        <span className="font-semibold text-stone-900 dark:text-white truncate">
          {brandName}
        </span>
      )}
    </>
  )

  const containerClass = cn(
    'flex items-center gap-2 px-4 py-3 transition-all duration-200',
    isCollapsed && 'justify-center px-2',
    onClick && 'cursor-pointer hover:opacity-80',
    className
  )

  if (onClick) {
    return (
      <button onClick={onClick} className={containerClass}>
        {content}
      </button>
    )
  }

  return <div className={containerClass}>{content}</div>
}
