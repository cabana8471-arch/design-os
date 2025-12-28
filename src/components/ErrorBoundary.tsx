/**
 * Error Boundary Components
 *
 * Provides graceful error handling with retry capabilities.
 */

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Fallback component to render on error */
  fallback?: ReactNode
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  /** Custom error message */
  errorMessage?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  showDetails: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error)
      console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    })
  }

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, showDetails } = this.state
      const { errorMessage } = this.props

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" strokeWidth={1.5} />
          </div>

          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
            Something went wrong
          </h2>

          <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md">
            {errorMessage || 'An unexpected error occurred. Please try again.'}
          </p>

          <div className="flex gap-3 mb-6">
            <Button onClick={this.handleRetry} variant="default" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" strokeWidth={2} />
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              size="sm"
            >
              <Home className="w-4 h-4 mr-2" strokeWidth={2} />
              Go Home
            </Button>
          </div>

          {import.meta.env.DEV && error && (
            <div className="w-full max-w-2xl">
              <button
                onClick={this.toggleDetails}
                className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 mx-auto mb-2"
              >
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" strokeWidth={2} />
                ) : (
                  <ChevronDown className="w-4 h-4" strokeWidth={2} />
                )}
                {showDetails ? 'Hide' : 'Show'} Error Details
              </button>

              {showDetails && (
                <div className="text-left bg-stone-100 dark:bg-stone-800 rounded-lg p-4 overflow-auto">
                  <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                    {error.name}: {error.message}
                  </p>
                  {errorInfo?.componentStack && (
                    <pre className="text-xs text-stone-600 dark:text-stone-400 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Route Error Boundary - For use with React Router
 * Handles errors at the route level with navigation options
 */
interface RouteErrorBoundaryProps {
  children: ReactNode
  /** Route name for error message */
  routeName?: string
}

export function RouteErrorBoundary({ children, routeName }: RouteErrorBoundaryProps) {
  return (
    <ErrorBoundary
      errorMessage={
        routeName
          ? `Failed to load the ${routeName} page. This might be a temporary issue.`
          : undefined
      }
      onError={(error) => {
        // Could send to error tracking service here
        console.error(`[RouteError] ${routeName || 'Unknown route'}:`, error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * ComponentErrorBoundary - For use around specific components
 * Provides inline error display without taking over the whole page
 */
interface ComponentErrorBoundaryProps {
  children: ReactNode
  /** Component name for error message */
  componentName?: string
  /** Additional class names */
  className?: string
}

export function ComponentErrorBoundary({
  children,
  componentName,
  className,
}: ComponentErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div
          className={cn(
            'p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20',
            className
          )}
        >
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">
              {componentName ? `${componentName} failed to load` : 'Component error'}
            </span>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
