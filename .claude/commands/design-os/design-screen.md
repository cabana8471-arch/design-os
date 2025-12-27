# Design Screen

You are helping the user create a screen design for a section of their product. The screen design will be a props-based React component that can be exported and integrated into any React codebase.

## Step 1: Check Prerequisites

First, identify the target section and verify that all required files exist.

### Validate Design Guidance (Skill File)

Check that the frontend-design skill file exists and has meaningful content:

```bash
# Check file exists
if [ ! -f ".claude/skills/frontend-design/SKILL.md" ]; then
  echo "Warning: SKILL.md - File not found at .claude/skills/frontend-design/SKILL.md"
fi

# Check file has meaningful content (>100 characters after frontmatter)
CONTENT_LENGTH=$(sed '/^---$/,/^---$/d' .claude/skills/frontend-design/SKILL.md | tr -d '[:space:]' | wc -c)
if [ "$CONTENT_LENGTH" -lt 100 ]; then
  echo "Warning: SKILL.md - Insufficient content (< 100 chars). Add meaningful design guidance."
fi
```

**If the file is missing or has insufficient content:**

Show a warning and offer to continue with fallback guidance:

```
Note: The frontend-design skill file at `.claude/skills/frontend-design/SKILL.md` is missing or empty.

Without this guidance, the screen design may be more generic. You can:
1. Continue anyway — I'll use basic design principles (results may be less distinctive)
2. Stop here — Add the skill file first for better design quality

The skill file provides guidance on creating distinctive, production-grade interfaces.
```

Use AskUserQuestion with options:
- "Continue with basic design principles" — Proceed using fallback guidance
- "Stop — I'll add the skill file first" — END COMMAND

Track user's choice - if continuing without skill file, use these **fallback design principles**:

**Visual Hierarchy:**
- Use 1.5-2rem (24-32px) for main headings
- Use 0.875-1rem (14-16px) for body text
- Create clear distinction between primary, secondary, and tertiary elements

**Spacing System:**
- Use 8px increments for padding and margins (8, 16, 24, 32, 48, 64)
- Maintain consistent gutter widths (16px on mobile, 24px on tablet, 32px on desktop)
- Apply generous whitespace around primary actions

**Component Patterns:**
- Buttons: 40-44px height for primary actions, 32-36px for secondary
- Cards: 16-24px padding, subtle shadows or borders
- Tables: 12-16px cell padding, alternating row colors for readability

**Responsive Breakpoints:**
- Mobile: < 640px (single column, stacked layouts)
- Tablet: 640-1024px (two columns, condensed tables)
- Desktop: > 1024px (multi-column, full tables)

**Dark Mode:**
- Backgrounds: stone-900 to stone-950
- Text: stone-100 to stone-300
- Borders: stone-700 to stone-800
- Increase contrast for interactive elements

### Identify Target Section

Read `/product/product-roadmap.md` to get the list of available sections.

If there's only one section, auto-select it. If there are multiple sections, use the AskUserQuestion tool to ask which section the user wants to create a screen design for.

### Verify Section Files

Verify all required files exist for the selected section:

- `product/sections/[section-id]/spec.md`
- `product/sections/[section-id]/data.json`
- `product/sections/[section-id]/types.ts`

If any file is missing, show a specific error message:

**If `spec.md` doesn't exist:**
```
Error: spec.md - File not found at product/sections/[section-id]/spec.md. Run /shape-section to create it.
```

**If `data.json` doesn't exist:**
```
Error: data.json - File not found at product/sections/[section-id]/data.json. Run /sample-data to create it.
```

**If `types.ts` doesn't exist:**
```
Error: types.ts - File not found at product/sections/[section-id]/types.ts. Run /sample-data to create it.
```

Stop here if any required file is missing.

## Step 2: Check for Design System and Shell

Check for optional enhancements:

**Design Tokens:**
- Check if `/product/design-system/colors.json` exists
- Check if `/product/design-system/typography.json` exists

If design tokens exist, read them and use them for styling. If they don't exist, show a warning:

"Note: Design tokens haven't been defined yet. I'll use default styling, but for consistent branding, consider running `/design-tokens` first."

**Shell:**
- Check if `product/shell/spec.md` exists

If shell exists, the screen design will render inside the shell in Design OS. If not, show a warning:

