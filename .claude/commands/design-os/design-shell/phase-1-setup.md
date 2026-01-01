<!-- v1.0.0 -->

# Phase 1: Setup & Validation

This phase covers Steps 0-2: product context validation, existing shell detection, audit workflow, prerequisites, and product structure analysis.

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
| 50%+         | PROCEED: Load context and continue to Step 0.1                                               |

> **Tip:** Use `/product-interview --minimal` for quick start (6 categories, ~20 min), `/product-interview --audit` to check progress, or `/product-interview --stage=shell` to complete shell-related categories.

**If proceeding, load relevant context:**

From `product-context.md`, extract and use:

- Section 3 (Design Direction): Aesthetic tone, animation style, information density
- Section 6 (UI Patterns): Notification style, modal vs drawer preferences
- Section 7 (Mobile & Responsive): Mobile navigation pattern, responsive priority

These pre-inform design decisions in Steps 3, 3.5, and 3.6.

---

> **Workflow Structure:** Step 0 validates product context (mandatory). Steps 0.1-0.7 are **pre-flight checks** (audit/detection) that only run when a shell already exists. For fresh creation, these are skipped and the workflow starts at Step 1.

> **Control Flow for Steps 0.5-0.7:** These steps form a SEQUENTIAL audit workflow:
>
> - **Step 0.5** presents a manual reference checklist — work through each category with the user
> - **Step 0.6** displays the aggregated audit report summarizing all findings
> - **Step 0.7** determines next actions based on the mode selected in Step 0.1
>   This is NOT an automated process — each check requires verification and judgment.

> **Responsive Strategy:** Shell components use **desktop-first** design — full navigation layout is designed first, then simplified for mobile (hamburger menu, collapsible sidebar). See `agents.md` → "Responsive Strategy Clarification" for details.

## Step 0.1: Detect Existing Shell

Before starting, check if a shell already exists:

```bash
# Check for existing shell
SHELL_EXISTS=false
SPEC_EXISTS=false
COMPONENTS_EXIST=false

if [ -f "product/shell/spec.md" ]; then
  SPEC_EXISTS=true
  SHELL_EXISTS=true
fi

if [ -f "src/shell/components/AppShell.tsx" ]; then
  COMPONENTS_EXIST=true
  SHELL_EXISTS=true
fi
```

**If SHELL_EXISTS is false:** Skip Steps 0.5-0.7 entirely and proceed directly to Step 1 (fresh creation workflow).

**If SHELL_EXISTS is true:** Present mode selection:

```
I've detected an existing Shell Design:
- spec.md: [✓ exists / ✗ missing]
- AppShell.tsx: [✓ exists / ✗ missing]
- Secondary components: [N/M created]

What would you like to do?

1. **Audit & Report** — Check everything, report issues, no modifications
2. **Audit & Manual Fix** — Check issues, then guide you through manual repairs
3. **Enhance** — Add missing secondary components (drawers, modals)
4. **Full Rebuild** — Delete everything and start fresh
```

> **Note:** Audit modes (1-2) are useful when a shell partially exists (e.g., adding relationships to an existing shell or checking for issues). For a brand new shell, select **Full Rebuild** or start directly with `/design-shell` on a fresh codebase.

Use AskUserQuestion with these options. Based on the choice:

- **Audit & Report**: Go to Step 0.5, then STOP after displaying report (command ends; user can re-run `/design-shell` to take action)
- **Audit & Manual Fix**: Go to Step 0.5, work through checklist with user to manually fix issues, then continue to Step 1+
- **Enhance**: Skip design questions (assume existing shell is valid). Go directly to Step 3.6 to add new secondary components based on updated interactive elements selections.
- **Full Rebuild**: Delete existing shell files, then continue to Step 1

## Step 0.5: Run Audit Checklist

> **Note:** This is a manual reference checklist. Work through each category systematically, verifying items and noting issues. The audit report (Step 0.6) summarizes your findings. Not all checks can be automated — use judgment for visual/UX checks.

Run the comprehensive audit checklist. For each category, check all items and record results.

### A. Spec Compliance

