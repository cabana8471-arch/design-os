/**
 * useFocusManagement - Focus trap and restoration for modals/drawers
 *
 * Provides accessible focus management:
 * - Saves focus when modal opens
 * - Traps focus within the modal (Tab cycles through focusable elements)
 * - Restores focus when modal closes
 * - Supports Escape key to close
 *
 * Usage:
 * const { containerRef } = useFocusManagement({
 *   isOpen,
 *   onClose: () => setIsOpen(false),
 * })
 *
 * return (
 *   <div ref={containerRef}>
 *     <Modal content />
 *   </div>
 * )
 */

import { useEffect, useRef, useCallback } from 'react'

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

interface UseFocusManagementOptions {
  /** Whether the modal/drawer is open */
  isOpen: boolean
  /** Called when Escape is pressed */
  onClose?: () => void
  /** Whether to close on Escape key (default: true) */
  closeOnEscape?: boolean
  /** Whether to auto-focus the first element (default: true) */
  autoFocus?: boolean
  /** Whether to restore focus on close (default: true) */
  restoreFocus?: boolean
}

interface UseFocusManagementReturn<T extends HTMLElement> {
  /** Ref to attach to the container element */
  containerRef: React.RefObject<T>
  /** Manually focus the first focusable element */
  focusFirst: () => void
  /** Manually focus the last focusable element */
  focusLast: () => void
}

export function useFocusManagement<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  closeOnEscape = true,
  autoFocus = true,
  restoreFocus = true,
}: UseFocusManagementOptions): UseFocusManagementReturn<T> {
  const containerRef = useRef<T>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return []
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
  }, [])

  // Focus the first focusable element
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[0].focus()
    }
  }, [getFocusableElements])

  // Focus the last focusable element
  const focusLast = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[elements.length - 1].focus()
    }
  }, [getFocusableElements])

  // Save focus when opening, restore when closing
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement

      // Auto-focus first element
      if (autoFocus) {
        // Small delay to ensure container is rendered
        requestAnimationFrame(() => {
          focusFirst()
        })
      }
    } else {
      // Restore focus when closing
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus()
        previousFocusRef.current = null
      }
    }
  }, [isOpen, autoFocus, restoreFocus, focusFirst])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault()
        onClose?.()
        return
      }

      // Handle Tab for focus trap
      if (e.key === 'Tab') {
        const elements = getFocusableElements()
        if (elements.length === 0) return

        const firstElement = elements[0]
        const lastElement = elements[elements.length - 1]

        // Shift+Tab on first element -> focus last
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
        // Tab on last element -> focus first
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEscape, onClose, getFocusableElements])

  return {
    containerRef,
    focusFirst,
    focusLast,
  }
}
