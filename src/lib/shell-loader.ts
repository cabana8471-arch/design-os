/**
 * Shell loading and parsing utilities
 */

import type { ShellSpec, ShellInfo } from '@/types/product'
import type { ComponentType, ReactNode } from 'react'

// Load shell spec markdown file at build time
// Note: import.meta.glob with eager:true loads all matching files at build time.
// Files are loaded as raw strings; validation happens in parse functions.
const shellSpecFiles = import.meta.glob('/product/shell/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * Validate that loaded markdown content is a non-empty string
 * Returns true if valid, logs warning and returns false if malformed
 */
function validateShellSpecContent(content: unknown, path: string): content is string {
  if (content === null || content === undefined) {
    if (import.meta.env.DEV) {
      console.warn(`[shell-loader] File at ${path} is null or undefined`)
    }
    return false
  }
  if (typeof content !== 'string') {
    if (import.meta.env.DEV) {
      console.warn(`[shell-loader] File at ${path} is not a string (got ${typeof content})`)
    }
    return false
  }
  if (content.trim().length === 0) {
    if (import.meta.env.DEV) {
      console.warn(`[shell-loader] File at ${path} is empty`)
    }
    return false
  }
  return true
}

// Load shell components lazily
const shellComponentModules = import.meta.glob('/src/shell/components/*.tsx') as Record<
  string,
  () => Promise<{ default: ComponentType }>
>

// Load shell preview component lazily
const shellPreviewModules = import.meta.glob('/src/shell/*.tsx') as Record<
  string,
  () => Promise<{ default: ComponentType }>
>

/**
 * Parse shell spec.md content into ShellSpec structure
 *
 * Expected format:
 * # Application Shell Specification
 *
 * ## Overview
 * Description of the shell design
 *
 * ## Navigation Structure
 * - Nav Item 1 → Section
 * - Nav Item 2 → Section
 *
 * ## Layout Pattern
 * Description of layout (sidebar, top nav, etc.)
 */
export function parseShellSpec(md: string): ShellSpec | null {
  if (!md || !md.trim()) return null

  // Track validation warnings (reported in DEV mode) - consistent with section-loader.ts
  const warnings: string[] = []

  try {
    // Extract overview
    const overviewMatch = md.match(/## Overview\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)
    const overview = overviewMatch?.[1]?.trim() || ''

    if (!overviewMatch) {
      warnings.push('Missing "## Overview" section')
    } else if (!overview) {
      warnings.push('"## Overview" section is empty')
    }

    // Extract navigation items
    const navSection = md.match(/## Navigation Structure\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)
    const navigationItems: string[] = []

    if (navSection?.[1]) {
      const lines = navSection[1].split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('- ')) {
          navigationItems.push(trimmed.slice(2).trim())
        }
      }
    }

    if (!navSection) {
      warnings.push('Missing "## Navigation Structure" section')
    } else if (navigationItems.length === 0) {
      warnings.push('"## Navigation Structure" section has no bullet items (expected "- Nav Item → Section")')
    }

    // Extract layout pattern
    const layoutMatch = md.match(/## Layout Pattern\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)
    const layoutPattern = layoutMatch?.[1]?.trim() || ''

    if (!layoutMatch) {
      warnings.push('Missing "## Layout Pattern" section')
    } else if (!layoutPattern) {
      warnings.push('"## Layout Pattern" section is empty')
    }

    // Report validation warnings in DEV mode - consistent with section-loader.ts
    if (import.meta.env.DEV && warnings.length > 0) {
      console.warn('[shell-loader] spec.md validation:')
      warnings.forEach(w => console.warn(`  - ${w}`))
    }

    // Return null if we couldn't parse anything meaningful
    if (!overview && navigationItems.length === 0 && !layoutPattern) {
      return null
    }

    return {
      raw: md,
      overview,
      navigationItems,
      layoutPattern,
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[shell-loader] Failed to parse shell spec.md:', error)
    }
    return null
  }
}

/**
 * Check if shell components exist
 *
 * Note: The DEV-mode logging below is intentional and NOT dead code.
 * It helps debug shell component discovery issues during development,
 * especially when AppShell.tsx exists but isn't being detected due to
 * path mismatches or import.meta.glob timing issues.
 *
 * The logging only runs in development mode (import.meta.env.DEV) and
 * is stripped from production builds by Vite.
 */
export function hasShellComponents(): boolean {
  // Check if AppShell.tsx exists
  const exists = '/src/shell/components/AppShell.tsx' in shellComponentModules
  // DEV-only: Log shell component discovery for debugging path resolution issues
  // Justification: Helps diagnose why shell components aren't detected when expected
  if (import.meta.env.DEV) {
    console.log('[Shell] hasShellComponents check:', {
      exists,
      availableComponents: Object.keys(shellComponentModules),
      lookingFor: '/src/shell/components/AppShell.tsx'
    })
  }
  return exists
}

/**
 * Load shell component dynamically
 */
export function loadShellComponent(
  componentName: string
): (() => Promise<{ default: ComponentType }>) | null {
  const path = `/src/shell/components/${componentName}.tsx`
  return shellComponentModules[path] || null
}

/**
 * Load AppShell component that can wrap content
 *
 * Note: This function loads AppShell.tsx directly. The previous ShellWrapper.tsx
 * fallback was removed to align with the documented shell component structure
 * (AppShell.tsx, MainNav.tsx, UserMenu.tsx) per design-shell.md specifications.
 *
 * Type Safety: The type assertion assumes AppShell accepts a children prop.
 * This is validated at runtime in ScreenDesignPage.tsx where the component
 * is actually used. If the component doesn't accept children, the shell
 * wrapper in ScreenDesignPage will gracefully fall back to a passthrough.
 */
export function loadAppShell(): (() => Promise<{ default: ComponentType<{ children?: ReactNode }> }>) | null {
  const path = '/src/shell/components/AppShell.tsx'
  const loader = shellComponentModules[path]

  // Validate module exists before type assertion
  if (!loader) {
    if (import.meta.env.DEV) {
      console.log('[shell-loader] AppShell.tsx not found at:', path)
    }
    return null
  }

  // Type assertion is safe because:
  // 1. We've verified the loader exists
  // 2. Runtime validation happens in ScreenDesignPage.tsx
  return loader as () => Promise<{ default: ComponentType<{ children?: ReactNode }> }>
}

/**
 * Load shell preview wrapper dynamically
 */
export function loadShellPreview(): (() => Promise<{ default: ComponentType }>) | null {
  return shellPreviewModules['/src/shell/ShellPreview.tsx'] || null
}

/**
 * Load the complete shell info
 */
export function loadShellInfo(): ShellInfo | null {
  const specPath = '/product/shell/spec.md'
  const specContent = shellSpecFiles[specPath]

  // Validate content before parsing
  const validSpec = validateShellSpecContent(specContent, specPath) ? specContent : null
  const spec = validSpec ? parseShellSpec(validSpec) : null
  const hasComponents = hasShellComponents()

  // Return null if neither spec nor components exist
  if (!spec && !hasComponents) {
    return null
  }

  return { spec, hasComponents }
}

/**
 * Check if shell has been defined (spec or components)
 */
export function hasShell(): boolean {
  return hasShellSpec() || hasShellComponents()
}

/**
 * Check if shell spec has been defined
 */
export function hasShellSpec(): boolean {
  return '/product/shell/spec.md' in shellSpecFiles
}

/**
 * Get list of shell component names
 */
export function getShellComponentNames(): string[] {
  const names: string[] = []
  for (const path of Object.keys(shellComponentModules)) {
    const match = path.match(/\/src\/shell\/components\/([^/]+)\.tsx$/)
    if (match) {
      names.push(match[1])
    }
  }
  return names
}
