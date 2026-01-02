# Design System

This document covers design requirements, design tokens, content container standards, Tailwind CSS directives, and the Design Direction document.

---

## Design Requirements

When creating screen designs, follow these guidelines:

- **Mobile Responsive**: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) to ensure layouts adapt properly across screen sizes. Note: Section components use mobile-first design; shell components use desktop-first. See "Responsive Strategy Clarification" section in `validation-patterns.md` for details.

- **Light & Dark Mode**: Use `dark:` variants for all colors. Test that all UI elements are visible and readable in both modes.

- **Use Design Tokens**: When design tokens are defined, apply the product's color palette and typography. Otherwise, fall back to `stone` for neutrals and `lime` for accents.

- **Props-Based Components**: All screen design components must accept data and callbacks via props. Never import data directly in exportable components.

- **No Navigation in Section Screen Designs**: Section screen designs should not include navigation chrome. The shell handles all navigation.

---

## Content Container Standard

All section screen designs MUST use a consistent container wrapper. This ensures visual harmony across sections.

### Container Pattern

```tsx
<div className="h-full bg-[neutral]-50 dark:bg-[neutral]-950 px-4 py-4 sm:px-6">
  {/* Section content */}
</div>
```

> **Note:** `[neutral]` is a placeholder — replace with your neutral color palette (e.g., `stone`, `slate`, `gray`, `zinc`).

**Concrete Example (using `stone`):**

```tsx
<div className="h-full bg-stone-50 dark:bg-stone-950 px-4 py-4 sm:px-6">
  {/* Section content */}
</div>
```

### Container Values by Information Density

| Density     | Container Padding   | Background           |
| ----------- | ------------------- | -------------------- |
| Compact     | `px-3 py-3 sm:px-4` | `bg-[neutral]-50/50` |
| Comfortable | `px-4 py-4 sm:px-6` | `bg-[neutral]-50`    |
| Spacious    | `px-6 py-6 sm:px-8` | `bg-[neutral]-50`    |

### Where Density Comes From

1. **design-direction.md** — If exists, use the documented Information Density value
2. **Existing sections** — If no design-direction, match existing section patterns
3. **Default** — If neither exists, use "Comfortable" (`px-4 py-4 sm:px-6`)

### Edge-to-Edge Exception

Some views require full-width content (dashboards, maps, large visualizations). In these cases:

1. Still wrap in `<div className="h-full bg-[neutral]-50">`
2. Apply padding only to header/control areas
3. Document the exception with a comment

```tsx
// Edge-to-edge layout for dashboard charts
<div className="h-full bg-stone-50 dark:bg-stone-950">
  <div className="px-4 sm:px-6 py-4 border-b">
    {/* Header with standard padding */}
  </div>
  <div className="flex-1">{/* Full-width chart area */}</div>
</div>
```

---

## Tailwind CSS Directives

These rules apply to both the Design OS application and all screen designs/components it generates:

- **Tailwind CSS v4**: We always use Tailwind CSS v4 (not v3). Do not reference or create v3 patterns.

- **No tailwind.config.js**: Tailwind CSS v4 does not use a `tailwind.config.js` file. Never reference, create, or modify one.

- **Use Built-in Utility Classes**: Avoid writing custom CSS. Stick to using Tailwind's built-in utility classes for all styling.

- **Use Built-in Colors**: Avoid defining custom colors. Use Tailwind's built-in color utility classes (e.g., `stone-500`, `lime-400`, `red-600`).

### Tailwind v4 Specific Patterns

Design OS uses Tailwind CSS v4, which has several differences from v3:

| Feature         | v3 Pattern                    | v4 Pattern                            |
| --------------- | ----------------------------- | ------------------------------------- |
| Configuration   | `tailwind.config.js`          | CSS-based via `@import "tailwindcss"` |
| Theme Extension | `extend: { colors: {...} }`   | `@theme { --color-* }` in CSS         |
| Dark Mode       | `darkMode: 'class'`           | Built-in, automatic                   |
| Content Paths   | `content: ['./src/**/*.tsx']` | Automatic detection                   |
| Plugins         | `plugins: [...]` in config    | CSS `@plugin` directive               |

**Key v4 behaviors in Design OS:**

- Theme tokens defined in `src/index.css` using `@theme` block
- Dark mode toggles `dark` class on `<html>` element
- Colors use Tailwind's built-in palette (no custom tokens)
- Typography uses Google Fonts loaded via CSS `@import`

