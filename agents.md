# Agent Directives for Design OS

Design OS is a **product planning and design tool** that helps users define their product vision, structure their data model, design their UI, and prepare export packages for implementation in a separate codebase.

> **Important**: Design OS is a planning tool, not the end product codebase. The screen designs and components generated here are meant to be exported and integrated into your actual product's codebase.

---

## Understanding Design OS Context

When working in Design OS, be aware of two distinct contexts:

### 1. Design OS Application
The React application that displays and manages planning files. When modifying the Design OS UI itself:
- Files live in `src/` (components, pages, utilities)
- Uses the Design OS design system (stone palette, DM Sans, etc.)
- Provides the interface for viewing specs, screen designs, exports, etc.

### 2. Product Design (Screen Designs & Exports)
The product you're planning and designing. When creating screen designs and exports:
- Screen design components live in `src/sections/[section-name]/` and `src/shell/`
- Product definition files live in `product/`
- Exports are packaged to `product-plan/` for integration into a separate codebase
- Follow the design requirements specified in each section's spec

---

## Getting Started — The Planning Flow

Design OS follows a structured planning sequence:

### 1. Product Overview (`/product-vision`)
Define your product's core description, the problems it solves, and key features.
**Output:** `product/product-overview.md`

### 2. Product Roadmap (`/product-roadmap`)
Break your product into 3-5 development sections. Each section represents a self-contained area that can be designed and built independently.
**Output:** `product/product-roadmap.md`

### 3. Data Model (`/data-model`)
Define the core entities and relationships in your product. This establishes the "nouns" of your system and ensures consistency across sections.
**Output:** `product/data-model/data-model.md`

### 4. Design System (`/design-tokens`)
Choose your color palette (from Tailwind) and typography (from Google Fonts). These tokens are applied to all screen designs.
**Output:** `product/design-system/colors.json`, `product/design-system/typography.json`

### 5. Application Shell (`/design-shell`)
Design the persistent navigation and layout that wraps all sections.
**Output:** `product/shell/spec.md`, `src/shell/components/`

### 6. For Each Section:
- `/shape-section` — Define the specification
- `/sample-data` — Create sample data and types
- `/design-screen` — Create screen designs
- `/screenshot-design` — Capture screenshots

### 7. Export (`/export-product`)
Generate the complete export package with all components, types, and handoff documentation.
**Output:** `product-plan/`

---

## Command Quick Reference

### Files Generated Per Command

| Command | Creates | Location |
|---------|---------|----------|
| `/product-vision` | `product-overview.md` | `product/` |
| `/product-roadmap` | `product-roadmap.md` | `product/` |
| `/data-model` | `data-model.md` | `product/data-model/` |
| `/design-tokens` | `colors.json`, `typography.json` | `product/design-system/` |
| `/design-shell` | `spec.md`, `AppShell.tsx`, `MainNav.tsx`, `UserMenu.tsx`, `index.ts`, `ShellPreview.tsx` | `product/shell/`, `src/shell/components/`, `src/shell/` |
| `/shape-section` | `spec.md` | `product/sections/[section-id]/` |
| `/sample-data` | `data.json`, `types.ts` | `product/sections/[section-id]/` |
| `/design-screen` | `[ViewName].tsx`, `components/*.tsx`, `components/index.ts` | `src/sections/[section-id]/` |
| `/screenshot-design` | `[view-name].png` | `product/sections/[section-id]/` |
| `/export-product` | Complete export package | `product-plan/` |

### Command Prerequisites

| Command | Required | Optional |
|---------|----------|----------|
| `/product-vision` | — | — |
| `/product-roadmap` | `product-overview.md` | — |
| `/data-model` | `product-overview.md` | `product-roadmap.md` |
| `/design-tokens` | `product-overview.md` | — |
| `/design-shell` | `product-overview.md` | Design tokens, Sections (for navigation) |
| `/shape-section` | `product-overview.md`, `product-roadmap.md` | Data model, Shell spec |
| `/sample-data` | Section `spec.md` | Data model |
| `/design-screen` | Section `spec.md`, `data.json`, `types.ts` | Design tokens, Shell components, `SKILL.md` |
| `/screenshot-design` | Screen design components | Playwright MCP |
| `/export-product` | `product-overview.md`, at least one section | Shell components, All sections |

**Legend:**
- **Required**: Command will STOP if missing
- **Optional**: Command will WARN and continue with defaults if missing

---

## File Structure