"Note: An application shell hasn't been designed yet. The screen design will render standalone. Consider running `/design-shell` first to see section screen designs in the full app context."

## Step 3: Analyze Requirements

Read and analyze all three files:

1. **spec.md** - Understand the user flows and UI requirements
2. **data.json** - Understand the data structure and sample content
3. **types.ts** - Understand the TypeScript interfaces and available callbacks

Identify what views are needed by extracting them from the spec.

### Views Extraction from spec.md

The `## Views` section in spec.md defines all views for a section. Extract views using this format:

**Expected spec.md format:**

```markdown
## Views
- ListView — Shows all items in a table with filtering
- DetailView — Displays single item details with edit capability
- CreateForm — Modal form for adding new items
```

**Extraction rules:**

1. Look for `## Views` section in spec.md
2. Each line starting with `- ` defines one view
3. Parse format: `- [ViewName] — [Description]` (em-dash separator)
4. If no `## Views` section exists, treat as single-view section (default view name derived from section title)

**Parsing algorithm:**

```
views = []
in_views_section = false

for line in spec_lines:
  if line matches "## Views":
    in_views_section = true
  elif line matches "## " and in_views_section:
    break  # Next section started
  elif in_views_section and line.startswith("- "):
    # Parse: "- ViewName — Description"
    parts = line[2:].split(" — ", 1)
    view_name = parts[0].strip()
    description = parts[1].strip() if len(parts) > 1 else ""
    views.append({ name: view_name, description: description })

if len(views) == 0:
  # Single-view section - derive name from section title
  views.append({ name: sectionTitle + "View", description: "Main view" })
```

**Common view patterns:**

| Pattern | Views | Use Case |
|---------|-------|----------|
| Single view | `[SectionName]View` | Simple sections (settings, about page) |
| List + Detail | `ListView`, `DetailView` | CRUD for a single entity |
| List + Detail + Form | `ListView`, `DetailView`, `CreateForm` | Full CRUD operations |
| Dashboard + Settings | `DashboardView`, `SettingsView` | Section with config |

**Validation:**

If the `## Views` section exists but has no valid entries:
```
Warning: spec.md has a ## Views section but no views could be parsed.
Expected format: "- ViewName — Description"
Proceeding as single-view section.
```

## Step 4: Clarify the Screen Design Scope

### Check for Existing Views

Before prompting the user for which view to create, check what already exists:

```bash
# List existing screen design components
ls src/sections/[section-id]/components/ 2>/dev/null || echo "No components yet"

# List existing preview wrappers
ls src/sections/[section-id]/*.tsx 2>/dev/null | grep -v components || echo "No preview wrappers yet"
```

If components already exist, report them to the user:

"I found the following screen designs already created for **[Section Title]**:
- [Existing View 1] (component + preview)
- [Existing View 2] (component + preview)

Based on the spec, you still need: [remaining views]"

### Ask Which View to Build

If the spec implies multiple views, use the AskUserQuestion tool to confirm which view to build first:

"The specification suggests a few different views for **[Section Title]**:

1. **[View 1]** - [Brief description] [CREATED if exists]
2. **[View 2]** - [Brief description] [PENDING if not exists]

Which view should I create first?"

**Skip views that already exist** — Only offer pending views as options. If all views are complete, inform the user:

"All views specified for **[Section Title]** have been created. Run `/screenshot-design` to capture screenshots, or `/export-product` when ready to export."

If there's only one obvious view, proceed directly.

### Note on Multiple Views

When creating designs for a section with multiple views:

- **Create each view as a separate component file:** `src/sections/[section-id]/components/[ViewName].tsx`
- **Create a separate preview wrapper for each:** `src/sections/[section-id]/[ViewName].tsx` (in section root)
- **Update types.ts with Props interfaces:** Add a Props interface for each view (e.g., `ListViewProps`, `DetailViewProps`)
- **Update components/index.ts:** Export all view components for easy importing
- **Track created views:** After creating each view, confirm it in the UI so you know which ones are complete

### Multiple Views File Structure

For a section with multiple views, the complete file structure looks like:

