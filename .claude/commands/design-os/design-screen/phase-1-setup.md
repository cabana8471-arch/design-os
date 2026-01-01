<!-- v1.0.0 -->

# Phase 1: Setup & Validation (Steps 0-2)

This phase covers Step 0 (Product Context Validation), Preamble (Multi-View Workflow), Step 1 (Prerequisites), and Step 2 (Design System, Shell, Design Direction).

---

## Step 0: Validate Product Context

**MANDATORY:** Check for `product/product-context.md` before any other steps.

```bash
CONTEXT_FILE="product/product-context.md"

if [ ! -f "$CONTEXT_FILE" ]; then
  echo "Error: product-context.md - File not found. Run /product-interview first."
  exit 1
fi

# Parse completeness
COMPLETENESS=$(grep "^Completeness:" "$CONTEXT_FILE" | grep -oE '[0-9]+' | head -1)
if [ -z "$COMPLETENESS" ]; then
  COMPLETENESS=0
fi

echo "Product context found: ${COMPLETENESS}% complete"
```

**Behavior based on completeness:**

| Completeness | Action                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------- |
| 0% (missing) | ERROR: Stop and ask user to run `/product-interview`                                         |
| 1-49%        | WARNING: "Context is ${COMPLETENESS}% complete. Continue or run `/product-interview` first?" |
| 50%+         | PROCEED: Load context and continue to Step 1                                                 |

> **Tip:** Use `/product-interview --minimal` for quick start (6 categories, ~20 min), `/product-interview --audit` to check progress, or `/product-interview --stage=section` to complete section-related categories.

**If proceeding, load relevant context:**

From `product-context.md`, extract and use:

- Section 5 (Section Depth): All states (empty, loading, error) — CRITICAL for complete designs
- Section 6 (UI Patterns): Component preferences, form validation style
- Section 7 (Mobile & Responsive): Touch interactions, responsive priority
- Section 11 (Error Handling): Error message style, recovery patterns

These ensure designs include all necessary states and patterns.

---

## Preamble: Multi-View Workflow Context

> **Read this section first** to understand how this command handles sections with multiple views. The actual command steps begin at "Step 1: Check Prerequisites" below.

> **Multi-View Sections:** This command creates ONE view component per run. For sections with multiple views (e.g., ListView, DetailDrawer, CreateModal):
>
> 1. Run `/design-screen` once for each view
> 2. Start with the primary view (usually the list/dashboard)
> 3. Create secondary views (detail, create, edit) in subsequent runs
> 4. View Relationships (from spec.md) wire them together automatically
>
> The preview wrapper created for the first view will be updated to include subsequent views.

> **Responsive Strategy:** Section components use **mobile-first** design — single-column layouts for mobile are designed first, then enhanced for larger screens (grids, multi-column layouts). See `agents.md` → "Responsive Strategy Clarification" for details.

### Multi-View Workflow Details

**Q: Does each view share the same data.json?**
Yes. All views in a section share `product/sections/[section-id]/data.json`. The sample data is generated once by `/sample-data` and used by all views.

**Q: How does a subsequent run detect existing views?**
The command checks `src/sections/[section-id]/components/` for existing `.tsx` files. It skips views that already exist unless you explicitly request to recreate them.

**Q: How does the preview wrapper know which view to render?**
The preview wrapper (`[ViewName]View.tsx` at section root) imports all created components and uses React state to manage which secondary views are open. When you create a new view, the command updates the preview wrapper to:

1. Import the new component
2. Add state for controlling its visibility (e.g., `isDetailOpen`)
3. Wire the callbacks (e.g., `onView` opens the detail drawer)

**Q: What files are created per view?**

| View Type                | Component Location          | Preview Wrapper Update                       |
| ------------------------ | --------------------------- | -------------------------------------------- |
| Primary (first)          | `components/[ViewName].tsx` | Creates new `[ViewName]View.tsx`             |
| Secondary (drawer/modal) | `components/[ViewName].tsx` | Updates existing wrapper with state + wiring |

**Example for Invoice section with 3 views:**

```
src/sections/invoices/
├── InvoiceListView.tsx      ← Preview wrapper (created on first run, updated on subsequent)
└── components/
    ├── InvoiceList.tsx      ← Run 1: Primary view
    ├── InvoiceDetail.tsx    ← Run 2: Detail drawer component
    ├── CreateInvoice.tsx    ← Run 3: Create modal component
    └── index.ts             ← Re-exports all components
```

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

Track user's choice - if continuing without skill file, use the **fallback design principles** defined in `agents.md`.