```
.claude/
├── commands/                      # Executable commands for Design OS
│   └── design-os/                 # Design OS workflow commands
│       ├── design-screen.md
│       ├── design-shell.md
│       ├── export-product.md
│       ├── product-vision.md
│       ├── product-roadmap.md
│       ├── data-model.md
│       ├── design-tokens.md
│       ├── sample-data.md
│       ├── screenshot-design.md
│       └── shape-section.md
│
├── skills/                        # Specialized guidance for design quality
│   └── frontend-design/           # Guidance for high-quality UI components
│       └── SKILL.md               # Comprehensive design guidance
│
└── templates/                     # Modular prompt templates
    └── design-os/
        ├── README.md              # Template system documentation
        ├── common/                # Templates used in both prompt types
        │   ├── top-rules.md
        │   ├── reporting-protocol.md
        │   ├── model-guidance.md
        │   ├── verification-checklist.md
        │   ├── clarifying-questions.md
        │   └── tdd-workflow.md
        ├── one-shot/              # One-shot implementation prompts
        │   ├── preamble.md
        │   └── prompt-template.md
        └── section/               # Section-specific prompts
            ├── preamble.md
            ├── prompt-template.md
            ├── clarifying-questions.md
            └── tdd-workflow.md

product/                           # Product definition (portable)
├── product-overview.md            # Product description, problems/solutions, features
├── product-roadmap.md             # List of sections with titles and descriptions
│
├── data-model/                    # Global data model
│   └── data-model.md              # Entity descriptions and relationships
│
├── design-system/                 # Design tokens
│   ├── colors.json                # { primary, secondary, neutral }
│   └── typography.json            # { heading, body, mono }
│
├── shell/                         # Application shell
│   └── spec.md                    # Shell specification
│
└── sections/
    └── [section-name]/
        ├── spec.md                # Section specification
        ├── data.json              # Sample data for screen designs
        ├── types.ts               # TypeScript interfaces
        └── *.png                  # Screenshots

**Note on data.json naming:**
- In source (`product/sections/`): `data.json`
- In export (`product-plan/sections/`): renamed to `sample-data.json`

This transformation happens during `/export-product` to clarify the file's purpose as sample/test data in the target codebase.

src/
├── shell/                         # Shell design components
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── MainNav.tsx
│   │   ├── UserMenu.tsx
│   │   └── index.ts
│   └── ShellPreview.tsx
│
└── sections/
    └── [section-name]/
        ├── components/            # Exportable components (see note below)
        │   ├── [Component].tsx
        │   └── index.ts
        └── [ViewName].tsx         # Preview wrapper (see note below)

**Components vs. Preview Wrappers:**

| Type | Location | Purpose | Exported? |
|------|----------|---------|-----------|
| **Exportable Components** | `components/[Component].tsx` | Props-based UI components that receive data via props. These are portable and meant to be copied to your production codebase. | Yes — copied to `product-plan/sections/[id]/components/` |
| **Preview Wrappers** | `[ViewName].tsx` (root of section folder) | Design OS preview files that load sample data and pass it to exportable components. Used only for viewing designs in the browser. | No — these stay in Design OS only |

**Example:**
```
src/sections/invoices/
├── components/
│   ├── InvoiceList.tsx       ← Exportable: receives `invoices` prop, renders list
│   ├── InvoiceCard.tsx       ← Exportable: receives `invoice` prop, renders card
│   └── index.ts              ← Re-exports all components
└── InvoiceListView.tsx       ← Preview wrapper: loads data.json, passes to InvoiceList
```

The preview wrapper imports sample data and provides it to components for Design OS viewing. The exportable components never import data directly — they accept everything via props.

**Seeing Examples:**
- Run the Design OS workflow commands (`/product-vision`, `/shape-section`, etc.) to generate real examples
- Check `docs/` directory for additional documentation and walkthroughs
- Each command's step-by-step output shows exactly what files are created

product-plan/                      # Export package (GENERATED by /export-product)
├── README.md                      # Quick start guide
├── product-overview.md            # Product summary
├── design-guidance/               # Design guidance for implementation
│   └── frontend-design.md         # Frontend design principles (copied from SKILL.md in Step 7)
├── prompts/                       # Ready-to-use prompts for coding agents
│   ├── one-shot-prompt.md         # Prompt for full implementation
│   └── section-prompt.md          # Prompt template for incremental
├── instructions/                  # Implementation instructions
│   ├── one-shot-instructions.md   # All milestones combined
│   └── incremental/               # Milestone-by-milestone instructions
│       ├── 01-foundation.md
│       └── [NN]-[section-id].md   # Section-specific instructions (starting at 02)
├── design-system/                 # Tokens, colors, fonts
├── data-model/                    # Types and sample data
│   ├── types.ts                   # Consolidated TypeScript interfaces
│   ├── README.md                  # Data model documentation
│   └── sample-data.json           # Combined sample data from all sections
├── shell/                         # Shell components
│   ├── components/                # AppShell.tsx, MainNav.tsx, UserMenu.tsx, index.ts
│   └── README.md                  # Shell usage documentation
└── sections/
    └── [section-id]/
        ├── components/            # Exportable React components
        ├── sample-data.json       # Test data (copied from data.json)
        ├── types.ts               # Section-specific types
        ├── README.md              # Section implementation guide
        └── tests.md               # TDD test specifications
```

