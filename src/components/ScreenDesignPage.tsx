import { Suspense, useMemo, useState, useRef, useCallback, useEffect, Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Maximize2, GripVertical, Layout, Smartphone, Tablet, Monitor, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { loadScreenDesignComponent, sectionUsesShell } from '@/lib/section-loader'
import { loadAppShell, hasShellComponents } from '@/lib/shell-loader'
import { loadProductData } from '@/lib/product-loader'
import { getNavigationCategories, defaultUser } from '@/shell/navigation-config'
import React from 'react'

/**
 * Error boundary for screen design components.
 * Catches runtime errors (e.g., from prop type mismatches) and displays
 * a friendly error message instead of crashing the entire preview.
 */
interface ScreenDesignErrorBoundaryProps {
  children: ReactNode
  screenDesignName?: string
}

interface ScreenDesignErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ScreenDesignErrorBoundary extends Component<ScreenDesignErrorBoundaryProps, ScreenDesignErrorBoundaryState> {
  constructor(props: ScreenDesignErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ScreenDesignErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[ScreenDesignErrorBoundary] Component error:', error)
      console.error('[ScreenDesignErrorBoundary] Component stack:', errorInfo.componentStack)
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center p-8 bg-red-50 dark:bg-red-950/20">
          <div className="max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Screen Design Error
            </h2>
            <p className="text-sm text-red-600 dark:text-red-300 mb-4">
              {this.props.screenDesignName
                ? `The component "${this.props.screenDesignName}" encountered an error while rendering.`
                : 'A screen design component encountered an error while rendering.'}
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-red-100 dark:bg-red-900/30 rounded p-3">
                <summary className="text-xs font-medium text-red-700 dark:text-red-300 cursor-pointer">
                  Error Details (DEV only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const MIN_WIDTH = 320
const DEFAULT_WIDTH_PERCENT = 100

export function ScreenDesignPage() {
  const { sectionId, screenDesignName } = useParams<{ sectionId: string; screenDesignName: string }>()
  const navigate = useNavigate()
  const [widthPercent, setWidthPercent] = useState(DEFAULT_WIDTH_PERCENT)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Load product data to get section title
  const productData = useMemo(() => loadProductData(), [])
  const section = productData.roadmap?.sections.find((s) => s.id === sectionId)

  // Handle resize drag
  const handleMouseDown = useCallback(() => {
    isDragging.current = true

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerCenter = containerRect.left + containerWidth / 2

      // Calculate distance from center
      const distanceFromCenter = Math.abs(e.clientX - containerCenter)
      const maxDistance = containerWidth / 2

      // Convert to percentage (distance from center * 2 = total width)
      let newWidthPercent = (distanceFromCenter / maxDistance) * 100

      // Clamp between min width and 100%
      const minPercent = (MIN_WIDTH / containerWidth) * 100
      newWidthPercent = Math.max(minPercent, Math.min(100, newWidthPercent))

      // Round to avoid floating point precision issues in width calculations
      setWidthPercent(Math.round(newWidthPercent))
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const previewWidth = `${widthPercent}%`

  return (
    <div className="h-screen bg-stone-100 dark:bg-stone-900 animate-fade-in flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 shrink-0 z-50">
        <div className="px-4 py-2 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/sections/${sectionId}`)}
            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Back
          </Button>
          <div className="h-4 w-px bg-stone-200 dark:bg-stone-700" />
          <div className="flex items-center gap-2 min-w-0">
            <Layout className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.5} />
            {section && (
              <span className="text-sm text-stone-500 dark:text-stone-400 truncate">
                {section.title}
              </span>
            )}
            <span className="text-stone-300 dark:text-stone-600">/</span>
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">
              {screenDesignName}
            </span>
          </div>

          {/* Width indicator and device presets */}
          <div className="ml-auto flex items-center gap-4">
            {/* Device size presets */}
            <div className="flex items-center gap-1 border-r border-stone-200 dark:border-stone-700 pr-4">
              <button
                onClick={() => setWidthPercent(30)}
                className={`p-1.5 rounded transition-colors ${
                  widthPercent <= 40
                    ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100'
                    : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                title="Mobile (30%)"
              >
                <Smartphone className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setWidthPercent(60)}
                className={`p-1.5 rounded transition-colors ${
                  widthPercent > 40 && widthPercent <= 60
                    ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100'
                    : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                title="Tablet (60%)"
              >
                <Tablet className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setWidthPercent(100)}
                className={`p-1.5 rounded transition-colors ${
                  widthPercent > 60
                    ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100'
                    : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                title="Desktop (100%)"
              >
                <Monitor className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono w-10 text-right">
              {Math.round(widthPercent)}%
            </span>
            <ThemeToggle />
            <a
              href={`/sections/${sectionId}/screen-designs/${screenDesignName}/fullscreen`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              Fullscreen
            </a>
          </div>
        </div>
      </header>

      {/* Preview area with resizable container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden flex items-stretch justify-center p-6"
      >
        {/* Left resize handle */}
        <div
          className="w-4 flex items-center justify-center cursor-ew-resize group shrink-0"
          onMouseDown={handleMouseDown}
        >
          <div className="w-1 h-16 rounded-full bg-stone-300 dark:bg-stone-600 group-hover:bg-stone-400 dark:group-hover:bg-stone-500 transition-colors flex items-center justify-center">
            <GripVertical className="w-3 h-3 text-stone-500 dark:text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
          </div>
        </div>

        {/*
          Preview container using iframe for true isolation.

          WHY IFRAME?
          -----------
          We use an iframe to completely isolate the screen design from Design OS styles:

          1. CSS Isolation: The iframe creates a separate document context, so Design OS
             styles (stone palette, DM Sans, etc.) don't bleed into screen designs that
             use their own design tokens (different colors, fonts).

          2. Theme Syncing: The iframe loads ScreenDesignFullscreen which syncs theme
             via localStorage polling, ensuring dark/light mode matches the parent.

          3. Shell Integration: The fullscreen component can optionally wrap the screen
             design in the AppShell component, showing the complete app experience.

          4. Screenshots: The /fullscreen route is what gets captured by Playwright
             during /screenshot-design, providing clean screenshots without Design OS chrome.

          The iframe src points to: /sections/[sectionId]/screen-designs/[name]/fullscreen
          This route renders ScreenDesignFullscreen which handles lazy loading and shell wrapping.
        */}
        <div
          className="bg-white dark:bg-stone-950 rounded-lg shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden"
          style={{ width: previewWidth, minWidth: MIN_WIDTH, maxWidth: '100%' }}
        >
          <iframe
            src={`/sections/${sectionId}/screen-designs/${screenDesignName}/fullscreen`}
            className="w-full h-full border-0"
            title={`${section?.title || sectionId} - ${screenDesignName} Screen Design`}
          />
        </div>

        {/* Right resize handle */}
        <div
          className="w-4 flex items-center justify-center cursor-ew-resize group shrink-0"
          onMouseDown={handleMouseDown}
        >
          <div className="w-1 h-16 rounded-full bg-stone-300 dark:bg-stone-600 group-hover:bg-stone-400 dark:group-hover:bg-stone-500 transition-colors flex items-center justify-center">
            <GripVertical className="w-3 h-3 text-stone-500 dark:text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Fullscreen version of a screen design (for screenshots)
 * Syncs theme with parent window via localStorage
 * Wraps screen design in AppShell if shell components exist
 */
export function ScreenDesignFullscreen() {
  const { sectionId, screenDesignName } = useParams<{ sectionId: string; screenDesignName: string }>()

  // Load screen design component
  const ScreenDesignComponent = useMemo(() => {
    if (!sectionId || !screenDesignName) return null
    const loader = loadScreenDesignComponent(sectionId, screenDesignName)
    if (!loader) return null
    // Wrap the loader to handle potential export issues
    return React.lazy(async () => {
      try {
        const module = await loader()
        if (module && typeof module.default === 'function') {
          return module
        }
        if (import.meta.env.DEV) {
          console.error('Screen design does not have a valid default export:', screenDesignName)
        }
        return { default: () => <div>Invalid screen design: {screenDesignName}</div> }
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('Failed to load screen design:', screenDesignName, e)
        }
        return { default: () => <div>Failed to load: {screenDesignName}</div> }
      }
    })
  }, [sectionId, screenDesignName])

  // Load AppShell component if it exists AND this section uses the shell
  const AppShellComponent = useMemo(() => {
    // Check if this section should use the shell (based on spec.md config)
    if (sectionId && !sectionUsesShell(sectionId)) {
      if (import.meta.env.DEV) {
        console.log('[ScreenDesignFullscreen] Section configured to not use shell')
      }
      return null
    }

    // Check if shell components exist
    const shellExists = hasShellComponents()
    if (import.meta.env.DEV) {
      console.log('[ScreenDesignFullscreen] Shell exists:', shellExists)
    }
    if (!shellExists) return null

    const loader = loadAppShell()
    if (import.meta.env.DEV) {
      console.log('[ScreenDesignFullscreen] AppShell loader:', loader)
    }
    if (!loader) {
      if (import.meta.env.DEV) {
        console.warn('[ScreenDesignFullscreen] hasShellComponents() returned true but loadAppShell() returned null')
      }
      return null
    }

    // Wrap the loader to provide default props to the shell
    return React.lazy(async () => {
      try {
        const module = await loader() as Record<string, unknown>

        // Validate module structure before type casting
        if (!module) {
          if (import.meta.env.DEV) {
            console.warn('[ScreenDesignFullscreen] AppShell module is null or undefined')
          }
          return { default: ({ children }: { children?: React.ReactNode }) => <>{children}</> }
        }

        // Check for valid export (default or named AppShell)
        const rawComponent = module.default ?? module.AppShell
        if (!rawComponent) {
          if (import.meta.env.DEV) {
            console.warn('[ScreenDesignFullscreen] AppShell module has no default or AppShell export')
          }
          return { default: ({ children }: { children?: React.ReactNode }) => <>{children}</> }
        }

        // Validate it's a function before casting
        if (typeof rawComponent !== 'function') {
          if (import.meta.env.DEV) {
            console.warn(`[ScreenDesignFullscreen] AppShell export is not a function (got ${typeof rawComponent})`)
          }
          return { default: ({ children }: { children?: React.ReactNode }) => <>{children}</> }
        }

        /**
         * Type for shell component props.
         * AppShell components accept navigation categories, user info, and callbacks.
         * Using a specific interface instead of Record<string, unknown> for better type safety.
         *
         * NavigationCategory structure:
         * - id: string - unique category identifier
         * - label: string - display name
         * - items: NavigationItem[] - list of navigation items with id, label, href, icon?
         */
        interface ShellComponentProps {
          children?: React.ReactNode
          categories?: Array<{
            id: string
            label: string
            items: Array<{ id: string; label: string; href: string; icon?: string }>
          }>
          user?: { id: string; name: string; email: string; avatar?: string }
          onNavigate?: (href: string) => void
          onLogout?: () => void
        }

        // Safe to cast now - we've validated it's a function
        const ShellComponent = rawComponent as React.ComponentType<ShellComponentProps>

        // Create a wrapper that provides default props to the shell
        const ShellWrapper = ({ children }: { children?: React.ReactNode }) => {
          // Get navigation categories with current section marked as active
          const categories = getNavigationCategories(sectionId)

          // Pass props dynamically - the shell component decides what it needs
          return (
            <ShellComponent
              categories={categories}
              user={defaultUser}
              onNavigate={() => {}}
              onLogout={() => {}}
            >
              {children}
            </ShellComponent>
          )
        }

        return { default: ShellWrapper }
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('[ScreenDesignFullscreen] Failed to load AppShell:', e)
        }
        return { default: ({ children }: { children?: React.ReactNode }) => <>{children}</> }
      }
    })
  }, [sectionId]) // Depends on sectionId to check section-specific shell config

  // Sync theme with parent window
  useEffect(() => {
    const applyTheme = () => {
      const theme = localStorage.getItem('theme') || 'system'
      const root = document.documentElement

      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', systemDark)
      } else {
        root.classList.toggle('dark', theme === 'dark')
      }
    }

    // Apply on mount
    applyTheme()

    // Listen for storage changes (from parent window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        applyTheme()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    // Also poll for changes since storage event doesn't fire in same window
    // Using 250ms interval to balance responsiveness with performance
    const interval = setInterval(applyTheme, 250)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  if (!ScreenDesignComponent) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-stone-600 dark:text-stone-400">Screen design not found.</p>
      </div>
    )
  }

  // If shell exists, wrap screen design in AppShell
  if (AppShellComponent) {
    return (
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center bg-background">
            <div className="text-stone-500 dark:text-stone-400">Loading...</div>
          </div>
        }
      >
        <AppShellComponent>
          <ScreenDesignErrorBoundary screenDesignName={screenDesignName}>
            <ScreenDesignComponent />
          </ScreenDesignErrorBoundary>
        </AppShellComponent>
      </Suspense>
    )
  }

  // No shell, render screen design directly
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-background">
          <div className="text-stone-500 dark:text-stone-400">Loading...</div>
        </div>
      }
    >
      <ScreenDesignErrorBoundary screenDesignName={screenDesignName}>
        <ScreenDesignComponent />
      </ScreenDesignErrorBoundary>
    </Suspense>
  )
}