| Check | Verification                               | Fix Action                 |
| ----- | ------------------------------------------ | -------------------------- |
| A1    | `product/shell/spec.md` exists?            | Create                     |
| A2    | `## Overview` section complete?            | Warning                    |
| A3    | `## Navigation Structure` valid?           | Warning                    |
| A4    | `## Layout Pattern` defined?               | Warning                    |
| A5    | `## Shell Relationships` exists?           | Create based on components |
| A6    | `design-direction.md` exists and complete? | Regenerate                 |

### B. Component Completeness

| Check | Verification                             | Fix Action   |
| ----- | ---------------------------------------- | ------------ |
| B1    | `AppShell.tsx` exists?                   | Create       |
| B2    | `MainNav.tsx` exists?                    | Create       |
| B3    | `UserMenu.tsx` exists?                   | Create       |
| B4    | `index.ts` exports all components?       | Update       |
| B5    | Each relationship in spec has component? | List missing |
| B6    | `ShellPreview.tsx` exists?               | Create       |

### C. Wiring Validation

| Check | Verification                               | Fix Action    |
| ----- | ------------------------------------------ | ------------- |
| C1    | ShellPreview has state for each secondary? | Add state     |
| C2    | Handlers wired (not console.log)?          | Wire handlers |
| C3    | All relationships from spec are connected? | Connect       |
| C4    | Sheet/Dialog imports present?              | Add imports   |

### D. Data & Types

| Check | Verification                        | Fix Action |
| ----- | ----------------------------------- | ---------- |
| D1    | `product/shell/data.json` exists?   | Create     |
| D2    | data.json has `_meta` valid?        | Add        |
| D3    | Data for each secondary component?  | Add        |
| D4    | `product/shell/types.ts` exists?    | Create     |
| D5    | Props interface for each component? | Add        |

### E. Design Token Consistency

| Check | Verification                                             | Fix Action         |
| ----- | -------------------------------------------------------- | ------------------ |
| E1    | Colors match `colors.json`?                              | Report differences |
| E2    | Typography match `typography.json`?                      | Report differences |
| E3    | Spacing match Information Density from design-direction? | Report             |
| E4    | Visual Signatures applied consistently?                  | Report             |

### F. Accessibility & UX

| Check | Verification                         | Fix Action   |
| ----- | ------------------------------------ | ------------ |
| F1    | ARIA labels on interactive elements? | List missing |
| F2    | Keyboard navigation (Tab, Escape)?   | Suggest      |
| F3    | Focus visible states?                | Suggest      |
| F4    | Screen reader friendly?              | Suggest      |

### G. Dark Mode Consistency

| Check | Verification                        | Fix Action   |
| ----- | ----------------------------------- | ------------ |
| G1    | All elements have `dark:` variants? | List missing |
| G2    | Sufficient contrast in dark mode?   | Report       |
| G3    | Borders/shadows visible in dark?    | Report       |

### H. Export Readiness

| Check | Verification                                    | Fix Action      |
| ----- | ----------------------------------------------- | --------------- |
| H1    | No `import data from` in exportable components? | List violations |
| H2    | Props-based (no hardcoded data)?                | List violations |
| H3    | No Design OS specific imports?                  | List            |
| H4    | Relative imports transformable?                 | Verify          |

### I. Focus & Keyboard

| Check | Verification                   | Fix Action   |
| ----- | ------------------------------ | ------------ |
| I1    | Skip link present in AppShell? | Add SkipLink |
| I2    | Focus trap in modals/drawers?  | Implement    |
| I3    | Escape closes modals?          | Add handler  |
| I4    | Keyboard shortcuts functional? | Wire         |

### J. Error Handling

| Check | Verification                              | Fix Action       |
| ----- | ----------------------------------------- | ---------------- |
| J1    | Error boundaries on secondary components? | Wrap             |
| J2    | Fallback UI defined?                      | Add error state  |
| J3    | Retry mechanism?                          | Add retry button |

### K. Loading & Performance

| Check | Verification                | Fix Action         |
| ----- | --------------------------- | ------------------ |
| K1    | Skeleton loaders defined?   | Create             |
| K2    | Lazy loading for secondary? | Wrap in React.lazy |
| K3    | Suspense boundaries?        | Add Suspense       |

### L. Theme & Dark Mode

