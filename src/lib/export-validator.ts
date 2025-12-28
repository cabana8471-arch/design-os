/**
 * Export Validation Utilities
 *
 * Validates the product data before export to catch common issues.
 */

import type { ProductData } from '@/types/product'
import type { SectionData } from '@/types/section'

export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface ValidationIssue {
  severity: ValidationSeverity
  category: string
  message: string
  suggestion?: string
}

export interface ValidationResult {
  isValid: boolean
  issues: ValidationIssue[]
  summary: {
    errors: number
    warnings: number
    info: number
  }
}

/**
 * Validate product data for export
 */
export function validateForExport(
  productData: ProductData,
  sections: SectionData[]
): ValidationResult {
  const issues: ValidationIssue[] = []

  // === ERRORS (blocking) ===

  // Check product overview exists
  if (!productData.overview) {
    issues.push({
      severity: 'error',
      category: 'Product',
      message: 'Product overview is missing',
      suggestion: 'Run /product-vision to create the product overview',
    })
  }

  // Check at least one section exists
  const sectionsWithContent = sections.filter((s) => s.exists)
  if (sectionsWithContent.length === 0) {
    issues.push({
      severity: 'error',
      category: 'Sections',
      message: 'No sections have been defined',
      suggestion: 'Run /shape-section to create at least one section',
    })
  }

  // === WARNINGS (non-blocking) ===

  // Check design tokens
  if (!productData.designSystem?.colors) {
    issues.push({
      severity: 'warning',
      category: 'Design',
      message: 'Color tokens not defined',
      suggestion: 'Run /design-tokens to define your color palette',
    })
  }

  if (!productData.designSystem?.typography) {
    issues.push({
      severity: 'warning',
      category: 'Design',
      message: 'Typography tokens not defined',
      suggestion: 'Run /design-tokens to define your fonts',
    })
  }

  // Check shell components
  if (!productData.shell?.hasComponents) {
    issues.push({
      severity: 'warning',
      category: 'Shell',
      message: 'Shell components not created',
      suggestion: 'Run /design-shell to create the application shell',
    })
  }

  // Check data model
  if (!productData.dataModel) {
    issues.push({
      severity: 'warning',
      category: 'Data',
      message: 'Data model not defined',
      suggestion: 'Run /data-model to define your entities',
    })
  }

  // Check sections for completeness
  for (const section of sectionsWithContent) {
    if (!section.spec) {
      issues.push({
        severity: 'warning',
        category: 'Section',
        message: `Section "${section.sectionId}" has no specification`,
        suggestion: 'Run /shape-section to define the spec',
      })
    }

    if (!section.data) {
      issues.push({
        severity: 'warning',
        category: 'Section',
        message: `Section "${section.sectionId}" has no sample data`,
        suggestion: 'Run /sample-data to create sample data',
      })
    }

    if (section.screenDesigns.length === 0) {
      issues.push({
        severity: 'warning',
        category: 'Section',
        message: `Section "${section.sectionId}" has no screen designs`,
        suggestion: 'Run /design-screen to create screen designs',
      })
    }
  }

  // === INFO (informational) ===

  // Sections without screenshots
  for (const section of sectionsWithContent) {
    if (section.screenDesigns.length > 0 && section.screenshots.length === 0) {
      issues.push({
        severity: 'info',
        category: 'Section',
        message: `Section "${section.sectionId}" has screen designs but no screenshots`,
        suggestion: 'Run /screenshot-design to capture screenshots',
      })
    }
  }

  // Product roadmap
  if (!productData.roadmap) {
    issues.push({
      severity: 'info',
      category: 'Product',
      message: 'Product roadmap not defined',
      suggestion: 'Run /product-roadmap to plan your sections',
    })
  }

  // Calculate summary
  const summary = {
    errors: issues.filter((i) => i.severity === 'error').length,
    warnings: issues.filter((i) => i.severity === 'warning').length,
    info: issues.filter((i) => i.severity === 'info').length,
  }

  return {
    isValid: summary.errors === 0,
    issues,
    summary,
  }
}

/**
 * Format validation result for display
 */
export function formatValidationResult(result: ValidationResult): string {
  if (result.issues.length === 0) {
    return 'All checks passed. Ready for export.'
  }

  const lines: string[] = []

  if (result.summary.errors > 0) {
    lines.push(`${result.summary.errors} error(s) - must fix before export`)
  }
  if (result.summary.warnings > 0) {
    lines.push(`${result.summary.warnings} warning(s) - recommended to fix`)
  }
  if (result.summary.info > 0) {
    lines.push(`${result.summary.info} suggestion(s)`)
  }

  return lines.join(', ')
}