**Migration notes for developers:**

- Never create `tailwind.config.js` — it's not used in v4
- Custom colors go in `@theme { --color-custom: #value }` not config
- The `@apply` directive still works for composing utilities
- JIT mode is always on — no need to enable it

---

## Import Path Aliases

Design OS uses TypeScript path aliases for cleaner imports. The `@/` alias maps to `./src/*`.

### Configuration

Defined in `tsconfig.json`:

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

### Usage Examples

| Instead of                                                   | Use                                                      |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| `import { Button } from '../../../components/ui/button'`     | `import { Button } from '@/components/ui/button'`        |
| `import { loadSectionData } from '../../lib/section-loader'` | `import { loadSectionData } from '@/lib/section-loader'` |
| `import type { SectionData } from '../types/section'`        | `import type { SectionData } from '@/types/section'`     |

### When to Use

- **Always use `@/`** for imports from `src/` — cleaner and path-independent
- **Use relative imports** only within the same directory (e.g., `./Button.tsx`)
- **Barrel exports** (index.ts files) can use relative imports for their directory

### Consistency Rules

1. Components in `src/components/` import utilities from `@/lib/`
2. Pages import components from `@/components/`
3. Types are always imported from `@/types/`
4. UI primitives are imported from `@/components/ui/`

---

## Design System Scope

Design OS separates concerns between its own UI and the product being designed:

- **Design OS UI**: Always uses the stone/lime palette and DM Sans typography
- **Product Screen Designs**: Use the design tokens defined for the product (when available)
- **Shell**: Shell components are created with product design tokens during `/design-shell`, then used by `ScreenDesignPage` to preview the full app experience

---

## Design Direction Document

The Design Direction document captures aesthetic decisions made during shell design and ensures consistency across all sections.

### Purpose

1. **Document decisions**: Record the aesthetic choices made when applying the frontend-design skill
2. **Enable consistency**: Provide a reference for `/design-screen` to match shell aesthetics
3. **Guide implementation**: Help implementation agents understand the intended visual identity

### Location

`product/design-system/design-direction.md`

### Schema

```markdown
# Design Direction for [Product Name]

## User Preferences

| Setting                 | Choice                                                |
| ----------------------- | ----------------------------------------------------- |
| **Aesthetic Tone**      | Professional / Modern / Minimal / Playful / Technical |
| **Animation Style**     | None / Subtle / Standard / Rich                       |
| **Information Density** | Compact / Comfortable / Spacious                      |
| **Responsive Priority** | Desktop-first / Mobile-first / Balanced               |

## Aesthetic Tone

[One sentence describing the overall feel - e.g., "Refined utility with bold lime accents"]

## Visual Signatures

These distinctive elements MUST appear consistently across all sections:

- [Signature 1 - e.g., "Rounded corners (rounded-xl) on all cards"]
- [Signature 2 - e.g., "Lime-500 accent for primary actions"]
- [Signature 3 - e.g., "Stone-900 dark backgrounds with high contrast text"]

## Color Application

- **Primary usage**: [When and how - e.g., "Lime for buttons, active nav, key CTAs"]
- **Accent pattern**: [How accents draw attention - e.g., "Subtle lime underlines on hover"]
- **Neutral treatment**: [How neutrals create hierarchy - e.g., "Stone-50 to stone-900 for depth"]

## Motion & Interaction

- **Animation style**: [subtle/bold/none]
- **Key interactions**: [e.g., "200ms ease-out for all hover states"]
- **Timing**: [e.g., "Fast - prioritize responsiveness over flair"]

## Typography Treatment

- **Heading style**: [e.g., "DM Sans 600, tight tracking, stone-900"]
- **Body approach**: [e.g., "DM Sans 400, relaxed line-height, stone-600"]
- **Distinctive choices**: [e.g., "Mono font for data values and IDs"]

## Consistency Guidelines

These rules MUST remain consistent across all sections:

1. [Guideline - e.g., "All interactive elements use lime-500 hover states"]
2. [Guideline - e.g., "Card padding is always p-6"]
3. [Guideline - e.g., "Dark mode uses stone-900 backgrounds, not black"]

## Applied From

- **Skill file used**: [Yes/No - whether SKILL.md was used]
- **Fallback tone**: [If fallback, which tone was chosen]
```