| Check | Verification                                      | Fix Action              |
| ----- | ------------------------------------------------- | ----------------------- |
| L1    | Anti-flicker script in index.html `<head>`?       | Add sync script         |
| L2    | Script is after `<meta>` but before `<link>`/CSS? | Move script             |
| L3    | `dark` class on `<html>` not `<body>`?            | Correct selector        |
| L4    | ThemeToggle reads localStorage at init?           | Add lazy init           |
| L5    | System preference listener exists?                | Add mediaQuery listener |
| L6    | All components have `dark:` variants?             | Add variants            |

### M. Shell Utility Components (Optional)

If accessibility or UX enhancements are priorities, validate use of utility components from `src/shell/`:

| Check | Verification                                   | Fix Action                 |
| ----- | ---------------------------------------------- | -------------------------- |
| M1    | SkipLink included in AppShell?                 | Add for accessibility      |
| M2    | ShellErrorBoundary wraps secondary components? | Wrap for error handling    |
| M3    | useFocusManagement hook in modals/drawers?     | Add for focus trap         |
| M4    | ThemeToggle uses useShellShortcuts?            | Add for keyboard shortcuts |
| M5    | ShellSkeleton used for loading states?         | Add for loading UX         |

> **See also:** `agents.md` → "Shell Utility Components" section for component descriptions and usage.

## Step 0.6: Display Audit Report

```
╔════════════════════════════════════════════════════════════════╗
║                    SHELL DESIGN AUDIT REPORT                   ║
╠════════════════════════════════════════════════════════════════╣
║ Product: [Product Name]                                        ║
║ Date: [timestamp]                                              ║
╠════════════════════════════════════════════════════════════════╣
║ SUMMARY                                                        ║
║ ├─ Spec Compliance:      [X]/6 [✓/!]                          ║
║ ├─ Components:           [X]/[Y] ([Z] missing)                 ║
║ ├─ Wiring:               [X]/[Y] ([Z] not wired)               ║
║ ├─ Data & Types:         [X]/5 [✓/!]                          ║
║ ├─ Design Tokens:        [X]/4 [✓/!]                          ║
║ ├─ Accessibility:        [X]/4 ([Z] warnings)                  ║
║ ├─ Dark Mode:            [X]/3 [✓/!]                          ║
║ ├─ Export Ready:         [X]/4 [✓/!]                          ║
║ ├─ Focus & Keyboard:     [X]/4 [✓/!]                          ║
║ ├─ Error Handling:       [X]/3 [✓/!]                          ║
║ ├─ Loading:              [X]/3 [✓/!]                          ║
║ ├─ Theme:                [X]/6 [✓/!]                          ║
║ └─ Utility Components:   [X]/5 [✓/!] (optional)               ║
╠════════════════════════════════════════════════════════════════╣
║ ISSUES FOUND                                                   ║
║                                                                 ║
║ [List each issue with check ID and details]                    ║
╠════════════════════════════════════════════════════════════════╣
║ RECOMMENDED ACTIONS                                            ║
║                                                                 ║
║ [Numbered list of actions to fix issues]                       ║
╚════════════════════════════════════════════════════════════════╝
```

## Step 0.7: Post-Audit Actions

Based on mode selection from Step 0.1:

- **Audit & Report**: STOP here, display report only
- **Audit & Fix**: Apply fixes for all fixable issues, then continue
- **Enhance**: Skip to Step 3.6
- **Full Rebuild**: Continue to Step 1

If all checks pass, offer UI/UX improvement suggestions:

```
Shell Design Audit Complete ✓

All checks passed. Here are some UI/UX improvement suggestions:

**Navigation:**
- [ ] Add keyboard shortcuts for nav items (Alt+1, Alt+2...)
- [ ] Consider collapsible sidebar with icon-only mode
- [ ] Add breadcrumbs for deep navigation

**Header Actions:**
- [ ] Group similar actions (notifications + messages)
- [ ] Add badge counter on notifications
- [ ] Consider sticky header on scroll

**User Menu:**
- [ ] Add status indicator (online/away/busy)
- [ ] Quick actions in dropdown (switch theme, quick settings)
- [ ] Recent activity summary

**Mobile:**
- [ ] Swipe gestures for drawer
- [ ] Bottom navigation bar alternative
- [ ] Pull-to-refresh pattern

Would you like me to implement any of these suggestions?
```

## Step 1: Check Prerequisites

First, verify prerequisites exist:

