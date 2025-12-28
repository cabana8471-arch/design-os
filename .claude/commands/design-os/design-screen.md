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

Track user's choice - if continuing without skill file, use the **fallback design principles** defined in `/design-shell` Step 1.

> **Note:** The fallback design principles (Visual Hierarchy, Spacing System, Component Patterns, Responsive Breakpoints, Dark Mode) are defined in `.claude/commands/design-os/design-shell.md` Step 1. This avoids duplication and ensures consistency between shell and screen design commands.

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

If design direction exists, read it and display a confirmation:

"I found your Design Direction document. I'll ensure this screen design follows the established aesthetic: [aesthetic tone from document]"

Read the key sections:

- **Visual Signatures** — Elements that MUST appear consistently
- **Color Application** — How primary/secondary/neutral colors are used
- **Motion & Interaction** — Animation style and timing
- **Typography Treatment** — How typography creates hierarchy
- **Consistency Guidelines** — Rules that MUST remain consistent

### Parse Design Direction

Read and extract the key preferences from the design direction document:

**1. User Preferences Table:**

Extract the values from the `## User Preferences` section:

| Setting                 | Value to Apply                                        |
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

If neither shell nor design direction exists, proceed with the design guidance from Step 1 (skill file or fallback).

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

| Pattern              | Views                                  | Use Case                               |
| -------------------- | -------------------------------------- | -------------------------------------- |
| Single view          | `[SectionName]View`                    | Simple sections (settings, about page) |
| List + Detail        | `ListView`, `DetailView`               | CRUD for a single entity               |
| List + Detail + Form | `ListView`, `DetailView`, `CreateForm` | Full CRUD operations                   |
| Dashboard + Settings | `DashboardView`, `SettingsView`        | Section with config                    |

**Validation:**

If the `## Views` section exists but has no valid entries:

```
Warning: spec.md has a ## Views section but no views could be parsed.
Expected format: "- ViewName — Description"
Proceeding as single-view section.
```

### Layout Patterns Extraction from spec.md

The `## Layout Patterns` section in spec.md defines the preferred layouts for different screen sizes (added by `/shape-section`):

**Expected spec.md format:**

```markdown
## Layout Patterns

- **Desktop:** Table + Drawer
- **Mobile/Tablet:** Card Stack
- **Responsive Behavior:** Different patterns
```

**Extraction rules:**

1. Look for `## Layout Patterns` section in spec.md
2. Parse the three entries: Desktop, Mobile/Tablet, Responsive Behavior
3. If section doesn't exist, use defaults based on content type

**Layout Pattern Values:**

| Pattern              | Description                             | Component Pattern                                |
| -------------------- | --------------------------------------- | ------------------------------------------------ |
| **Desktop Patterns** |                                         |                                                  |
| Table + Drawer       | Data table, row click opens drawer      | `<DataTable />` + `<Drawer />`                   |
| Card Grid            | Visual cards in grid layout             | `<div className="grid grid-cols-3">`             |
| Split View           | Master list + detail panel side-by-side | `<div className="flex"><List /><Detail /></div>` |
| Full-Page Detail     | Navigate to separate detail page        | Router-based navigation                          |
| **Mobile Patterns**  |                                         |                                                  |
| Card Stack           | Vertical scrolling cards                | `<div className="space-y-4">`                    |
| Compact List         | Minimal list items                      | `<ul className="divide-y">`                      |
| Bottom Sheet         | Details in swipe-up sheet               | `<BottomSheet />` component                      |
| Accordion            | Inline expandable items                 | `<Accordion />` component                        |

**Responsive Behavior Values:**

| Behavior                 | Implementation                              |
| ------------------------ | ------------------------------------------- |
| Same pattern, adapted    | Use same component, responsive classes only |
| Different patterns       | Render different components per breakpoint  |
| Mobile-first progressive | Start mobile, add desktop enhancements      |

**Apply Layout Patterns:**

When creating the screen design components:

1. **For Desktop:** Use the specified desktop pattern as the primary layout
2. **For Mobile/Tablet:** Use the specified mobile pattern or adapt desktop
3. **Responsive classes:** Apply Tailwind breakpoint classes based on behavior:
   - Same pattern: `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"`
   - Different patterns: `{isMobile ? <CardStack /> : <DataTable />}` or `className="hidden lg:block"`

**If Layout Patterns section is missing:**

```
Note: No Layout Patterns specified in spec.md. I'll use sensible defaults based on the content type:
- List views → Table (desktop), Cards (mobile)
- Detail views → Full width (all sizes)
- Forms → Single column (mobile), Two columns (desktop)
```

