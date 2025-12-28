/**
 * Shell loading and parsing utilities
 */

import type { ShellSpec, ShellInfo } from '@/types/product'
import type { ComponentType, ReactNode } from 'react'

// ============================================================================
// Shell Props Types (for complete passthrough pattern)
// ============================================================================

/**
 * Context selector configuration (organization/client/workspace picker)
 */
export interface ContextSelectorConfig {
  type: 'organization' | 'client' | 'workspace' | 'project'
  label: string
  position: 'header-left' | 'sidebar-top' | 'sidebar-bottom'
  items: Array<{ id: string; name: string; icon?: string }>
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}

/**
 * Breadcrumb configuration with default and per-section paths
 */
export interface BreadcrumbConfig {
  mode: 'auto' | 'manual' | 'none'
  default: BreadcrumbItem[]
  sections: Record<string, BreadcrumbItem[]>
}

/**
 * Header action button/control
 */
export interface HeaderAction {
  id: string
  icon: string
  label?: string
  badge?: boolean | number
  type?: 'button' | 'search' | 'dropdown'
  href?: string
}

/**
 * User configuration
 */
export interface UserConfig {
  id: string
  name: string
  email: string
  avatar?: string
}

/**
 * Navigation category
 */
export interface NavigationCategory {
  id: string
  label: string
  items: Array<{ id: string; label: string; href: string; icon?: string }>
}

/**
 * Complete shell props - all properties that can be passed to AppShell
 * This interface is used for the complete passthrough pattern
 */
export interface ShellProps {
  // Navigation
  categories?: NavigationCategory[]

  // User
  user?: UserConfig

  // Context selector (organization/client/workspace picker)
  contextSelector?: ContextSelectorConfig

  // Breadcrumbs
  breadcrumbs?: BreadcrumbItem[]

  // Header elements
  headerActions?: HeaderAction[]

  // Layout
  sidebarCollapsed?: boolean
  layoutVariant?: 'sidebar' | 'topnav' | 'minimal'

  // View context (added by ScreenDesignPage)
  currentSection?: string
  currentView?: string

  // Allow any additional props from spec
  [key: string]: unknown
}

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

// ============================================================================
// Shell Props Parsing (for complete passthrough pattern)
// ============================================================================

/**
 * Parse context selector from shell spec
 *
 * Expected format in spec.md:
 * ## Context Selector
 * type: organization
 * label: "Select Organization"
 * position: header-left
 * items:
 *   - { id: "org-1", name: "Acme Corp", icon: "building" }
 *   - { id: "org-2", name: "Globex Inc", icon: "building" }
 */
function parseContextSelector(md: string): ContextSelectorConfig | undefined {
  const sectionMatch = md.match(/## Context Selector\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)
  if (!sectionMatch) return undefined

  const content = sectionMatch[1]

  // Parse type
  const typeMatch = content.match(/type:\s*(\w+)/i)
  const type = (typeMatch?.[1] as ContextSelectorConfig['type']) || 'organization'

  // Parse label
  const labelMatch = content.match(/label:\s*"?([^"\n]+)"?/i)
  const label = labelMatch?.[1]?.trim() || 'Select Organization'

  // Parse position
  const positionMatch = content.match(/position:\s*([\w-]+)/i)
  const position = (positionMatch?.[1] as ContextSelectorConfig['position']) || 'header-left'

  // Parse items
  const items: ContextSelectorConfig['items'] = []
  const itemLines = content.split('\n')
  for (const line of itemLines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('-') && trimmed.includes('id:')) {
      const idMatch = trimmed.match(/id:\s*"([^"]+)"/)
      const nameMatch = trimmed.match(/name:\s*"([^"]+)"/)
      const iconMatch = trimmed.match(/icon:\s*"([^"]+)"/)
      if (idMatch && nameMatch) {
        items.push({
          id: idMatch[1],
          name: nameMatch[1],
          icon: iconMatch?.[1]
        })
      }
    }
  }

  // If no items parsed, provide sample data for preview
  if (items.length === 0) {
    items.push(
      { id: 'org-1', name: 'Acme Corporation', icon: 'building' },
      { id: 'org-2', name: 'Globex Inc', icon: 'building' }
    )
  }

  return { type, label, position, items }
}