### Created By

The `/design-shell` command creates this document in Step 6.5, after defining the shell spec and before creating components.

### Design Direction Lifecycle

| Phase  | Command           | Step     | Action                                              |
| ------ | ----------------- | -------- | --------------------------------------------------- |
| Create | `/design-shell`   | Step 6.5 | Creates `product/design-system/design-direction.md` |
| Read   | `/design-screen`  | Step 2   | Reads for aesthetics consistency                    |
| Apply  | `/design-screen`  | Step 5   | Applies guidance to screen components               |
| Export | `/export-product` | Step 7   | Copies to `product-plan/design-system/`             |

### Command References

| Command           | How It Uses design-direction.md                            |
| ----------------- | ---------------------------------------------------------- |
| `/design-shell`   | **Creates** the document (Step 6.5)                        |
| `/design-screen`  | **Reads and applies** aesthetics (Steps 2, 5)              |
| `/shape-section`  | Does NOT reference (spec is functional, not visual)        |
| `/sample-data`    | Does NOT reference (data structure, not presentation)      |
| `/design-tokens`  | Does NOT reference (tokens are inputs TO design-direction) |
| `/export-product` | **Copies** to export package                               |

> **Note:** `/shape-section` and `/sample-data` intentionally don't reference design-direction.md because they define WHAT the section does, not HOW it looks. Visual design is applied later by `/design-screen`.

### Fallback Behavior

If design-direction.md doesn't exist (user hasn't run `/design-shell`), commands behave as follows:

| Command           | Fallback Behavior                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `/design-screen`  | Uses SKILL.md guidance or fallback design principles; applies defaults from `agents.md`              |
| `/export-product` | Skips copying design-direction.md; generated prompts still work but lack specific aesthetic guidance |

**Recommendation:** Run `/design-shell` before `/design-screen` to establish aesthetic consistency across all sections.

### Exported To

The `/export-product` command copies this to `product-plan/design-system/design-direction.md` for implementation agents.

---

## Design System (Design OS Application)

The Design OS application itself uses a "Refined Utility" aesthetic:

- **Typography**: DM Sans for headings and body, IBM Plex Mono for code
- **Colors**: Stone palette for neutrals (warm grays), lime for accents
- **Layout**: Maximum 800px content width, generous whitespace
- **Cards**: Minimal borders (1px), subtle shadows, generous padding
- **Motion**: Subtle fade-ins (200ms), no bouncy animations

### Icon Stroke Width Convention

Lucide React icons use intentionally varied stroke widths for visual hierarchy:

| Stroke Width      | Use Case                                      | Examples                                  |
| ----------------- | --------------------------------------------- | ----------------------------------------- |
| **1.5** (default) | Standard icons, navigation, actions           | ArrowLeft, ChevronRight, Layout, Download |
| **2**             | Smaller icons (w-3/w-4), interactive elements | X button, GripVertical, AlertTriangle     |
| **2.5**           | Status indicators, emphasis, completion marks | Check marks, Step indicators              |
| **3**             | Tiny icons (w-2.5), maximum visibility        | Tiny check marks in checkboxes            |

**Rationale:**

- Thinner strokes (1.5) for larger icons maintain visual balance
- Thicker strokes (2-3) for smaller icons ensure visibility and legibility
- Status icons use heavier weights to draw attention

**Example Usage:**

```tsx
// Standard 5x5 icon - use 1.5
<Layout className="w-5 h-5" strokeWidth={1.5} />

// Small 4x4 icon in button - use 2
<X className="w-4 h-4" strokeWidth={2} />

// Status indicator - use 2.5
<Check className="w-3.5 h-3.5" strokeWidth={2.5} />

// Tiny checkbox mark - use 3
<Check className="w-2.5 h-2.5" strokeWidth={3} />
```

This pattern is intentional and should NOT be normalized to a single value.

---

## Design Token Shade Guide

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
// Note: Replace [neutral] with your neutral color from design tokens (e.g., stone, slate, gray)
<div className="bg-white dark:bg-[neutral]-900 border border-[neutral]-200 dark:border-[neutral]-800">
  <p className="text-[neutral]-900 dark:text-[neutral]-100">Primary text</p>
  <p className="text-[neutral]-600 dark:text-[neutral]-400">Secondary text</p>
</div>
```
