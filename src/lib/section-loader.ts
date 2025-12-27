/**
 * Section data loading utilities for spec.md, data.json, and screen designs
 *
 * File structure:
 * - product/sections/[section-id]/spec.md     - Section specification
 * - product/sections/[section-id]/data.json   - Sample data
 * - src/sections/[section-id]/[PageName].tsx  - Screen design pages
 */

import type { SectionData, ParsedSpec, ScreenDesignInfo, ScreenshotInfo } from '@/types/section'
import type { ComponentType } from 'react'

// Load spec.md files from product/sections at build time
const specFiles = import.meta.glob('/product/sections/*/spec.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Load data.json files from product/sections at build time
// Note: import.meta.glob with eager:true loads all matching files at build time.
// Malformed JSON will cause build errors, but missing keys are handled gracefully.
const dataFiles = import.meta.glob('/product/sections/*/data.json', {
  eager: true,
}) as Record<string, { default: Record<string, unknown> }>

/**
 * Validate that loaded data.json content has expected structure
 * Returns true if valid, logs warning and returns false if malformed
 */
function validateDataFileContent(data: unknown, path: string): data is Record<string, unknown> {
  if (data === null || data === undefined) {
    if (import.meta.env.DEV) {
      console.warn(`[section-loader] Data file at ${path} is null or undefined`)
    }
    return false
  }
  if (typeof data !== 'object' || Array.isArray(data)) {
    if (import.meta.env.DEV) {
      console.warn(`[section-loader] Data file at ${path} is not an object (got ${Array.isArray(data) ? 'array' : typeof data})`)
    }
    return false
  }
  return true
}

/**
 * Load screen design components from src/sections lazily
 *
 * Type safety note: ComponentType<Record<string, unknown>> indicates these are
 * React components that accept arbitrary props. This is intentional since:
 * - Screen design components define their own prop interfaces in types.ts
 * - Props are passed dynamically at runtime based on data.json content
 * - The actual prop validation happens at the component level
 */
const screenDesignModules = import.meta.glob('/src/sections/*/*.tsx') as Record<
  string,
  () => Promise<{ default: ComponentType<Record<string, unknown>> }>
>

// Load screenshot files from product/sections at build time
const screenshotFiles = import.meta.glob('/product/sections/*/*.png', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * Extract section ID from a product/sections file path
 * e.g., "/product/sections/invoices/spec.md" -> "invoices"
 */
function extractSectionIdFromProduct(path: string): string | null {
  const match = path.match(/\/product\/sections\/([^/]+)\//)
  return match?.[1] || null
}

/**
 * Extract section ID from a src/sections file path
 * e.g., "/src/sections/invoices/InvoiceList.tsx" -> "invoices"
 */
function extractSectionIdFromSrc(path: string): string | null {
  const match = path.match(/\/src\/sections\/([^/]+)\//)
  return match?.[1] || null
}

/**
 * Extract screen design name from a file path
 * e.g., "/src/sections/invoices/InvoiceList.tsx" -> "InvoiceList"
 */
function extractScreenDesignName(path: string): string | null {
  const match = path.match(/\/src\/sections\/[^/]+\/([^/]+)\.tsx$/)
  return match?.[1] || null
}

/**
 * Extract screenshot name from a file path
 * e.g., "/product/sections/invoices/invoice-list.png" -> "invoice-list"
 */
function extractScreenshotName(path: string): string | null {
  const match = path.match(/\/product\/sections\/[^/]+\/([^/]+)\.png$/)
  return match?.[1] || null
}

/**
 * Parse spec.md content into ParsedSpec structure
 *
 * Expected format:
 * # Section Specification
 *
 * ## Overview
 * [Brief description of the section]
 *
 * ## User Flows
 * - Flow 1
 * - Flow 2
 *
 * ## UI Requirements
 * - Requirement 1
 * - Requirement 2
 *
 * ## Configuration (optional)
 * - shell: false (to disable app shell wrapping for this section's screen designs)
 *
 * Validation mode: In development, logs warnings when expected sections are missing or empty.
 * This helps catch malformed spec files that would silently produce empty data.
 */
export function parseSpec(md: string): ParsedSpec | null {
  if (!md || !md.trim()) return null

  // Track validation warnings (reported in DEV mode)
  const warnings: string[] = []

  try {
    // Extract title from first # heading
    const titleMatch = md.match(/^#\s+(.+)$/m)
    const title = titleMatch?.[1]?.trim() || 'Section Specification'

    if (!titleMatch) {
      warnings.push('Missing top-level # heading (using default title)')
    }

    // Extract overview - content between ## Overview and next ##
    const overviewMatch = md.match(/## Overview\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)
    const overview = overviewMatch?.[1]?.trim() || ''

    if (!overviewMatch) {
      warnings.push('Missing "## Overview" section')
    } else if (!overview) {
      warnings.push('"## Overview" section is empty')
    }

    // Extract user flows - bullet list after ## User Flows
    const userFlowsSection = md.match(/## User Flows\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)
    const userFlows: string[] = []

    if (userFlowsSection?.[1]) {
      const lines = userFlowsSection[1].split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('- ')) {
          userFlows.push(trimmed.slice(2).trim())
        }
      }
    }

    if (!userFlowsSection) {
      warnings.push('Missing "## User Flows" section')
    } else if (userFlows.length === 0) {
      warnings.push('"## User Flows" section has no bullet items (expected "- Flow name")')
    }

    // Extract UI requirements - bullet list after ## UI Requirements
    const uiReqSection = md.match(/## UI Requirements\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)
    const uiRequirements: string[] = []

    if (uiReqSection?.[1]) {
      const lines = uiReqSection[1].split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('- ')) {
          uiRequirements.push(trimmed.slice(2).trim())
        }
      }
    }

    if (!uiReqSection) {
      warnings.push('Missing "## UI Requirements" section')
    } else if (uiRequirements.length === 0) {
      warnings.push('"## UI Requirements" section has no bullet items (expected "- Requirement")')
    }

    // Report validation warnings in DEV mode
    if (import.meta.env.DEV && warnings.length > 0) {
      console.warn(`[section-loader] spec.md validation (${title}):`)
      warnings.forEach(w => console.warn(`  - ${w}`))
    }

    // Extract configuration - check for shell: false
    // First, try to find a Configuration section to limit scope
    const configSection = md.match(/## Configuration\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)

    // Look for "shell: false" or "- shell: false"
    // Priority: Check Configuration section first, then fall back to document-wide search
    // This reduces false positives from code blocks or prose mentioning "shell: false"
    let shellDisabled = false
    if (configSection?.[1]) {
      // Prefer Configuration section match
      shellDisabled = /^\s*-?\s*shell\s*:\s*false/im.test(configSection[1])
    } else {
      // Fall back to document-wide search (for backwards compatibility)
      // Only match at start of line to avoid matching in code blocks or inline text
      shellDisabled = /^-?\s*shell\s*:\s*false/im.test(md)
    }
    const useShell = !shellDisabled

    return { title, overview, userFlows, uiRequirements, useShell }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[section-loader] Failed to parse spec.md:', error)
    }
    return null
  }
}

/**
 * Get screen designs for a specific section
 */
export function getSectionScreenDesigns(sectionId: string): ScreenDesignInfo[] {
  const screenDesigns: ScreenDesignInfo[] = []
  const prefix = `/src/sections/${sectionId}/`

  for (const path of Object.keys(screenDesignModules)) {
    if (path.startsWith(prefix)) {
      const name = extractScreenDesignName(path)
      if (name) {
        screenDesigns.push({
          name,
          path,
          componentName: name,
        })
      }
    }
  }

  return screenDesigns
}

/**
 * Get screenshots for a specific section
 */
export function getSectionScreenshots(sectionId: string): ScreenshotInfo[] {
  const screenshots: ScreenshotInfo[] = []
  const prefix = `/product/sections/${sectionId}/`

  for (const [path, url] of Object.entries(screenshotFiles)) {
    if (path.startsWith(prefix)) {
      const name = extractScreenshotName(path)
      if (name) {
        screenshots.push({
          name,
          path,
          url,
        })
      }
    }
  }

  return screenshots
}

/**
 * Load screen design component dynamically
 *
 * Returns a lazy-load function that resolves to the component module.
 * The component accepts Record<string, unknown> props since actual
 * prop types are defined per-component in types.ts.
 *
 * @param sectionId - The section folder name (e.g., "invoices")
 * @param screenDesignName - The component file name without extension (e.g., "InvoiceList")
 * @returns A lazy-load function or null if component not found
 */
export function loadScreenDesignComponent(
  sectionId: string,
  screenDesignName: string
): (() => Promise<{ default: ComponentType<Record<string, unknown>> }>) | null {
  const path = `/src/sections/${sectionId}/${screenDesignName}.tsx`
  const loader = screenDesignModules[path]

  if (!loader && import.meta.env.DEV) {
    const MAX_PATHS_SHOWN = 10
    const availablePaths = Object.keys(screenDesignModules)
      .filter((p) => p.includes(`/src/sections/${sectionId}/`))
    const totalCount = availablePaths.length
    const shownPaths = availablePaths.slice(0, MAX_PATHS_SHOWN)
    const remaining = totalCount - shownPaths.length

    let pathsMessage = shownPaths.map((p) => `  - ${p}`).join('\n') || '  (none)'
    if (remaining > 0) {
      pathsMessage += `\n  ... and ${remaining} more`
    }

    console.warn(
      `[section-loader] Screen design component not found: ${path}\n` +
        `Available paths for section "${sectionId}" (${totalCount} total):\n` +
        pathsMessage
    )
  }

  return loader || null
}

/**
 * Load all data for a specific section
 */
export function loadSectionData(sectionId: string): SectionData {
  const specPath = `/product/sections/${sectionId}/spec.md`
  const dataPath = `/product/sections/${sectionId}/data.json`

  const specContent = specFiles[specPath] || null
  const dataModule = dataFiles[dataPath]

  // Validate data.json content before using
  let data: Record<string, unknown> | null = null
  if (dataModule?.default) {
    if (validateDataFileContent(dataModule.default, dataPath)) {
      data = dataModule.default
    }
  }

  const screenDesigns = getSectionScreenDesigns(sectionId)
  const screenshots = getSectionScreenshots(sectionId)

  // Determine if any artifacts exist for this section
  // This helps distinguish "section not found" from "section exists but is empty"
  const exists = !!(specContent || data || screenDesigns.length > 0 || screenshots.length > 0)

  return {
    sectionId,
    exists,
    spec: specContent,
    specParsed: specContent ? parseSpec(specContent) : null,
    data,
    screenDesigns,
    screenshots,
  }
}

/**
 * Check if a section has a spec.md file
 */
export function hasSectionSpec(sectionId: string): boolean {
  return `/product/sections/${sectionId}/spec.md` in specFiles
}

/**
 * Check if a section's screen designs should use the app shell
 * Returns true by default, false if spec contains "shell: false"
 */
export function sectionUsesShell(sectionId: string): boolean {
  const specPath = `/product/sections/${sectionId}/spec.md`
  const specContent = specFiles[specPath]
  if (!specContent) return true // Default to using shell if no spec

  const parsed = parseSpec(specContent)
  return parsed?.useShell ?? true
}

/**
 * Check if a section has a data.json file
 */
export function hasSectionData(sectionId: string): boolean {
  return `/product/sections/${sectionId}/data.json` in dataFiles
}

/**
 * Get all section IDs that have any artifacts
 */
export function getAllSectionIds(): string[] {
  const ids = new Set<string>()

  for (const path of Object.keys(specFiles)) {
    const id = extractSectionIdFromProduct(path)
    if (id) ids.add(id)
  }

  for (const path of Object.keys(dataFiles)) {
    const id = extractSectionIdFromProduct(path)
    if (id) ids.add(id)
  }

  for (const path of Object.keys(screenDesignModules)) {
    const id = extractSectionIdFromSrc(path)
    if (id) ids.add(id)
  }

  return Array.from(ids)
}