```
product/sections/[section-id]/
├── spec.md                    # Defines all views (from /shape-section)
├── data.json                  # Contains data for ALL views
└── types.ts                   # Props interfaces for EACH view

src/sections/[section-id]/
├── components/
│   ├── ListView.tsx           # First view component (props-based)
│   ├── DetailView.tsx         # Second view component (props-based)
│   ├── [SubComponent].tsx     # Shared sub-components
│   └── index.ts               # Exports all components
├── ListView.tsx               # Preview wrapper for first view
└── DetailView.tsx             # Preview wrapper for second view
```

**Key points:**
- Each view has its own component AND preview wrapper
- All views share the same `data.json` and `types.ts`
- Sub-components can be shared across views (import from `./[SubComponent]`)
- Run `/design-screen` once per view — the command asks which view to create

### Multi-View Workflow (Cross-Command Reference)

When working with sections that have multiple views, here's how the commands work together:

| Step | Command | What It Does for Multi-View Sections |
|------|---------|--------------------------------------|
| 1 | `/shape-section` | Defines all views in the `## Views` section of `spec.md` |
| 2 | `/sample-data` | Creates data for ALL views in a single `data.json`, creates Props interfaces for EACH view in `types.ts` |
| 3 | `/design-screen` | Run N times (once per view). Each run creates one component + preview wrapper |
| 4 | `/screenshot-design` | Run N times (once per view). Each run captures one screenshot |
| 5 | `/export-product` | Exports ALL view components together with their shared types |

**Workflow Tips:**
- Check the spec's `## Views` section to know how many views exist
- Track which views have been created (check `src/sections/[id]/components/`)
- Complete all views before running `/screenshot-design`
- If you add a new view to the spec later, run `/sample-data` again to update `types.ts`

**Common Issues:**
- **Missing view in types.ts:** Re-run `/sample-data` to regenerate Props interfaces
- **View component exists but no preview:** Create the preview wrapper manually or re-run `/design-screen`
- **Inconsistent styling between views:** Use shared sub-components and import them in all views

### Default View Routing

When navigating to `/sections/[section-id]`:
- The **first view listed in the spec** is the default view
- Other views are accessed via `/sections/[section-id]/screen-designs/[view-name]`
- Name your primary view first (e.g., "ListView" before "DetailView")

**See also:** `/shape-section` documents the full multi-view workflow from spec to screenshot

## Step 5: Apply Frontend Design Guidance

Before creating the screen design, apply the design guidance (validated in Step 1) to ensure high-quality design output.

### Design Guidance Application

**Scenario A: Skill file was validated in Step 1**

If the skill file passed validation in Step 1, invoke the `frontend-design` skill now:

1. Use the `Skill` tool with `skill: "frontend-design"` to apply design guidance
2. Alternatively, read `.claude/skills/frontend-design/SKILL.md` directly
3. Apply the guidance from the skill file to inform your design decisions

**Scenario B: User chose to continue without skill file in Step 1**

If the user chose to continue without the skill file, use the **fallback design principles** defined in Step 1 (Visual Hierarchy, Spacing System, Component Patterns, Responsive Breakpoints, Dark Mode).

### Key Design Principles to Follow

Regardless of which scenario applies, ensure the screen design follows these principles:
- Create distinctive, non-generic interfaces that avoid common AI design patterns
- Use creative layouts with strong visual hierarchy
- Apply thoughtful spacing and typography choices
- Implement meaningful interactions and animations
- Ensure accessibility and responsive design throughout

## Step 6: Create the Props-Based Component

### Create Directory

First, create the necessary directories if they don't exist:
```bash
mkdir -p src/sections/[section-id]/components
```

Then validate the directory was created successfully:
```bash
if [ ! -d "src/sections/[section-id]/components" ]; then
  echo "Error: Failed to create directory src/sections/[section-id]/components."
  exit 1
fi
```

### Create the Component File

Then create the main component file at `src/sections/[section-id]/components/[ViewName].tsx`.

### Component Structure

The component MUST:

- Import types from the types.ts file
- Accept all data via props (never import data.json directly)
- Accept callback props for all actions
- Be fully self-contained and portable

### Import Path Guidelines

Components in Design OS use relative import paths. Here's how imports work for different file types:

| File Type | Import From Component | Example |
|-----------|----------------------|---------|
| **Types** (types.ts in product/) | Relative path from component | `import type { InvoiceListProps } from '@/../product/sections/invoices/types'` |
| **Sub-components** (in same directory) | Relative path | `import { StatusBadge } from './StatusBadge'` |
| **UI components** (shared library) | Alias path | `import { Button } from '@/components/ui/button'` |