> **Note:** The full fallback design principles are documented in `agents.md` → "Enhanced Fallback Design Guidance" section. This includes: Aesthetic Tone Options, Visual Hierarchy, Color Application, Typography Choices, Motion & Interaction, and Distinctiveness Requirements. For skill file validation, see `agents.md` → "Skill File Validation Pattern".

### Validate UI Components for Wiring

If the spec contains a `## View Relationships` section, check that the required UI components exist:

```bash
# Read spec to check for relationship types
SPEC_FILE="product/sections/[section-id]/spec.md"

# Check for drawer relationships
if grep -q "(drawer," "$SPEC_FILE" 2>/dev/null; then
  if [ ! -f "src/components/ui/sheet.tsx" ]; then
    echo "Warning: Drawer relationship found but Sheet component is missing."
    echo "Install with: npx shadcn@latest add sheet"
    MISSING_SHEET=true
  fi
fi

# Check for modal relationships
if grep -q "(modal," "$SPEC_FILE" 2>/dev/null; then
  if [ ! -f "src/components/ui/dialog.tsx" ]; then
    echo "Warning: Modal relationship found but Dialog component is missing."
    echo "Install with: npx shadcn@latest add dialog"
    MISSING_DIALOG=true
  fi
fi
```

**If UI components are missing:**

Use AskUserQuestion with options:

- "Install missing components now" — Run the shadcn command to add them
- "Continue without wiring" — Use console.log handlers (legacy behavior)
- "Skip — I'll install manually" — Proceed, but warn that wiring may fail

**Track the choice:**

```
UI_WIRING_AVAILABLE=true   # If all components exist or user installed them
UI_WIRING_AVAILABLE=false  # If user chose to continue without wiring
```

This ensures we only attempt to generate wired preview wrappers when the required components are available.

### Identify Target Section

Read `/product/product-roadmap.md` to get the list of available sections.

If there's only one section, auto-select it. If there are multiple sections, use the AskUserQuestion tool to ask which section the user wants to create a screen design for.

### Extract and Validate Section ID

After selecting a section, extract and validate the section ID from the spec path:

**1. Extract section-id from spec path:**

```bash
# Given spec path: product/sections/invoices/spec.md
# Extract section-id: invoices
SPEC_PATH="product/sections/[section-id]/spec.md"
SECTION_ID=$(echo "$SPEC_PATH" | sed 's|product/sections/||' | sed 's|/spec.md||')
echo "Extracted section-id: $SECTION_ID"
```

**2. Verify section-id matches selected section:**

Compare the extracted section-id with the section selected from the roadmap:

| Source                 | Section ID               |
| ---------------------- | ------------------------ |
| From roadmap selection | `[selected-section-id]`  |
| From spec path         | `[extracted-section-id]` |

**3. If IDs don't match:**

```
Warning: Section ID mismatch detected.
- Selected from roadmap: "[selected-section-id]"
- Extracted from spec path: "[extracted-section-id]"

This may indicate a file was moved or renamed. Please verify you're working with the correct section.
```

Use AskUserQuestion with options:

- "Continue with roadmap section" — Use the section ID from roadmap
- "Continue with spec path section" — Use the section ID from file path
- "Cancel — I'll verify the files first" — END COMMAND

> **See also:** `agents.md` → "Section ID Generation Rules" for the standardized section ID format.

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

### Validate UI Components (Optional Check)

If the section uses view relationships with drawers or modals, verify the required UI components exist:

```bash
# Check for Sheet component (used for drawers)
if [ ! -f "src/components/ui/sheet.tsx" ]; then
  echo "Warning: Sheet component not found. Drawer-based view relationships may not work in preview."
fi

# Check for Dialog component (used for modals)
if [ ! -f "src/components/ui/dialog.tsx" ]; then
  echo "Warning: Dialog component not found. Modal-based view relationships may not work in preview."
fi
```

This is a warning only — the command continues, but wired preview functionality may be limited.

### Multi-View Sections

If this section has multiple views defined in `spec.md` (under `## Views`):

1. This command creates **ONE view component per run**
2. Run `/design-screen` multiple times (once per view)
3. All views share the same `types.ts` and `data.json`
4. See `/shape-section` → "Step 4.6: Define View Relationships" for complete guidance

> **Tip:** When creating multi-view sections, start with the primary view (usually a list), then create secondary views (drawers, modals) in subsequent runs.

### Parsing View Relationships from Spec

If the spec includes a `## View Relationships` section (created by `/shape-section` Step 4.6), parse it to enable wired preview functionality:

```bash
# Extract view relationships from spec
# Note: SECTION_ID was set in Step 1 (e.g., SECTION_ID="invoices")
VIEW_RELS=$(grep -A 20 "## View Relationships" "product/sections/${SECTION_ID}/spec.md" | grep "^-" || echo "")

if [ -n "$VIEW_RELS" ]; then
  echo "Found view relationships:"
  echo "$VIEW_RELS"
fi
```