---

## Design Requirements

When creating screen designs, follow these guidelines:

- **Mobile Responsive**: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) to ensure layouts adapt properly across screen sizes.

- **Light & Dark Mode**: Use `dark:` variants for all colors. Test that all UI elements are visible and readable in both modes.

- **Use Design Tokens**: When design tokens are defined, apply the product's color palette and typography. Otherwise, fall back to `stone` for neutrals and `lime` for accents.

- **Props-Based Components**: All screen design components must accept data and callbacks via props. Never import data directly in exportable components.

- **No Navigation in Section Screen Designs**: Section screen designs should not include navigation chrome. The shell handles all navigation.

---

## Tailwind CSS Directives

These rules apply to both the Design OS application and all screen designs/components it generates:

- **Tailwind CSS v4**: We always use Tailwind CSS v4 (not v3). Do not reference or create v3 patterns.

- **No tailwind.config.js**: Tailwind CSS v4 does not use a `tailwind.config.js` file. Never reference, create, or modify one.

- **Use Built-in Utility Classes**: Avoid writing custom CSS. Stick to using Tailwind's built-in utility classes for all styling.

- **Use Built-in Colors**: Avoid defining custom colors. Use Tailwind's built-in color utility classes (e.g., `stone-500`, `lime-400`, `red-600`).

### Tailwind v4 Specific Patterns

Design OS uses Tailwind CSS v4, which has several differences from v3:

| Feature | v3 Pattern | v4 Pattern |
|---------|------------|------------|
| Configuration | `tailwind.config.js` | CSS-based via `@import "tailwindcss"` |
| Theme Extension | `extend: { colors: {...} }` | `@theme { --color-* }` in CSS |
| Dark Mode | `darkMode: 'class'` | Built-in, automatic |
| Content Paths | `content: ['./src/**/*.tsx']` | Automatic detection |
| Plugins | `plugins: [...]` in config | CSS `@plugin` directive |

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

| Instead of | Use |
|------------|-----|
| `import { Button } from '../../../components/ui/button'` | `import { Button } from '@/components/ui/button'` |
| `import { loadSectionData } from '../../lib/section-loader'` | `import { loadSectionData } from '@/lib/section-loader'` |
| `import type { SectionData } from '../types/section'` | `import type { SectionData } from '@/types/section'` |

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

## The Four Pillars

Design OS is organized around four main areas:

1. **Product Overview** — The "what" and "why"
   - Product name and description
   - Problems and solutions
   - Key features
   - Sections/roadmap

2. **Data Model** — The "nouns" of the system
   - Core entity names and descriptions
   - Relationships between entities
   - Minimal — leaves room for implementation

3. **Design System** — The "look and feel"
   - Color palette (Tailwind colors)
   - Typography (Google Fonts)

4. **Application Shell** — The persistent chrome
   - Global navigation structure
   - User menu
   - Layout pattern

Plus **Sections** — The individual features, each with spec, data, screen designs.

---

## Skills & Design Guidance

Design OS includes a skills system that provides specialized guidance for creating high-quality screen designs.

### The Frontend-Design Skill

The **frontend-design** skill provides comprehensive guidance for creating distinctive, production-grade frontend interfaces that avoid generic "AI-generated" aesthetics.

**Location:** `.claude/skills/frontend-design/SKILL.md`

**When to Use:**
- Referenced by `/design-shell` command — before creating shell components
- Referenced by `/design-screen` command — before creating section screen designs

**What It Covers:**
- Creating distinctive UI that reflects your product's visual identity
- Choosing bold design directions and unexpected layouts
- Applying thoughtful typography and color choices
- Using motion and transitions effectively
- Avoiding generic fonts (Inter, Roboto), predictable layouts, and "AI slop" aesthetics

