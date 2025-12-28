/**
 * Error types and utilities for Design OS
 *
 * Provides structured error handling with:
 * - Typed error categories and severities
 * - Standard error message formatting
 * - Recovery action guidance
 */

/**
 * Error severity levels
 * - error: Fatal errors that prevent operation
 * - warning: Non-fatal issues to address
 * - info: Informational messages
 */
export type ErrorSeverity = 'error' | 'warning' | 'info'

/**
 * Error categories for different failure types
 */
export type ErrorCategory =
  | 'file-not-found'
  | 'parse-error'
  | 'validation-error'
  | 'component-error'
  | 'type-mismatch'
  | 'missing-dependency'
  | 'structure-error'

/**
 * Recovery action with optional command
 */
export interface RecoveryAction {
  /** Description of the action to take */
  action: string
  /** Optional Claude command to run (e.g., "/sample-data") */
  command?: string
}

/**
 * Structured error with recovery guidance
 */
export interface DesignOSError {
  /** Error severity level */
  severity: ErrorSeverity
  /** Error category for classification */
  category: ErrorCategory
  /** Component or file that caused the error (e.g., "data.json", "AppShell.tsx") */
  component: string
  /** Human-readable error message */
  message: string
  /** Additional details (shown in DEV mode) */
  details?: string
  /** Recovery action guidance */
  recovery?: RecoveryAction
  /** Timestamp when error occurred */
  timestamp: number
}

/**
 * Result type for loader functions that includes errors
 */
export interface LoadResult<T> {
  /** The loaded data, or null if loading failed */
  data: T | null
  /** Fatal errors that prevented loading */
  errors: DesignOSError[]
  /** Non-fatal warnings to address */
  warnings: DesignOSError[]
}

/**
 * Format error message following the standard format:
 * [Level]: [Component] - [Issue]. [Action].
 *
 * @example
 * formatError(error)
 * // => "Error: data.json - Missing _meta.models. Add model descriptions to data.json."
 */
export function formatError(error: DesignOSError): string {
  const level = error.severity.charAt(0).toUpperCase() + error.severity.slice(1)
  const action = error.recovery?.action ? ` ${error.recovery.action}` : ''
  const command = error.recovery?.command ? ` Run ${error.recovery.command}.` : ''

  return `${level}: ${error.component} - ${error.message}.${action}${command}`
}

/**
 * Create a structured error with proper formatting
 *
 * @param category - Error category
 * @param component - Component or file that caused the error
 * @param message - Human-readable error message (without period)
 * @param recovery - Optional recovery action
 * @param severity - Error severity (defaults to 'error')
 *
 * @example
 * createError(
 *   'validation-error',
 *   'data.json',
 *   'Missing _meta.models',
 *   { action: 'Add model descriptions to data.json' }
 * )
 */
export function createError(
  category: ErrorCategory,
  component: string,
  message: string,
  recovery?: RecoveryAction,
  severity: ErrorSeverity = 'error'
): DesignOSError {
  return {
    severity,
    category,
    component,
    message,
    recovery,
    timestamp: Date.now(),
  }
}

/**
 * Create a warning (non-fatal error)
 */
export function createWarning(
  category: ErrorCategory,
  component: string,
  message: string,
  recovery?: RecoveryAction
): DesignOSError {
  return createError(category, component, message, recovery, 'warning')
}

/**
 * Create a file-not-found error with standard recovery command
 */
export function createFileNotFoundError(
  filePath: string,
  recoveryCommand?: string
): DesignOSError {
  const fileName = filePath.split('/').pop() || filePath
  return createError(
    'file-not-found',
    fileName,
    `File not found at ${filePath}`,
    recoveryCommand
      ? { action: 'Create the file first.', command: recoveryCommand }
      : { action: 'Create the file or check the path.' }
  )
}

/**
 * Create a validation error for data.json _meta structure
 */
export function createMetaValidationError(
  issue: string,
  details?: string
): DesignOSError {
  const error = createError(
    'structure-error',
    'data.json',
    issue,
    { action: 'Update the _meta structure.', command: '/sample-data' }
  )
  if (details) {
    error.details = details
  }
  return error
}

/**
 * Create a component loading error
 */
export function createComponentError(
  componentName: string,
  sectionId: string,
  message: string
): DesignOSError {
  return createError(
    'component-error',
    `${componentName}.tsx`,
    message,
    { action: `Check the component in src/sections/${sectionId}/.`, command: '/design-screen' }
  )
}

/**
 * Create a parse error for markdown or JSON
 */
export function createParseError(
  fileName: string,
  issue: string,
  details?: string
): DesignOSError {
  const error = createError(
    'parse-error',
    fileName,
    issue,
    { action: 'Fix the file syntax.' }
  )
  if (details) {
    error.details = details
  }
  return error
}

/**
 * Create an empty LoadResult
 */
export function emptyLoadResult<T>(): LoadResult<T> {
  return {
    data: null,
    errors: [],
    warnings: [],
  }
}

/**
 * Create a successful LoadResult
 */
export function successLoadResult<T>(data: T, warnings: DesignOSError[] = []): LoadResult<T> {
  return {
    data,
    errors: [],
    warnings,
  }
}

/**
 * Create a failed LoadResult
 */
export function failedLoadResult<T>(errors: DesignOSError[], warnings: DesignOSError[] = []): LoadResult<T> {
  return {
    data: null,
    errors,
    warnings,
  }
}

/**
 * Check if a LoadResult has any errors
 */
export function hasErrors<T>(result: LoadResult<T>): boolean {
  return result.errors.length > 0
}

/**
 * Check if a LoadResult has any warnings
 */
export function hasWarnings<T>(result: LoadResult<T>): boolean {
  return result.warnings.length > 0
}

/**
 * Check if a LoadResult has any issues (errors or warnings)
 */
export function hasIssues<T>(result: LoadResult<T>): boolean {
  return hasErrors(result) || hasWarnings(result)
}

/**
 * Combine multiple LoadResults into one
 */
export function combineLoadResults<T>(
  results: LoadResult<unknown>[],
  combineData: () => T | null
): LoadResult<T> {
  const errors: DesignOSError[] = []
  const warnings: DesignOSError[] = []

  for (const result of results) {
    errors.push(...result.errors)
    warnings.push(...result.warnings)
  }

  return {
    data: errors.length === 0 ? combineData() : null,
    errors,
    warnings,
  }
}

/**
 * Log errors to console in development mode
 */
export function logErrors(errors: DesignOSError[], context?: string): void {
  if (import.meta.env.DEV && errors.length > 0) {
    const prefix = context ? `[${context}]` : '[Design OS]'
    console.group(`${prefix} ${errors.length} error(s)`)
    for (const error of errors) {
      console.error(formatError(error))
      if (error.details) {
        console.error('  Details:', error.details)
      }
    }
    console.groupEnd()
  }
}

/**
 * Log warnings to console in development mode
 */
export function logWarnings(warnings: DesignOSError[], context?: string): void {
  if (import.meta.env.DEV && warnings.length > 0) {
    const prefix = context ? `[${context}]` : '[Design OS]'
    console.group(`${prefix} ${warnings.length} warning(s)`)
    for (const warning of warnings) {
      console.warn(formatError(warning))
      if (warning.details) {
        console.warn('  Details:', warning.details)
      }
    }
    console.groupEnd()
  }
}

/**
 * Log all issues from a LoadResult
 */
export function logLoadResult<T>(result: LoadResult<T>, context?: string): void {
  logErrors(result.errors, context)
  logWarnings(result.warnings, context)
}
