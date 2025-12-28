import { createBrowserRouter } from 'react-router-dom'
import { ProductPage } from '@/components/ProductPage'
import { DataModelPage } from '@/components/DataModelPage'
import { DesignPage } from '@/components/DesignPage'
import { SectionsPage } from '@/components/SectionsPage'
import { SectionPage } from '@/components/SectionPage'
import { ScreenDesignPage, ScreenDesignFullscreen } from '@/components/ScreenDesignPage'
import { ShellDesignPage, ShellDesignFullscreen } from '@/components/ShellDesignPage'
import { ExportPage } from '@/components/ExportPage'
import { RouteErrorBoundary } from '@/components/ErrorBoundary'

/**
 * Design OS Router Configuration
 *
 * IMPORTANT: Route patterns are referenced by commands
 * ====================================================
 * If you modify these routes, update the corresponding command files:
 *
 * - `/sections/:sectionId/screen-designs/:screenDesignName`
 *   → Referenced in: .claude/commands/design-os/screenshot-design.md (Step 3)
 *   → Used for: Screen design preview and screenshot capture
 *
 * - `/sections/:sectionId/screen-designs/:screenDesignName/fullscreen`
 *   → Referenced in: src/components/ScreenDesignPage.tsx (iframe src)
 *   → Used for: Isolated screen design rendering, shell integration, screenshots
 *
 * - `/shell/design/fullscreen`
 *   → Used for: Shell design screenshots
 *
 * Keep these in sync to ensure /screenshot-design command works correctly.
 *
 * ERROR BOUNDARIES
 * =================
 * Routes are wrapped with RouteErrorBoundary for graceful error handling.
 * Dynamic content routes (sections, screen designs, shell) have specific
 * error boundaries to handle component loading failures.
 *
 * Error boundaries provide:
 * - Friendly error messages
 * - Retry functionality
 * - Navigation back to home
 * - Detailed error info in development
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RouteErrorBoundary routeName="Product">
        <ProductPage />
      </RouteErrorBoundary>
    ),
  },
  {
    path: '/data-model',
    element: (
      <RouteErrorBoundary routeName="Data Model">
        <DataModelPage />
      </RouteErrorBoundary>
    ),
  },
  {
    path: '/design',
    element: (
      <RouteErrorBoundary routeName="Design">
        <DesignPage />
      </RouteErrorBoundary>
    ),
  },
  {
    path: '/sections',
    element: (
      <RouteErrorBoundary routeName="Sections">
        <SectionsPage />
      </RouteErrorBoundary>
    ),
  },
  {
    path: '/sections/:sectionId',
    element: (
      <RouteErrorBoundary routeName="Section">
        <SectionPage />
      </RouteErrorBoundary>
    ),
  },
  {
    path: '/sections/:sectionId/screen-designs/:screenDesignName',
    element: (
      <RouteErrorBoundary routeName="Screen Design">
        <ScreenDesignPage />
      </RouteErrorBoundary>
    ),
  },
  {
    path: '/sections/:sectionId/screen-designs/:screenDesignName/fullscreen',
    element: <ScreenDesignFullscreen />,
  },
  {
    path: '/shell/design',
    element: (
      <RouteErrorBoundary routeName="Shell Design">
        <ShellDesignPage />
      </RouteErrorBoundary>
    ),
  },
  {
    path: '/shell/design/fullscreen',
    element: <ShellDesignFullscreen />,
  },
  {
    path: '/export',
    element: (
      <RouteErrorBoundary routeName="Export">
        <ExportPage />
      </RouteErrorBoundary>
    ),
  },
])