### View Relationships Extraction from spec.md

The `## View Relationships` section in spec.md defines how views connect to each other (added by `/shape-section` Step 4.6).

**Expected spec.md format:**

```markdown
## View Relationships

- AgentListView.onView -> AgentDetailDrawer (drawer, entityId)
- AgentListView.onCreate -> CreateAgentModal (modal, none)
```

**Parsing algorithm:**

```python
relationships = []
in_relationships_section = False

for line in spec_lines:
    if line.strip() == "## View Relationships":
        in_relationships_section = True
    elif line.startswith("## ") and in_relationships_section:
        break  # Next section started
    elif in_relationships_section and line.startswith("- "):
        # Parse: "- PrimaryView.callback -> SecondaryView (type, dataRef)"
        # Regex: ^- (\w+)\.(\w+) -> (\w+) \((\w+), (\w+)\)$
        match = re.match(r'^- (\w+)\.(\w+) -> (\w+) \((\w+), (\w+)\)$', line.strip())
        if match:
            relationships.append({
                'primary': match.group(1),
                'callback': match.group(2),
                'secondary': match.group(3),
                'type': match.group(4),      # drawer | modal | inline
                'dataRef': match.group(5)    # entityId | entity | none
            })
```

**Relationship data structure:**

| Field       | Description                       | Example Values                             |
| ----------- | --------------------------------- | ------------------------------------------ |
| `primary`   | The view that triggers the action | `AgentListView`                            |
| `callback`  | The callback prop name            | `onView`, `onCreate`, `onEdit`, `onDelete` |
| `secondary` | The view that opens               | `AgentDetailDrawer`, `CreateAgentModal`    |
| `type`      | UI element type                   | `drawer`, `modal`, `inline`                |
| `dataRef`   | Data passing method               | `entityId`, `entity`, `none`               |

**If no relationships section exists:**

```python
relationships = []  # Empty list - use legacy console.log behavior
```

This is the backwards-compatible behavior for specs created before Step 4.6 was added.

**Store relationships for later use:**

The extracted relationships will be used in:

- **Step 4:** Determine if we should create all related views together
- **Step 7.5:** Create secondary view components
- **Step 8:** Generate wired preview wrappers instead of console.log handlers

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

### Create Related Views Together (If Relationships Exist)

If the spec contains a `## View Relationships` section (parsed in Step 3), offer to create all related views in a single run.

**Check for relationships:**

```python
# From Step 3 parsing
relationships = [...]  # List of relationship objects

# Find relationships where selected view is PRIMARY
related_secondaries = [r for r in relationships if r['primary'] == selected_view]

# Find relationships where selected view is SECONDARY
related_primaries = [r for r in relationships if r['secondary'] == selected_view]
```

**If selected view is PRIMARY with related secondaries:**

```
I see **[PrimaryView]** is connected to secondary view(s):

1. **[SecondaryView1]** — opens via `[callback1]` ([type1])
2. **[SecondaryView2]** — opens via `[callback2]` ([type2])

Would you like me to create all related views together?
```

Use AskUserQuestion with options:

- "Yes, create all together (Recommended)" — Create primary + all secondaries + wired preview
- "Create only [PrimaryView]" — Create just the primary, callbacks will console.log
- "Create only [SecondaryView]" — Create a specific secondary in isolation

**If user chooses "Create all together":**

Track views to create:

```python
VIEWS_TO_CREATE = [
    { 'name': selected_view, 'role': 'primary' },
    { 'name': secondary1, 'role': 'secondary', 'relationship': rel1 },
    { 'name': secondary2, 'role': 'secondary', 'relationship': rel2 },
]
CREATE_WIRED_PREVIEW = True
```

**If user chooses single view:**

```python
VIEWS_TO_CREATE = [{ 'name': selected_view, 'role': 'standalone' }]
CREATE_WIRED_PREVIEW = False  # Use console.log handlers
```

**Output confirmation:**

If creating multiple views:

```
I'll create these components:

**Components** (exportable, props-based):
- src/sections/[id]/components/[PrimaryView].tsx
- src/sections/[id]/components/[SecondaryView1].tsx
- src/sections/[id]/components/[SecondaryView2].tsx
- src/sections/[id]/components/index.ts

**Preview wrappers** (Design OS only):
- src/sections/[id]/[PrimaryView].tsx — Wired preview with working [type]
- src/sections/[id]/[SecondaryView1].tsx — Standalone preview for testing
- src/sections/[id]/[SecondaryView2].tsx — Standalone preview for testing

Proceeding...
```

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

