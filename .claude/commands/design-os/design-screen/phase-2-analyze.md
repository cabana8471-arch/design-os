<!-- v1.0.0 -->

# Phase 2: Analysis & Scope (Steps 3-5)

This phase covers Step 3 (Analyze Requirements), Step 4 (Clarify Screen Design Scope), and Step 5 (Apply Frontend Design Guidance).

---

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

**View Name Validation (PascalCase):**

After extracting view names, validate they follow PascalCase convention:

```
For each view in views:
  if view.name does NOT match pattern "^[A-Z][a-zA-Z0-9]*$":
    print "Warning: View name '[view.name]' doesn't follow PascalCase convention."
    print "Expected format: ListView, DetailView, DashboardView, etc."
    print "Consider renaming in spec.md before continuing."
```

This helps catch common mistakes:

- `listView` → should be `ListView`
- `list-view` → should be `ListView`
- `LIST_VIEW` → should be `ListView`

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
        # Regex: Flexible spacing to handle variations like extra spaces around dots/arrows
        match = re.match(r'^\s*-\s*(\w+)\s*\.\s*(\w+)\s*->\s*(\w+)\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)\s*$', line.strip())
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

> **Version Note:** The `## View Relationships` section (Step 4.6) was added to `/shape-section` as part of the multi-view workflow enhancement. Specs created before this enhancement won't have this section. To add view relationships to an existing spec, either re-run `/shape-section` or manually add the `## View Relationships` section following the format above.

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

### Design Guidance Priority

Apply design guidance in this priority order:

1. **`product/design-system/design-direction.md`** (if exists) — Contains aesthetic decisions from `/design-shell`, ensures consistency across sections
2. **`.claude/skills/frontend-design/SKILL.md`** (if validated) — Provides general design principles and patterns
3. **Fallback design principles** (from Step 1) — Used when neither of the above is available

> **Key Rule:** If `design-direction.md` exists, its visual signatures and guidelines take precedence. SKILL.md provides additional techniques, but design-direction.md defines the product's specific aesthetic.

### Design Guidance Application

**Scenario A: Skill file was validated in Step 1**

If the skill file passed validation in Step 1, apply the `frontend-design` skill guidance now:

1. Read `.claude/skills/frontend-design/SKILL.md` to load the design guidance
2. Extract key principles from the "Design Thinking" and "Frontend Aesthetics Guidelines" sections
3. Apply the guidance to inform your design decisions for this screen

> **Note:** The `frontend-design` skill is a guidance file, not a slash command. Read it directly rather than invoking it.

### How to Apply the Skill File

When the skill file is available, apply its guidance systematically:

**Step A: Extract Aesthetic Direction**

From the "Design Thinking" or "Aesthetic Direction" section:

- Identify the overall visual tone (e.g., refined utility, bold, minimalist)
- Note any distinctive visual signatures recommended
- Extract color usage guidance beyond basic tokens

**Step B: Apply Tailwind CSS Patterns**

From the "Frontend Aesthetics Guidelines" or "Tailwind Patterns" section:

- Use recommended spacing scale (not arbitrary values)
- Apply suggested border radius patterns (rounded-lg vs rounded-xl)
- Follow shadow hierarchy recommendations
- Use the motion/transition patterns specified

**Step C: Implement Typography Hierarchy**

From typography guidance:

- Apply heading styles (weights, sizes, tracking)
- Use body text recommendations (line-height, color contrast)
- Apply any distinctive font choices mentioned

**Step D: Verify Accessibility**

From "Accessibility Integration" or "A11y" section:

- Ensure color contrast meets guidelines
- Add appropriate ARIA labels
- Verify focus states are visible
- Check touch target sizes

**Step E: Apply Distinctiveness Requirements**

Make at least ONE distinctive choice per component:

- Unexpected hover interaction
- Creative use of negative space
- Non-standard card or button treatment
- Asymmetric layout element

Document which distinctive elements you applied for consistency tracking.