/**
 * Parse breadcrumbs configuration from shell spec
 *
 * Expected format in spec.md:
 * ## Breadcrumbs
 * mode: manual
 * default:
 *   - { label: "Home", href: "/" }
 * sections:
 *   invoices:
 *     - { label: "Billing", href: "/billing" }
 *     - { label: "Invoices", href: "/sections/invoices" }
 */
function parseBreadcrumbConfig(md: string): BreadcrumbConfig | undefined {
  const sectionMatch = md.match(/## Breadcrumbs\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)
  if (!sectionMatch) return undefined

  const content = sectionMatch[1]

  // Parse mode
  const modeMatch = content.match(/mode:\s*(\w+)/i)
  const mode = (modeMatch?.[1] as BreadcrumbConfig['mode']) || 'manual'

  // Parse default breadcrumbs
  const defaultBreadcrumbs: BreadcrumbItem[] = []
  const defaultMatch = content.match(/default:\s*\n([\s\S]*?)(?=sections:|$)/i)
  if (defaultMatch) {
    const lines = defaultMatch[1].split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('-') && trimmed.includes('label:')) {
        const labelMatch = trimmed.match(/label:\s*"([^"]+)"/)
        const hrefMatch = trimmed.match(/href:\s*"([^"]+)"/)
        if (labelMatch) {
          defaultBreadcrumbs.push({
            label: labelMatch[1],
            href: hrefMatch?.[1]
          })
        }
      }
    }
  }

  // If no defaults, use Home
  if (defaultBreadcrumbs.length === 0) {
    defaultBreadcrumbs.push({ label: 'Home', href: '/' })
  }

  // Parse per-section breadcrumbs
  const sections: Record<string, BreadcrumbItem[]> = {}
  const sectionsMatch = content.match(/sections:\s*\n([\s\S]*)$/i)
  if (sectionsMatch) {
    const sectionsContent = sectionsMatch[1]
    // Match section ID followed by breadcrumb items
    const sectionPattern = /(\w[\w-]*):\s*\n((?:\s+-[^\n]+\n?)+)/g
    let match
    while ((match = sectionPattern.exec(sectionsContent)) !== null) {
      const sectionId = match[1]
      const itemsContent = match[2]
      const sectionBreadcrumbs: BreadcrumbItem[] = []

      const lines = itemsContent.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('-') && trimmed.includes('label:')) {
          const labelMatch = trimmed.match(/label:\s*"([^"]+)"/)
          const hrefMatch = trimmed.match(/href:\s*"([^"]+)"/)
          if (labelMatch) {
            sectionBreadcrumbs.push({
              label: labelMatch[1],
              href: hrefMatch?.[1]
            })
          }
        }
      }

      if (sectionBreadcrumbs.length > 0) {
        sections[sectionId] = sectionBreadcrumbs
      }
    }
  }

  return { mode, default: defaultBreadcrumbs, sections }
}

/**
 * Parse header actions from shell spec
 *
 * Expected format in spec.md:
 * ## Header Actions
 * - { id: "notifications", icon: "bell", badge: true }
 * - { id: "search", icon: "search" }
 * - { id: "help", icon: "help-circle", label: "Help" }
 */
function parseHeaderActions(md: string): HeaderAction[] | undefined {
  const sectionMatch = md.match(/## Header Actions\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)
  if (!sectionMatch) return undefined

  const content = sectionMatch[1]
  const actions: HeaderAction[] = []

  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('-') && trimmed.includes('id:')) {
      const idMatch = trimmed.match(/id:\s*"([^"]+)"/)
      const iconMatch = trimmed.match(/icon:\s*"([^"]+)"/)
      const labelMatch = trimmed.match(/label:\s*"([^"]+)"/)
      const badgeMatch = trimmed.match(/badge:\s*(true|\d+)/)
      const typeMatch = trimmed.match(/type:\s*"?(\w+)"?/)
      const hrefMatch = trimmed.match(/href:\s*"([^"]+)"/)

      if (idMatch && iconMatch) {
        actions.push({
          id: idMatch[1],
          icon: iconMatch[1],
          label: labelMatch?.[1],
          badge: badgeMatch
            ? (badgeMatch[1] === 'true' ? true : parseInt(badgeMatch[1]))
            : undefined,
          type: typeMatch?.[1] as HeaderAction['type'],
          href: hrefMatch?.[1]
        })
      }
    }
  }

  return actions.length > 0 ? actions : undefined
}

