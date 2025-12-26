import { createBrowserRouter } from 'react-router-dom'
import { ProductPage } from '@/components/ProductPage'
import { DataModelPage } from '@/components/DataModelPage'
import { DesignPage } from '@/components/DesignPage'
import { SectionsPage } from '@/components/SectionsPage'
import { SectionPage } from '@/components/SectionPage'
import { ScreenDesignPage, ScreenDesignFullscreen } from '@/components/ScreenDesignPage'
import { ShellDesignPage, ShellDesignFullscreen } from '@/components/ShellDesignPage'
import { ExportPage } from '@/components/ExportPage'

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
 * ERROR BOUNDARY NOTE
 * ===================
 * Currently, routes do not have error boundaries. Design OS gracefully handles
 * missing content (empty product, missing sections) at the component level.
 *
 * If error boundaries are needed in the future:
 * 1. Create an ErrorBoundary component in src/components/ErrorBoundary.tsx
 * 2. Use react-router-dom's errorElement property on each route
 * 3. Consider route-specific error handling for dynamic content routes
 *
 * Routes that would benefit from error boundaries if added:
 * - /sections/:sectionId (section data loading)
 * - /sections/:sectionId/screen-designs/:screenDesignName (component loading)
 * - /shell/design (shell component loading)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProductPage />,
  },
  {
    path: '/data-model',
    element: <DataModelPage />,
  },
  {
    path: '/design',
    element: <DesignPage />,
  },
  {
    path: '/sections',
    element: <SectionsPage />,
  },
  {
    path: '/sections/:sectionId',
    element: <SectionPage />,
  },
  {
    path: '/sections/:sectionId/screen-designs/:screenDesignName',
    element: <ScreenDesignPage />,
  },
  {
    path: '/sections/:sectionId/screen-designs/:screenDesignName/fullscreen',
    element: <ScreenDesignFullscreen />,
  },
  {
    path: '/shell/design',
    element: <ShellDesignPage />,
  },
  {
    path: '/shell/design/fullscreen',
    element: <ShellDesignFullscreen />,
  },
  {
    path: '/export',
    element: <ExportPage />,
  },
])