| Step | Command              | What It Does for Multi-View Sections                                                                     |
| ---- | -------------------- | -------------------------------------------------------------------------------------------------------- |
| 1    | `/shape-section`     | Defines all views in the `## Views` section of `spec.md`                                                 |
| 2    | `/sample-data`       | Creates data for ALL views in a single `data.json`, creates Props interfaces for EACH view in `types.ts` |
| 3    | `/design-screen`     | Run N times (once per view). Each run creates one component + preview wrapper                            |
| 4    | `/screenshot-design` | Run N times (once per view). Each run captures one screenshot                                            |
| 5    | `/export-product`    | Exports ALL view components together with their shared types                                             |

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
- Other views are accessed via `/sections/[section-id]/screen-designs/[ViewName]` (matching the component file name, PascalCase)
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

### Cross-Section Consistency Check

Before creating the component, check if other sections already have screen designs:

```bash
# List existing section components
ls src/sections/*/components/*.tsx 2>/dev/null | head -10
```

**If other sections exist**, analyze their styling patterns to ensure consistency:

1. **Color class patterns** — Check for primary color usage (e.g., `bg-lime-600`, `text-lime-500`)
2. **Spacing patterns** — Check for consistent padding/margin (e.g., `p-6`, `gap-4`, `space-y-4`)
3. **Typography patterns** — Check for heading/body text styles (e.g., `text-xl font-semibold`)
4. **Component patterns** — Check for card styles, button styles, table layouts

Example analysis:

```bash
# Extract color patterns from existing components
grep -rh 'bg-[a-z]+-[0-9]\+' src/sections/*/components/*.tsx 2>/dev/null | sort | uniq -c | sort -rn | head -5

# Extract spacing patterns
grep -rh 'p-[0-9]\+\|px-[0-9]\+\|py-[0-9]\+' src/sections/*/components/*.tsx 2>/dev/null | sort | uniq -c | head -5
```

**Apply matching patterns** to the new screen design to maintain visual cohesion across sections.

**If design-direction.md exists**, use it as the primary reference. If not, infer patterns from existing section components.

**Report to user:**
"I found [N] existing section(s) with screen designs. I'll match the established patterns:

- Primary color: [color]-[shade] for buttons/accents
- Card style: [padding], [border/shadow style]
- Spacing: [consistent spacing pattern]"

## Step 6: Create the Props-Based Component

### Create Directory

First, create the necessary directories if they don't exist:

```bash
mkdir -p src/sections/[section-id]/components
```

Then validate the directory was created successfully:

```bash
if [ ! -d "src/sections/[section-id]/components" ]; then
  echo "Error: src/sections/[section-id]/components/ - Directory creation failed. Check write permissions."
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

| File Type                               | Import From Component  | Example                                                                                       |
| --------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| **Types** (types.ts in product/)        | Alias path via product | `import type { InvoiceListProps } from '@/../product/sections/invoices/types'`                |
| **Sample data** (data.json in product/) | Alias path via product | `import invoiceData from '@/../product/sections/invoices/data.json'` (preview wrappers only!) |
| **Sub-components** (in same directory)  | Relative path          | `import { StatusBadge } from './StatusBadge'`                                                 |
| **UI components** (shared library)      | Alias path             | `import { Button } from '@/components/ui/button'`                                             |

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
import type { InvoiceListProps } from "@/../product/sections/invoices/types";

export function InvoiceList({
  invoices,
  onView,
  onEdit,
  onDelete,
  onCreate,
}: InvoiceListProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Component content here */}

      {/* Example: Using a callback */}
      <button onClick={onCreate}>Create Invoice</button>

      {/* Example: Mapping data with callbacks */}
      {invoices.map((invoice) => (
        <div key={invoice.id}>
          <span>{invoice.clientName}</span>
          <button onClick={() => onView?.(invoice.id)}>View</button>
          <button onClick={() => onEdit?.(invoice.id)}>Edit</button>
          <button onClick={() => onDelete?.(invoice.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
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
// Note: Replace [neutral] with your neutral color from design tokens (e.g., stone, slate, gray)
<div className="bg-white dark:bg-[neutral]-900 border border-[neutral]-200 dark:border-[neutral]-800">
  <p className="text-[neutral]-900 dark:text-[neutral]-100">Primary text</p>
  <p className="text-[neutral]-600 dark:text-[neutral]-400">Secondary text</p>
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
import type { Invoice } from "@/../product/sections/[section-id]/types";

interface InvoiceRowProps {
  invoice: Invoice;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function InvoiceRow({
  invoice,
  onView,
  onEdit,
  onDelete,
}: InvoiceRowProps) {
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
  );
}
```

