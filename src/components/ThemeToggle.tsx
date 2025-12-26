/**
 * ThemeToggle Component - Theme Persistence System
 *
 * This component manages the Design OS light/dark theme with localStorage persistence.
 *
 * ## How Theme Syncing Works
 *
 * 1. **Initial Load**: Reads theme from `localStorage.getItem('theme')`, defaults to 'system'
 * 2. **Theme Application**: Adds/removes `dark` class on `document.documentElement`
 * 3. **Persistence**: Saves preference to localStorage on every change
 * 4. **System Mode**: When 'system', follows OS preference via `prefers-color-scheme` media query
 *
 * ## Theme Cycle
 * Click cycles through: light → dark → system → light
 *
 * ## Integration with Screen Designs
 * Screen designs rendered in iframes inherit the theme through:
 * - CSS custom properties propagated from the parent
 * - The iframe content reads the same localStorage key
 * - The ScreenDesignPage component syncs theme to iframes on load
 *
 * ## localStorage Key
 * - Key: 'theme'
 * - Values: 'light' | 'dark' | 'system'
 */
import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Theme = 'light' | 'dark' | 'system'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system'
    }
    return 'system'
  })

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (theme: Theme) => {
      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', systemDark)
      } else {
        root.classList.toggle('dark', theme === 'dark')
      }
    }

    applyTheme(theme)
    localStorage.setItem('theme', theme)

    // Listen for system theme changes when in system mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'system'
      return 'light'
    })
  }

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-8 h-8 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
      title={`Theme: ${theme}`}
    >
      {isDark ? (
        <Moon className="w-4 h-4" strokeWidth={1.5} />
      ) : (
        <Sun className="w-4 h-4" strokeWidth={1.5} />
      )}
    </Button>
  )
}
