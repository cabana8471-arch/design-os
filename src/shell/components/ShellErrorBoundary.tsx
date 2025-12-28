/**
 * ShellErrorBoundary - Error boundary for shell secondary components
 *
 * Prevents crashes in secondary components (NotificationsDrawer, SettingsModal, etc.)
 * from breaking the entire shell. Provides a fallback UI with retry option.
 *
 * Usage:
 * <ShellErrorBoundary componentName="Notifications">
 *   <NotificationsDrawer {...props} />
 * </ShellErrorBoundary>
 */

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShellErrorBoundaryProps {
  /** Name of the component being wrapped (for error display) */
  componentName: string
  /** Children to render */
  children: ReactNode
  /** Optional fallback to render on error */
  fallback?: ReactNode
  /** Called when an error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ShellErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ShellErrorBoundary extends Component<
  ShellErrorBoundaryProps,
  ShellErrorBoundaryState
> {
  constructor(props: ShellErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ShellErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(`[ShellErrorBoundary] ${this.props.componentName} crashed:`, error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-900 dark:text-white">
              Failed to load {this.props.componentName}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Something went wrong. Please try again.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            Retry
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