1. Read `/product/product-overview.md` — Product name and description
2. Read `/product/product-roadmap.md` — Sections for navigation
3. Check if `/product/design-system/colors.json` and `/product/design-system/typography.json` exist
4. Check if `.claude/skills/frontend-design/SKILL.md` exists and has content
5. **NEW:** Check if UI components for secondary elements exist

If any required file is missing, show a specific error message:

**If `/product/product-overview.md` is missing:**

```
Error: product/product-overview.md - File not found. Run /product-vision to create it.
```

**If `/product/product-roadmap.md` is missing:**

```
Error: product/product-roadmap.md - File not found. Run /product-roadmap to create it.
```

Stop here if any required file is missing.

### Check Section Definitions

Check if any sections have been defined (spec.md exists):

```bash
# Count sections with spec files
SECTION_COUNT=$(find product/sections -name "spec.md" 2>/dev/null | wc -l | tr -d ' ')
echo "Sections with spec.md: $SECTION_COUNT"
```

**If no sections are defined yet:**

```
Note: No sections have been defined yet (no spec.md files found in product/sections/).

The shell navigation will be minimal without sections:
- Navigation will use section placeholders from product-roadmap.md
- Screen designs won't be linked until sections are created
- You may want to re-run /design-shell after defining sections for complete navigation

To define sections, run /shape-section for each section listed in product-roadmap.md.
```

Use AskUserQuestion with options:

- "Continue with minimal navigation" — Proceed, shell will use roadmap titles
- "Stop — I'll define sections first" — END COMMAND

This warning helps users understand that `/design-shell` can be run at any point, but navigation is most complete when sections exist.

### Validate UI Components (for Secondary Components)

Check if Sheet and Dialog components exist for secondary shell components:

```bash
# Check UI components needed for secondary shell elements
SHEET_EXISTS=false
DIALOG_EXISTS=false

if [ -f "src/components/ui/sheet.tsx" ]; then
  SHEET_EXISTS=true
fi

if [ -f "src/components/ui/dialog.tsx" ]; then
  DIALOG_EXISTS=true
fi

echo "UI Components Status:"
echo "- Sheet: $SHEET_EXISTS"
echo "- Dialog: $DIALOG_EXISTS"
```

**If UI components are missing:**

```
Note: Some UI components are missing:
- Sheet: [✓/✗] — Required for drawers (Notifications, Help, Mobile Menu)
- Dialog: [✓/✗] — Required for modals (Search, Settings, Profile)

These are needed for interactive shell elements. You can:
1. Continue without secondary components — Basic shell only
2. Install shadcn/ui components first — Run: npx shadcn@latest add sheet dialog

Which would you prefer?
```

Track the availability for Step 3.6 (interactive elements question).

### Validate Design Guidance (Skill File)

Check that the frontend-design skill file exists and has meaningful content:

```bash
SKILL_FILE=".claude/skills/frontend-design/SKILL.md"
SKILL_AVAILABLE=false

# Check file exists
if [ ! -f "$SKILL_FILE" ]; then
  echo "Warning: SKILL.md - File not found at $SKILL_FILE"
else
  # Check file has meaningful content (>100 characters after frontmatter/metadata)
  # Handle both files with frontmatter (--- delimiters) and without
  if grep -q '^---$' "$SKILL_FILE"; then
    # File has frontmatter - strip it before counting
    CONTENT_LENGTH=$(sed '/^---$/,/^---$/d' "$SKILL_FILE" | tr -d '[:space:]' | wc -c)
  else
    # No frontmatter - count all content (excluding HTML comments at start)
    CONTENT_LENGTH=$(sed '/^<!--.*-->$/d' "$SKILL_FILE" | tr -d '[:space:]' | wc -c)
  fi

  if [ "$CONTENT_LENGTH" -lt 100 ]; then
    echo "Warning: SKILL.md - Insufficient content (< 100 chars). Add meaningful design guidance."
  else
    SKILL_AVAILABLE=true
    echo "Skill file validated"
  fi
fi
```

**If the file is missing or has insufficient content:**

Show a warning and offer to continue with fallback guidance:

```
Note: The frontend-design skill file at `.claude/skills/frontend-design/SKILL.md` is missing or empty.

Without this guidance, the shell design may be more generic. You can:
1. Continue anyway — I'll use basic design principles (results may be less distinctive)
2. Stop here — Add the skill file first for better design quality

The skill file provides guidance on creating distinctive, production-grade interfaces.
```