**Relationship Format:** `- [PrimaryView].[callback] -> [SecondaryView] ([type], [dataRef])`

For each relationship found:

1. Create state in the preview wrapper (e.g., `isDrawerOpen`)
2. Wire the callback to update state (e.g., `setIsDrawerOpen(true)`)
3. Render the secondary view in appropriate wrapper (`Sheet` for drawer, `Dialog` for modal)
4. Pass entity data based on `dataRef` (`entityId` = lookup, `entity` = pass directly, `none` = no data)

> **See also:** agents.md → "View Relationships" section for complete specification.

## Step 2: Check for Design System, Shell, and Design Direction

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

**Design Direction:**

- Check if `/product/design-system/design-direction.md` exists

### Validate Design Direction (If Present)

If the file exists, validate its structure before reading:

```bash
DESIGN_DIRECTION_FILE="product/design-system/design-direction.md"

if [ -f "$DESIGN_DIRECTION_FILE" ]; then
  # Check for required sections
  MISSING_SECTIONS=""

  if ! grep -q "## User Preferences" "$DESIGN_DIRECTION_FILE"; then
    MISSING_SECTIONS="$MISSING_SECTIONS User Preferences"
  fi

  if ! grep -q "## Visual Signatures" "$DESIGN_DIRECTION_FILE"; then
    MISSING_SECTIONS="$MISSING_SECTIONS Visual Signatures"
  fi

  if ! grep -q "## Consistency Guidelines" "$DESIGN_DIRECTION_FILE"; then
    MISSING_SECTIONS="$MISSING_SECTIONS Consistency Guidelines"
  fi

  if [ -n "$MISSING_SECTIONS" ]; then
    echo "Warning: design-direction.md exists but is missing sections:$MISSING_SECTIONS"
    echo "Consider re-running /design-shell to regenerate it."
  else
    echo "Design direction validated"
  fi
fi
```

**If design direction is malformed:**

```
Warning: design-direction.md - Missing required sections: [list].
The file may be incomplete. Consider re-running /design-shell to regenerate it.

Proceeding with available guidance...
```

If design direction exists and validates, read it and display a confirmation:

"I found your Design Direction document. I'll ensure this screen design follows the established aesthetic: [aesthetic tone from document]"

Read the key sections:

- **Visual Signatures** — Elements that MUST appear consistently
- **Color Application** — How primary/secondary/neutral colors are used
- **Motion & Interaction** — Animation style and timing
- **Typography Treatment** — How typography creates hierarchy
- **Consistency Guidelines** — Rules that MUST remain consistent

If design direction does NOT exist, show a warning:

"Note: Design direction hasn't been defined yet. I'll proceed with default design principles, but for consistent aesthetics across sections, consider running `/design-shell` first to establish your visual identity."

### Parse Design Direction

Read and extract the key preferences from the design direction document:

**1. User Preferences Table:**

Extract the values from the `## User Preferences` section:

| Setting                 | Choice                                                |
| ----------------------- | ----------------------------------------------------- |
| **Aesthetic Tone**      | Professional / Modern / Minimal / Playful / Technical |
| **Animation Style**     | None / Subtle / Standard / Rich                       |
| **Information Density** | Compact / Comfortable / Spacious                      |
| **Responsive Priority** | Desktop-first / Mobile-first / Balanced               |

**2. Apply Aesthetic Guidelines:**

Based on the **Aesthetic Tone** value:

| Tone         | Apply These Patterns                                      |
| ------------ | --------------------------------------------------------- |
| Professional | Muted colors, clear hierarchy, rounded-md borders         |
| Modern       | High contrast, bold typography, rounded-lg to rounded-xl  |
| Minimal      | Max whitespace, monochromatic palette, shadow-sm or none  |
| Playful      | Warm palette, rounded-xl to rounded-2xl, generous padding |
| Technical    | Dense layouts, monospace for data, minimal border radius  |

**3. Apply Animation Timing:**

Based on the **Animation Style** value:

| Style    | Hover | Entry/Exit | Micro-interactions |
| -------- | ----- | ---------- | ------------------ |
| None     | 0ms   | 0ms        | Disabled           |
| Subtle   | 150ms | 200ms      | Fade only          |
| Standard | 200ms | 300ms      | Fade + scale       |
| Rich     | 250ms | 400ms      | Full animations    |

**4. Apply Spacing Scale:**

Based on the **Information Density** value:

| Density     | Card Padding | Section Gap | Component Spacing |
| ----------- | ------------ | ----------- | ----------------- |
| Compact     | p-3          | gap-4       | space-y-2         |
| Comfortable | p-5          | gap-6       | space-y-4         |
| Spacious    | p-8          | gap-10      | space-y-6         |

