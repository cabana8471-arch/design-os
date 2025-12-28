/**
 * ShellFooter - Optional footer component for the shell
 *
 * Displays version, links, and copyright information at the bottom of the shell.
 * Can be placed in the sidebar footer or main content footer.
 *
 * Usage:
 * <ShellFooter
 *   version="1.0.0"
 *   copyright="2024 Company Name"
 *   links={[
 *     { label: "Privacy", href: "/privacy" },
 *     { label: "Terms", href: "/terms" },
 *   ]}
 * />
 */

import { cn } from '@/lib/utils'

interface FooterLink {
  /** Link label */
  label: string
  /** Link URL */
  href: string
  /** Open in new tab (default: false) */
  external?: boolean
}

interface ShellFooterProps {
  /** Application version (e.g., "1.0.0" or "v1.0.0") */
  version?: string
  /** Footer links */
  links?: FooterLink[]
  /** Copyright text (e.g., "2024 Company Name") */
  copyright?: string
  /** Layout variant */
  variant?: 'sidebar' | 'inline' | 'centered'
  /** Additional class names */
  className?: string
}

export function ShellFooter({
  version,
  links,
  copyright,
  variant = 'sidebar',
  className,
}: ShellFooterProps) {
  const currentYear = new Date().getFullYear()
  const copyrightText = copyright || `${currentYear} Your Company`

  if (variant === 'centered') {
    return (
      <footer
        className={cn(
          'border-t border-stone-200 dark:border-stone-800 px-4 py-3 text-center',
          className
        )}
      >
        <div className="text-xs text-stone-500 dark:text-stone-400 space-y-1">
          {links && links.length > 0 && (
            <nav className="flex items-center justify-center gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
          <div className="flex items-center justify-center gap-2">
            {version && <span>v{version.replace(/^v/, '')}</span>}
            {version && <span aria-hidden="true">·</span>}
            <span>© {copyrightText}</span>
          </div>
        </div>
      </footer>
    )
  }

  if (variant === 'inline') {
    return (
      <footer
        className={cn(
          'border-t border-stone-200 dark:border-stone-800 px-4 py-2 text-xs text-stone-500 dark:text-stone-400',
          className
        )}
      >
        <div className="flex items-center justify-between">
          {links && links.length > 0 && (
            <nav className="flex items-center gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-2">
            {version && <span>v{version.replace(/^v/, '')}</span>}
            <span>© {copyrightText}</span>
          </div>
        </div>
      </footer>
    )
  }

  // Sidebar variant (default) - compact, stacked layout
  return (
    <footer
      className={cn(
        'px-4 py-3 text-xs text-stone-500 dark:text-stone-400 space-y-2',
        className
      )}
    >
      {links && links.length > 0 && (
        <nav className="flex flex-wrap gap-x-3 gap-y-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
      <div className="flex items-center gap-2">
        {version && <span>v{version.replace(/^v/, '')}</span>}
        {version && <span aria-hidden="true">·</span>}
        <span>© {copyrightText}</span>
      </div>
    </footer>
  )
}