### How Skills Integrate with Commands

Commands that create user-facing components reference the frontend-design skill to ensure design quality:

1. **`/design-shell`** — Creates application shell components
   - Step 5: Read `.claude/skills/frontend-design/SKILL.md` before creating AppShell, MainNav, UserMenu components
   - Ensures shell has distinctive, branded aesthetics matching the product vision

2. **`/design-screen`** — Creates section screen designs
   - Step 5: Read `.claude/skills/frontend-design/SKILL.md` before creating screen components
   - Ensures consistent, distinctive design quality across all sections

### Design Guidance Hierarchy

When creating screen designs, follow this hierarchy:

1. **Technical Requirements** (agents.md, Design Requirements section) — MANDATORY
   - Mobile responsive (Tailwind responsive prefixes)
   - Light/dark mode support (dark: variants)
   - Props-based components (portable, no direct data imports)
   - Tailwind CSS v4 (not v3)

2. **Aesthetic Guidance** (frontend-design skill) — MANDATORY
   - Distinctive visual identity
   - Bold design directions
   - Thoughtful typography and color choices
   - Effective use of motion

Both must be followed for production-ready screen designs. Technical requirements ensure portability and consistency; aesthetic guidance ensures distinctive, memorable design.

### Skill File Validation Pattern

Commands that reference the frontend-design skill (`/design-shell`, `/design-screen`) must validate the skill file before use:

**Validation Steps:**

1. **Check existence:** Verify `.claude/skills/frontend-design/SKILL.md` exists
2. **Check content:** File must have at least 100 characters of meaningful content (excluding frontmatter)
3. **Check structure:** File should contain design guidance sections

**Validation Script:**

```bash
# Check skill file exists and has content
SKILL_FILE=".claude/skills/frontend-design/SKILL.md"

if [ ! -f "$SKILL_FILE" ]; then
  echo "Skill file missing"
elif [ $(wc -c < "$SKILL_FILE") -lt 100 ]; then
  echo "Skill file has insufficient content"
else
  echo "Skill file valid"
fi
```

**Fallback Behavior:**

If the skill file is missing or empty, commands should:
1. Warn the user (design may be more generic)
2. Offer to continue with basic design principles
3. Proceed with fallback guidance if user approves

This ensures commands don't fail completely when the skill file is missing, while still encouraging its use for better results.

**Standard Reference in Commands:**

Commands that use the skill file should include this validation as an early step (typically Step 1):

```markdown
## Step 1: Validate Skill File

Before creating screen designs, validate the frontend-design skill file:

1. Check if `.claude/skills/frontend-design/SKILL.md` exists
2. Verify it has at least 100 characters of content
3. If valid, proceed to use it in [Step N where design is applied]
4. If missing/empty, ask user: "Continue with basic design principles?"

See: agents.md → "Skill File Validation Pattern" for the standard validation script.
```

**Commands that MUST validate the skill file:**
- `/design-shell` — Before creating AppShell, MainNav, UserMenu components
- `/design-screen` — Before creating section screen design components

**Commands that do NOT require skill file validation:**
- `/product-vision`, `/product-roadmap`, `/data-model` — No visual design created
- `/sample-data` — Data only, no visual components
- `/screenshot-design` — Captures existing designs, doesn't create new ones
- `/export-product` — Packages existing components, doesn't create new ones

---

## Design System Scope

Design OS separates concerns between its own UI and the product being designed:

- **Design OS UI**: Always uses the stone/lime palette and DM Sans typography
- **Product Screen Designs**: Use the design tokens defined for the product (when available)
- **Shell**: Uses product design tokens to preview the full app experience

---

## Export & Handoff

The `/export-product` command generates a complete handoff package:

- **Ready-to-use prompts**: Pre-written prompts to copy/paste into coding agents
  - `one-shot-prompt.md`: For full implementation in one session
  - `section-prompt.md`: Template for section-by-section implementation
- **Implementation instructions**: Detailed guides for each milestone
  - `product-overview.md`: Always provide for context
  - `one-shot-instructions.md`: All milestones combined
  - Incremental instructions in `instructions/incremental/`
- **Design guidance**: The frontend-design skill is copied to `design-guidance/frontend-design.md`
  - Provides guidance for creating distinctive, production-grade components
  - Ensures implementation agents follow the same quality standards
  - Referenced in prompts: "Read `product-plan/design-guidance/frontend-design.md` before creating components"
