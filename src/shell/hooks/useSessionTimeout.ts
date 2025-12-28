/**
 * useSessionTimeout - Session inactivity timeout with warning
 *
 * Tracks user activity and triggers callbacks when the user has been
 * inactive for too long. Shows a warning before the final timeout.
 *
 * Usage:
 * const { showWarning, resetTimer, remainingTime } = useSessionTimeout({
 *   timeoutMs: 30 * 60 * 1000, // 30 minutes
 *   warningMs: 5 * 60 * 1000,  // Show warning 5 minutes before
 *   onWarning: () => setShowWarningModal(true),
 *   onTimeout: () => logout(),
 * })
 */

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseSessionTimeoutOptions {
  /** Total timeout duration in milliseconds */
  timeoutMs: number
  /** When to show warning (ms before timeout) */
  warningMs: number
  /** Called when warning threshold is reached */
  onWarning?: () => void
  /** Called when timeout is reached */
  onTimeout?: () => void
  /** Whether timeout tracking is enabled (default: true) */
  enabled?: boolean
  /** Events that reset the timer (default: mouse/keyboard/touch) */
  activityEvents?: string[]
}

interface UseSessionTimeoutReturn {
  /** Whether the warning should be shown */
  showWarning: boolean
  /** Manually reset the timer (e.g., after user acknowledges warning) */
  resetTimer: () => void
  /** Time remaining in milliseconds (0 when not in warning state) */
  remainingTime: number
  /** Whether the session has timed out */
  isTimedOut: boolean
}

const DEFAULT_ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
]

export function useSessionTimeout({
  timeoutMs,
  warningMs,
  onWarning,
  onTimeout,
  enabled = true,
  activityEvents = DEFAULT_ACTIVITY_EVENTS,
}: UseSessionTimeoutOptions): UseSessionTimeoutReturn {
  const [showWarning, setShowWarning] = useState(false)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)

  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(0)

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [])

  const startCountdown = useCallback(() => {
    // Update remaining time every second
    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current
      const remaining = Math.max(0, timeoutMs - elapsed)
      setRemainingTime(remaining)

      if (remaining <= 0) {
        clearTimers()
      }
    }, 1000)
  }, [timeoutMs, clearTimers])

  const resetTimer = useCallback(() => {
    if (!enabled) return

    clearTimers()
    setShowWarning(false)
    setIsTimedOut(false)
    setRemainingTime(0)
    lastActivityRef.current = Date.now()

    // Set warning timer
    const warningDelay = timeoutMs - warningMs
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
      setRemainingTime(warningMs)
      onWarning?.()
      startCountdown()
    }, warningDelay)

    // Set timeout timer
    timeoutTimerRef.current = setTimeout(() => {
      setIsTimedOut(true)
      setShowWarning(false)
      clearTimers()
      onTimeout?.()
    }, timeoutMs)
  }, [enabled, timeoutMs, warningMs, onWarning, onTimeout, clearTimers, startCountdown])

  // Initialize timers on mount
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (!enabled || isInitializedRef.current) return

    // Use requestAnimationFrame to avoid synchronous setState in effect
    const frameId = requestAnimationFrame(() => {
      isInitializedRef.current = true
      lastActivityRef.current = Date.now()

      // Set warning timer
      const warningDelay = timeoutMs - warningMs
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true)
        setRemainingTime(warningMs)
        onWarning?.()
        startCountdown()
      }, warningDelay)

      // Set timeout timer
      timeoutTimerRef.current = setTimeout(() => {
        setIsTimedOut(true)
        setShowWarning(false)
        clearTimers()
        onTimeout?.()
      }, timeoutMs)
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [enabled, timeoutMs, warningMs, onWarning, onTimeout, clearTimers, startCountdown])

  // Handle activity events
  useEffect(() => {
    if (!enabled) return

    const handleActivity = () => {
      // Only reset if not already in warning state
      // If in warning state, require explicit resetTimer call
      if (!showWarning) {
        resetTimer()
      }
    }

    // Throttle activity handling
    let lastHandled = 0
    const throttledHandler = () => {
      const now = Date.now()
      if (now - lastHandled > 1000) {
        lastHandled = now
        handleActivity()
      }
    }

    activityEvents.forEach((event) => {
      window.addEventListener(event, throttledHandler, { passive: true })
    })

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, throttledHandler)
      })
      clearTimers()
    }
  }, [enabled, activityEvents, showWarning, resetTimer, clearTimers])

  return {
    showWarning,
    resetTimer,
    remainingTime,
    isTimedOut,
  }
}

/**
 * Format remaining time as MM:SS
 */
export function formatRemainingTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
