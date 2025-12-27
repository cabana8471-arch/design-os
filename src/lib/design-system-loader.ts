/**
 * Design system loading utilities for colors and typography
 */

import type { DesignSystem, ColorTokens, TypographyTokens } from '@/types/product'

// Valid Tailwind v4 color palette names
const VALID_TAILWIND_COLORS = new Set([
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink',
  'rose', 'slate', 'gray', 'zinc', 'neutral', 'stone'
])

/**
 * Validate that a color name is a valid Tailwind v4 palette color
 */
function isValidTailwindColor(color: string): boolean {
  return VALID_TAILWIND_COLORS.has(color.toLowerCase())
}

/**
 * Validate color tokens structure and values
 * Returns true if valid, logs warning and returns false if malformed
 */
function validateColorTokens(colors: unknown, path: string): colors is { primary: string; secondary: string; neutral: string } {
  if (colors === null || colors === undefined) {
    if (import.meta.env.DEV) {
      console.warn(`[design-system-loader] Colors file at ${path} is null or undefined`)
    }
    return false
  }

  if (typeof colors !== 'object' || Array.isArray(colors)) {
    if (import.meta.env.DEV) {
      console.warn(`[design-system-loader] Colors file at ${path} is not an object (got ${Array.isArray(colors) ? 'array' : typeof colors})`)
    }
    return false
  }

  const colorObj = colors as Record<string, unknown>

  // Check required fields exist
  if (!colorObj.primary || !colorObj.secondary || !colorObj.neutral) {
    if (import.meta.env.DEV) {
      console.warn(`[design-system-loader] Colors file at ${path} missing required fields (primary, secondary, neutral)`)
    }
    return false
  }

  // Validate each color is a valid Tailwind color
  for (const [key, value] of Object.entries(colorObj)) {
    if (typeof value !== 'string') {
      if (import.meta.env.DEV) {
        console.warn(`[design-system-loader] Color "${key}" at ${path} is not a string`)
      }
      return false
    }
    if (!isValidTailwindColor(value)) {
      if (import.meta.env.DEV) {
        console.warn(`[design-system-loader] Color "${key}: ${value}" at ${path} is not a valid Tailwind color. Valid colors: ${[...VALID_TAILWIND_COLORS].join(', ')}`)
      }
      // @TODO: Consider adding support for custom colors defined in @theme { --color-* } blocks.
      // For now, we warn but accept the value to allow experimentation with custom colors.
      // To enforce strict validation, uncomment the return false below:
      // return false
    }
  }

  return true
}

/**
 * Validate typography tokens structure
 * Returns true if valid, logs warning and returns false if malformed
 */
function validateTypographyTokens(typography: unknown, path: string): typography is { heading: string; body: string; mono?: string } {
  if (typography === null || typography === undefined) {
    if (import.meta.env.DEV) {
      console.warn(`[design-system-loader] Typography file at ${path} is null or undefined`)
    }
    return false
  }

  if (typeof typography !== 'object' || Array.isArray(typography)) {
    if (import.meta.env.DEV) {
      console.warn(`[design-system-loader] Typography file at ${path} is not an object (got ${Array.isArray(typography) ? 'array' : typeof typography})`)
    }
    return false
  }

  const typographyObj = typography as Record<string, unknown>

  // Check required fields exist
  if (!typographyObj.heading || !typographyObj.body) {
    if (import.meta.env.DEV) {
      console.warn(`[design-system-loader] Typography file at ${path} missing required fields (heading, body)`)
    }
    return false
  }

  return true
}

// Load JSON files from product/design-system at build time
const designSystemFiles = import.meta.glob('/product/design-system/*.json', {
  eager: true,
}) as Record<string, { default: Record<string, string> }>

/**
 * Load color tokens from colors.json
 *
 * Expected format:
 * {
 *   "primary": "lime",
 *   "secondary": "teal",
 *   "neutral": "stone"
 * }
 */
export function loadColorTokens(): ColorTokens | null {
  const path = '/product/design-system/colors.json'
  const colorsModule = designSystemFiles[path]
  if (!colorsModule?.default) return null

  const colors = colorsModule.default
  if (!validateColorTokens(colors, path)) {
    return null
  }

  return {
    primary: colors.primary,
    secondary: colors.secondary,
    neutral: colors.neutral,
  }
}

/**
 * Load typography tokens from typography.json
 *
 * Expected format:
 * {
 *   "heading": "DM Sans",
 *   "body": "DM Sans",
 *   "mono": "IBM Plex Mono"
 * }
 */
export function loadTypographyTokens(): TypographyTokens | null {
  const path = '/product/design-system/typography.json'
  const typographyModule = designSystemFiles[path]
  if (!typographyModule?.default) return null

  const typography = typographyModule.default
  if (!validateTypographyTokens(typography, path)) {
    return null
  }

  return {
    heading: typography.heading,
    body: typography.body,
    mono: typography.mono || 'IBM Plex Mono',
  }
}

/**
 * Load the complete design system
 */
export function loadDesignSystem(): DesignSystem | null {
  const colors = loadColorTokens()
  const typography = loadTypographyTokens()

  // Return null if neither colors nor typography are defined
  if (!colors && !typography) {
    return null
  }

  return { colors, typography }
}

/**
 * Check if design system has been defined (at least colors or typography)
 */
export function hasDesignSystem(): boolean {
  return (
    '/product/design-system/colors.json' in designSystemFiles ||
    '/product/design-system/typography.json' in designSystemFiles
  )
}

/**
 * Check if colors have been defined
 */
export function hasColors(): boolean {
  return '/product/design-system/colors.json' in designSystemFiles
}

/**
 * Check if typography has been defined
 */
export function hasTypography(): boolean {
  return '/product/design-system/typography.json' in designSystemFiles
}
