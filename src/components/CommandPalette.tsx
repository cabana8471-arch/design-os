/**
 * Command Palette - Quick navigation and search
 *
 * Press ⌘K (Mac) or Ctrl+K (Windows) to open.
 * Features:
 * - Quick navigation to any page
 * - Fuzzy search for sections
 * - Theme toggle shortcut
 */

import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import {
  FileText,
  Database,
  Palette,
  Layout,
  Package,
  ArrowRight,
  Moon,
  Sun,
  PanelTop,
  Search,
} from 'lucide-react'
import { loadProductData } from '@/lib/product-loader'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()

  // Load product data for sections (memoized to avoid recalculation)
  const productData = useMemo(() => loadProductData(), [])

  const handleSelect = useCallback(
    (value: string) => {
      onOpenChange(false)

      // Handle theme toggle
      if (value === 'theme-light') {
        localStorage.setItem('theme', 'light')
        document.documentElement.classList.remove('dark')
        return
      }
      if (value === 'theme-dark') {
        localStorage.setItem('theme', 'dark')
        document.documentElement.classList.add('dark')
        return
      }
      if (value === 'theme-system') {
        localStorage.setItem('theme', 'system')
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', systemDark)
        return
      }

      // Navigate to page
      navigate(value)
    },
    [navigate, onOpenChange]
  )

  const sections = productData?.roadmap?.sections || []

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command Palette"
      className={cn(
        'fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg',
        'bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700',
        'overflow-hidden z-50'
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-200 dark:border-stone-700">
        <Search className="w-4 h-4 text-stone-400" strokeWidth={2} />
        <Command.Input
          placeholder="Search or navigate..."
          className={cn(
            'flex-1 bg-transparent outline-none',
            'text-stone-900 dark:text-stone-100 placeholder:text-stone-400'
          )}
        />
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-stone-500 bg-stone-100 dark:bg-stone-800 rounded">
          esc
        </kbd>
      </div>

      <Command.List className="max-h-[300px] overflow-auto p-2">
        <Command.Empty className="py-6 text-center text-stone-500 dark:text-stone-400">
          No results found.
        </Command.Empty>

        {/* Navigation */}
        <Command.Group
          heading="Navigation"
          className="text-xs font-medium text-stone-500 dark:text-stone-400 px-2 py-1.5"
        >
          <CommandItem value="/" icon={<FileText className="w-4 h-4" />} onSelect={handleSelect}>
            Product Overview
          </CommandItem>
          <CommandItem value="/data-model" icon={<Database className="w-4 h-4" />} onSelect={handleSelect}>
            Data Model
          </CommandItem>
          <CommandItem value="/design" icon={<Palette className="w-4 h-4" />} onSelect={handleSelect}>
            Design System
          </CommandItem>
          <CommandItem value="/sections" icon={<Layout className="w-4 h-4" />} onSelect={handleSelect}>
            Sections
          </CommandItem>
          <CommandItem value="/shell/design" icon={<PanelTop className="w-4 h-4" />} onSelect={handleSelect}>
            Shell Design
          </CommandItem>
          <CommandItem value="/export" icon={<Package className="w-4 h-4" />} onSelect={handleSelect}>
            Export
          </CommandItem>
        </Command.Group>

        {/* Sections */}
        {sections.length > 0 && (
          <Command.Group
            heading="Sections"
            className="text-xs font-medium text-stone-500 dark:text-stone-400 px-2 py-1.5"
          >
            {sections.map((section) => (
              <CommandItem
                key={section.id}
                value={`/sections/${section.id}`}
                icon={<ArrowRight className="w-4 h-4" />}
                onSelect={handleSelect}
              >
                {section.title}
              </CommandItem>
            ))}
          </Command.Group>
        )}

        {/* Theme */}
        <Command.Group
          heading="Theme"
          className="text-xs font-medium text-stone-500 dark:text-stone-400 px-2 py-1.5"
        >
          <CommandItem value="theme-light" icon={<Sun className="w-4 h-4" />} onSelect={handleSelect}>
            Light Mode
          </CommandItem>
          <CommandItem value="theme-dark" icon={<Moon className="w-4 h-4" />} onSelect={handleSelect}>
            Dark Mode
          </CommandItem>
          <CommandItem value="theme-system" icon={<Sun className="w-4 h-4" />} onSelect={handleSelect}>
            System Theme
          </CommandItem>
        </Command.Group>
      </Command.List>

      <div className="px-4 py-2 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-4">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">↑↓</kbd>
          navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">↵</kbd>
          select
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">esc</kbd>
          close
        </span>
      </div>
    </Command.Dialog>
  )
}

interface CommandItemProps {
  value: string
  icon: React.ReactNode
  children: React.ReactNode
  onSelect: (value: string) => void
}

function CommandItem({ value, icon, children, onSelect }: CommandItemProps) {
  return (
    <Command.Item
      value={value}
      onSelect={() => onSelect(value)}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer',
        'text-stone-700 dark:text-stone-300',
        'data-[selected=true]:bg-stone-100 dark:data-[selected=true]:bg-stone-800'
      )}
    >
      <span className="text-stone-400 dark:text-stone-500">{icon}</span>
      <span>{children}</span>
    </Command.Item>
  )
}