- **Test instructions**: Each section includes `tests.md` with TDD specs
- **Portable components**: Props-based, ready for any React setup

The prompts guide the implementation agent to ask clarifying questions about authentication, user modeling, and tech stack before building. Test instructions are framework-agnostic and include user flows, empty states, and edge cases.

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

| Stroke Width | Use Case | Examples |
|--------------|----------|----------|
| **1.5** (default) | Standard icons, navigation, actions | ArrowLeft, ChevronRight, Layout, Download |
| **2** | Smaller icons (w-3/w-4), interactive elements | X button, GripVertical, AlertTriangle |
| **2.5** | Status indicators, emphasis, completion marks | Check marks, Step indicators |
| **3** | Tiny icons (w-2.5), maximum visibility | Tiny check marks in checkboxes |

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

## Standardized Prerequisite Checks

All commands must follow this consistent pattern for checking prerequisites:

### Pattern: Required vs. Optional Prerequisites

**Required Prerequisites** → STOP with clear error message if missing
- Product overview (almost all commands)
- Product roadmap (planning commands)
- Section spec (for data/design commands)

**Optional Enhancements** → WARN and continue if missing
- Design tokens (design commands proceed with defaults)
- Data model (sample-data proceeds with local definitions)
- Application shell (design-shell question may be skipped)

### Standard Error Messages

**Required file missing:**
```
I don't see [file description] at [path]. Please run [prerequisite command] first.
```

**Optional feature missing:**
```
Note: [Feature] hasn't been defined yet. I'll proceed with [default approach], but for [reason], consider running [command] first.
```

### Error Message Format Standard

All commands must use consistent error message formatting:

**Pattern:** `Error: [Component] - [Issue]. [Action to fix].`

**Examples:**

| Component | Issue | Action | Full Message |
|-----------|-------|--------|--------------|
| product-overview.md | File not found | Run /product-vision | `Error: product-overview.md - File not found. Run /product-vision to create it.` |
| data.json | Invalid JSON syntax | Check file for syntax errors | `Error: data.json - Invalid JSON syntax. Check the file for missing commas or brackets.` |
| AppShell.tsx | Missing default export | Add export default statement | `Error: AppShell.tsx - Missing default export. Add 'export default AppShell' at the end of the file.` |
| SKILL.md | Insufficient content | Add design guidance | `Error: SKILL.md - Insufficient content (< 100 chars). Add meaningful design guidance.` |

**Severity Levels:**

| Level | Prefix | Behavior |
|-------|--------|----------|
| Error | `Error:` | STOP command, require user action |
| Warning | `Warning:` | Continue with fallback, inform user |
| Note | `Note:` | Informational, no action required |

**Format Consistency:**
- Always start with the level prefix (`Error:`, `Warning:`, `Note:`)
- Include the component/file name after the prefix
- Use a hyphen to separate the component from the issue
- End with a clear action the user can take
- Use periods to terminate sentences

This ensures users can quickly understand what went wrong and how to fix it.

### Directory Creation Pattern

All commands that create files must include explicit directory creation:

```bash
# Before creating /product/sections/[section-id]/spec.md:
mkdir -p product/sections/[section-id]

# Before creating /product/design-system/colors.json:
mkdir -p product/design-system

# Before creating src/shell/components/AppShell.tsx:
mkdir -p src/shell/components
```

### File Validation Pattern

After creating critical files, verify structure:

1. **Check existence:** File was actually written
2. **Validate structure:** Required fields/sections exist
3. **Verify content:** Data is consistent and complete

For `data.json` files specifically:
- Verify `_meta` object exists at top level
- Verify `_meta.models` is an object with descriptions
- Verify `_meta.relationships` is an array
- Ensure all model names match actual data keys

### Section ID Generation Rules

When creating section IDs from section titles, follow these standardized rules:

1. **Convert to lowercase** — "Invoice Management" → "invoice management"
2. **Replace spaces with hyphens** — "invoice management" → "invoice-management"
3. **Replace "&" with "-and-"** — "Reports & Analytics" → "reports-and-analytics"
4. **Remove special characters except hyphens** — Strip punctuation, quotes, etc.
5. **Cannot start or end with hyphen** — Trim leading/trailing hyphens
6. **Maximum 50 characters** — Truncate if necessary

**Examples:**
- "Invoice Management" → `invoice-management`
- "Reports & Analytics" → `reports-and-analytics`
- "User Settings" → `user-settings`
- "Q&A Forum" → `q-and-a-forum`

