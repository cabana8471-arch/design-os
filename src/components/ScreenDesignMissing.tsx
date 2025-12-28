/**
 * ScreenDesignMissing - Friendly UI when a screen design component is not found
 *
 * Shows what was expected, lists available designs in the section,
 * and provides recovery guidance with command to run.
 */

import { FileQuestion, ArrowRight, Terminal, Layout } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScreenDesignMissingProps {
  /** The section ID (folder name) */
  sectionId: string
  /** The screen design name that was expected */
  screenDesignName: string
  /** List of available screen designs in this section */
  availableDesigns?: Array<{ name: string; path: string }>
  /** Recovery command to create the missing design */
  recoveryCommand?: string
  /** Callback to navigate to an available design */
  onNavigateToDesign?: (name: string) => void
  /** Additional class names */
  className?: string
}

export function ScreenDesignMissing({
  sectionId,
  screenDesignName,
  availableDesigns = [],
  recoveryCommand = '/design-screen',
  onNavigateToDesign,
  className,
}: ScreenDesignMissingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] p-8 text-center',
        className
      )}
    >
      {/* Icon */}
      <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-6">
        <FileQuestion className="w-10 h-10 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
        Screen Design Not Found
      </h2>

      {/* Description */}
      <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md">
        The screen design{' '}
        <code className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded text-sm font-mono">
          {screenDesignName}
        </code>{' '}
        doesn't exist in the{' '}
        <code className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded text-sm font-mono">
          {sectionId}
        </code>{' '}
        section.
      </p>

      {/* Expected path */}
      <div className="mb-6 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Expected file:</p>
        <code className="text-sm font-mono text-stone-700 dark:text-stone-300">
          src/sections/{sectionId}/{screenDesignName}.tsx
        </code>
      </div>

      {/* Available designs */}
      {availableDesigns.length > 0 && (
        <div className="mb-6 w-full max-w-sm">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
            Available screen designs in this section:
          </p>
          <div className="space-y-2">
            {availableDesigns.map((design) => (
              <button
                key={design.name}
                onClick={() => onNavigateToDesign?.(design.name)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg',
                  'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                  'hover:border-lime-500 dark:hover:border-lime-400 hover:bg-lime-50 dark:hover:bg-lime-900/20',
                  'transition-colors group'
                )}
              >
                <div className="flex items-center gap-3">
                  <Layout className="w-4 h-4 text-stone-400 group-hover:text-lime-600 dark:group-hover:text-lime-400" strokeWidth={1.5} />
                  <span className="font-medium text-stone-700 dark:text-stone-300 group-hover:text-lime-700 dark:group-hover:text-lime-300">
                    {design.name}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-lime-600 dark:group-hover:text-lime-400" strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No available designs */}
      {availableDesigns.length === 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            No screen designs have been created for this section yet.
          </p>
        </div>
      )}

      {/* Recovery action */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          To create this screen design, run:
        </p>
        <div className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-950 rounded-lg">
          <Terminal className="w-4 h-4 text-lime-400" strokeWidth={2} />
          <code className="text-lime-400 font-mono text-sm">{recoveryCommand}</code>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact version for inline use in cards/lists
 */
export function ScreenDesignMissingCompact({
  screenDesignName,
  recoveryCommand = '/design-screen',
}: {
  screenDesignName: string
  recoveryCommand?: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
      <FileQuestion className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
      <div className="flex-1">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {screenDesignName} not found
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Run <code className="font-mono text-lime-600 dark:text-lime-400">{recoveryCommand}</code> to create
        </p>
      </div>
    </div>
  )
}

export default ScreenDesignMissing
