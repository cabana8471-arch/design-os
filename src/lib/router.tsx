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
