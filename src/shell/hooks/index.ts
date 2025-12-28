/**
 * Shell Hooks
 *
 * Utility hooks for building application shells:
 * - useFocusManagement: Focus trap and restoration for modals
 * - useShellShortcuts: Global keyboard shortcuts
 * - useShellState: Persistent shell UI state (sidebar, nav groups)
 * - useSessionTimeout: Session inactivity timeout with warning
 */

// HIGH PRIORITY - Accessibility
export { useFocusManagement } from './useFocusManagement'

// MEDIUM PRIORITY - UX
export { useShellShortcuts } from './useShellShortcuts'
export { useShellState } from './useShellState'

// LOW PRIORITY - Optional
export { useSessionTimeout, formatRemainingTime } from './useSessionTimeout'
