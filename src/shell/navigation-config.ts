/**
 * Navigation configuration stub for Design OS boilerplate.
 * This file provides default exports when no shell has been designed yet.
 *
 * When you run /design-shell, this file will be replaced with your
 * product's actual navigation configuration.
 */

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: string
}

export interface NavigationCategory {
  id: string
  label: string
  items: NavigationItem[]
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

/**
 * Returns navigation categories with the active section marked.
 * Override this when you design your shell.
 */
export function getNavigationCategories(_activeSectionId?: string): NavigationCategory[] {
  // Return empty array until shell is designed
  return []
}

/**
 * Default user for shell preview.
 * Override this when you design your shell.
 */
export const defaultUser: User = {
  id: 'default',
  name: 'Demo User',
  email: 'demo@example.com',
}
