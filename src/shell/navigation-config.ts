/**
 * Navigation configuration stub for Design OS boilerplate.
 *
 * ## Why This File Returns Empty Data
 *
 * This is an intentional placeholder that exists to:
 * 1. Provide TypeScript types for navigation structures
 * 2. Prevent import errors before /design-shell is run
 * 3. Enable the application to start without a configured shell
 *
 * ## What Happens When You Run /design-shell
 *
 * The /design-shell command will create actual navigation configuration:
 * - `src/shell/components/AppShell.tsx` — The shell wrapper component
 * - `src/shell/components/MainNav.tsx` — Navigation component
 * - `src/shell/components/UserMenu.tsx` — User menu component
 *
 * The navigation data itself comes from `product/shell/spec.md` and
 * `product/product-roadmap.md`, not from this file.
 *
 * ## If You're Seeing Empty Navigation
 *
 * Run `/design-shell` to generate the shell components, which will
 * populate the navigation based on your product roadmap.
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
 *
 * **Why this returns an empty array:**
 * This is a stub function that exists before /design-shell is run.
 * Once you run /design-shell, the shell components will be created and
 * navigation will be populated from your product roadmap.
 *
 * **This function is NOT used by the actual shell components.**
 * The shell components (AppShell, MainNav) receive navigation data
 * as props from the screen design preview system. This stub exists
 * only to satisfy TypeScript imports and prevent build errors.
 *
 * @param _activeSectionId - Currently unused in stub
 * @returns Empty array - shell components receive data via props instead
 */
export function getNavigationCategories(_activeSectionId?: string): NavigationCategory[] {
  // Return empty array - this is intentional.
  // See JSDoc above for explanation.
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
