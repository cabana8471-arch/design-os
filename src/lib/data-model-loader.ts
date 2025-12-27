/**
 * Data model loading and parsing utilities
 */

import type { DataModel, Entity } from '@/types/product'

// Load data model markdown file at build time
// Note: import.meta.glob with eager:true loads all matching files at build time.
// Files are loaded as raw strings; validation happens in parse functions.
const dataModelFiles = import.meta.glob('/product/data-model/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * Validate that loaded markdown content is a non-empty string
 * Returns true if valid, logs warning and returns false if malformed
 */
function validateDataModelContent(content: unknown, path: string): content is string {
  if (content === null || content === undefined) {
    if (import.meta.env.DEV) {
      console.warn(`[data-model-loader] File at ${path} is null or undefined`)
    }
    return false
  }
  if (typeof content !== 'string') {
    if (import.meta.env.DEV) {
      console.warn(`[data-model-loader] File at ${path} is not a string (got ${typeof content})`)
    }
    return false
  }
  if (content.trim().length === 0) {
    if (import.meta.env.DEV) {
      console.warn(`[data-model-loader] File at ${path} is empty`)
    }
    return false
  }
  return true
}

/**
 * Parse data-model.md content into DataModel structure
 *
 * Expected format:
 * # Data Model
 *
 * ## Entities
 *
 * ### EntityName
 * Description of what this entity represents.
 *
 * ### AnotherEntity
 * Description of this entity.
 *
 * ## Relationships
 *
 * - Entity has many OtherEntity
 * - OtherEntity belongs to Entity
 */
export function parseDataModel(md: string): DataModel | null {
  if (!md || !md.trim()) return null

  try {
    const entities: Entity[] = []
    const relationships: string[] = []

    // Extract entities section
    const entitiesSection = md.match(/## Entities\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)

    if (entitiesSection?.[1]) {
      // Match ### EntityName followed by description
      const entityMatches = [...entitiesSection[1].matchAll(/### ([^\n]+)\n+([\s\S]*?)(?=\n### |\n## |$)/g)]
      for (const match of entityMatches) {
        entities.push({
          name: match[1].trim(),
          description: match[2].trim(),
        })
      }
    }

    // Extract relationships section
    const relationshipsSection = md.match(/## Relationships\s*\n+([\s\S]*?)(?=\n## |\n#[^#]|$)/)

    if (relationshipsSection?.[1]) {
      const lines = relationshipsSection[1].split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('- ')) {
          relationships.push(trimmed.slice(2).trim())
        }
      }
    }

    // Return null if we couldn't parse anything meaningful
    if (entities.length === 0 && relationships.length === 0) {
      return null
    }

    return { entities, relationships }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[data-model-loader] Failed to parse data-model.md:', error)
    }
    return null
  }
}

/**
 * Load the data model from markdown file
 */
export function loadDataModel(): DataModel | null {
  const path = '/product/data-model/data-model.md'
  const content = dataModelFiles[path]

  // Validate content before parsing
  if (!validateDataModelContent(content, path)) {
    return null
  }

  return parseDataModel(content)
}

/**
 * Check if data model has been defined
 */
export function hasDataModel(): boolean {
  return '/product/data-model/data-model.md' in dataModelFiles
}