/**
 * Parse layout variant from shell spec
 *
 * Expected format in spec.md:
 * ## Layout Pattern
 * variant: sidebar
 * (or just description text - we'll try to infer)
 */
function parseLayoutVariant(md: string): ShellProps['layoutVariant'] | undefined {
  const sectionMatch = md.match(/## Layout Pattern\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)
  if (!sectionMatch) return undefined

  const content = sectionMatch[1].toLowerCase()

  // Check for explicit variant
  const variantMatch = content.match(/variant:\s*(\w+)/i)
  if (variantMatch) {
    const variant = variantMatch[1] as ShellProps['layoutVariant']
    if (['sidebar', 'topnav', 'minimal'].includes(variant)) {
      return variant
    }
  }

  // Try to infer from description
  if (content.includes('sidebar')) return 'sidebar'
  if (content.includes('top nav') || content.includes('topnav') || content.includes('horizontal')) return 'topnav'
  if (content.includes('minimal') || content.includes('simple')) return 'minimal'

  return undefined
}

/**
 * Get all shell props from spec - complete passthrough
 *
 * This is the main function for the passthrough pattern.
 * ScreenDesignPage calls this and spreads the result to AppShell:
 *
 * ```tsx
 * const shellProps = getShellProps(sectionId)
 * return <AppShell {...shellProps}>{children}</AppShell>
 * ```
 *
 * When you add new features to AppShell:
 * 1. Add the type to ShellProps interface
 * 2. Add a parser function for the new section
 * 3. Include it in the return object here
 * 4. ScreenDesignPage automatically passes it (no changes needed there)
 *
 * @param sectionId - Current section ID (for section-specific breadcrumbs)
 * @param viewName - Current view name (for breadcrumb display)
 * @returns All shell props parsed from spec.md
 */
export function getShellProps(sectionId?: string, viewName?: string): ShellProps {
  const specPath = '/product/shell/spec.md'
  const specContent = shellSpecFiles[specPath]

  // Return empty props if no spec exists
  if (!validateShellSpecContent(specContent, specPath)) {
    return {}
  }

  const md = specContent

  // Parse all sections from spec
  const contextSelector = parseContextSelector(md)
  const breadcrumbConfig = parseBreadcrumbConfig(md)
  const headerActions = parseHeaderActions(md)
  const layoutVariant = parseLayoutVariant(md)

  // Build breadcrumbs array for current section
  let breadcrumbs: BreadcrumbItem[] | undefined
  if (breadcrumbConfig && breadcrumbConfig.mode !== 'none') {
    // Start with section-specific breadcrumbs if available, otherwise use defaults
    if (sectionId && breadcrumbConfig.sections[sectionId]) {
      breadcrumbs = [...breadcrumbConfig.sections[sectionId]]
    } else {
      breadcrumbs = [...breadcrumbConfig.default]
    }

    // Add current view as final breadcrumb if provided
    if (viewName) {
      breadcrumbs.push({ label: viewName })
    }
  }

  // Build and return complete props object
  const props: ShellProps = {}

  // Only include defined values (avoid undefined spreading)
  if (contextSelector) props.contextSelector = contextSelector
  if (breadcrumbs && breadcrumbs.length > 0) props.breadcrumbs = breadcrumbs
  if (headerActions) props.headerActions = headerActions
  if (layoutVariant) props.layoutVariant = layoutVariant

  // Add view context
  if (sectionId) props.currentSection = sectionId
  if (viewName) props.currentView = viewName

  if (import.meta.env.DEV) {
    console.log('[shell-loader] getShellProps:', {
      sectionId,
      viewName,
      hasContextSelector: !!contextSelector,
      breadcrumbsCount: breadcrumbs?.length ?? 0,
      headerActionsCount: headerActions?.length ?? 0,
      layoutVariant
    })
  }

  return props
}
