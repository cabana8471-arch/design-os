/**
 * Breadcrumb Utilities
 *
 * Helper functions for generating breadcrumb navigation items.
 */

export interface BreadcrumbItem {
  label: string
  href?: string
}

/**
 * Generate breadcrumb items for common routes
 */
export function generateBreadcrumbs(
  path: string,
  params?: Record<string, string>,
  labels?: Record<string, string>
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = []

  // Parse path segments
  const segments = path.split('/').filter(Boolean)

  if (segments[0] === 'sections') {
    items.push({ label: 'Sections', href: '/sections' })

    if (params?.sectionId) {
      const sectionLabel = labels?.sectionTitle || params.sectionId
      items.push({ label: sectionLabel, href: `/sections/${params.sectionId}` })
    }

    if (segments.includes('screen-designs') && params?.screenDesignName) {
      items.push({ label: 'Screen Designs' })
      items.push({ label: params.screenDesignName })
    }
  } else if (segments[0] === 'shell') {
    items.push({ label: 'Design', href: '/design' })
    items.push({ label: 'Shell Design' })
  } else if (segments[0] === 'data-model') {
    items.push({ label: 'Data Model' })
  } else if (segments[0] === 'design') {
    items.push({ label: 'Design System' })
  } else if (segments[0] === 'export') {
    items.push({ label: 'Export' })
  }

  return items
}