This ensures consistent path naming across all commands that reference sections.

### Question Asking Patterns

Commands should ask users questions in a consistent, predictable way:

**Question Format:**

```markdown
**[Category]:**
1. [Specific question]?
2. [Another specific question]?
```

**Categories by Command Type:**

| Command Type | Typical Questions |
|--------------|-------------------|
| Vision/Planning | Product goals, target audience, key differentiators |
| Data Model | Entity relationships, required vs. optional fields |
| Design | Color preferences, layout style, responsive priorities |
| Section | Feature scope, edge cases, integration points |
| Export | Target framework, authentication approach, deployment |

**Question Timing:**

| When | Question Pattern |
|------|------------------|
| Before starting | Clarify ambiguous requirements |
| At decision points | Offer options with recommendations |
| On validation failure | Explain issue and ask how to proceed |
| Before overwriting | Confirm destructive operations |

**Answer Handling:**

1. Accept short answers (yes/no, option letters, brief phrases)
2. Provide sensible defaults when possible
3. Don't re-ask questions already answered in conversation context
4. Document decisions made for future reference

### Viewport Dimensions (Standardized)

All commands referencing viewport sizes must use these consistent dimensions:

| Viewport | Width | Height | Use Case |
|----------|-------|--------|----------|
| Desktop (default) | 1280px | 800px | Standard documentation, screenshots |
| Mobile | 375px | 667px | Mobile-first testing, responsive checks |
| Tablet | 768px | 1024px | Tablet variants, medium breakpoints |

**Responsive Breakpoints:**

| Breakpoint | Width Range | Tailwind Class |
|------------|-------------|----------------|
| Mobile | < 640px | (default) |
| Tablet | 640-1024px | `sm:`, `md:` |
| Desktop | > 1024px | `lg:`, `xl:` |

**Command-Specific Usage:**

| Command | Viewport Usage |
|---------|----------------|
| `/screenshot-design` | Desktop 1280x800 default, capture all viewports as needed |
| `/design-screen` | Build mobile-first, test at all breakpoints |
| `/design-shell` | Design for all breakpoints, desktop is primary layout |
| `/export-product` | Verification checklist includes 375px, 768px, 1024px, 1920px |

**Screenshot Naming Convention:**

```
[view-name].png           # Desktop (default)
[view-name]-mobile.png    # Mobile viewport
[view-name]-tablet.png    # Tablet viewport
[view-name]-dark.png      # Dark mode variant
```

---

## Template State (Boilerplate Directories)

The Design OS boilerplate includes several intentionally empty directories. This is by design — they serve as placeholders that users populate through the Design OS workflow commands.

### Intentionally Empty Directories

| Directory | Purpose | Populated By |
|-----------|---------|--------------|
| `product/` | Product definition files | `/product-vision`, `/product-roadmap`, `/data-model`, `/design-tokens` |
| `product/sections/` | Section specifications and data | `/shape-section`, `/sample-data` |
| `product/shell/` | Shell specification | `/design-shell` |
| `product/design-system/` | Design tokens (colors, typography) | `/design-tokens` |
| `product/data-model/` | Global data model | `/data-model` |
| `src/shell/components/` | Shell React components | `/design-shell` |
| `src/sections/` | Section screen design components | `/design-screen` |
| `product-plan/` | Export package (generated) | `/export-product` |

### Why Empty?

1. **Clean starting point** — Users begin with a blank canvas, not outdated example content
2. **No confusion** — Example content could be mistaken for required structure
3. **Workflow-driven** — Each directory is populated through its corresponding command
4. **Portable** — The boilerplate works for any product type without modification

### The .gitkeep Convention

Empty directories contain a `.gitkeep` file to ensure they're tracked by Git. This is a common convention since Git doesn't track empty directories.

**Important:**
- `.gitkeep` files are placeholders only — they have no special meaning to Git
- When a command creates files in the directory, the `.gitkeep` can remain (harmless)
- Never reference `.gitkeep` in code or commands — treat directories as empty until populated
- These files are intentionally excluded from exports and sync operations

### Helper Functions

The Design OS source code includes functions that check for content existence:

- `hasShellComponents()` — Returns `false` until `/design-shell` creates shell components
- `hasShellSpec()` — Returns `false` until `/design-shell` creates `product/shell/spec.md`
- `loadProductData()` — Returns empty/null values until product files are created

These functions gracefully handle the empty state and enable the UI to show appropriate "get started" messaging rather than errors.
