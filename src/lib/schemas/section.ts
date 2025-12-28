/**
 * Zod schemas for section data validation
 */

import { z } from 'zod'

// =============================================================================
// Screen Design & Screenshot Info
// =============================================================================

export const ScreenDesignInfoSchema = z.object({
  name: z.string().min(1, 'Screen design name is required'),
  path: z.string().min(1, 'Screen design path is required'),
  componentName: z.string().min(1, 'Component name is required'),
})

export const ScreenshotInfoSchema = z.object({
  name: z.string().min(1, 'Screenshot name is required'),
  path: z.string().min(1, 'Screenshot path is required'),
  url: z.string().min(1, 'Screenshot URL is required'),
})

// =============================================================================
// Parsed Spec
// =============================================================================

export const ParsedSpecSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  overview: z.string(),
  userFlows: z.array(z.string()).default([]),
  uiRequirements: z.array(z.string()).default([]),
  /** Whether screen designs for this section should be wrapped in the app shell. Defaults to true. */
  useShell: z.boolean().default(true),
})

// =============================================================================
// Section Data
// =============================================================================

export const SectionDataSchema = z.object({
  sectionId: z.string().min(1, 'Section ID is required'),
  /**
   * Whether any artifacts exist for this section.
   * true = at least one of spec, data, screenDesigns, or screenshots exists
   * false = section ID was requested but no artifacts found
   */
  exists: z.boolean(),
  spec: z.string().nullable(),
  specParsed: ParsedSpecSchema.nullable(),
  data: z.record(z.string(), z.unknown()).nullable(),
  screenDesigns: z.array(ScreenDesignInfoSchema).default([]),
  screenshots: z.array(ScreenshotInfoSchema).default([]),
})

// =============================================================================
// Sample Data Validation (for data.json files)
// =============================================================================

export const SampleDataMetaSchema = z.object({
  models: z.record(z.string(), z.string()).default({}),
  relationships: z.array(z.string()).default([]),
})

export const SampleDataSchema = z.object({
  _meta: SampleDataMetaSchema.optional(),
}).passthrough() // Allow additional keys for the actual data

// =============================================================================
// Type Exports (derived from schemas)
// =============================================================================

export type ScreenDesignInfo = z.infer<typeof ScreenDesignInfoSchema>
export type ScreenshotInfo = z.infer<typeof ScreenshotInfoSchema>
export type ParsedSpec = z.infer<typeof ParsedSpecSchema>
export type SectionData = z.infer<typeof SectionDataSchema>
export type SampleDataMeta = z.infer<typeof SampleDataMetaSchema>
export type SampleData = z.infer<typeof SampleDataSchema>
