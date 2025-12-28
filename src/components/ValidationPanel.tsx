/**
 * ValidationPanel - Display validation errors and warnings inline
 *
 * Shows a collapsible panel with error/warning counts and details.
 * Each item includes the error message and recovery action if available.
 */

import { useState } from 'react'
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, X, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DesignOSError } from '@/lib/errors'

interface ValidationPanelProps {
  /** Fatal errors that need to be fixed */
  errors: DesignOSError[]
  /** Non-fatal warnings to address */
  warnings: DesignOSError[]
  /** Start collapsed */
  collapsed?: boolean
  /** Callback when an item is dismissed */
  onDismiss?: (index: number, type: 'error' | 'warning') => void
  /** Additional class names */
  className?: string
}

/**
 * Get icon for error severity
 */
function SeverityIcon({ severity, className }: { severity: DesignOSError['severity']; className?: string }) {
  switch (severity) {
    case 'error':
      return <AlertCircle className={cn('text-red-500 dark:text-red-400', className)} strokeWidth={2} />
    case 'warning':
      return <AlertTriangle className={cn('text-amber-500 dark:text-amber-400', className)} strokeWidth={2} />
    case 'info':
      return <Info className={cn('text-blue-500 dark:text-blue-400', className)} strokeWidth={2} />
  }
}

/**
 * Single validation item with copy-to-clipboard for recovery commands
 */
function ValidationItem({
  error,
  onDismiss,
}: {
  error: DesignOSError
  onDismiss?: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (error.recovery?.command) {
      await navigator.clipboard.writeText(error.recovery.command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg',
        error.severity === 'error' && 'bg-red-50 dark:bg-red-900/20',
        error.severity === 'warning' && 'bg-amber-50 dark:bg-amber-900/20',
        error.severity === 'info' && 'bg-blue-50 dark:bg-blue-900/20'
      )}
    >
      <SeverityIcon severity={error.severity} className="w-4 h-4 mt-0.5 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            error.severity === 'error' && 'text-red-800 dark:text-red-200',
            error.severity === 'warning' && 'text-amber-800 dark:text-amber-200',
            error.severity === 'info' && 'text-blue-800 dark:text-blue-200'
          )}
        >
          <span className="font-semibold">{error.component}</span>
          <span className="mx-1">—</span>
          {error.message}
        </p>

        {error.recovery && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs text-stone-600 dark:text-stone-400">
              {error.recovery.action}
            </span>
            {error.recovery.command && (
              <button
                onClick={handleCopy}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono',
                  'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300',
                  'hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors'
                )}
                title="Copy command"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" strokeWidth={2} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" strokeWidth={2} />
                    {error.recovery.command}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {error.details && import.meta.env.DEV && (
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-mono">
            {error.details}
          </p>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-stone-400" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

/**
 * ValidationPanel - Collapsible panel for displaying validation issues
 */
export function ValidationPanel({
  errors,
  warnings,
  collapsed: initialCollapsed = false,
  onDismiss,
  className,
}: ValidationPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)

  const totalErrors = errors.length
  const totalWarnings = warnings.length
  const totalIssues = totalErrors + totalWarnings

  // Don't render if no issues
  if (totalIssues === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        totalErrors > 0
          ? 'border-red-200 dark:border-red-800'
          : 'border-amber-200 dark:border-amber-800',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3',
          totalErrors > 0
            ? 'bg-red-50 dark:bg-red-900/30'
            : 'bg-amber-50 dark:bg-amber-900/30'
        )}
      >
        <div className="flex items-center gap-3">
          {totalErrors > 0 ? (
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" strokeWidth={2} />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" strokeWidth={2} />
          )}

          <span
            className={cn(
              'text-sm font-medium',
              totalErrors > 0
                ? 'text-red-800 dark:text-red-200'
                : 'text-amber-800 dark:text-amber-200'
            )}
          >
            {totalErrors > 0 && `${totalErrors} error${totalErrors > 1 ? 's' : ''}`}
            {totalErrors > 0 && totalWarnings > 0 && ', '}
            {totalWarnings > 0 && `${totalWarnings} warning${totalWarnings > 1 ? 's' : ''}`}
          </span>
        </div>

        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-stone-500" strokeWidth={2} />
        ) : (
          <ChevronUp className="w-4 h-4 text-stone-500" strokeWidth={2} />
        )}
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-3 space-y-2 bg-white dark:bg-stone-900">
          {errors.map((error, index) => (
            <ValidationItem
              key={`error-${index}`}
              error={error}
              onDismiss={onDismiss ? () => onDismiss(index, 'error') : undefined}
            />
          ))}
          {warnings.map((warning, index) => (
            <ValidationItem
              key={`warning-${index}`}
              error={warning}
              onDismiss={onDismiss ? () => onDismiss(index, 'warning') : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Compact validation badge for inline use
 */
export function ValidationBadge({
  errors,
  warnings,
  onClick,
}: {
  errors: number
  warnings: number
  onClick?: () => void
}) {
  if (errors === 0 && warnings === 0) return null

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        errors > 0
          ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
          : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
      )}
    >
      {errors > 0 ? (
        <AlertCircle className="w-3 h-3" strokeWidth={2} />
      ) : (
        <AlertTriangle className="w-3 h-3" strokeWidth={2} />
      )}
      {errors > 0 ? `${errors} error${errors > 1 ? 's' : ''}` : `${warnings} warning${warnings > 1 ? 's' : ''}`}
    </button>
  )
}

export default ValidationPanel
