/**
 * Section types for Design OS v2
 */

export interface SectionData {
  sectionId: string
  /**
   * Whether any artifacts exist for this section.
   * true = at least one of spec, data, screenDesigns, or screenshots exists
   * false = section ID was requested but no artifacts found
   * This helps distinguish "not loaded" vs "loaded but empty" states.
   */
  exists: boolean
  spec: string | null
  specParsed: ParsedSpec | null
  data: Record<string, unknown> | null
  screenDesigns: ScreenDesignInfo[]
  screenshots: ScreenshotInfo[]
}

export interface ParsedSpec {
  title: string
  overview: string
  userFlows: string[]
  uiRequirements: string[]
  /** Whether screen designs for this section should be wrapped in the app shell. Defaults to true. */
  useShell: boolean
}

export interface ScreenDesignInfo {
  name: string
  path: string
  componentName: string
}

export interface ScreenshotInfo {
  name: string
  path: string
  url: string
}