**Path Resolution:**
- `@/` resolves to `src/` (TypeScript path alias)
- `@/../product/` resolves to the `product/` directory (for types.ts access)
- Relative paths (e.g., `./StatusBadge`) stay within the section's component folder

**Why `@/../product/`?**
- Components live in `src/sections/[section-id]/components/`
- Types live in `product/sections/[section-id]/types.ts`
- The `@/../product/` pattern navigates from `src/` up to root, then into `product/`

**Example with actual paths:**

```tsx
// Component location: src/sections/invoices/components/InvoiceList.tsx
// Types location: product/sections/invoices/types.ts

// Import types using the @/../product/ pattern
import type { InvoiceListProps } from '@/../product/sections/invoices/types'

export function InvoiceList({
  invoices,
  onView,
  onEdit,
  onDelete,
  onCreate
}: InvoiceListProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Component content here */}

      {/* Example: Using a callback */}
      <button onClick={onCreate}>Create Invoice</button>

      {/* Example: Mapping data with callbacks */}
      {invoices.map(invoice => (
        <div key={invoice.id}>
          <span>{invoice.clientName}</span>
          <button onClick={() => onView?.(invoice.id)}>View</button>
          <button onClick={() => onEdit?.(invoice.id)}>Edit</button>
          <button onClick={() => onDelete?.(invoice.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

### Design Requirements

- **Mobile responsive:** Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) and ensure the design layout works gracefully on mobile, tablet and desktop screen sizes.
- **Light & dark mode:** Use `dark:` variants for all colors
- **Use design tokens:** If defined, apply the product's color palette and typography
- **Follow the frontend-design skill:** Create distinctive, memorable interfaces

### Applying Design Tokens

**If `/product/design-system/colors.json` exists:**
- Use the primary color for buttons, links, and key accents
- Use the secondary color for tags, highlights, secondary elements
- Use the neutral color for backgrounds, text, and borders

**If `/product/design-system/typography.json` exists:**
- Note the font choices for reference in comments
- The fonts will be applied at the app level, but use appropriate font weights

**If design tokens don't exist:**
- Fall back to `stone` for neutrals and `lime` for accents (Design OS defaults)

### Design Token Shade Guide

Use specific shades for each UI element type to ensure consistency:

**Primary Color Shades:**
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Primary button background | `[primary]-600` | `[primary]-500` |
| Primary button hover | `[primary]-700` | `[primary]-400` |
| Primary link text | `[primary]-600` | `[primary]-400` |
| Primary accent/highlight | `[primary]-500` | `[primary]-400` |
| Primary badge/tag background | `[primary]-100` | `[primary]-900` |
| Primary badge/tag text | `[primary]-800` | `[primary]-200` |

**Secondary Color Shades:**
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Secondary button background | `[secondary]-100` | `[secondary]-800` |
| Secondary button text | `[secondary]-800` | `[secondary]-100` |
| Secondary badge background | `[secondary]-100` | `[secondary]-900` |
| Secondary badge text | `[secondary]-700` | `[secondary]-200` |
| Subtle highlight | `[secondary]-50` | `[secondary]-900/50` |

**Neutral Color Shades:**
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page background | `[neutral]-50` | `[neutral]-950` |
| Card background | `white` | `[neutral]-900` |
| Border/divider | `[neutral]-200` | `[neutral]-800` |
| Primary text | `[neutral]-900` | `[neutral]-100` |
| Secondary text | `[neutral]-600` | `[neutral]-400` |
| Muted/placeholder text | `[neutral]-400` | `[neutral]-500` |
| Disabled element | `[neutral]-300` | `[neutral]-700` |

**Example Usage:**
```tsx
// Primary button
<button className="bg-lime-600 hover:bg-lime-700 dark:bg-lime-500 dark:hover:bg-lime-400 text-white">
  Save Changes
</button>

// Secondary badge
<span className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
  Active
</span>

// Card with neutral styling
<div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
  <p className="text-stone-900 dark:text-stone-100">Primary text</p>
  <p className="text-stone-600 dark:text-stone-400">Secondary text</p>
