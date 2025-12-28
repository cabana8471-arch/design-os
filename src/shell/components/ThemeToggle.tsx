/**
 * ThemeToggle - Theme switcher with light/dark/system options
 *
 * Provides a dropdown to switch between light, dark, and system theme.
 * Works with the anti-flicker script that should be in index.html <head>.
 *
 * IMPORTANT: For no-flicker on page load, add this script FIRST in <head>:
 *
 * <script>
 *   (function() {
 *     try {
 *       var theme = localStorage.getItem('theme') || 'system';
 *       var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
 *       if (theme === 'dark' || (theme === 'system' && systemDark)) {
 *         document.documentElement.classList.add('dark');
 *       }
 *     } catch (e) {}
 *   })();
 * </script>
 *
 * Usage:
 * <ThemeToggle />
 */

import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Theme = 'light' | 'dark' | 'system'

interface ThemeToggleProps {
  /** Size of the toggle button (default: "icon") */
  size?: 'icon' | 'sm' | 'default'
  /** Additional class names */
  className?: string
}

export function ThemeToggle({ size = 'icon', className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system'
    }
    return 'system'
  })

  // Apply theme when it changes
  useEffect(() => {
    const root = document.documentElement
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (theme === 'dark' || (theme === 'system' && systemDark)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} className={className}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            <span>{label}</span>
            {theme === value && (
              <Check className="ml-auto h-4 w-4 text-lime-600" strokeWidth={2} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