Then import and use in the main component:

```tsx
import { InvoiceRow } from "./InvoiceRow";

export function InvoiceList({
  invoices,
  onView,
  onEdit,
  onDelete,
}: InvoiceListProps) {
  return (
    <div>
      {invoices.map((invoice) => (
        <InvoiceRow
          key={invoice.id}
          invoice={invoice}
          onView={() => onView?.(invoice.id)}
          onEdit={() => onEdit?.(invoice.id)}
          onDelete={() => onDelete?.(invoice.id)}
        />
      ))}
    </div>
  );
}
```

## Step 7.5: Create Secondary View Components (If Relationships Exist)

If `CREATE_WIRED_PREVIEW = True` (from Step 4), create the secondary view components now.

**For each secondary view in `VIEWS_TO_CREATE`:**

### Secondary View Component Pattern

Secondary views (drawers, modals, inline panels) receive the **full entity object** rather than just an ID, because the preview wrapper does the lookup.

**Example: Drawer Component**

```tsx
// src/sections/[section-id]/components/AgentDetailDrawer.tsx
import type {
  Agent,
  AgentDetailDrawerProps,
} from "@/../product/sections/[section-id]/types";

export function AgentDetailDrawer({
  agent,
  onClose,
  onEdit,
  onDelete,
}: AgentDetailDrawerProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Header with close button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{agent.name}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Agent details */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-stone-500">Status</label>
          <p className="font-medium">{agent.status}</p>
        </div>
        <div>
          <label className="text-sm text-stone-500">Last Seen</label>
          <p className="font-medium">{agent.lastSeen}</p>
        </div>
        {/* Add more fields based on entity structure */}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={onEdit}
          className="flex-1 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
```

**Example: Modal Component (Create Form)**

```tsx
// src/sections/[section-id]/components/CreateAgentModal.tsx
import type { CreateAgentModalProps } from "@/../product/sections/[section-id]/types";

export function CreateAgentModal({ onClose, onSave }: CreateAgentModalProps) {
  return (
    <div className="space-y-6">
      {/* Modal header */}
      <div>
        <h2 className="text-xl font-semibold">Create New Agent</h2>
        <p className="text-sm text-stone-500">Add a new agent to your system</p>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Agent Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter agent name"
          />
        </div>
        {/* Add more fields as needed */}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            onSave?.({
              /* form data */
            })
          }
          className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700"
        >
          Create Agent
        </button>
      </div>
    </div>
  );
}
```

### Secondary View Props Pattern

The Props interfaces for secondary views should be generated by `/sample-data` in `types.ts`:

```typescript
// For drawer/detail views - receive full entity
export interface AgentDetailDrawerProps {
  agent: Agent;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// For create modals - no entity, just callbacks
export interface CreateAgentModalProps {
  onClose?: () => void;
  onSave?: (agent: Partial<Agent>) => void;
}

// For edit modals - receive entity + save callback
export interface EditAgentModalProps {
  agent: Agent;
  onClose?: () => void;
  onSave?: (agent: Agent) => void;
}
```

### Create Standalone Previews for Secondary Views

Each secondary view also gets its own standalone preview wrapper for isolated testing:

```tsx
// src/sections/[section-id]/AgentDetailDrawerPreview.tsx
import data from "@/../product/sections/[section-id]/data.json";
import { AgentDetailDrawer } from "./components/AgentDetailDrawer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { Agent } from "@/../product/sections/[section-id]/types";

export default function AgentDetailDrawerPreview() {
  // Use first entity from sample data for preview
  const agent = (data.agents as Agent[])[0];

  if (!agent) {
    return (
      <div className="p-8 text-center text-stone-500">
        No sample data available. Run /sample-data first.
      </div>
    );
  }

  return (
    <Sheet defaultOpen>
      <SheetContent>
        <AgentDetailDrawer
          agent={agent}
          onClose={() => console.log("Close drawer")}
          onEdit={() => console.log("Edit agent:", agent.id)}
          onDelete={() => console.log("Delete agent:", agent.id)}
        />
      </SheetContent>
    </Sheet>
  );
}
```

## Step 8: Create the Preview Wrapper

