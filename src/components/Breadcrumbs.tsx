/**
 * Breadcrumbs Component - Navigation hierarchy display
 */

import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbsProps {
  items: Array<{ label: string; href?: string }>
  /** Show home icon at the start */
  showHome?: boolean
  /** Additional class names */
  className?: string
}

export function Breadcrumbs({ items, showHome = true, className }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm', className)}
    >
      {showHome && (
        <>
          <Link
            to="/"
            className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            aria-label="Home"
          >
            <Home className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <ChevronRight
            className="w-4 h-4 text-stone-300 dark:text-stone-600"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </>
      )}

      <ol className="flex items-center gap-1" role="list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast
                      ? 'text-stone-900 dark:text-stone-100 font-medium'
                      : 'text-stone-500 dark:text-stone-400'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight
                  className="w-4 h-4 text-stone-300 dark:text-stone-600"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