Use AskUserQuestion with options:

- "Continue with basic design principles" — Proceed using fallback guidance
- "Stop — I'll add the skill file first" — END COMMAND

Track user's choice - if continuing without skill file, use these **enhanced fallback design principles** (see agents.md → "Enhanced Fallback Design Guidance" for full details):

**Aesthetic Tone Options** (ask user to choose one):

- **Refined Utility**: Clean, purposeful, subtle shadows, muted accents, professional feel
- **Bold & Bright**: High contrast, vibrant colors, strong typography, energetic
- **Soft & Approachable**: Rounded corners, pastel accents, generous spacing, friendly
- **Professional Dense**: Compact layout, neutral palette, efficient use of space, data-focused

**Visual Hierarchy** (beyond just sizes):

- Create clear distinction using size, weight, AND color together
- Use generous whitespace around primary actions
- Group related elements with subtle background colors
- Apply contrast intentionally to guide the eye

**Spacing System:**

- Use 8px increments for padding and margins (8, 16, 24, 32, 48, 64)
- Maintain consistent gutter widths (16px on mobile, 24px on tablet, 32px on desktop)
- Apply generous whitespace around primary actions

**Color Application:**

- Primary: Reserve for key actions and active states (buttons, links, selected items)
- Secondary: Use for supportive elements (badges, highlights, secondary buttons)
- Neutral: Create hierarchy with 3-4 distinct shades (not more)
- Accent: One unexpected color choice for distinctiveness

**Typography Choices:**

- Headings: Slightly heavier weight (600-700), moderate tracking
- Body: Regular weight (400), comfortable line height (1.5-1.7)
- Use size differences of at least 4px between hierarchy levels
- Consider one distinctive font choice (avoid Inter, Roboto unless product specifically requires them)

**Motion & Interaction:**

- Prefer CSS transitions over JavaScript animations
- Use 150-200ms for hover states
- Use 250-300ms for entry/exit animations
- Avoid bounce or overshoot effects unless matching a playful tone

**Responsive Breakpoints:**

- Mobile: < 640px (single column, stacked nav)
- Tablet: 640-1024px (condensed sidebar or collapsible nav)
- Desktop: > 1024px (full sidebar, multi-column layouts)

**Dark Mode:**

- Backgrounds: stone-900 to stone-950 (never pure black)
- Text: stone-100 to stone-300
- Borders: stone-700 to stone-800
- Increase contrast for interactive elements

**Distinctiveness Requirement:**
Even without the full skill file, make at least ONE distinctive choice:

- An unexpected color accent
- Asymmetric layout element
- Creative use of negative space
- Unique hover interaction
- Non-standard card treatment

### Check Optional Enhancements

If design tokens are missing, show a warning but continue:

"Note: Design tokens haven't been defined yet. I'll proceed with default styling, but you may want to run `/design-tokens` first for consistent colors and typography."

## Step 2: Analyze Product Structure

Review the roadmap sections and present navigation options with recommendations based on product size:

"I'm designing the shell for **[Product Name]**. Based on your roadmap, you have [N] sections:

1. **[Section 1]** — [Description]
2. **[Section 2]** — [Description]
3. **[Section 3]** — [Description]

Let's decide on the shell layout. Common patterns:

**A. Sidebar Navigation** — Vertical nav on the left, content on the right
Best for: Apps with many sections, dashboard-style tools, admin panels
**Recommended when:** 5+ sections, complex navigation hierarchy, or data-heavy applications

**B. Top Navigation** — Horizontal nav at top, content below
Best for: Simpler apps, marketing-style products, fewer sections
**Recommended when:** 3-4 sections, content-focused products, or public-facing sites

**C. Minimal Header** — Just logo + user menu, sections accessed differently
Best for: Single-purpose tools, wizard-style flows
**Recommended when:** 1-2 sections, focused workflows, or embedded applications

**Based on your [N] sections, I'd recommend [Pattern A/B/C]** because [reason based on section count and product type].

Which pattern fits **[Product Name]** best? (I can also suggest alternatives if none of these feel right.)"

Wait for their response.

---

**Next:** Continue to Phase 2 (Steps 3-5) for design configuration.