</div>
```

### What to Include

- Implement ALL user flows and UI requirements from the spec
- Use the prop data (not hardcoded values)
- Include realistic UI states (hover, active, etc.)
- Use the callback props for all interactive elements
- Handle optional callbacks with optional chaining: `onClick={() => onDelete?.(id)}`

### What NOT to Include

- No `import data from` statements - data comes via props
- No features not specified in the spec
- No routing logic - callbacks handle navigation intent
- No navigation elements (shell handles navigation)

## Step 7: Create Sub-Components (If Needed)

For complex views, break down into sub-components. Each sub-component should also be props-based.

Create sub-components at `src/sections/[section-id]/components/[SubComponent].tsx`.

Example:

```tsx
import type { Invoice } from '@/../product/sections/[section-id]/types'

interface InvoiceRowProps {
  invoice: Invoice
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function InvoiceRow({ invoice, onView, onEdit, onDelete }: InvoiceRowProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <p className="font-medium">{invoice.clientName}</p>
        <p className="text-sm text-stone-500">{invoice.invoiceNumber}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onView}>View</button>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}
```

Then import and use in the main component:

```tsx
import { InvoiceRow } from './InvoiceRow'

export function InvoiceList({ invoices, onView, onEdit, onDelete }: InvoiceListProps) {
  return (
    <div>
      {invoices.map(invoice => (
        <InvoiceRow
          key={invoice.id}
          invoice={invoice}
          onView={() => onView?.(invoice.id)}
          onEdit={() => onEdit?.(invoice.id)}
          onDelete={() => onDelete?.(invoice.id)}
        />
      ))}
    </div>
  )
}
```

## Step 8: Create the Preview Wrapper

Create a preview wrapper at `src/sections/[section-id]/[ViewName].tsx` (note: this is in the section root, not in components/).

This wrapper is what Design OS renders. It imports the sample data and feeds it to the props-based component.

Example:

```tsx
import data from '@/../product/sections/[section-id]/data.json'
import { InvoiceList } from './components/InvoiceList'

export default function InvoiceListPreview() {
  return (
    <InvoiceList
      invoices={data.invoices}
      onView={(id) => console.log('View invoice:', id)}
      onEdit={(id) => console.log('Edit invoice:', id)}
      onDelete={(id) => console.log('Delete invoice:', id)}
      onCreate={() => console.log('Create new invoice')}
    />
  )
}
```

The preview wrapper:

- Has a `default` export (required for Design OS routing)
- Imports sample data from data.json
- Passes data to the component via props
- Provides console.log handlers for callbacks (for testing interactions)
- Is NOT exported to the user's codebase - it's only for Design OS
- **Will render inside the shell** if one has been designed

### Multi-View Preview Wrappers

For sections with multiple views (defined in the spec's `## Views` section), you need to create a separate preview wrapper for each view.

**Workflow for multi-view sections:**
1. Run `/design-screen` for the first view (e.g., "List view")
   - Creates: `src/sections/[section-id]/InvoiceListView.tsx` (preview wrapper)
   - Creates: `src/sections/[section-id]/components/InvoiceList.tsx` (exportable component)
2. Run `/design-screen` again for the second view (e.g., "Detail view")
   - Creates: `src/sections/[section-id]/InvoiceDetailView.tsx` (preview wrapper)
   - Creates: `src/sections/[section-id]/components/InvoiceDetail.tsx` (exportable component)
3. Repeat for each additional view

**File structure after multiple views:**
```
src/sections/invoices/
├── InvoiceListView.tsx       ← Preview wrapper for list view
├── InvoiceDetailView.tsx     ← Preview wrapper for detail view
└── components/
    ├── InvoiceList.tsx       ← Exportable component
    ├── InvoiceDetail.tsx     ← Exportable component
    ├── InvoiceRow.tsx        ← Shared sub-component
    └── index.ts              ← Exports all components
```

**Each preview wrapper is independent:**
- Uses the same `data.json` (shared sample data)
- Passes relevant data to its specific component
- Can reference other views via callbacks (e.g., `onViewDetail` navigates to detail view)

## Step 9: Create Component Index

Create an index file at `src/sections/[section-id]/components/index.ts` to cleanly export all components.

### What to Export

The index file should export:

1. **Main view components** — Always export these
2. **Reusable sub-components** — Export if they may be useful standalone
3. **Props interfaces** — Re-export from types.ts for convenience

