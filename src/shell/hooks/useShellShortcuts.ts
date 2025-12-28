/**
 * useShellShortcuts - Centralized keyboard shortcuts for shell
 *
 * Provides a unified system for global keyboard shortcuts.
 * Handlers are only called when enabled is true (default).
 *
 * Usage:
 * useShellShortcuts({
 *   onSearch: () => setIsSearchOpen(true),
 *   onSettings: () => setIsSettingsOpen(true),
 *   onEscape: closeAllModals,
 * })
 *
 * Standard shortcuts:
 * - Cmd+K / Ctrl+K -> Search
 * - Cmd+B / Ctrl+B -> Toggle Sidebar
 * - Cmd+, / Ctrl+, -> Settings
 * - Cmd+/ / Ctrl+/ -> Help
 * - Escape -> Close current modal/drawer
 * - Alt+1-9 -> Navigate to section 1-9
 */

import { useEffect, useCallback } from 'react'

interface ShortcutHandlers {
  /** Called on Cmd+K / Ctrl+K */
  onSearch?: () => void
  /** Called on Cmd+B / Ctrl+B */
  onToggleSidebar?: () => void
  /** Called on Cmd+, / Ctrl+, */
  onSettings?: () => void
  /** Called on Cmd+/ / Ctrl+/ */
  onHelp?: () => void
  /** Called on Escape */
  onEscape?: () => void
  /** Called on Alt+1-9 with section index */
  onNavigateSection?: (index: number) => void
  /** Called on Cmd+N / Ctrl+N */
  onNotifications?: () => void
}

interface UseShellShortcutsOptions extends ShortcutHandlers {
  /** Whether shortcuts are enabled (default: true) */
  enabled?: boolean
}

export function useShellShortcuts({
  onSearch,
  onToggleSidebar,
  onSettings,
  onHelp,
  onEscape,
  onNavigateSection,
  onNotifications,
  enabled = true,
}: UseShellShortcutsOptions): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      const isMod = e.metaKey || e.ctrlKey
      const isAlt = e.altKey

      // Cmd+K -> Search (always works, even when typing)
      if (isMod && e.key === 'k') {
        e.preventDefault()
        onSearch?.()
        return
      }

      // Escape -> Close (always works)
      if (e.key === 'Escape') {
        onEscape?.()
        return
      }

      // Skip other shortcuts when typing
      if (isTyping) return

      // Cmd+B -> Toggle Sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault()
        onToggleSidebar?.()
        return
      }

      // Cmd+, -> Settings
      if (isMod && e.key === ',') {
        e.preventDefault()
        onSettings?.()
        return
      }

      // Cmd+/ -> Help
      if (isMod && e.key === '/') {
        e.preventDefault()
        onHelp?.()
        return
      }

      // Cmd+N -> Notifications
      if (isMod && e.key === 'n' && !e.shiftKey) {
        e.preventDefault()
        onNotifications?.()
        return
      }

      // Alt+1-9 -> Navigate to section
      if (isAlt && !isMod) {
        const num = parseInt(e.key, 10)
        if (num >= 1 && num <= 9) {
          e.preventDefault()
          onNavigateSection?.(num - 1) // 0-indexed
          return
        }
      }
    },
    [
      enabled,
      onSearch,
      onToggleSidebar,
      onSettings,
      onHelp,
      onEscape,
      onNavigateSection,
      onNotifications,
    ]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}