**Scenario B: User chose to continue without skill file in Step 1**

If the user chose to continue without the skill file, use the **fallback design principles** defined in Step 1 (Visual Hierarchy, Spacing System, Component Patterns, Responsive Breakpoints, Dark Mode).

### Key Design Principles to Follow

Regardless of which scenario applies, ensure the screen design follows these principles:

- Create distinctive, non-generic interfaces that avoid common AI design patterns
- Use creative layouts with strong visual hierarchy
- Apply thoughtful spacing and typography choices
- Implement meaningful interactions and animations
- Ensure accessibility and responsive design throughout

### Design Application Verification Checklist (MANDATORY)

**Before finalizing EACH component, verify ALL items below are implemented.** This is NOT optional guidance — it's a verification checklist to ensure design quality.

**If design-direction.md exists:**

- [ ] **Visual Signatures** — ALL 3 signatures from `## Visual Signatures` section are implemented in this component where applicable
- [ ] **Color Application** — Primary, Accent, and Neutral colors follow the rules in `## Color Application`
- [ ] **Typography Treatment** — Heading style, Body approach, and distinctive choices from `## Typography Treatment` are applied
- [ ] **Motion & Interaction** — Animation timings from `## Motion & Interaction` are used for all hover/transition states
- [ ] **Consistency Guidelines** — ALL 3 rules from `## Consistency Guidelines` are verified for this component

**If using fallback design principles (no design-direction.md):**

- [ ] **Aesthetic Tone** — User's chosen tone (Refined Utility / Bold & Bright / Soft & Approachable / Professional Dense) is consistently applied
- [ ] **Visual Hierarchy** — Size, weight, AND color create clear distinction between elements
- [ ] **Color Application** — Primary reserved for key actions, Neutral uses 3-4 distinct shades only
- [ ] **Typography** — Heading/body weights differ by at least 200 (e.g., 400 body, 600 heading)
- [ ] **Motion** — Hover states use 150-200ms, entry/exit use 250-300ms

**Distinctiveness Requirement (ALWAYS required):**

- [ ] At least ONE distinctive visual element exists in this component:
  - Unexpected hover interaction (e.g., color shift, scale, underline animation)
  - Creative negative space usage
  - Non-standard card/button treatment (e.g., gradient border, unique shadow)
  - Asymmetric layout element
  - Custom border radius pattern

**If ANY checklist item is not implemented, go back and fix it before proceeding to Step 6.**

### Cross-Section Consistency Check

Before creating the component, check if other sections already have screen designs:

```bash
# List existing section components
ls src/sections/*/components/*.tsx 2>/dev/null | head -10
```

**If other sections exist**, analyze their styling patterns to ensure consistency:

1. **Container pattern** — Check for page-level container padding (e.g., `px-4 sm:px-6 py-4`)
2. **Color class patterns** — Check for primary color usage (e.g., `bg-lime-600`, `text-lime-500`)
3. **Spacing patterns** — Check for consistent padding/margin (e.g., `p-6`, `gap-4`, `space-y-4`)
4. **Typography patterns** — Check for heading/body text styles (e.g., `text-xl font-semibold`)
5. **Component patterns** — Check for card styles, button styles, table layouts

**Container Pattern Analysis:**

```bash
# Extract container patterns from existing section root divs
grep -rh 'className="h-full\|className="min-h-full' src/sections/*/components/*.tsx 2>/dev/null | head -5
```

**If container patterns are inconsistent:**

```
Warning: Inconsistent container padding detected across sections:
- [Section A]: px-4 sm:px-6 py-4
- [Section B]: p-1
- [Section C]: no padding

I'll apply the standard container pattern from design-direction.md to ensure consistency.
```

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

- Container: [container padding pattern]
- Primary color: [color]-[shade] for buttons/accents
- Card style: [padding], [border/shadow style]
- Spacing: [consistent spacing pattern]"

---

**Next:** Continue to Phase 3 (Steps 6-11) for component creation and completion.
