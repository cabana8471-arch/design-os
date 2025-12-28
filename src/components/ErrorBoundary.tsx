/**
 * Error Boundary Components
 *
 * Provides graceful error handling with retry capabilities and context-aware recovery.
 */

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Terminal, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

/**
 * Recovery action with optional command
 */
interface RecoveryAction {
  /** Button label */
  label: string
  /** Description of what this action does */
  description?: string
  /** Optional command to copy (e.g., "/design-screen") */
  command?: string
  /** Click handler */
  onClick?: () => void
}

interface ErrorBoundaryProps {
  children: ReactNode
  /** Fallback component to render on error */
  fallback?: ReactNode
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  /** Custom error message */
  errorMessage?: string
  /** Context for error (affects recovery suggestions) */
  context?: 'section' | 'screen-design' | 'shell' | 'page'
  /** Section ID (for context-aware suggestions) */
  sectionId?: string
  /** Additional recovery actions */
  recoveryActions?: RecoveryAction[]
}

/**
 * Get default recovery suggestions based on context
 */
function getDefaultRecoveryActions(
  context?: ErrorBoundaryProps['context'],
  sectionId?: string,
  error?: Error | null
): RecoveryAction[] {
  const actions: RecoveryAction[] = []

  // Add context-specific recovery actions
  switch (context) {
    case 'screen-design':
      actions.push({
        label: 'Create Screen Design',
        description: 'Run the design-screen command to create this component',
        command: '/design-screen',
      })
      if (sectionId) {
        actions.push({
          label: 'Check Section Data',
          description: 'Ensure data.json and types.ts exist',
          command: '/sample-data',
        })
      }
      break

    case 'section':
      actions.push({
        label: 'Create Section Spec',
        description: 'Define the section specification first',
        command: '/shape-section',
      })
      break

    case 'shell':
      actions.push({
        label: 'Create Shell',
        description: 'Design the application shell',
        command: '/design-shell',
      })
      break

    case 'page':
      // Generic page error - check if it's a missing product file
      if (error?.message?.includes('product-overview')) {
        actions.push({
          label: 'Create Product Vision',
          description: 'Start by defining your product vision',
          command: '/product-vision',
        })
      }
      break
  }

  return actions
}

/**
 * Context-aware recovery suggestions component
 */
function ContextRecovery({
  context,
  sectionId,
  recoveryActions,
  error,
}: {
  context?: ErrorBoundaryProps['context']
  sectionId?: string
  recoveryActions?: RecoveryAction[]
  error?: Error | null
}) {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  // Combine default and custom recovery actions
  const defaultActions = getDefaultRecoveryActions(context, sectionId, error)
  const allActions = [...defaultActions, ...(recoveryActions || [])]

  if (allActions.length === 0) return null

  const handleCopyCommand = async (command: string) => {
    await navigator.clipboard.writeText(command)
    setCopiedCommand(command)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  return (
    <div className="w-full max-w-md mb-6">
      <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3 text-center">
        Recovery suggestions:
      </p>
      <div className="space-y-2">
        {allActions.map((action, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                {action.label}
              </p>
              {action.description && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {action.description}
                </p>
              )}
            </div>
            {action.command && (
              <button
                onClick={() => handleCopyCommand(action.command!)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono',
                  'bg-stone-900 dark:bg-stone-950 text-lime-400',
                  'hover:bg-stone-800 dark:hover:bg-stone-900 transition-colors'
                )}
                title="Copy command"
              >
                {copiedCommand === action.command ? (
                  <>
                    <Check className="w-3 h-3" strokeWidth={2} />
                    Copied
                  </>
                ) : (
                  <>
                    <Terminal className="w-3 h-3" strokeWidth={2} />
                    {action.command}
                  </>
                )}
              </button>
            )}
            {action.onClick && !action.command && (
              <Button
                onClick={action.onClick}
                variant="outline"
                size="sm"
              >
                {action.label}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
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

          <div className="flex flex-wrap gap-3 mb-6 justify-center">
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

          {/* Context-aware recovery suggestions */}
          <ContextRecovery
            context={this.props.context}
            sectionId={this.props.sectionId}
            recoveryActions={this.props.recoveryActions}
            error={error}
          />

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
