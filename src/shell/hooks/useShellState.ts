/**
 * useShellState - Persistent shell UI state
 *
 * Manages and persists shell preferences like:
 * - Sidebar collapsed state
 * - Expanded navigation groups
 * - Other UI preferences
 *
 * State is saved to localStorage and restored on page load.
 *
 * Usage:
 * const {
 *   sidebarCollapsed,
 *   setSidebarCollapsed,
 *   expandedNavGroups,
 *   toggleNavGroup,
 * } = useShellState()
 */

import { useState, useEffect, useCallback } from 'react'

const STORAGE_PREFIX = 'shell:'

// Generic localStorage hook
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const prefixedKey = `${STORAGE_PREFIX}${key}`

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const stored = localStorage.getItem(prefixedKey)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(value))
    } catch {
      // Ignore localStorage errors (quota exceeded, etc.)
    }
  }, [prefixedKey, value])

  return [value, setValue]
}

interface ShellStateReturn {
  /** Whether the sidebar is collapsed */
  sidebarCollapsed: boolean
  /** Toggle or set sidebar collapsed state */
  setSidebarCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void

  /** Array of expanded navigation group IDs */
  expandedNavGroups: string[]
  /** Toggle a navigation group's expanded state */
  toggleNavGroup: (id: string) => void
  /** Check if a navigation group is expanded */
  isNavGroupExpanded: (id: string) => boolean
  /** Expand all navigation groups */
  expandAllNavGroups: () => void
  /** Collapse all navigation groups */
  collapseAllNavGroups: () => void

  /** Recently visited section IDs (max 5) */
  recentSections: string[]
  /** Add a section to recent history */
  addRecentSection: (sectionId: string) => void
  /** Clear recent sections */
  clearRecentSections: () => void

  /** User's preferred density setting */
  density: 'compact' | 'comfortable' | 'spacious'
  /** Set density preference */
  setDensity: (density: 'compact' | 'comfortable' | 'spacious') => void

  /** Reset all shell state to defaults */
  resetShellState: () => void
}

export function useShellState(): ShellStateReturn {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('sidebar-collapsed', false)

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [setSidebarCollapsed])

  // Navigation groups
  const [expandedNavGroups, setExpandedNavGroups] = useLocalStorage<string[]>('expanded-nav', [])

  const toggleNavGroup = useCallback(
    (id: string) => {
      setExpandedNavGroups((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      )
    },
    [setExpandedNavGroups]
  )

  const isNavGroupExpanded = useCallback(
    (id: string) => expandedNavGroups.includes(id),
    [expandedNavGroups]
  )

  const expandAllNavGroups = useCallback(() => {
    // This would need nav group IDs passed in or fetched
    // For now, we leave it as a placeholder that can be wired up
  }, [])

  const collapseAllNavGroups = useCallback(() => {
    setExpandedNavGroups([])
  }, [setExpandedNavGroups])

  // Recent sections
  const [recentSections, setRecentSections] = useLocalStorage<string[]>('recent-sections', [])

  const addRecentSection = useCallback(
    (sectionId: string) => {
      setRecentSections((prev) => {
        // Remove if already exists, then add to front
        const filtered = prev.filter((id) => id !== sectionId)
        return [sectionId, ...filtered].slice(0, 5) // Keep max 5
      })
    },
    [setRecentSections]
  )

  const clearRecentSections = useCallback(() => {
    setRecentSections([])
  }, [setRecentSections])

  // Density preference
  const [density, setDensity] = useLocalStorage<'compact' | 'comfortable' | 'spacious'>(
    'density',
    'comfortable'
  )

  // Reset all state
  const resetShellState = useCallback(() => {
    setSidebarCollapsed(false)
    setExpandedNavGroups([])
    setRecentSections([])
    setDensity('comfortable')
  }, [setSidebarCollapsed, setExpandedNavGroups, setRecentSections, setDensity])

  return {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    expandedNavGroups,
    toggleNavGroup,
    isNavGroupExpanded,
    expandAllNavGroups,
    collapseAllNavGroups,
    recentSections,
    addRecentSection,
    clearRecentSections,
    density,
    setDensity,
    resetShellState,
  }
}