### Export Requirements

**Always export:**
- All view components (e.g., `InvoiceList`, `InvoiceDetail`)
- Components that might be reused in other sections

**Optionally export:**
- Internal sub-components used only within this section (e.g., `InvoiceRow`)
- Helper components that aren't standalone (consider keeping private)

**Re-export Props interfaces:**
- Include Props interfaces so consumers can import from one location
- This makes the component API more discoverable

**Where do Props come from?**
Props interfaces are defined in `product/sections/[section-id]/types.ts` by the `/sample-data` command. The types.ts file contains BOTH:
- Entity types (e.g., `Invoice`, `LineItem`) — describe the data structure
- Props interfaces (e.g., `InvoiceListProps`) — describe component inputs including data and callbacks

Components import Props from types.ts, not define them locally. This ensures Props interfaces are consistent with the data model.

### Example index.ts

```tsx
// Re-export components
export { InvoiceList } from './InvoiceList'
export { InvoiceDetail } from './InvoiceDetail'
export { InvoiceRow } from './InvoiceRow'

// Re-export Props interfaces for convenience
export type { InvoiceListProps, InvoiceDetailProps } from '@/../product/sections/[section-id]/types'

// Optionally re-export entity types if useful
export type { Invoice, LineItem } from '@/../product/sections/[section-id]/types'
```

### When NOT to Export

Keep components private (don't export) if:
- They're highly specific to a single parent component
- They contain hardcoded layout assumptions
- They're being refactored and the API is unstable

**Note:** During export (`/export-product`), the import paths will be transformed to relative paths (e.g., `../types`).

## Step 10: Confirm and Next Steps

Let the user know:

"I've created the screen design for **[Section Title]**:

**Exportable components** (props-based, portable):

- `src/sections/[section-id]/components/[ViewName].tsx`
- `src/sections/[section-id]/components/[SubComponent].tsx` (if created)
- `src/sections/[section-id]/components/index.ts`

**Preview wrapper** (for Design OS only):

- `src/sections/[section-id]/[ViewName].tsx`

**Important:** Restart your dev server to see the changes.

[If shell exists]: The screen design will render inside your application shell, showing the full app experience.

[If design tokens exist]: I've applied your color palette ([primary], [secondary], [neutral]) and typography choices.

**Next steps:**

- Run `/screenshot-design` to capture a screenshot of this screen design for documentation
- If the spec calls for additional views, run `/design-screen` again to create them
- When all sections are complete, run `/export-product` to generate the complete export package"

If the spec indicates additional views are needed:

"The specification also calls for [other view(s)]. Run `/design-screen` again to create those, then `/screenshot-design` to capture each one."

## Important Notes

- ALWAYS read the `frontend-design` skill before creating screen designs
- Components MUST be props-based - never import data.json in exportable components
- The preview wrapper is the ONLY file that imports data.json
- Use TypeScript interfaces from types.ts for all props
- Callbacks should be optional (use `?`) and called with optional chaining (`?.`)
- Always remind the user to restart the dev server after creating files
- Sub-components should also be props-based for maximum portability
- Apply design tokens when available for consistent branding
- Screen designs render inside the shell when viewed in Design OS (if shell exists)

### Path Alias Validation (`@/` and `@/../`)

Screen design components use the `@/` path alias for imports. Before creating components, verify the alias is configured:

**Expected tsconfig.json configuration:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Import patterns used in screen designs:**
| Pattern | Resolves To | Use Case |
|---------|-------------|----------|
| `@/components/ui/button` | `./src/components/ui/button` | UI components |
| `@/lib/utils` | `./src/lib/utils` | Utilities |
| `@/../product/sections/[id]/types` | `./product/sections/[id]/types` | Section types |
| `@/../product/sections/[id]/data.json` | `./product/sections/[id]/data.json` | Sample data (preview only) |

**Troubleshooting:**

| Issue | Symptom | Fix |
|-------|---------|-----|
| Missing path alias | `Cannot find module '@/...'` | Add `paths` to tsconfig.json |
| Wrong baseUrl | Imports resolve incorrectly | Set `baseUrl: "."` in tsconfig.json |
| Vite not resolving | Works in IDE but fails at runtime | Check `vite.config.ts` has matching alias |

**Vite alias configuration (if needed):**
```ts
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```
