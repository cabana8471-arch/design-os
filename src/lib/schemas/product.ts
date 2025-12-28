/**
 * Zod schemas for product data validation
 */

import { z } from 'zod'

// =============================================================================
// Product Overview
// =============================================================================

export const ProblemSchema = z.object({
  title: z.string().min(1, 'Problem title is required'),
  solution: z.string().min(1, 'Problem solution is required'),
})

export const ProductOverviewSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string(),
  problems: z.array(ProblemSchema).default([]),
  features: z.array(z.string()).default([]),
})

// =============================================================================
// Product Roadmap
// =============================================================================

export const SectionSchema = z.object({
  id: z.string().min(1, 'Section ID is required'),
  title: z.string().min(1, 'Section title is required'),
  description: z.string(),
  order: z.number().int().positive(),
})

export const ProductRoadmapSchema = z.object({
  sections: z.array(SectionSchema).min(1, 'At least one section is required'),
})

// =============================================================================
// Data Model
// =============================================================================

export const EntitySchema = z.object({
  name: z.string().min(1, 'Entity name is required'),
  description: z.string(),
})

export const DataModelSchema = z.object({
  entities: z.array(EntitySchema).default([]),
  relationships: z.array(z.string()).default([]),
})

// =============================================================================
// Design System
// =============================================================================

// Valid Tailwind color names
const TailwindColorNames = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia',
  'pink', 'rose',
] as const

export const ColorTokensSchema = z.object({
  primary: z.enum(TailwindColorNames),
  secondary: z.enum(TailwindColorNames),
  neutral: z.enum(TailwindColorNames),
})

export const TypographyTokensSchema = z.object({
  heading: z.string().min(1, 'Heading font is required'),
  body: z.string().min(1, 'Body font is required'),
  mono: z.string().min(1, 'Mono font is required'),
})

export const DesignSystemSchema = z.object({
  colors: ColorTokensSchema.nullable(),
  typography: TypographyTokensSchema.nullable(),
})

// =============================================================================
// Application Shell
// =============================================================================

export const ShellSpecSchema = z.object({
  raw: z.string(),
  overview: z.string(),
  navigationItems: z.array(z.string()).default([]),
  layoutPattern: z.string(),
})

export const ShellInfoSchema = z.object({
  spec: ShellSpecSchema.nullable(),
  hasComponents: z.boolean(),
})

// =============================================================================
// Combined Product Data
// =============================================================================

export const ProductDataSchema = z.object({
  overview: ProductOverviewSchema.nullable(),
  roadmap: ProductRoadmapSchema.nullable(),
  dataModel: DataModelSchema.nullable(),
  designSystem: DesignSystemSchema.nullable(),
  shell: ShellInfoSchema.nullable(),
})

// =============================================================================
// Type Exports (derived from schemas)
// =============================================================================

export type Problem = z.infer<typeof ProblemSchema>
export type ProductOverview = z.infer<typeof ProductOverviewSchema>
export type Section = z.infer<typeof SectionSchema>
export type ProductRoadmap = z.infer<typeof ProductRoadmapSchema>
export type Entity = z.infer<typeof EntitySchema>
export type DataModel = z.infer<typeof DataModelSchema>
export type ColorTokens = z.infer<typeof ColorTokensSchema>
export type TypographyTokens = z.infer<typeof TypographyTokensSchema>
export type DesignSystem = z.infer<typeof DesignSystemSchema>
export type ShellSpec = z.infer<typeof ShellSpecSchema>
export type ShellInfo = z.infer<typeof ShellInfoSchema>
export type ProductData = z.infer<typeof ProductDataSchema>