Create a preview wrapper at `src/sections/[section-id]/[ViewName].tsx` (note: this is in the section root, not in components/).

This wrapper is what Design OS renders. It imports the sample data and feeds it to the props-based component.

Example:

```tsx
import data from "@/../product/sections/[section-id]/data.json";
import { InvoiceList } from "./components/InvoiceList";

export default function InvoiceListPreview() {
  return (
    <InvoiceList
      invoices={data.invoices}
      onView={(id) => console.log("View invoice:", id)}
      onEdit={(id) => console.log("Edit invoice:", id)}
      onDelete={(id) => console.log("Delete invoice:", id)}
      onCreate={() => console.log("Create new invoice")}
    />
  );
}
```

The preview wrapper:

- Has a `default` export (required for Design OS routing)
- Imports sample data from data.json
- Passes data to the component via props
- Provides console.log handlers for callbacks (for testing interactions)
- Is NOT exported to the user's codebase - it's only for Design OS
- **Will render inside the shell** if one has been designed

### Wired Preview Wrapper Templates

If `CREATE_WIRED_PREVIEW = True` (from Step 4), use these templates instead of the console.log version.

**Template: Drawer Pattern**

When the spec defines a drawer relationship (e.g., `ListView.onView -> DetailDrawer (drawer, entityId)`):

```tsx
// src/sections/[section-id]/AgentListPreview.tsx
import { useState } from "react";
import data from "@/../product/sections/[section-id]/data.json";
import { AgentList } from "./components/AgentList";
import { AgentDetailDrawer } from "./components/AgentDetailDrawer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { Agent } from "@/../product/sections/[section-id]/types";

export default function AgentListPreview() {
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Lookup entity from sample data
  const selectedAgent = selectedId
    ? (data.agents as Agent[]).find((a) => a.id === selectedId)
    : null;

  // Wire onView callback to open drawer
  const handleView = (id: string) => {
    setSelectedId(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedId(null);
  };

  return (
    <>
      <AgentList
        agents={data.agents}
        onView={handleView}
        onEdit={(id) => console.log("Edit:", id)}
        onCreate={() => console.log("Create")}
      />

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent>
          {selectedAgent ? (
            <AgentDetailDrawer
              agent={selectedAgent}
              onClose={handleCloseDrawer}
              onEdit={() => console.log("Edit:", selectedId)}
              onDelete={() => {
                console.log("Delete:", selectedId);
                handleCloseDrawer();
              }}
            />
          ) : selectedId ? (
            <div className="p-4 text-red-500">
              Error: Agent with ID "{selectedId}" not found in sample data
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
```

**Template: Modal Pattern**

When the spec defines a modal relationship (e.g., `ListView.onCreate -> CreateModal (modal, none)`):

```tsx
// src/sections/[section-id]/AgentListPreview.tsx
import { useState } from "react";
import data from "@/../product/sections/[section-id]/data.json";
import { AgentList } from "./components/AgentList";
import { CreateAgentModal } from "./components/CreateAgentModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AgentListPreview() {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <AgentList
        agents={data.agents}
        onView={(id) => console.log("View:", id)}
        onCreate={() => setIsModalOpen(true)}
        onEdit={(id) => console.log("Edit:", id)}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <CreateAgentModal
            onClose={() => setIsModalOpen(false)}
            onSave={(agent) => {
              console.log("Created:", agent);
              setIsModalOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**Template: Inline Pattern**

When the spec defines an inline relationship (e.g., `ListView.onView -> DetailInline (inline, entityId)`):

```tsx
// src/sections/[section-id]/AgentListPreview.tsx
import { useState } from "react";
import data from "@/../product/sections/[section-id]/data.json";
import { AgentList } from "./components/AgentList";
import { AgentDetailInline } from "./components/AgentDetailInline";
import type { Agent } from "@/../product/sections/[section-id]/types";

export default function AgentListPreview() {
  // Inline expansion state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const expandedAgent = expandedId
    ? (data.agents as Agent[]).find((a) => a.id === expandedId)
    : null;

  return (
    <AgentList
      agents={data.agents}
      expandedId={expandedId}
      expandedContent={
        expandedAgent ? (
          <AgentDetailInline
            agent={expandedAgent}
            onClose={() => setExpandedId(null)}
          />
        ) : null
      }
      onToggle={handleToggle}
      onEdit={(id) => console.log("Edit:", id)}
    />
  );
}
```

**Template: Multiple Relationships (Drawer + Modal)**

When a primary view has multiple relationships:

```tsx
// src/sections/[section-id]/AgentListPreview.tsx
import { useState } from "react";
import data from "@/../product/sections/[section-id]/data.json";
import { AgentList } from "./components/AgentList";
import { AgentDetailDrawer } from "./components/AgentDetailDrawer";
import { CreateAgentModal } from "./components/CreateAgentModal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Agent } from "@/../product/sections/[section-id]/types";