**5. Apply Responsive Approach:**

Based on the **Responsive Priority** value:

| Priority      | Tailwind Approach                                            |
| ------------- | ------------------------------------------------------------ |
| Desktop-first | Design for lg: first, then adapt with default and sm:        |
| Mobile-first  | Design for default (mobile) first, enhance with md:, lg:     |
| Balanced      | Design all breakpoints equally, test at 375px, 768px, 1024px |

### Parse AI-Generated Guidance Sections

In addition to the User Preferences table, the design-direction.md contains AI-generated specific guidance that MUST be applied:

**6. Visual Signatures:**

Extract the 3 distinctive elements from `## Visual Signatures`:

```
Visual Signatures to apply:
1. [Signature 1] — implement consistently across all components
2. [Signature 2] — implement consistently across all components
3. [Signature 3] — implement consistently across all components
```

**How to apply:** These are mandatory visual patterns. Every component you create must include these signatures where applicable (e.g., if signature is "left accent border on active items", apply it to all active/selected states).

**7. Color Application:**

Extract the rules from `## Color Application`:

| Color Type | Application Rule                       |
| ---------- | -------------------------------------- |
| Primary    | [Extracted primary usage rule]         |
| Accent     | [Extracted accent pattern]             |
| Neutral    | [Extracted neutral treatment + shades] |

**How to apply:** Follow these rules exactly. If primary is "reserved for CTAs only", never use it for decorative elements.

**8. Motion & Interaction:**

Extract from `## Motion & Interaction`:

| Aspect           | Value                           |
| ---------------- | ------------------------------- |
| Animation style  | [Description of motion feel]    |
| Key interactions | [Specific interaction patterns] |
| Timing           | [Exact durations]               |

**How to apply:** Use these exact timings and effects. If "cards lift on hover", implement `hover:shadow-lg` consistently.

**9. Typography Treatment:**

Extract from `## Typography Treatment`:

| Aspect              | Value                         |
| ------------------- | ----------------------------- |
| Heading style       | [Weight, tracking, case]      |
| Body approach       | [Line height, spacing]        |
| Distinctive choices | [Unique typographic decision] |

**How to apply:** Apply heading styles to all headings, body styles to all body text. The distinctive choice should appear at least once per view.

**10. Consistency Guidelines:**

Extract the 3 rules from `## Consistency Guidelines`:

```
Consistency rules:
1. [Rule 1] — apply everywhere applicable
2. [Rule 2] — apply everywhere applicable
3. [Rule 3] — apply everywhere applicable
```

**How to apply:** These are non-negotiable consistency requirements. Verify each component follows all 3 rules before finalizing.

### Display Confirmation

After parsing, show the user what will be applied:

```
Design Direction loaded:
- Aesthetic: [Aesthetic Tone] — [brief description of what this means]
- Animation: [Animation Style] — [timing to be used]
- Density: [Information Density] — [spacing to be applied]
- Responsive: [Responsive Priority] — [approach to be taken]

Visual Signatures:
1. [Signature 1]
2. [Signature 2]
3. [Signature 3]

Consistency Rules:
1. [Rule 1]
2. [Rule 2]
3. [Rule 3]
```

If design direction doesn't exist but shell exists, show a warning:

"Note: A shell has been designed but no Design Direction document exists. For consistent aesthetics across sections, consider running `/design-shell` again to generate `design-direction.md`. I'll infer the direction from the shell components."

If neither shell nor design direction exists, proceed with the design guidance from Step 1 (`.claude/skills/frontend-design/SKILL.md` or fallback design principles from `agents.md`).

### Fallback When Design Direction Missing

If `design-direction.md` doesn't exist, apply these defaults:

**Default Information Density:** Comfortable

**Default Container Pattern:**

```tsx
<div className="h-full bg-stone-50 dark:bg-stone-950 px-4 py-4 sm:px-6">
  {/* Section content */}
</div>
```

**Default Spacing Values:**

| Context           | Value               |
| ----------------- | ------------------- |
| Container Padding | `px-4 py-4 sm:px-6` |
| Card Padding      | `p-5`               |
| Section Gap       | `gap-6`             |
| Component Spacing | `space-y-4`         |

**Report to user:**

```
Note: design-direction.md not found. Using default "Comfortable" density:
- Container: px-4 py-4 sm:px-6
- Cards: p-5
- Gaps: gap-6

For consistent styling across sections, run /design-shell to create design-direction.md.
```

---

**Next:** Continue to Phase 2 (Steps 3-5) for requirements analysis and scope clarification.
