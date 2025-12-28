import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, ArrowLeft, Search } from 'lucide-react'
import { PhaseNav } from './PhaseNav'
import { ThemeToggle } from './ThemeToggle'
import { CommandPalette } from './CommandPalette'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { Button } from '@/components/ui/button'

interface AppLayoutProps {
  children: ReactNode
  /** Optional title shown in the header (for sub-pages) */
  title?: string
  /** Optional back navigation path */
  backTo?: string
  /** Optional back label */
  backLabel?: string
  /** Whether to show the phase nav (default: true) */
  showPhaseNav?: boolean
}

export function AppLayout({
  children,
  title,
  backTo,
  backLabel = 'Back',
  showPhaseNav = true,
}: AppLayoutProps) {
  const navigate = useNavigate()
  const { open: commandPaletteOpen, setOpen: setCommandPaletteOpen } = useCommandPalette()

  // Determine if this is a sub-page (has back navigation)
  const isSubPage = !!backTo

  return (
    <>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    <div className="min-h-screen bg-background animate-fade-in flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="px-4 sm:px-6 py-3">
          {isSubPage ? (
            /* Sub-page header with back button */
            <div className="max-w-3xl mx-auto flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(backTo)}
                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
                {backLabel}
              </Button>
              {title && (
                <>
                  <div className="h-4 w-px bg-stone-200 dark:bg-stone-700" />
                  <h1 className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {title}
                  </h1>
                </>
              )}
              <div className="ml-auto flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCommandPaletteOpen(true)}
                  className="hidden sm:flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                >
                  <Search className="w-4 h-4" strokeWidth={1.5} />
                  <kbd className="text-xs px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">⌘K</kbd>
                </Button>
                <ThemeToggle />
              </div>
            </div>
          ) : (
            /* Main page header with phase nav - full width */
            <div className="flex items-center justify-between gap-4">
              {/* Theme Toggle on left for balance */}
              <div className="w-10 shrink-0">
                {/* Empty spacer for balance */}
              </div>

              {/* Phase Navigation - centered */}
              {showPhaseNav && (
                <div className="flex-1 flex justify-center">
                  <PhaseNav />
                </div>
              )}

              {/* Search & Theme Toggle */}
              <div className="shrink-0 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCommandPaletteOpen(true)}
                  className="hidden sm:flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                >
                  <Search className="w-4 h-4" strokeWidth={1.5} />
                  <kbd className="text-xs px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">⌘K</kbd>
                </Button>
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {children}
      </main>

      {/* Footer with logo */}
      <footer className="py-8 flex justify-center">
        <a
          href="https://buildermethods.com/design-os"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400 transition-colors group"
        >
          <span className="text-xs">Powered by</span>
          <div className="w-5 h-5 rounded bg-stone-300 dark:bg-stone-600 flex items-center justify-center transition-colors group-hover:bg-stone-400 dark:group-hover:bg-stone-500">
            <Layers className="w-3 h-3 text-stone-100 dark:text-stone-900" strokeWidth={1.5} />
          </div>
          <span className="text-xs font-medium">Design OS</span>
        </a>
      </footer>
    </div>
    </>
  )
}