export default function AgentListPreview() {
  // Drawer state (for onView)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modal state (for onCreate)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Lookup selected entity
  const selectedAgent = selectedId
    ? (data.agents as Agent[]).find((a) => a.id === selectedId)
    : null;

  // Handlers
  const handleView = (id: string) => {
    setSelectedId(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedId(null);
  };

  return (
    <>
      <AgentList
        agents={data.agents}
        onView={handleView}
        onCreate={() => setIsCreateModalOpen(true)}
        onEdit={(id) => console.log("Edit:", id)}
      />

      {/* Drawer for viewing details */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent>
          {selectedAgent && (
            <AgentDetailDrawer
              agent={selectedAgent}
              onClose={handleCloseDrawer}
              onEdit={() => console.log("Edit:", selectedId)}
              onDelete={() => {
                console.log("Delete:", selectedId);
                handleCloseDrawer();
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Modal for creating new agent */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <CreateAgentModal
            onClose={() => setIsCreateModalOpen(false)}
            onSave={(agent) => {
              console.log("Created:", agent);
              setIsCreateModalOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

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
export { InvoiceList } from "./InvoiceList";
export { InvoiceDetail } from "./InvoiceDetail";
export { InvoiceRow } from "./InvoiceRow";

// Re-export Props interfaces for convenience
export type {
  InvoiceListProps,
  InvoiceDetailProps,
} from "@/../product/sections/[section-id]/types";

// Optionally re-export entity types if useful
export type {
  Invoice,
  LineItem,
} from "@/../product/sections/[section-id]/types";
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

### View Progress Tracking

After creating a component, check and report the view progress for multi-view sections:

```bash
# Count views from spec (lines starting with "- " under ## Views section)
SPEC_VIEWS=$(sed -n '/^## Views$/,/^## /p' product/sections/[section-id]/spec.md | grep -c '^- ')

# Count created components (excluding index.ts)
CREATED=$(ls src/sections/[section-id]/components/*.tsx 2>/dev/null | grep -v index.ts | wc -l | tr -d ' ')

if [ "$SPEC_VIEWS" -gt 0 ] && [ "$CREATED" -lt "$SPEC_VIEWS" ]; then
  REMAINING=$((SPEC_VIEWS - CREATED))
  echo "Progress: $CREATED of $SPEC_VIEWS views created. $REMAINING view(s) remaining."
fi
```

**Report to user:**

- For single-view sections: No additional message needed
- For multi-view sections: "Progress: Created X of Y views. Z view(s) remaining: [list pending view names]"

This helps users track their progress and ensures all views are completed before running `/export-product`.

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

> **How `@/../product/` works:**
>
> The `@/../product/` pattern is NOT a separate alias — it combines the `@/` alias with relative path navigation:
>
> 1. `@/` resolves to `./src/`
> 2. `../` navigates up from `src/` to the project root
> 3. `product/` enters the product directory
>
> **Result:** `@/../product/sections/invoices/types` → `./src/../product/sections/invoices/types` → `./product/sections/invoices/types`
>
> This pattern requires only the standard `@/*` alias configuration — no additional paths needed.

**Import patterns used in screen designs:**
| Pattern | Resolves To | Use Case |
|---------|-------------|----------|
| `@/components/ui/button` | `./src/components/ui/button` | UI components |
| `@/lib/utils` | `./src/lib/utils` | Utilities |
| `@/../product/sections/[id]/types` | `./product/sections/[id]/types` | Section types |
| `@/../product/sections/[id]/data.json` | `./product/sections/[id]/data.json` | Sample data (preview only) |

**Troubleshooting:**

| Issue              | Symptom                           | Fix                                       |
| ------------------ | --------------------------------- | ----------------------------------------- |
| Missing path alias | `Cannot find module '@/...'`      | Add `paths` to tsconfig.json              |
| Wrong baseUrl      | Imports resolve incorrectly       | Set `baseUrl: "."` in tsconfig.json       |
| Vite not resolving | Works in IDE but fails at runtime | Check `vite.config.ts` has matching alias |

**Vite alias configuration (if needed):**

```ts
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```
