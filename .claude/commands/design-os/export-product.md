# Export Product

You are helping the user export their complete product design as a handoff package for implementation. This generates all files needed to build the product in a real codebase.

> **Design Note on Step Count:** This command has 18 steps (including Step 8A and Step 10.5), which may seem verbose. This is intentional:
>
> - Each step performs a discrete, verifiable operation
> - Steps can be referenced individually in error messages
> - The granularity aids debugging when exports fail
> - Users can track progress through the export process
>
> Do not attempt to consolidate steps — the verbosity ensures reliability.

**Step Index:**

| Step | Purpose                                                    |
| ---- | ---------------------------------------------------------- |
| 1    | Check prerequisites (product files, templates, skill file) |
| 2    | Gather export information                                  |
| 3    | Create export directory structure                          |
| 4    | Generate product-overview.md                               |
| 5    | Generate milestone instructions (incremental)              |
| 6    | Generate one-shot-instructions.md                          |
| 7    | Copy design guidance (SKILL.md → frontend-design.md)       |
| 8    | Validate all components                                    |
| 8A   | Validate design coherence (conditional)                    |
| 9    | Copy and transform components                              |
| 10   | Generate section READMEs                                   |
| 10.5 | Generate shell README                                      |
| 11   | Consolidate data model types                               |
| 12   | Generate section test instructions                         |
| 13   | Generate design system files                               |
| 14   | Generate prompt files (assemble templates)                 |
| 15   | Generate README.md                                         |
| 16   | Copy screenshots                                           |
| 17   | Create zip file                                            |
| 18   | Confirm completion                                         |

## Step 1: Check Prerequisites

Verify the minimum requirements exist:

**Required:**

- `/product/product-overview.md` — Product overview
- `/product/product-roadmap.md` — Sections defined
- At least one section with screen designs in `src/sections/[section-id]/`

**Recommended (show warning if missing):**

- `/product/data-model/data-model.md` — Global data model
- `/product/design-system/colors.json` — Color tokens
- `/product/design-system/typography.json` — Typography tokens

**Shell Components (optional but recommended):**

Primary Components:

- `src/shell/components/AppShell.tsx` — Application shell wrapper
- `src/shell/components/MainNav.tsx` — Navigation component
- `src/shell/components/UserMenu.tsx` — User menu component
- `src/shell/components/index.ts` — Component exports

Secondary Components (optional - based on /design-shell Step 3.6 selections):

- `src/shell/components/NotificationsDrawer.tsx`
- `src/shell/components/SearchModal.tsx`
- `src/shell/components/ThemeToggle.tsx`
- `src/shell/components/SettingsModal.tsx`
- `src/shell/components/ProfileModal.tsx`
- `src/shell/components/HelpPanel.tsx`
- `src/shell/components/FeedbackModal.tsx`
- `src/shell/components/MobileMenuDrawer.tsx`

**Shell Prerequisite Check:**

Check if shell components exist before proceeding:

```bash
# Check for primary shell component
if [ ! -f "src/shell/components/AppShell.tsx" ]; then
  echo "Shell components not found"
  SHELL_EXISTS=false
else
  SHELL_EXISTS=true
  # Count all shell components
  SHELL_COMPONENT_COUNT=$(ls -1 src/shell/components/*.tsx 2>/dev/null | grep -v index.ts | wc -l)
  echo "Found $SHELL_COMPONENT_COUNT shell component(s)"

  # List secondary components if any
  SECONDARY_COMPONENTS=$(ls -1 src/shell/components/*.tsx 2>/dev/null | grep -v -E "(AppShell|MainNav|UserMenu|index)" | xargs -I {} basename {} .tsx)
  if [ -n "$SECONDARY_COMPONENTS" ]; then
    echo "Secondary components: $SECONDARY_COMPONENTS"
  fi
fi
```

| Shell Status             | Action                                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| Shell components exist   | Include shell in export (Step 8-9 will validate and copy all components) |
| Shell components missing | Show warning, offer to proceed without shell                             |

**If shell is missing:**

```
Note: Shell components haven't been created yet at src/shell/components/.

You can:
1. Proceed without shell — The export will not include shell components
2. Stop and create shell first — Run /design-shell to create the application shell

Most products benefit from a shell for consistent navigation. However, if your product doesn't need a shell (e.g., single-page app, embedded widget), you can proceed without it.
```

Use AskUserQuestion with options:

- "Proceed without shell (Recommended if shell not needed)" — Continue export, skip shell steps
- "Stop — I'll create the shell first" — END COMMAND

Track the user's choice with a `INCLUDE_SHELL` flag for Steps 8-9.

### Check Optional Design Direction

Check if design direction exists (created by /design-shell Step 6.5):

```bash
if [ ! -f "product/design-system/design-direction.md" ]; then
  echo "Note: Design direction not found at product/design-system/design-direction.md"
  echo "Exports will use default design guidance. For consistent branding, run /design-shell first."
  DESIGN_DIRECTION_EXISTS=false
else
  DESIGN_DIRECTION_EXISTS=true
  echo "Design direction found"
fi
```

| Design Direction Status | Action                                                           |
| ----------------------- | ---------------------------------------------------------------- |
| File exists             | Include in export (copy to product-plan/design-system/)          |
| File missing            | Show note (informational only), proceed without design direction |

> **Note:** This is informational only. Unlike shell components, missing design direction does not require user confirmation to proceed.

**If any required file is missing:**

Output error message:

```
"To export your product, you need at minimum:
- A product overview (`/product-vision`)
- A roadmap with sections (`/product-roadmap`)
- At least one section with screen designs

Please complete these first."
```

**END COMMAND** — Do not proceed to Step 2. The export cannot continue without these files.

### Validate Template Files Exist (Boilerplate Integrity Check)

Before proceeding, verify all 12 required template files exist. If any are missing, STOP and report.

> **What this validates:** These are boilerplate files that ship with Design OS, NOT user-created files. This check ensures the installation is complete and uncorrupted.
>
> **If validation fails:**
>
> - **Likely cause:** Incomplete clone, accidental deletion, or corrupted installation
> - **Resolution:** Re-clone the Design OS boilerplate from the source repository
> - **Not a user error:** Users don't create these files — they come with the template

> **Severity Levels:**
>
> - **File existence** → STOP if missing (cannot proceed without templates)
> - **Version comments** → WARNING if missing (proceed but warn for maintenance)

**Required templates:**

- `.claude/templates/design-os/common/top-rules.md`
- `.claude/templates/design-os/common/reporting-protocol.md`
- `.claude/templates/design-os/common/model-guidance.md`
- `.claude/templates/design-os/common/verification-checklist.md`
- `.claude/templates/design-os/common/clarifying-questions.md`
- `.claude/templates/design-os/common/tdd-workflow.md`
- `.claude/templates/design-os/one-shot/preamble.md`
- `.claude/templates/design-os/one-shot/prompt-template.md`
- `.claude/templates/design-os/section/preamble.md`
- `.claude/templates/design-os/section/prompt-template.md`
- `.claude/templates/design-os/section/clarifying-questions.md`
- `.claude/templates/design-os/section/tdd-workflow.md`

> **See also:** `.claude/templates/design-os/README.md` for complete documentation on the template system, including assembly order and variable substitution.

**Required skill file:**

- `.claude/skills/frontend-design/SKILL.md` — Design guidance (copied to export in Step 7)

**If any template is missing:**

STOP and report: "Missing template file: `.claude/templates/design-os/[path]`. Cannot generate prompts without all templates. Please restore the missing file."

**END COMMAND** — Do not proceed to Step 2 if any template is missing.

### Validate Template Version Comments

Before assembling prompts, verify all templates have valid version comments at line 1:

**Version Comment Pattern:** `<!-- v#.#.# -->` or `<!-- v#.#.#-suffix -->`

**Standardized Regex Patterns:**

All version regex patterns should follow this standardized format:

| Context                | Pattern                                                | Description                                      |
| ---------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| **Bash validation**    | `^<!-- v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)? -->$`   | Match version at line start with optional suffix |
| **Template stripping** | `^<!-- v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)? -->\n?` | Strip version and optional newline               |
| **Validation check**   | `<!-- v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)? -->`     | Find any remaining version comments              |

Valid examples:

- `<!-- v1.0.0 -->`
- `<!-- v1.2.0-section -->`
- `<!-- v2.0.0-beta -->`

**Validation Script:**

```bash
# Check each template has a version comment on line 1
VERSION_PATTERN='^<!-- v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)? -->$'

for template in .claude/templates/design-os/common/*.md .claude/templates/design-os/one-shot/*.md .claude/templates/design-os/section/*.md; do
  if [ -f "$template" ]; then
    first_line=$(head -1 "$template")
    if [[ ! "$first_line" =~ $VERSION_PATTERN ]]; then
      echo "Warning: Template missing valid version comment: $template"
      echo "  First line: $first_line"
      echo "  Expected format: <!-- v1.0.0 --> or <!-- v1.0.0-suffix -->"
    fi
  fi
done
```

**If a template is missing a version comment:**

Show warning but continue:

```
Warning: Some templates are missing version comments:
- [template-path]: Missing or invalid version comment

Templates should have a version comment on line 1 (e.g., <!-- v1.0.0 -->).
This helps track template changes across exports.

Proceeding with export, but consider adding version comments for future maintenance.
```

Version comments are stripped during template assembly (Step 14), so missing version comments don't break the export — but they make template maintenance harder.

### Validate File Content (Not Just Existence)

For critical files, verify they contain meaningful content, not just that they exist:

**Content validation rules:**

| File                      | Minimum Requirements                                        |
| ------------------------- | ----------------------------------------------------------- |
| `product-overview.md`     | Contains `# ` heading and at least 50 characters of content |
| `product-roadmap.md`      | Contains at least one `## ` section heading                 |
| `spec.md` (per section)   | Contains `## Overview` or `## User Flows` section           |
| `data.json` (per section) | Valid JSON with at least one key besides `_meta`            |
| `types.ts` (per section)  | Contains at least one `export interface` declaration        |

**Validation script (conceptual):**

```bash
# Check product-overview.md has meaningful content
if [ -f "product/product-overview.md" ]; then
  CONTENT_LENGTH=$(wc -c < "product/product-overview.md")
  if [ "$CONTENT_LENGTH" -lt 50 ]; then
    echo "Warning: product-overview.md appears to be empty or incomplete ($CONTENT_LENGTH bytes)"
  fi
fi
```

**If a required file exists but is empty or invalid:**

Show warning: "File [path] exists but appears to be empty or incomplete. Please verify content before exporting."

Continue with export but note the warning in the README.

If recommended files are missing, show warnings but continue:

"Note: Some recommended items are missing:

- [ ] Data model — Run `/data-model` for consistent entity definitions
- [ ] Design tokens — Run `/design-tokens` for consistent styling
- [ ] Application shell — Run `/design-shell` for navigation structure

You can proceed without these, but they help ensure a complete handoff."

## Step 2: Gather Export Information

Read all relevant files:

1. `/product/product-overview.md` — Product name, description, features
2. `/product/product-roadmap.md` — List of sections in order
3. `/product/data-model/data-model.md` (if exists)
4. `/product/design-system/colors.json` (if exists)
5. `/product/design-system/typography.json` (if exists)
6. `/product/shell/spec.md` (if exists)
7. For each section: `spec.md`, `data.json`, `types.ts`
8. List screen design components in `src/sections/` and `src/shell/`

## Step 3: Create Export Directory Structure

### Create Directories

First, create the root `product-plan/` directory:

```bash
mkdir -p product-plan
```

Then create all required subdirectories:

```bash
mkdir -p product-plan/prompts
mkdir -p product-plan/instructions/incremental
mkdir -p product-plan/design-guidance
mkdir -p product-plan/design-system
mkdir -p product-plan/data-model
mkdir -p product-plan/shell/components
```

Then validate all directories were created:

```bash
for dir in product-plan product-plan/prompts product-plan/instructions/incremental product-plan/design-guidance product-plan/design-system product-plan/data-model product-plan/shell/components; do
  if [ ! -d "$dir" ]; then
    echo "Error: $dir/ - Directory creation failed. Check write permissions."
    exit 1
  fi
done
```

The complete structure will be:

```
product-plan/
├── README.md                    # Quick start guide
├── product-overview.md          # Product summary (always provide)
│
├── design-guidance/             # Design principles and guidance
│   └── frontend-design.md       # Frontend design guidance for implementation
│
├── prompts/                     # Ready-to-use prompts for coding agents
│   ├── one-shot-prompt.md       # Prompt for full implementation
│   └── section-prompt.md        # Prompt template for section-by-section
│
├── instructions/                # Implementation instructions
│   ├── one-shot-instructions.md # All milestones combined
│   └── incremental/             # For milestone-by-milestone implementation
│       ├── 01-foundation.md
│       ├── 02-[first-section].md
│       ├── 03-[second-section].md
│       └── ...
│
├── design-system/               # Design tokens
│   ├── tokens.css
│   ├── tailwind-colors.md
│   └── fonts.md
│
├── data-model/                  # Data model
│   ├── README.md
│   ├── types.ts
│   └── sample-data.json
│
├── shell/                       # Shell components
│   ├── README.md
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── MainNav.tsx
│   │   ├── UserMenu.tsx
│   │   └── index.ts
│   └── screenshot.png (if exists)
│
└── sections/                    # Section components
    └── [section-id]/
        ├── README.md
        ├── tests.md               # Test-writing instructions for TDD
        ├── components/
        │   ├── [Component].tsx
        │   └── index.ts
        ├── types.ts
        ├── sample-data.json
        └── screenshot.png (if exists)
```

## Step 4: Generate product-overview.md

Create `product-plan/product-overview.md`:

```markdown
# [Product Name] — Product Overview

## Summary

[Product description from product-overview.md]

## Planned Sections

[Ordered list of sections from roadmap with descriptions]

1. **[Section 1]** — [Description]
2. **[Section 2]** — [Description]
   ...

## Data Model

[If data model exists: list entity names]
[If not: "Data model to be defined during implementation"]

## Design System

**Colors:**

- Primary: [color or "Not defined"]
- Secondary: [color or "Not defined"]
- Neutral: [color or "Not defined"]

**Typography:**

- Heading: [font or "Not defined"]
- Body: [font or "Not defined"]
- Mono: [font or "Not defined"]

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, and application shell
2. **[Section 1]** — [Brief description]
3. **[Section 2]** — [Brief description]
   ...

Each milestone has a dedicated instruction document in `product-plan/instructions/`.
```

## Step 5: Generate Milestone Instructions

### Preamble Handling for One-Shot vs Incremental

**One-Shot Prompt (`one-shot-prompt.md`):**

- Include the preamble **once at the top** of the file
- All milestone instructions follow in sequence
- The preamble applies to the entire implementation

**Incremental Instructions (`instructions/incremental/*.md`):**

- **Each milestone file includes its own preamble** at the top
- This ensures the preamble is always visible when providing a single milestone
- Preamble can be customized per milestone if needed (e.g., different context for foundation vs sections)

**Why separate preambles?**

- Incremental files are meant to be provided independently
- User may skip earlier milestones or provide them in different sessions
- Each file should be self-contained with full context

---

Each milestone instruction file should begin with the following preamble (adapt the milestone-specific details):

```markdown
---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---
```

### 01-foundation.md

Place in `product-plan/instructions/incremental/01-foundation.md`:

> **Pseudo-code Notation:** This template uses `[IF condition]` and `[If ... :]` syntax as instructions for the AI to conditionally include/exclude content based on the export state. When generating the actual file, evaluate these conditions and include only the appropriate content — do not output the brackets or conditions themselves.

```markdown
# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`, `design-guidance/frontend-design.md`
> **Prerequisites:** None
> **Note:** If shell components exist in export, Foundation includes shell setup.

[Include the preamble above]

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

[If design tokens exist:]
Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

[If not:]
Define your own design tokens based on your brand guidelines.

### 2. Data Model Types

[If data model exists:]
Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for interface definitions
- See `product-plan/data-model/README.md` for entity relationships

[If not:]
Define data types as you implement each section.

### 3. Routing Structure

Create placeholder routes for each section:

[List routes based on roadmap sections]

### 4. Application Shell

> **Note:** This section is conditional based on `INCLUDE_SHELL` flag set in Step 1.

**[IF INCLUDE_SHELL=true] — Shell components included in export:**

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu with avatar
- Plus any secondary components (NotificationsDrawer, SearchModal, etc. if included)

**Wire Up Navigation:**

Connect navigation to your routing:

[List nav items from shell spec]

**User Menu:**

The user menu expects:

- User name
- Avatar URL (optional)
- Logout callback

**[IF INCLUDE_SHELL=false] — Shell components NOT included in export:**

Design and implement your own application shell with:

- Navigation for all sections
- User menu
- Responsive layout

The export does not include shell components. Refer to `product-overview.md` for section structure and design your own navigation.

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- [IF INCLUDE_SHELL=true] `product-plan/shell/README.md` — Shell design intent
- [IF INCLUDE_SHELL=true] `product-plan/shell/components/` — Shell React components
- [IF INCLUDE_SHELL=true] `product-plan/shell/screenshot.png` — Shell visual reference

## Done When

- [ ] Design tokens are configured
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [IF INCLUDE_SHELL=true] Shell renders with navigation
- [IF INCLUDE_SHELL=true] Navigation links to correct routes
- [IF INCLUDE_SHELL=true] User menu shows user info
- [IF INCLUDE_SHELL=false] Custom navigation implemented
- [ ] Responsive on mobile
```

### [NN]-[section-id].md (for each section)

Place in `product-plan/instructions/incremental/[NN]-[section-id].md` (starting at 02 for the first section):

```markdown
# Milestone [N]: [Section Title]

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the [Section Title] feature — [brief description from roadmap].

## Overview

[One paragraph describing what this section enables users to do. Focus on the user's perspective and the value they get from this feature. Extract from spec.md overview.]

**Key Functionality:**

- [Bullet point 1 — e.g., "View a list of all projects with status indicators"]
- [Bullet point 2 — e.g., "Create new projects with name, description, and due date"]
- [Bullet point 3 — e.g., "Edit existing project details inline"]
- [Bullet point 4 — e.g., "Delete projects with confirmation"]
- [Bullet point 5 — e.g., "Filter projects by status or search by name"]

[List 3-6 key capabilities that the UI components support and need backend wiring]

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/[section-id]/tests.md` for detailed test-writing instructions including:

- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

The test instructions are framework-agnostic — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**TDD Workflow:**

1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/[section-id]/components/`:

[List components]

### Data Layer

The components expect these data shapes:

[Key types from types.ts]

You'll need to:

- Create API endpoints or data fetching logic
- Connect real data to the components

### Callbacks

Wire up these user actions:

[List callbacks from Props interface with descriptions]

### Empty States

Implement empty state UI for when no records exist yet:

- **No data yet:** Show a helpful message and call-to-action when the primary list/collection is empty
- **No related records:** Handle cases where associated records don't exist (e.g., a project with no tasks)
- **First-time user experience:** Guide users to create their first item with clear CTAs

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/[section-id]/README.md` — Feature overview and design intent
- `product-plan/sections/[section-id]/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/[section-id]/components/` — React components
- `product-plan/sections/[section-id]/types.ts` — TypeScript interfaces
- `product-plan/sections/[section-id]/sample-data.json` — Test data
- `product-plan/sections/[section-id]/screenshot.png` — Visual reference

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: [Primary Flow Name — e.g., "Create a New Project"]

1. User [starting action — e.g., "clicks 'New Project' button"]
2. User [next step — e.g., "fills in project name and description"]
3. User [next step — e.g., "clicks 'Create' to save"]
4. **Outcome:** [Expected result — e.g., "New project appears in the list, success message shown"]

### Flow 2: [Secondary Flow Name — e.g., "Edit an Existing Project"]

1. User [starting action — e.g., "clicks on a project row"]
2. User [next step — e.g., "modifies the project details"]
3. User [next step — e.g., "clicks 'Save' to confirm changes"]
4. **Outcome:** [Expected result — e.g., "Project updates in place, changes persisted"]

### Flow 3: [Additional Flow — e.g., "Delete a Project"]

1. User [starting action — e.g., "clicks delete icon on a project"]
2. User [next step — e.g., "confirms deletion in the modal"]
3. **Outcome:** [Expected result — e.g., "Project removed from list, empty state shown if last item"]

[Include 2-4 flows covering the main user journeys in this section. Reference the specific UI elements and button labels from the components.]

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no records exist
- [ ] All user actions work
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile
```

## Step 6: Generate one-shot-instructions.md

Create `product-plan/instructions/one-shot-instructions.md` by combining all milestone content into a single document. Include the preamble at the very top:

```markdown
# [Product Name] — Complete Implementation Instructions

---

## About These Instructions

**What you're receiving:**

- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**

- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**

- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Design tokens, data model types, routing structure, and application shell (all together)
2. **[Section 1]** — [Brief description]
3. **[Section 2]** — [Brief description]
   [List all sections]

Start with the Foundation milestone which sets up the core infrastructure, then build each section in order.

---

## Test-Driven Development

Each section includes a `tests.md` file with detailed test-writing instructions. These are **framework-agnostic** — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**For each section:**

1. Read `product-plan/sections/[section-id]/tests.md`
2. Write failing tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

The test instructions include:

- Specific UI elements, button labels, and interactions to verify
- Expected success and failure behaviors
- Empty state handling (when no records exist yet)
- Data assertions and state validations

---

[Include product-overview.md content]

---

# Milestone 1: Foundation

> **Purpose:** Set up all foundational elements in one milestone
> **Includes:** Design tokens, data model types, routing structure, AND application shell

[Include 01-foundation.md content WITHOUT the preamble — it's already at the top. Foundation includes design tokens, data model, routing, AND application shell all together.]

---

# Milestone 2: [First Section Name]

[Include first section handoff content WITHOUT the preamble]

---

# Milestone 3: [Second Section Name]

[Include second section handoff content WITHOUT the preamble]

[Repeat for all sections, incrementing milestone numbers]
```

## Step 7: Copy Design Guidance

Copy the frontend-design skill to the export package to provide guidance for implementation:

1. **Read** `.claude/skills/frontend-design/SKILL.md`
2. **Copy** its contents to `product-plan/design-guidance/frontend-design.md`

This ensures implementation agents (Claude, Cursor, etc.) have access to design guidance for creating distinctive, production-grade components with the same quality as the Design OS screen designs.

Reference this file in implementation prompts:

> **Before creating components, read `product-plan/design-guidance/frontend-design.md` and follow its guidance on distinctive UI, bold design directions, thoughtful typography, and effective motion.**

## Step 8: Validate All Components

Before proceeding with export, validate that all components are portable and follow the props-based pattern. This is a **blocking step** — the export cannot proceed if validation fails.

### Validate Shell Components

**Skip this section if `INCLUDE_SHELL` is false** (user chose to proceed without shell in Step 1).

Validate ALL shell components at `src/shell/components/` (primary AND secondary):

**Primary components (always validated):**

- `AppShell.tsx` — Main shell wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu component
- `index.ts` — Component exports

**Secondary components (validate if they exist):**

- `NotificationsDrawer.tsx`
- `SearchModal.tsx`
- `ThemeToggle.tsx`
- `SettingsModal.tsx`
- `ProfileModal.tsx`
- `HelpPanel.tsx`
- `FeedbackModal.tsx`
- `MobileMenuDrawer.tsx`

**List all shell components to validate:**

```bash
# Get all shell components (excluding index.ts)
SHELL_COMPONENTS=$(ls -1 src/shell/components/*.tsx 2>/dev/null | xargs -I {} basename {} .tsx)
echo "Validating shell components: $SHELL_COMPONENTS"
```

For EACH shell component file, validate:

1. **Check imports:**
   - [ ] No static data imports: `import data from '@/../product/...'`
   - [ ] No dynamic data imports: `import('@/../product/...')` or `await import('@/../product/...')`
   - [ ] No CommonJS data imports: `require('@/../product/...')`
   - [ ] No direct imports of `.json` files (static, dynamic, or require)
   - [ ] Only imports from external libraries or relative component files

2. **Check component structure:**
   - [ ] Component accepts all data via props
   - [ ] All callbacks are optional and use optional chaining: `onAction?.()`
   - [ ] No state management code (useState, useContext, etc.) — _EXCEPTION: Secondary components like ThemeToggle MAY use useState for local UI state_
   - [ ] No routing logic or navigation calls

3. **Check Props interface (primary components only):**

```bash
# Validate primary shell components export Props interfaces
for component in AppShell MainNav UserMenu; do
  if [ -f "src/shell/components/${component}.tsx" ]; then
    if ! grep -q "export interface ${component}Props" "src/shell/components/${component}.tsx"; then
      echo "Warning: ${component}.tsx missing Props interface export"
    fi
  fi
done
```

**Note:** Secondary components (drawers, modals) may use local useState for their open/close state. This is acceptable as long as:

- Data still comes via props
- Callbacks notify parent components
- No global state management (Zustand, Redux, etc.)

### Validate Section Components

For each section, validate all component files in `src/sections/[section-id]/components/`:

1. **Check imports:**
   - [ ] No static data imports: `import data from '@/../product/...'`
   - [ ] No dynamic data imports: `import('@/../product/...')` or `await import('@/../product/...')`
   - [ ] No CommonJS data imports: `require('@/../product/...')`
   - [ ] No direct imports of `.json` files (static, dynamic, or require)
   - [ ] Types imported from `@/../product/sections/[section-id]/types` (these will be transformed to `../types`)

2. **Check component structure:**
   - [ ] Component accepts all data via props
   - [ ] All callbacks are optional and use optional chaining: `onAction?.()`
   - [ ] No state management code (useState, useContext, etc.)
   - [ ] No routing logic or navigation calls

**Automated Props-Based Validation Script:**

```bash
# Validate section components are props-based (don't import data.json directly)
VALIDATION_ERRORS=0

for section_dir in src/sections/*/; do
  section_id=$(basename "$section_dir")

  for component in "$section_dir"components/*.tsx; do
    [ -f "$component" ] || continue
    component_name=$(basename "$component")

    # Check for direct data.json imports
    if grep -qE "import.*from.*data\.json" "$component"; then
      echo "Error: $section_id/$component_name imports data.json directly. Components must receive data via props."
      VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi

    # Check for product directory imports
    if grep -qE "from ['\"].*product/" "$component"; then
      echo "Error: $section_id/$component_name imports from product/ directory. Use relative imports or props instead."
      VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi

    # Check component has a Props interface
    if ! grep -qE "(interface|type).*Props" "$component"; then
      echo "Warning: $section_id/$component_name missing Props interface. Components should define props for portability."
      # This is a warning, not an error - component may still work without explicit Props
    fi
  done
done

if [ $VALIDATION_ERRORS -gt 0 ]; then
  echo ""
  echo "Found $VALIDATION_ERRORS props-based validation error(s). Fix before exporting."
  exit 1
fi
```

### Validate Sub-Components (Recursive)

Components may import other components. Validate the full dependency tree with a **maximum depth of 10 levels** to prevent infinite loops from circular imports.

**Recursion Limits and Stopping Conditions:**

| Condition                                 | Action                                 |
| ----------------------------------------- | -------------------------------------- |
| Max depth reached (10 levels)             | Stop recursion, warn user              |
| Component already visited in current path | Circular import detected, report error |
| No more local imports                     | Stop recursion (base case)             |
| Import file doesn't exist                 | Report missing dependency, stop branch |

**Step 1: Build dependency graph**

For each component file, extract its local imports:

```bash
# Find components imported by each file
for component in src/sections/*/components/*.tsx; do
  # Extract imports like: import { Button } from './Button'
  grep -E "^import.*from '\\./" "$component" | sed "s/.*from '\\.\\/\\([^']*\\)'.*/\\1/"
done
```

**Step 2: Validate all imported components (with depth tracking)**

For each component referenced in imports:

1. Check if current depth > 10 → Stop with warning: "Max recursion depth reached. Component tree may be too deep or contain cycles."
2. Check if component is already in the current validation path → Circular import detected, report error
3. Check if the imported file exists in `components/`
4. Apply the same validation rules (no data imports, props-based, etc.)
5. Recursively check that component's imports (increment depth counter)

**Recursion Implementation:**

> **Comprehensive Error Reporting:** This function collects errors as it traverses the component tree. When an error is encountered (circular import, max depth, missing component), it logs the error but continues checking other branches. All errors are reported together at the end of validation, not stopped at the first failure.

```
function validateComponent(path, depth = 0, visited = [], errors = []):
  if depth > 10:
    errors.append("Max recursion depth (10) reached at: {path}")
    return errors  # Stop this branch, but continue others

  if path in visited:
    errors.append("Circular import detected: {visited} -> {path}")
    return errors  # Circular dependency, continue other branches

  visited.append(path)

  # Validate this component's imports
  for import in getLocalImports(path):
    validateComponent(import, depth + 1, visited.copy(), errors)

  # Validate this component's portability
  portabilityErrors = checkPortability(path)
  errors.extend(portabilityErrors)

  return errors
```

**Validation Behavior:**

- Collect ALL validation errors before reporting
- Continue checking other components even if one has issues
- Report comprehensive summary at the end

**Step 3: Report missing sub-components**

If a component imports another component that doesn't exist:

```
Error: Component dependency missing:
- InvoiceList.tsx imports './InvoiceCard' but InvoiceCard.tsx doesn't exist

Please ensure all sub-components are created before export.
```

**Step 4: Validate sub-component portability**

All sub-components must also pass the portability checks:

- No data imports
- Props-based architecture
- No state management or routing

If a sub-component fails validation, report it along with its parent:

```
Error: Sub-component validation failed:
- InvoiceCard.tsx (imported by InvoiceList.tsx) - imports data directly

Fix the sub-component before export.
```

**Step 5: Handle circular imports**

If circular imports are detected:

```
Error: Circular import detected in component tree:
  InvoiceList.tsx → InvoiceCard.tsx → InvoiceRow.tsx → InvoiceList.tsx

Circular imports prevent proper validation and may cause issues in the target codebase.
Please refactor components to remove the circular dependency.
```

**Recovery Guidance for Circular Imports:**

To identify and fix circular imports:

1. **Map the dependency chain** — Follow the cycle shown in the error message
2. **Find shared logic** — Identify what's being shared that creates the cycle
3. **Extract to a new component** — Create a component that both can import without cycles:

   ```
   # Before (circular):
   InvoiceList → InvoiceCard → InvoiceRow → InvoiceList

   # After (fixed):
   InvoiceList → InvoiceCard → InvoiceRow
                     ↓              ↓
                 SharedUtils (new component)
   ```

4. **Common patterns causing cycles:**
   - Parent passing callbacks that child uses to modify parent
   - Shared type definitions imported from component files
   - Utility functions mixed with component code

5. **Re-run validation** after refactoring to confirm the cycle is broken

This ensures the entire component tree is portable, not just the top-level components, while preventing infinite loops during validation.

### If Validation Passes

Continue to Step 9 with confidence.

### If Validation Fails

**Do not proceed with export.** Instead:

1. **Report failures to user** — List all components that failed validation and specify why:
   - Component imports data directly from JSON
   - Component contains routing/navigation logic
   - Component uses state management

2. **Provide fix instructions** — Tell the user:

   ```
   The following components cannot be exported as-is:
   - [Component1] - imports data directly
   - [Component2] - contains routing logic

   Please run `/design-screen` for the affected sections and fix these issues:
   - Remove all direct data imports
   - Use props to accept all data instead
   - Replace routing with optional callbacks
   ```

3. **Do not create partial exports** — An incomplete export with missing or broken components will cause failures in the user's codebase. It's better to fix the components first, then re-run the export.

4. **Recovery workflow** — After fixing the issues:
   - You may resume from Step 8 (this step) to re-validate components
   - If validation passes, continue to Step 9 and subsequent steps
   - If earlier steps (1-7) were not completed, re-run `/export-product` from the beginning instead

## Step 8A: Validate Design Coherence

Before copying components, perform a design coherence check across all sections to ensure consistent styling.

### Check for Design Direction Document

First, check if a design direction document exists:

```bash
if [ -f "product/design-system/design-direction.md" ]; then
  echo "Design direction found - checking coherence against documented guidelines"
else
  echo "Note: No design-direction.md found. Inferring patterns from components."
fi
```

### Color Class Consistency

Extract and compare primary color usage across all section components:

```bash
# Find primary color patterns across sections
echo "Checking color consistency..."
for dir in src/sections/*/components; do
  if [ -d "$dir" ]; then
    section=$(basename $(dirname "$dir"))
    echo "Section: $section"
    grep -rh 'bg-[a-z]+-[0-9]\+' "$dir"/*.tsx 2>/dev/null | sort | uniq -c | sort -rn | head -3
  fi
done
```

**Check for inconsistencies:**

- Different primary colors across sections (e.g., `lime` in one, `blue` in another)
- Inconsistent shade usage (e.g., `-600` in one section, `-400` in another)
- Mixed color systems (e.g., some using `stone`, others using `slate`)

### Spacing Pattern Consistency

Check for consistent spacing patterns:

```bash
# Find spacing patterns
echo "Checking spacing consistency..."
grep -rh 'p-[0-9]\+\|px-[0-9]\+\|py-[0-9]\+\|gap-[0-9]\+' src/sections/*/components/*.tsx 2>/dev/null | sort | uniq -c | sort -rn | head -10
```

### Container Pattern Consistency

Check for consistent container patterns across section root components:

```bash
# Extract container patterns from section components
echo "Checking container consistency..."
grep -rh 'className="h-full\|className="min-h-full' src/sections/*/components/*.tsx 2>/dev/null | \
  sed 's/.*className="\([^"]*\)".*/\1/' | sort | uniq -c | sort -rn
```

**Check for inconsistencies:**

| Pattern           | Expected                                                         | Status |
| ----------------- | ---------------------------------------------------------------- | ------ |
| Container wrapper | `h-full bg-[neutral]-50 dark:bg-[neutral]-950 px-4 py-4 sm:px-6` | ✓/✗    |
| Background color  | Consistent neutral across sections                               | ✓/✗    |
| Padding pattern   | Matches Information Density                                      | ✓/✗    |

**If container patterns are inconsistent:**

```
Warning: Inconsistent container patterns detected:

Section "agents": h-full bg-slate-50 px-4 sm:px-6 py-4
Section "machines": h-full bg-slate-50 p-1  <- INCONSISTENT
Section "dashboard": min-h-full             <- MISSING PADDING

These differences may be intentional (e.g., edge-to-edge dashboards).
Would you like to:
1. Continue anyway — document inconsistencies in export README
2. Stop — fix inconsistencies before exporting
```

### Typography Consistency

Check for consistent font treatment:

```bash
# Find font patterns
echo "Checking typography consistency..."
grep -rh 'font-[a-z]\+\|text-[a-z]\+-[0-9]\+' src/sections/*/components/*.tsx 2>/dev/null | sort | uniq -c | head -10
```

### Report Findings

**If inconsistencies are found:**

```
Design Coherence Check - Potential Inconsistencies Found:

**Color Usage:**
- Section "invoices" uses lime-600 for primary buttons
- Section "reports" uses blue-500 for primary buttons

**Spacing:**
- Most sections use p-6 for card padding
- Section "settings" uses p-4

**Typography:**
- Inconsistent heading styles across sections

These may be intentional design choices. Please verify:
1. Are these differences intentional (different visual treatments for different areas)?
2. Should they be unified for visual consistency?

Proceed with export? (y/n)
```

Use AskUserQuestion with options:

- "Proceed — differences are intentional" — Continue with export
- "Stop — I'll fix the inconsistencies first" — END COMMAND

**If no significant inconsistencies found:**

```
Design Coherence Check - Passed

All sections appear to use consistent:
- Primary color: [detected color]-[shade]
- Spacing patterns: [detected patterns]
- Typography: [detected patterns]

Continuing with export...
```

### Copy Design Direction to Export

If `product/design-system/design-direction.md` exists, copy it to the export:

```bash
if [ -f "product/design-system/design-direction.md" ]; then
  mkdir -p product-plan/design-system
  cp product/design-system/design-direction.md product-plan/design-system/
  echo "Copied design-direction.md to export"
fi
```

This ensures implementation agents have access to the aesthetic direction when building the product.

## Step 9: Copy and Transform Components

### Shell Components

**Skip this section if `INCLUDE_SHELL` is false** (user chose to proceed without shell in Step 1).

Copy ALL files from `src/shell/components/` to `product-plan/shell/components/`:

**Primary components (always copied if shell exists):**

- `AppShell.tsx` — Main shell wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu component
- `index.ts` — Component exports

**Secondary components (copy if they exist):**

- `NotificationsDrawer.tsx`
- `SearchModal.tsx`
- `ThemeToggle.tsx`
- `SettingsModal.tsx`
- `ProfileModal.tsx`
- `HelpPanel.tsx`
- `FeedbackModal.tsx`
- `MobileMenuDrawer.tsx`

**Copy all shell components:**

```bash
# Copy all .tsx files from shell/components
for file in src/shell/components/*.tsx; do
  if [ -f "$file" ]; then
    cp "$file" product-plan/shell/components/
    echo "Copied: $(basename $file)"
  fi
done

# Copy index.ts
if [ -f "src/shell/components/index.ts" ]; then
  cp src/shell/components/index.ts product-plan/shell/components/
  echo "Copied: index.ts"
fi
```

For each copied file:

- Transform import paths from `@/...` to relative paths
- Remove any Design OS-specific imports
- Ensure components are self-contained

**Shell data and types (if they exist):**

Also copy shell data and types if they exist:

```bash
# Copy shell data.json (rename to sample-data.json)
if [ -f "product/shell/data.json" ]; then
  cp product/shell/data.json product-plan/shell/sample-data.json
  echo "Copied: data.json -> sample-data.json"
fi

# Copy shell types.ts
if [ -f "product/shell/types.ts" ]; then
  cp product/shell/types.ts product-plan/shell/types.ts
  echo "Copied: types.ts"
fi
```

### Section Components

For each section, copy from `src/sections/[section-id]/components/` to `product-plan/sections/[section-id]/components/`:

- Transform import paths according to the table below
- Remove Design OS-specific imports
- Keep only the exportable components (not preview wrappers)

**IMPORTANT: Preview Wrappers are NOT Exported**

The `src/sections/[section-id]/` folder contains two types of files:

| Location             | Type                  | Exported? | Purpose                                       |
| -------------------- | --------------------- | --------- | --------------------------------------------- |
| `components/*.tsx`   | Exportable components | ✅ Yes    | Props-based UI components for production use  |
| `*.tsx` (root level) | Preview wrappers      | ❌ No     | Design OS preview files that load sample data |

Preview wrappers (files like `InvoiceListView.tsx` at the root of a section folder) are **Design OS-only** files. They:

- Import sample data from `data.json`
- Pass data to exportable components for preview
- Are NOT portable and should NEVER be copied to the export package

**Only copy files from the `components/` subdirectory**, not from the section root.

### Import Path Transformation Table

When copying components to the export package, transform all import paths to relative paths for portability:

| Design OS Path                                 | Exported Path        | Notes                                         |
| ---------------------------------------------- | -------------------- | --------------------------------------------- |
| `@/../product/sections/[section-id]/types`     | `../types`           | Type imports become relative                  |
| `@/../product/sections/[section-id]/data.json` | ❌ Remove            | Data should come via props                    |
| `@/components/ui/*`                            | ❌ Remove or inline  | UI components need to be included or replaced |
| `@/lib/*`                                      | ❌ Remove or inline  | Utilities need to be included or replaced     |
| `./[ComponentName]`                            | `./[ComponentName]`  | Relative imports stay unchanged               |
| `../[ComponentName]`                           | `../[ComponentName]` | Relative imports stay unchanged               |
| `react`, `lucide-react`, etc.                  | Unchanged            | External library imports stay as-is           |

**Key transformation rules:**

1. **Types** — Transform `@/../product/...` paths to relative `../types`
2. **Data imports** — Must be removed (validation should catch these in Step 8)
3. **Design OS imports** — `@/components/*`, `@/lib/*` must be removed or inlined
4. **Relative imports** — Keep unchanged (they're already portable)
5. **External libraries** — Keep unchanged (standard npm packages)

### Types Files

Copy `product/sections/[section-id]/types.ts` to `product-plan/sections/[section-id]/types.ts`

### Sample Data

Copy `product/sections/[section-id]/data.json` to `product-plan/sections/[section-id]/sample-data.json`

## Step 10: Generate Section READMEs

For each section, create `product-plan/sections/[section-id]/README.md`:

````markdown
# [Section Title]

## Overview

[From spec.md overview]

## User Flows

[From spec.md user flows]

## Design Decisions

[Notable design choices from the screen design]

## Data Used

**Entities:** [List entities from types.ts]

**From global model:** [Which entities from data model are used]

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `[Component]` — [Brief description]
- `[SubComponent]` — [Brief description]

## Callback Props

| Callback   | Description                             |
| ---------- | --------------------------------------- |
| `onView`   | Called when user clicks to view details |
| `onEdit`   | Called when user clicks to edit         |
| `onDelete` | Called when user clicks to delete       |
| `onCreate` | Called when user clicks to create new   |

[Adjust based on actual Props interface]

## View Relationships

[Only include this section if spec.md contains a `## View Relationships` section]

These relationships show how views connect. Implement state management in your app to wire callbacks to secondary views.

| Primary View  | Callback | Secondary View    | Type   | Notes                               |
| ------------- | -------- | ----------------- | ------ | ----------------------------------- |
| AgentListView | onView   | AgentDetailDrawer | drawer | Opens side panel with agent details |
| AgentListView | onCreate | CreateAgentModal  | modal  | Opens centered dialog for new agent |

**Implementation pattern for drawers:**

```tsx
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);

// Wire callback to open drawer
const handleView = (id: string) => {
  setSelectedId(id);
  setIsDrawerOpen(true);
};
```
````

**Implementation pattern for modals:**

```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

// Wire callback to open modal
const handleCreate = () => {
  setIsModalOpen(true);
};
```

> **Note:** In Design OS, preview wrappers handle this wiring. In your production codebase, implement state management using your preferred pattern (useState, Zustand, Redux, etc.).

`````

### View Relationships Documentation

When copying section specs to export, check for `## View Relationships` in `product/sections/[section-id]/spec.md`. If present:

1. **Copy to README.md:** Include the "View Relationships" section in the section README (template above)
2. **Add implementation hints:** Include the state management patterns shown above
3. **Note the wiring:** Explain that callbacks need to be connected to state

**What NOT to export:**
- Preview wrappers (`src/sections/[id]/[ViewName].tsx`) — these are Design OS specific
- Wiring code — implementation depends on the target codebase's state management

**What TO export:**
- Relationship documentation — helps developers understand the intended UX
- Implementation patterns — provides starting points for wiring

## Step 10.5: Generate Shell README

**Skip this section if `INCLUDE_SHELL` is false** (user chose to proceed without shell in Step 1).

Create `product-plan/shell/README.md` to document the shell design and all its components:

````markdown
# Application Shell

## Overview

[From product/shell/spec.md overview section]

## Layout Pattern

[From spec.md - sidebar, top nav, or minimal]

## Components

### Primary Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `AppShell` | Main shell wrapper | children, navigationItems, user, onNavigate, onLogout, ... |
| `MainNav` | Navigation sidebar/bar | items, onNavigate, collapsed |
| `UserMenu` | User dropdown menu | user, onLogout, onProfileClick, onSettingsClick |

### Secondary Components

[List only components that were created. Skip if none exist.]

| Component | Type | Purpose | Props |
|-----------|------|---------|-------|
| `NotificationsDrawer` | drawer | Shows user notifications | notifications, onClose, onMarkRead |
| `SearchModal` | modal | Command palette (Cmd+K) | onClose, onSelect, recentItems |
| `ThemeToggle` | inline | Theme switcher | (uses local state) |
| `SettingsModal` | modal | App settings | settings, onClose, onSave |
| `ProfileModal` | modal | User profile editor | user, onClose, onSave |
| `HelpPanel` | drawer | Help and documentation | topics, onClose |
| `FeedbackModal` | modal | Feedback form | onClose, onSubmit |
| `MobileMenuDrawer` | drawer | Mobile navigation | navigationItems, onClose, onNavigate |

## Shell Relationships

[From product/shell/spec.md ## Shell Relationships section, if exists]

These relationships show how shell triggers connect to secondary components:

| Trigger | Action | Component | Type | Data |
|---------|--------|-----------|------|------|
| HeaderAction | notifications | NotificationsDrawer | drawer | notifications |
| HeaderAction | search | SearchModal | modal | none |
| UserMenu | profile | ProfileModal | modal | user |
| UserMenu | settings | SettingsModal | modal | settings |

**Implementation pattern for shell secondary components:**

```tsx
// In your app shell or layout component
const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
const [isSearchOpen, setIsSearchOpen] = useState(false)

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setIsSearchOpen(true)
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])

return (
  <>
    <AppShell
      onHeaderAction={(actionId) => {
        if (actionId === 'notifications') setIsNotificationsOpen(true)
        if (actionId === 'search') setIsSearchOpen(true)
      }}
      onProfileClick={() => setIsProfileOpen(true)}
      onSettingsClick={() => setIsSettingsOpen(true)}
    >
      {children}
    </AppShell>

    <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
      <SheetContent>
        <NotificationsDrawer
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </SheetContent>
    </Sheet>

    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <DialogContent>
        <SearchModal onClose={() => setIsSearchOpen(false)} />
      </DialogContent>
    </Dialog>
  </>
)
```

## Sample Data

See `sample-data.json` for example data for shell components (notifications, user, settings).

## Types

See `types.ts` for TypeScript interfaces for all shell component props.

## Visual Reference

See `screenshot.png` for the shell visual design (if captured).

## Responsive Behavior

- **Desktop:** [From spec.md responsive behavior]
- **Tablet:** [From spec.md]
- **Mobile:** [From spec.md]

## Design Notes

[From spec.md design notes section, if exists]
`````

## Step 11: Consolidate Data Model Types

Create unified type definitions and documentation for the entire data model in the export package.

### Create data-model/types.ts

Create `product-plan/data-model/types.ts` by consolidating types from all sections:

1. **Read the global data model:**
   - If `/product/data-model/data-model.md` exists, extract entity descriptions

2. **Consolidate all section types:**
   - For each section, read `product/sections/[section-id]/types.ts`
   - Extract all exported interfaces (exclude component Props interfaces)
   - Combine into a single consolidated types file

   **Handling Type Conflicts:**

   When the same type name appears in multiple sections with different definitions:

   | Scenario                         | Resolution                    | Action                                                      |
   | -------------------------------- | ----------------------------- | ----------------------------------------------------------- |
   | Global data model exists         | Global model is authoritative | Use the definition from `/product/data-model/data-model.md` |
   | No global model, types differ    | First section wins            | Use the first section's definition (alphabetical order)     |
   | No global model, types identical | Dedupe                        | Use shared definition once                                  |

   **When global data model exists but section type diverges:**

   If a section defines a type that differs from the global data model (different fields, types, or structure):
   1. Use the global data model definition (it is authoritative)
   2. Add a JSDoc comment above the type noting the divergence:
      ```typescript
      /**
       * Note: Section [section-id] defines additional/different fields for this type.
       * Global data model definition is authoritative. Review section types if needed.
       */
      ```
   3. Report the divergence to the user:
      ```
      Type divergence detected:
      - `[TypeName]`: global model used, section [section-id] has different definition
      Consider updating the global data model or section types for consistency.
      ```

   **When no global data model exists:**
   1. Sort sections alphabetically by section ID
   2. For each conflicting type, use the definition from the first section in sort order
   3. Add a JSDoc comment above the type noting the conflict:
      ```typescript
      /**
       * Note: This type is defined differently in sections [section-a] and [section-b].
       * Using definition from [section-a]. Review and consolidate if needed.
       */
      ```
   4. Report all conflicts to the user with this message format:
      ```
      Type conflicts detected (no global data model):
      - `[TypeName]`: defined in [section-a] (USED), [section-b] (SKIPPED)
      Consider running /data-model to create a global data model for consistency.
      ```

3. **Add JSDoc comments:**
   - Include descriptions from the global data model
   - Document relationships between entities
   - Add usage examples where helpful

4. **Export everything:**
   - Export all entity interfaces
   - Export any enums or type unions used across sections

**Example structure:**

```typescript
// =============================================================================
// Global Entity Types (from Data Model)
// =============================================================================

/** Represents a user in the system */
export interface User {
  id: string;
  name: string;
  email: string;
  // ... other fields
}

/** Represents a project managed by users */
export interface Project {
  id: string;
  name: string;
  ownerId: string; // References User.id
  // ... other fields
}

// =============================================================================
// Section-Specific Types
// =============================================================================

// From [Section 1]
export interface Task {
  id: string;
  projectId: string; // References Project.id
  // ... other fields
}

// From [Section 2]
export interface Document {
  id: string;
  projectId: string;
  // ... other fields
}

// =============================================================================
// Relationships & Documentation
// =============================================================================

/**
 * Type relationships in this product:
 * - User "owns" many Projects
 * - Project "contains" many Tasks
 * - Project "contains" many Documents
 */
```

### Create data-model/README.md

Create `product-plan/data-model/README.md` to document the data model:

```markdown
# Data Model

## Overview

[If global data model exists: "This product uses the following core entities:"]
[If not: "The following entities are used across sections:"]

## Entities

### [Entity 1]

[Description from data model or inferred from types]

- Fields: [List key fields]
- Relationships: [How it connects to other entities]

### [Entity 2]

[Repeat for all entities]

## Relationships

[Document how entities connect to each other]

- Users own Projects
- Projects contain Tasks
- etc.

## Sample Data

See `sample-data.json` for example data for each entity.

## Usage in Implementation

When building the product, these entity types should map to:

- Database schema
- API response models
- Component props and state

All sections use these shared types to ensure data consistency across the application.
```

### Create data-model/sample-data.json

Consolidate sample data from all sections:

```json
{
  "_meta": {
    "models": {
      "users": "Users of the application",
      "projects": "Projects owned and managed by users",
      "tasks": "Individual tasks within projects"
    },
    "relationships": [
      "Each User can own multiple Projects",
      "Each Project contains multiple Tasks"
    ]
  },
  "users": [
    {
      /* sample user data */
    }
  ],
  "projects": [
    {
      /* sample project data */
    }
  ],
  "tasks": [
    {
      /* sample task data */
    }
  ]
}
```

## Step 12: Generate Section Test Instructions

For each section, create `product-plan/sections/[section-id]/tests.md` with detailed test-writing instructions based on the section's spec, user flows, and UI design.

````markdown
# Test Instructions: [Section Title]

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

[Brief description of what this section does and the key functionality to test]

---

## User Flow Tests

### Flow 1: [Primary User Flow Name]

**Scenario:** [Describe what the user is trying to accomplish]

#### Success Path

**Setup:**

- [Preconditions - what state the app should be in]
- [Sample data to use - reference types from types.ts]

**Steps:**

1. User navigates to [page/route]
2. User sees [specific UI element - be specific about labels, text]
3. User clicks [specific button/link with exact label]
4. User enters [specific data in specific field]
5. User clicks [submit button with exact label]

**Expected Results:**

- [ ] [Specific UI change - e.g., "Success toast appears with message 'Item created'"]
- [ ] [Data assertion - e.g., "New item appears in the list"]
- [ ] [State change - e.g., "Form is cleared and reset to initial state"]
- [ ] [Navigation - e.g., "User is redirected to /items/:id"]

#### Failure Path: [Specific Failure Scenario]

**Setup:**

- [Conditions that will cause failure - e.g., "Server returns 500 error"]

**Steps:**

1. [Same steps as success path, or modified steps]

**Expected Results:**

- [ ] [Error handling - e.g., "Error message appears: 'Unable to save. Please try again.'"]
- [ ] [UI state - e.g., "Form data is preserved, not cleared"]
- [ ] [User can retry - e.g., "Submit button remains enabled"]

#### Failure Path: [Validation Error]

**Setup:**

- [Conditions - e.g., "User submits empty required field"]

**Steps:**

1. User leaves [specific field] empty
2. User clicks [submit button]

**Expected Results:**

- [ ] [Validation message - e.g., "Field shows error: 'Name is required'"]
- [ ] [Form state - e.g., "Form is not submitted"]
- [ ] [Focus - e.g., "Focus moves to first invalid field"]

---

### Flow 2: [Secondary User Flow Name]

[Repeat the same structure for additional flows]

---

## Empty State Tests

Empty states are critical for first-time users and when records are deleted. Test these thoroughly:

### Primary Empty State

**Scenario:** User has no [primary records] yet (first-time or all deleted)

**Setup:**

- [Primary data collection] is empty (`[]`)

**Expected Results:**

- [ ] [Empty state message is visible - e.g., "Shows heading 'No projects yet'"]
- [ ] [Helpful description - e.g., "Shows text 'Create your first project to get started'"]
- [ ] [Primary CTA is visible - e.g., "Shows button 'Create Project'"]
- [ ] [CTA is functional - e.g., "Clicking 'Create Project' opens the create form/modal"]
- [ ] [No blank screen - The UI is helpful, not empty or broken]

### Related Records Empty State

**Scenario:** A [parent record] exists but has no [child records] yet

**Setup:**

- [Parent record] exists with valid data
- [Child records collection] is empty (`[]`)

**Expected Results:**

- [ ] [Parent renders correctly with its data]
- [ ] [Child section shows empty state - e.g., "Shows 'No tasks yet' in the tasks panel"]
- [ ] [CTA to add child record - e.g., "Shows 'Add Task' button"]
- [ ] [No broken layouts or missing sections]

### Filtered/Search Empty State

**Scenario:** User applies filters or search that returns no results

**Setup:**

- Data exists but filter/search matches nothing

**Expected Results:**

- [ ] [Clear message - e.g., "Shows 'No results found'"]
- [ ] [Guidance - e.g., "Shows 'Try adjusting your filters' or similar"]
- [ ] [Reset option - e.g., "Shows 'Clear filters' link"]

---

## Component Interaction Tests

### [Component Name]

**Renders correctly:**

- [ ] [Specific element is visible - e.g., "Displays item title 'Sample Item'"]
- [ ] [Data display - e.g., "Shows formatted date 'Dec 12, 2025'"]

**User interactions:**

- [ ] [Click behavior - e.g., "Clicking 'Edit' button calls onEdit with item id"]
- [ ] [Hover behavior - e.g., "Hovering row shows action buttons"]
- [ ] [Keyboard - e.g., "Pressing Escape closes the modal"]

**Loading and error states:**

- [ ] [Loading - e.g., "Shows skeleton loader while data is fetching"]
- [ ] [Error - e.g., "Shows error message when data fails to load"]

---

## Edge Cases

- [ ] [Edge case 1 - e.g., "Handles very long item names with text truncation"]
- [ ] [Edge case 2 - e.g., "Works correctly with 1 item and 100+ items"]
- [ ] [Edge case 3 - e.g., "Preserves data when navigating away and back"]
- [ ] [Transition from empty to populated - e.g., "After creating first item, list renders correctly"]
- [ ] [Transition from populated to empty - e.g., "After deleting last item, empty state appears"]

---

## Accessibility Checks

- [ ] [All interactive elements are keyboard accessible]
- [ ] [Form fields have associated labels]
- [ ] [Error messages are announced to screen readers]
- [ ] [Focus is managed appropriately after actions]

---

## Sample Test Data

Use the data from `sample-data.json` or create variations:

[Include 2-3 example data objects based on types.ts that tests can use]

```typescript
// Example test data - populated state
const mockItem = {
  id: "test-1",
  name: "Test Item",
  // ... other fields from types.ts
};

const mockItems = [mockItem /* ... more items */];

// Example test data - empty states
const mockEmptyList = [];

const mockItemWithNoChildren = {
  id: "test-1",
  name: "Test Item",
  children: [], // No related records
};

// Example test data - error states
const mockErrorResponse = {
  status: 500,
  message: "Internal server error",
};
```
````

---

## Notes for Test Implementation

- Mock API calls to test both success and failure scenarios
- Test each callback prop is called with correct arguments
- Verify UI updates optimistically where appropriate
- Test that loading states appear during async operations
- Ensure error boundaries catch and display errors gracefully
- **Always test empty states** — Pass empty arrays to verify helpful empty state UI appears (not blank screens)
- Test transitions: empty → first item created, last item deleted → empty state returns

````

### Guidelines for Writing tests.md

When generating tests.md for each section:

1. **Read the spec.md thoroughly** — Extract all user flows and requirements
2. **Study the screen design components** — Note exact button labels, field names, UI text
3. **Review types.ts** — Understand the data shapes for assertions
4. **Include specific UI text** — Tests should verify exact labels, messages, placeholders
5. **Cover success and failure paths** — Every action should have both tested
6. **Always test empty states** — Primary lists with no items, parent records with no children, filtered results with no matches
7. **Be specific about assertions** — "Shows error" is too vague; "Shows red border and message 'Email is required' below the field" is specific
8. **Include edge cases** — Boundary conditions, transitions between empty and populated states
9. **Stay framework-agnostic** — Describe WHAT to test, not HOW to write the test code

## Step 13: Generate Design System Files

### tokens.css

```css
/* Design Tokens for [Product Name] */

:root {
  /* Colors */
  --color-primary: [Tailwind color];
  --color-secondary: [Tailwind color];
  --color-neutral: [Tailwind color];

  /* Typography */
  --font-heading: '[Heading Font]', sans-serif;
  --font-body: '[Body Font]', sans-serif;
  --font-mono: '[Mono Font]', monospace;
}
````

### tailwind-colors.md

```markdown
# Tailwind Color Configuration

## Color Choices

- **Primary:** `[color]` — Used for buttons, links, key accents
- **Secondary:** `[color]` — Used for tags, highlights, secondary elements
- **Neutral:** `[color]` — Used for backgrounds, text, borders

## Usage Examples

Primary button: `bg-[primary]-600 hover:bg-[primary]-700 text-white`
Secondary badge: `bg-[secondary]-100 text-[secondary]-800`
Neutral text: `text-[neutral]-600 dark:text-[neutral]-400`
```

### fonts.md

````markdown
# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>` or CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=[Heading+Font]&family=[Body+Font]&family=[Mono+Font]&display=swap"
  rel="stylesheet"
/>
```
````

## Font Usage

- **Headings:** [Heading Font]
- **Body text:** [Body Font]
- **Code/technical:** [Mono Font]

```

## Step 14: Generate Prompt Files

Create the `product-plan/prompts/` directory with two ready-to-use prompt files assembled from templates.

### Validate Required Files Exist

Before generating prompts, verify that key files from earlier steps were created successfully. The prompts reference these files, so they must exist:

**Required files:**
- `product-plan/product-overview.md` — Generated in Step 4
- `product-plan/instructions/one-shot-instructions.md` — Generated in Step 6
- `product-plan/instructions/incremental/01-foundation.md` — Generated in Step 5

If any required file is missing:
```

STOP: Missing required file: `product-plan/[path]`
Earlier export steps may have failed. Re-run `/export-product` from the beginning.

```

### Template System Overview

Prompts are assembled from modular templates stored in `.claude/templates/design-os/`:
- **Common templates** (`common/`) — Used in both one-shot and section prompts
- **Prompt-specific templates** (`one-shot/`, `section/`) — Structure specific to each prompt type

### Assembling Prompts

For each prompt, follow this assembly pattern:

1. Create the `product-plan/prompts/` directory
2. Read the appropriate templates from `.claude/templates/design-os/`
3. Assemble by concatenating in order
4. Substitute any variables (e.g., [Product Name])
5. Write the final assembled prompt to `product-plan/prompts/`

#### Template Assembly Algorithm

This algorithm describes the template assembly process. When implementing, follow these steps in order:

**Input:**
- `templateOrder` — Array of file paths to templates (in concatenation order)
- `variables` — Object mapping placeholder strings to their values
  - For one-shot: `{ "[Product Name]": "My Product" }`
  - For section: `{ "SECTION_NAME": "Invoices", "SECTION_ID": "invoices", "NN": "02" }`

**Process:**

```

1. Initialize empty result string

2. FOR each templatePath in templateOrder:
   a. Read file content from templatePath
   b. If file doesn't exist → STOP with error "Missing template file: [path]"
   c. Strip ALL leading HTML comments from top of content:
   - Match pattern: /^(<!--[\s\S]*?-->\s\*\n?)+/
   - This removes all consecutive HTML comments at the start (version, usage notes, etc.)
   - Handles: `<!-- v1.0.0 -->`, `<!-- Usage: ... -->`, `<!-- Note: ... -->`
   - Remove all matched comments and trailing whitespace
     d. If result is not empty, append "\n\n" (blank line separator)
     e. Append stripped content to result

3. FOR each (placeholder, value) in variables:
   a. Replace ALL occurrences of placeholder with value in result

4. Validate no unsubstituted variables remain:
   - Check for: "[Product Name]", "SECTION_NAME", "SECTION_ID", or standalone "NN"
   - Pattern: /\[Product Name\]|SECTION_NAME|SECTION_ID|\bNN\b/
   - If found → STOP with error listing unsubstituted variables

5. Validate no version comments remain:
   - Pattern: /<!--\s*v[\d.]+([-\w]*)\s*-->/
   - Handles versions with suffixes like v1.2.0-section
   - If found → STOP with error "Version comments not fully stripped"

6. Return assembled result

````

**Output:**
- Assembled prompt string ready to write to `product-plan/prompts/`

#### Template Assembly Implementation

When assembling templates, follow these specific steps:

**1. Read Template Files**
- Read each template file in the specified order from `.claude/templates/design-os/`
- Extract the content (without the HTML version comment `<!-- v1.0.0 -->` at the top)

**2. Variable Substitution**
For one-shot prompts, substitute:
- `[Product Name]` → The actual product name from `product-overview.md`

**Extracting Product Name:**
```bash
# Get the product name from the first level-1 heading in product-overview.md
PRODUCT_NAME=$(head -1 product/product-overview.md | sed 's/^# //')
````

The product name is the text from the first `# ` heading in `product/product-overview.md`.

- Example: `# InvoiceApp` → Product Name = "InvoiceApp"
- If no level-1 heading exists, STOP and warn: "Cannot extract product name. product-overview.md must start with a `# Product Name` heading."

For section prompts, substitute:

- `SECTION_NAME` → Human-readable section name (e.g., "Invoices", "Project Dashboard")
- `SECTION_ID` → Folder name from `product/sections/` (e.g., "invoices", "project-dashboard")
- `NN` → Milestone number (e.g., "02" for the first section, "03" for the second)

**3. Template Concatenation Order**
The templates are designed to be concatenated in a specific order. Do NOT reorder or skip templates:

**For one-shot-prompt.md:**

1. `one-shot/preamble.md` — Title and introduction
2. `common/model-guidance.md` — Model selection guidance
3. `one-shot/prompt-template.md` — Instructions and file references
4. `common/top-rules.md` — TOP 4 RULES
5. `common/reporting-protocol.md` — Implementation reporting
6. `common/tdd-workflow.md` — TDD implementation approach
7. `common/clarifying-questions.md` — Clarifying questions
8. `common/verification-checklist.md` — Final verification checklist

**For section-prompt.md:**

1. `section/preamble.md` — Title, section variables, and introduction
2. `common/model-guidance.md` — Model selection guidance
3. `section/prompt-template.md` — Instructions and file references
4. `common/top-rules.md` — TOP 4 RULES
5. `common/reporting-protocol.md` — Implementation reporting
6. `section/tdd-workflow.md` — TDD implementation approach (section-specific)
7. `section/clarifying-questions.md` — Clarifying questions (section-specific)
8. `common/verification-checklist.md` — Final verification checklist

**Variable Substitution for section-prompt.md:**

Unlike one-shot-prompt.md, section-prompt.md is a **template** that users fill in for each section. The substitution rules are:

| Variable         | Substitute During Export?         | Reason                           |
| ---------------- | --------------------------------- | -------------------------------- |
| `[Product Name]` | ✅ YES — from product-overview.md | Same for all sections            |
| `SECTION_NAME`   | ❌ NO — leave as placeholder      | User fills in (e.g., "Invoices") |
| `SECTION_ID`     | ❌ NO — leave as placeholder      | User fills in (e.g., "invoices") |
| `NN`             | ❌ NO — leave as placeholder      | User fills in (e.g., "02", "03") |

This means when assembling section-prompt.md:

1. Read the product name from `product/product-overview.md`
2. Replace all `[Product Name]` occurrences with the actual product name
3. Leave `SECTION_NAME`, `SECTION_ID`, and `NN` unchanged for user substitution

**4. Version Comment Handling**

- Strip all version comments from the top of each template before concatenating
- Version formats: `<!-- v1.0.0 -->`, `<!-- v1.2.0-section -->`, etc.
- These comments are used for template version tracking only and should NOT appear in the final assembled prompt
- Do not add version comments to the final prompt — the prompt should be clean and ready to use

**5. Whitespace and Formatting**

- Preserve formatting within each template
- Add a single blank line between concatenated templates to separate sections
- Ensure the final document has proper spacing for readability

**6. Error Handling**
If a template file is missing:

- **STOP the export process**
- Report to the user: "Missing template file: `.claude/templates/design-os/[path]`. Cannot generate prompts."
- Do not create partial or incomplete prompts

**7. Validation**
After assembling each prompt:

- Verify all variables have been substituted (no unsubstituted `SECTION_NAME`, `SECTION_ID`, `NN`, or `[Product Name]` remain)
- Verify all template files were included (no skipped sections)
- Check that the final prompt is readable and properly formatted

**8. Prompt Assembly Validation Checklist**

Before saving each assembled prompt, perform these validation checks:

```
[x] No version comments remain (<!-- v1.0.0 -->, <!-- v1.2.0-section -->, etc.)
[x] No unsubstituted variables remain ([Product Name], SECTION_NAME, etc.)
[x] All expected sections are present (TOP 4 RULES, Verification Checklist, etc.)
[x] No duplicate sections (same template included twice)
[x] Proper markdown formatting (headings, code blocks, lists)
[x] No broken markdown (unclosed code blocks, missing list items)
[x] File size is reasonable (not empty, not excessively large)
```

**If validation fails:**

```
STOP: Prompt assembly validation failed for [prompt-file]:
- [Specific issue found]

Review the template files and assembly process before continuing.
```

**Common Assembly Issues:**

- Version comments appearing in output → Template reading not stripping comments
- Duplicate content → Same template included multiple times in order
- Missing sections → Template file not found or skipped
- Broken markdown → Improper whitespace handling between templates

**Post-Assembly Validation Commands:**

After writing each prompt file, run these validation commands to catch issues:

```bash
# ============================================================
# ONE-SHOT-PROMPT.MD VALIDATION
# All variables should be substituted - no placeholders remain
# ============================================================

# Check for remaining version comments (should return no matches)
# Pattern handles version suffixes like v1.2.0-section
if grep -E '<!--\s*v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?\s*-->' product-plan/prompts/one-shot-prompt.md; then
  echo "ERROR: Version comments remain in one-shot-prompt.md"
  exit 1
fi

# Check for unsubstituted variables (should return no matches)
if grep -E '\[Product Name\]|SECTION_NAME|SECTION_ID|\bNN\b' product-plan/prompts/one-shot-prompt.md; then
  echo "ERROR: Unsubstituted variables remain in one-shot-prompt.md"
  exit 1
fi

# ============================================================
# SECTION-PROMPT.MD VALIDATION
# This is a TEMPLATE file with different rules:
# - [Product Name] MUST be substituted (user shouldn't have to fill this in)
# - SECTION_NAME, SECTION_ID, NN SHOULD remain (user fills these per-section)
# ============================================================

# Check for remaining version comments (should return no matches)
# Pattern handles version suffixes like v1.2.0-section
if grep -E '<!--\s*v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?\s*-->' product-plan/prompts/section-prompt.md; then
  echo "ERROR: Version comments remain in section-prompt.md"
  exit 1
fi

# Check that [Product Name] was substituted (should return no matches)
if grep -E '\[Product Name\]' product-plan/prompts/section-prompt.md; then
  echo "ERROR: [Product Name] was not substituted in section-prompt.md"
  exit 1
fi

# Verify SECTION_NAME, SECTION_ID, NN ARE present (they should remain as user placeholders)
if ! grep -q 'SECTION_NAME' product-plan/prompts/section-prompt.md; then
  echo "WARNING: SECTION_NAME placeholder missing in section-prompt.md (expected)"
fi
if ! grep -q 'SECTION_ID' product-plan/prompts/section-prompt.md; then
  echo "WARNING: SECTION_ID placeholder missing in section-prompt.md (expected)"
fi
```

**Validation differences explained:**

| Variable         | one-shot-prompt.md     | section-prompt.md           |
| ---------------- | ---------------------- | --------------------------- |
| `[Product Name]` | ❌ Must be substituted | ❌ Must be substituted      |
| `SECTION_NAME`   | ❌ Must be substituted | ✅ Must remain (user fills) |
| `SECTION_ID`     | ❌ Must be substituted | ✅ Must remain (user fills) |
| `NN`             | ❌ Must be substituted | ✅ Must remain (user fills) |

These commands provide concrete verification that the assembly process worked correctly for each prompt type.

### one-shot-prompt.md

Assemble from the templates listed above (see "Template Concatenation Order" section). Follow the template assembly process to create `product-plan/prompts/one-shot-prompt.md`:

> **Note:** The content below shows an example of the fully assembled output for reference. Do NOT copy this verbatim — instead, assemble the prompt by concatenating the template files in the order specified in "Template Concatenation Order". The templates contain the authoritative content; this example may not reflect the latest template versions.

```markdown
# One-Shot Implementation Prompt

I need you to implement a complete web application based on detailed design specifications and UI components I'm providing.

## Suggested Model Usage

For optimal cost-quality balance, consider this approach:

- **Claude Opus** → Initial implementation planning, architectural decisions, complex business logic
- **Claude Sonnet** → Implementing repetitive components, writing tests, routine CRUD operations
- **Claude Opus** → Final integration, edge cases, polish, and deployment

This is optional - use whichever model you prefer, but this can help optimize costs for large implementations.

---

## Instructions

Please carefully read and analyze the following files:

1. **@product-plan/product-overview.md** — Product summary with sections and data model overview
2. **@product-plan/instructions/one-shot-instructions.md** — Complete implementation instructions for all milestones

After reading these, also review:

- **@product-plan/design-guidance/frontend-design.md** — Design principles and guidance
- **@product-plan/design-system/** — Color and typography tokens
- **@product-plan/data-model/** — Entity types and relationships
- **@product-plan/shell/** — Application shell components
- **@product-plan/sections/** — All section components, types, sample data, and test instructions

## TOP 4 RULES FOR IMPLEMENTATION

These rules prevent common implementation mistakes. Follow them strictly.

### Rule 1: NEVER FABRICATE REQUIREMENTS

- Only implement features explicitly described in the spec files
- If a requirement is unclear or ambiguous, ASK the user - don't guess
- Use the Read tool to verify every requirement before implementing

**Common violations to avoid:**

- (INCORRECT) Adding authentication features not mentioned in spec
- (INCORRECT) Creating admin panels not requested
- (INCORRECT) Adding "nice to have" features without approval
- (INCORRECT) Inventing API endpoints not in data model

**How to follow:**

- (CORRECT) Read product-overview.md and instructions completely before planning
- (CORRECT) Ask clarifying questions if anything is unclear
- (CORRECT) Stick to EXACTLY what's specified in tests.md files

### Rule 2: INTEGRATION > REDESIGN

- DO NOT restyle or redesign the provided components
- DO NOT change the design tokens (colors, fonts, spacing)
- DO NOT modify component props or structure
- Your job is to integrate components into a working application

**Common violations to avoid:**

- (INCORRECT) "I'll make this component more modern by changing the colors"
- (INCORRECT) "Let me improve the layout by adding more padding"
- (INCORRECT) "I'll replace DM Sans with Inter because I prefer it"
- (INCORRECT) "This component would look better with shadows"

**How to follow:**

- (CORRECT) Use components exactly as provided
- (CORRECT) Pass data via props as designed
- (CORRECT) Focus on backend logic, routing, and state management
- (CORRECT) If component seems wrong, ask the user before changing

### Rule 3: READ BEFORE BUILDING

- Read ALL referenced files before creating your implementation plan
- Don't skip files because they seem optional
- Don't make assumptions about what files contain
- If you didn't read it with the Read tool, don't reference it

**Common violations to avoid:**

- (INCORRECT) Skipping tests.md and guessing what tests to write
- (INCORRECT) Not reading sample-data.json and creating wrong data structures
- (INCORRECT) Ignoring types.ts and defining duplicate types
- (INCORRECT) Assuming shell structure without reading AppShell.tsx

**How to follow:**

- (CORRECT) Read product-overview.md to understand product context
- (CORRECT) Read ALL instruction files before planning
- (CORRECT) Read tests.md for EACH section before implementing
- (CORRECT) Read provided components to understand props and behavior
- (CORRECT) Create implementation plan AFTER reading, not before

### Rule 4: ENGLISH OUTPUT ONLY

[Abbreviated — see `common/top-rules.md` for full content. Requires all generated files be in English.]

---

## Implementation Reporting Protocol

As you implement each milestone/feature, write brief progress updates to reduce context usage:

**Format:**
```

[DONE] [Milestone/Feature] complete
Files: [key files created/modified]
Tests: [number passing]

```

**Example:**
```

[DONE] Milestone 1 (Foundation) complete
Files: src/app/layout.tsx, src/lib/theme.tsx, src/app/page.tsx
Tests: 12 passing

[DONE] Authentication system complete
Files: src/lib/auth.ts, src/app/login/page.tsx
Tests: 8 passing

```

**DO NOT:**
- (INCORRECT) Echo entire file contents back to conversation
- (INCORRECT) Quote large blocks of code unless specifically needed for discussion
- (INCORRECT) Repeat implementation details already documented

**DO:**
- (CORRECT) Confirm completion with file paths
- (CORRECT) Report test results
- (CORRECT) Highlight any issues or decisions that need user input

---

## Before You Begin

Please ask me clarifying questions about:

1. **Authentication & Authorization**
   - How should users sign up and log in? (email/password, OAuth providers, magic links?)
   - Are there different user roles with different permissions?
   - Should there be an admin interface?

2. **User & Account Modeling**
   - Is this a single-user app or multi-user?
   - Do users belong to organizations/teams/workspaces?
   - How should user profiles be structured?

3. **Tech Stack Preferences**
   - What backend framework/language should I use?
   - What database do you prefer?
   - Any specific hosting/deployment requirements?

4. **Backend Business Logic**
   - Any server-side logic, validations or processes needed beyond what's shown in the UI?
   - Background processes, notifications, or other processes to trigger?

5. **Any Other Clarifications**
   - Questions about specific features or user flows
   - Edge cases that need clarification
   - Integration requirements

Lastly, be sure to ask me if I have any other notes to add for this implementation.

Once I answer your questions, create a comprehensive implementation plan before coding.

## Final Verification Checklist

Before considering this implementation complete, verify:

**Authentication & Data Access:**
- [ ] Authentication method implemented as discussed
- [ ] User roles and permissions implemented correctly
- [ ] Protected routes/pages properly secured
- [ ] Data access properly scoped to authenticated users

**Component Integration:**
- [ ] All provided components integrated without modification
- [ ] Design tokens applied correctly (no hardcoded colors/fonts)
- [ ] Props passed correctly to all components
- [ ] Component imports use correct paths

**Testing:**
- [ ] All test scenarios from tests.md files implemented
- [ ] User flows work end-to-end
- [ ] Empty states handled correctly
- [ ] Error states handled correctly
- [ ] Loading states implemented

**Responsive & Accessibility:**
- [ ] Mobile responsive (test at 375px, 768px, 1024px, 1920px)
- [ ] Dark mode works correctly (all text readable, proper contrast)
- [ ] Keyboard navigation works (tab order, focus states)
- [ ] Screen reader friendly (semantic HTML, ARIA labels where needed)

**Deployment Readiness:**
- [ ] No console errors or warnings
- [ ] Build succeeds without errors
- [ ] Environment variables documented in .env.example
- [ ] README includes setup instructions

**Data Integrity:**
- [ ] Form validations work correctly
- [ ] Database constraints properly implemented
- [ ] Error messages are user-friendly
- [ ] Data relationships maintain referential integrity

```

### section-prompt.md (Template File — Requires Variable Substitution)

**Note:** This is a **prompt template** that requires variable substitution before use. Unlike `one-shot-prompt.md`, users must fill in `SECTION_NAME`, `SECTION_ID`, and `NN` values for each section they implement. The variables at the top serve as placeholders that the user replaces with actual values.

Assemble from the templates listed above (see "Template Concatenation Order" section). Follow the template assembly process to create `product-plan/prompts/section-prompt.md`:

> **Note:** The content below shows an example of the fully assembled output for reference. Do NOT copy this verbatim — instead, assemble the prompt by concatenating the template files in the order specified in "Template Concatenation Order". The templates contain the authoritative content; this example may not reflect the latest template versions.

```markdown
# Section Implementation Prompt

## Define Section Variables

- **SECTION_NAME** = [Human-readable name, e.g., "Invoices" or "Project Dashboard"]
- **SECTION_ID** = [Folder name in sections/, e.g., "invoices" or "project-dashboard"]
- **NN** = [Milestone number, e.g., "02" or "03" — sections start at 02 since 01 is Foundation]

---

I need you to implement the **SECTION_NAME** section of my application.

## Suggested Model Usage

For optimal cost-quality balance, consider this approach:

- **Claude Opus** → Initial implementation planning, architectural decisions, complex business logic
- **Claude Sonnet** → Implementing repetitive components, writing tests, routine CRUD operations
- **Claude Opus** → Final integration, edge cases, polish, and deployment

This is optional - use whichever model you prefer, but this can help optimize costs for large implementations.

---

## Instructions

Please carefully read and analyze the following files:

1. **@product-plan/product-overview.md** — Product summary for overall context
2. **@product-plan/instructions/incremental/NN-SECTION_ID.md** — Specific instructions for this section

Also review the section assets:

- **@product-plan/design-guidance/frontend-design.md** — Design principles and guidance
- **@product-plan/sections/SECTION_ID/README.md** — Feature overview and design intent
- **@product-plan/sections/SECTION_ID/tests.md** — Test-writing instructions (use TDD approach)
- **@product-plan/sections/SECTION_ID/components/** — React components to integrate
- **@product-plan/sections/SECTION_ID/types.ts** — TypeScript interfaces
- **@product-plan/sections/SECTION_ID/sample-data.json** — Test data

## TOP 4 RULES FOR IMPLEMENTATION

These rules prevent common implementation mistakes. Follow them strictly.

### Rule 1: NEVER FABRICATE REQUIREMENTS

- Only implement features explicitly described in the spec files
- If a requirement is unclear or ambiguous, ASK the user - don't guess
- Use the Read tool to verify every requirement before implementing

**Common violations to avoid:**

- (INCORRECT) Adding authentication features not mentioned in spec
- (INCORRECT) Creating admin panels not requested
- (INCORRECT) Adding "nice to have" features without approval
- (INCORRECT) Inventing API endpoints not in data model

**How to follow:**

- (CORRECT) Read product-overview.md and instructions completely before planning
- (CORRECT) Ask clarifying questions if anything is unclear
- (CORRECT) Stick to EXACTLY what's specified in tests.md files

### Rule 2: INTEGRATION > REDESIGN

- DO NOT restyle or redesign the provided components
- DO NOT change the design tokens (colors, fonts, spacing)
- DO NOT modify component props or structure
- Your job is to integrate components into a working application

**Common violations to avoid:**

- (INCORRECT) "I'll make this component more modern by changing the colors"
- (INCORRECT) "Let me improve the layout by adding more padding"
- (INCORRECT) "I'll replace DM Sans with Inter because I prefer it"
- (INCORRECT) "This component would look better with shadows"

**How to follow:**

- (CORRECT) Use components exactly as provided
- (CORRECT) Pass data via props as designed
- (CORRECT) Focus on backend logic, routing, and state management
- (CORRECT) If component seems wrong, ask the user before changing

### Rule 3: READ BEFORE BUILDING

- Read ALL referenced files before creating your implementation plan
- Don't skip files because they seem optional
- Don't make assumptions about what files contain
- If you didn't read it with the Read tool, don't reference it

**Common violations to avoid:**

- (INCORRECT) Skipping tests.md and guessing what tests to write
- (INCORRECT) Not reading sample-data.json and creating wrong data structures
- (INCORRECT) Ignoring types.ts and defining duplicate types
- (INCORRECT) Assuming shell structure without reading AppShell.tsx

**How to follow:**

- (CORRECT) Read product-overview.md to understand product context
- (CORRECT) Read ALL instruction files before planning
- (CORRECT) Read tests.md for EACH section before implementing
- (CORRECT) Read provided components to understand props and behavior
- (CORRECT) Create implementation plan AFTER reading, not before

### Rule 4: ENGLISH OUTPUT ONLY

[Abbreviated — see `common/top-rules.md` for full content. Requires all generated files be in English.]

---

## Implementation Reporting Protocol

As you implement each milestone/feature, write brief progress updates to reduce context usage:

**Format:**
```

[DONE] [Milestone/Feature] complete
Files: [key files created/modified]
Tests: [number passing]

```

**Example:**
```

[DONE] Milestone 1 (Foundation) complete
Files: src/app/layout.tsx, src/lib/theme.tsx, src/app/page.tsx
Tests: 12 passing

[DONE] Authentication system complete
Files: src/lib/auth.ts, src/app/login/page.tsx
Tests: 8 passing

```

**DO NOT:**
- (INCORRECT) Echo entire file contents back to conversation
- (INCORRECT) Quote large blocks of code unless specifically needed for discussion
- (INCORRECT) Repeat implementation details already documented

**DO:**
- (CORRECT) Confirm completion with file paths
- (CORRECT) Report test results
- (CORRECT) Highlight any issues or decisions that need user input

---

## Before You Begin

Please ask me clarifying questions about:

1. **Authentication & Authorization** (if not yet established)
   - How should users authenticate?
   - What permissions are needed for this section?

2. **Data Relationships**
   - How does this section's data relate to other entities?
   - Are there any cross-section dependencies?

3. **Integration Points**
   - How should this section connect to existing features?
   - Any API endpoints already built that this should use?

4. **Backend Business Logic**
   - Any server-side logic, validations or processes needed beyond what's shown in the UI?
   - Background processes, notifications, or other processes to trigger?

5. **Any Other Clarifications**
   - Questions about specific user flows in this section
   - Edge cases that need clarification

## Implementation Approach

Use test-driven development:
1. Read the `tests.md` file and write failing tests first
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

Lastly, be sure to ask me if I have any other notes to add for this implementation.

Once I answer your questions, proceed with implementation.

## Final Verification Checklist

Before considering this implementation complete, verify:

**Authentication & Data Access:**
- [ ] Authentication method implemented as discussed
- [ ] User roles and permissions implemented correctly
- [ ] Protected routes/pages properly secured
- [ ] Data access properly scoped to authenticated users

**Component Integration:**
- [ ] All provided components integrated without modification
- [ ] Design tokens applied correctly (no hardcoded colors/fonts)
- [ ] Props passed correctly to all components
- [ ] Component imports use correct paths

**Testing:**
- [ ] All test scenarios from tests.md files implemented
- [ ] User flows work end-to-end
- [ ] Empty states handled correctly
- [ ] Error states handled correctly
- [ ] Loading states implemented

**Responsive & Accessibility:**
- [ ] Mobile responsive (test at 375px, 768px, 1024px, 1920px)
- [ ] Dark mode works correctly (all text readable, proper contrast)
- [ ] Keyboard navigation works (tab order, focus states)
- [ ] Screen reader friendly (semantic HTML, ARIA labels where needed)

**Deployment Readiness:**
- [ ] No console errors or warnings
- [ ] Build succeeds without errors
- [ ] Environment variables documented in .env.example
- [ ] README includes setup instructions

**Data Integrity:**
- [ ] Form validations work correctly
- [ ] Database constraints properly implemented
- [ ] Error messages are user-friendly
- [ ] Data relationships maintain referential integrity

```

## Step 15: Generate README.md

Create `product-plan/README.md` with the actual product name substituted:

**Important:** Replace all `[Product Name]` placeholders with the actual product name from `product-overview.md` before writing the file.

```bash
# Get the product name from product-overview.md (first line after "# ")
PRODUCT_NAME=$(head -1 product/product-overview.md | sed 's/^# //')
```

```markdown
# [Product Name] — Design Handoff

This folder contains everything needed to implement [Product Name].

## What's Included

**Ready-to-Use Prompts:**

- `prompts/one-shot-prompt.md` — Prompt template for full implementation
- `prompts/section-prompt.md` — Prompt template for section-by-section implementation

**Instructions:**

- `product-overview.md` — Product summary (provide with every implementation)
- `instructions/one-shot-instructions.md` — All milestones combined for full implementation
- `instructions/incremental/` — Milestone-by-milestone instructions (foundation, then sections)

**Design Assets:**

- `design-guidance/` — Frontend design principles and guidance for creating distinctive components
- `design-system/` — Colors, fonts, design tokens
- `data-model/` — Core entities and TypeScript types
- `shell/` — Application shell components
- `sections/` — All section components, types, sample data, and test instructions

## How to Use This

### Option A: Incremental (Recommended)

Build your app milestone by milestone for better control:

1. Copy the `product-plan/` folder to your codebase
2. Start with Foundation (`instructions/incremental/01-foundation.md`) — includes design tokens, data model, routing, and application shell
3. For each section:
   - Open `prompts/section-prompt.md`
   - Fill in the section variables at the top (SECTION_NAME, SECTION_ID, NN)
   - Copy/paste into your coding agent
   - Answer questions and implement
4. Review and test after each milestone

### Option B: One-Shot

Build the entire app in one session:

1. Copy the `product-plan/` folder to your codebase
2. Open `prompts/one-shot-prompt.md`
3. Add any additional notes to the prompt
4. Copy/paste the prompt into your coding agent
5. Answer the agent's clarifying questions
6. Let the agent plan and implement everything

## Test-Driven Development

Each section includes a `tests.md` file with test-writing instructions. For best results:

1. Read `sections/[section-id]/tests.md` before implementing
2. Write failing tests based on the instructions
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

The test instructions are **framework-agnostic** — they describe WHAT to test, not HOW. Adapt to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

## Tips

- **Use the pre-written prompts** — They include important clarifying questions about auth and data modeling.
- **Add your own notes** — Customize prompts with project-specific context when needed.
- **Build on your designs** — Use completed sections as the starting point for future feature development.
- **Review thoroughly** — Check plans and implementations carefully to catch details and inconsistencies.
- **Fill in the gaps** — Backend business logic may need manual additions. Incremental implementation helps you identify these along the way.

---

_Generated by Design OS_
```

## Step 16: Copy Screenshots

Copy any `.png` files from:

- `product/shell/` → `product-plan/shell/`
- `product/sections/[section-id]/` → `product-plan/sections/[section-id]/`

### Screenshot Copying with Reporting

Track which screenshots exist and were copied. Report the results to the user:

**Step 1: Check for shell screenshots**

```bash
if ls product/shell/*.png 1> /dev/null 2>&1; then
  cp product/shell/*.png product-plan/shell/
  echo "Copied shell screenshots"
else
  echo "Note: No shell screenshots found in product/shell/"
fi
```

**Step 2: Check for section screenshots**
For each section, check and report:

```bash
for section in product/sections/*/; do
  section_id=$(basename "$section")
  if ls "$section"*.png 1> /dev/null 2>&1; then
    cp "$section"*.png "product-plan/sections/$section_id/"
    echo "Copied screenshots for section: $section_id"
  else
    echo "Note: No screenshots found for section: $section_id"
  fi
done
```

**Step 2.5: Validate screenshot filenames**

After copying, validate that screenshot filenames follow the naming convention. This helps ensure consistent documentation.

**Expected naming convention:** `[screen-design-name].png` or `[screen-design-name]-[variant].png`

Valid examples:

- `invoice-list.png` (main view)
- `invoice-list-dark.png` (dark mode variant)
- `invoice-detail-mobile.png` (mobile variant)
- `dashboard-empty.png` (empty state)

Invalid examples:

- `screenshot1.png` (non-descriptive)
- `Screen Shot 2024-01-15.png` (system default name)
- `IMG_1234.png` (camera roll naming)

```bash
# Validate screenshot filenames in each section
for section in product-plan/sections/*/; do
  section_id=$(basename "$section")
  for png in "$section"*.png 2>/dev/null; do
    [ -f "$png" ] || continue
    filename=$(basename "$png")
    # Check if filename matches expected pattern: lowercase, hyphens, optional variant suffix
    if [[ ! "$filename" =~ ^[a-z][a-z0-9-]*\.png$ ]]; then
      echo "Warning: Screenshot '$filename' in $section_id doesn't follow naming convention."
      echo "  Expected format: [screen-design-name].png or [screen-design-name]-[variant].png"
    fi
  done
done
```

If warnings are reported, inform the user but continue with the export:

```
Note: Some screenshot filenames don't follow the naming convention.
Consider renaming them to match the pattern: [screen-design-name]-[variant].png
This improves documentation consistency but doesn't block the export.
```

**Step 3: Report summary**
After copying, provide a summary:

```
Screenshot Summary:
- Shell: [Copied / Not found]
- Section [section-1]: [Copied / Not found]
- Section [section-2]: [Copied / Not found]
...
```

**If no screenshots exist for any section:**

```
Warning: No screenshots were found for export.
The sections/[section-id]/ folders will not include visual references.
Consider running /screenshot-design for each section to capture screenshots.
```

This ensures users know which sections have visual documentation and which may need screenshots captured.

## Step 17: Create Zip File

After generating all the export files, create a zip archive of the product-plan folder.

### Validate Zip Command Exists

First, check if the `zip` command is available on the system:

```bash
if ! command -v zip &> /dev/null; then
  echo "Warning: 'zip' command not found. Skipping zip creation."
  echo "The export folder is still available at product-plan/"
  echo "To create a zip manually, install zip and run: zip -r product-plan.zip product-plan/"
fi
```

If `zip` is not available, skip zip creation but continue with the export. The `product-plan/` folder is still fully functional.

### Create the Zip Archive

If `zip` is available:

```bash
# Check if existing zip file exists and ask before removing
if [ -f "product-plan.zip" ]; then
  echo "Note: Existing product-plan.zip found. It will be replaced with the new export."
fi

# Remove any existing zip file
rm -f product-plan.zip

# Create the zip file
cd . && zip -r product-plan.zip product-plan/

# Verify zip was created and is valid
if [ -f "product-plan.zip" ]; then
  zip_size=$(du -h product-plan.zip | cut -f1)
  echo "Zip archive created: product-plan.zip ($zip_size)"
else
  echo "Error: Zip file not created. Check product-plan/ folder."
fi
```

### Validate Zip Contents

After creating the zip, verify it contains the expected structure:

```bash
# Validate zip is not corrupted
if ! unzip -t product-plan.zip > /dev/null 2>&1; then
  echo "Error: product-plan.zip - Zip file is corrupted. Recreating..."
  rm -f product-plan.zip
  zip -r product-plan.zip product-plan/
fi

# Check zip contains expected files
EXPECTED_FILES=(
  "product-plan/README.md"
  "product-plan/product-overview.md"
  "product-plan/prompts/one-shot-prompt.md"
)

for expected in "${EXPECTED_FILES[@]}"; do
  if ! unzip -l product-plan.zip | grep -q "$expected"; then
    echo "Warning: Zip missing expected file: $expected"
  fi
done

# Report zip contents summary
file_count=$(unzip -l product-plan.zip | tail -1 | awk '{print $2}')
echo "Zip contains $file_count files"
```

**Validation Criteria:**

| Check             | Pass Criteria                   | On Failure          |
| ----------------- | ------------------------------- | ------------------- |
| Zip exists        | `product-plan.zip` file present | Retry zip creation  |
| Zip not empty     | File size > 0 bytes             | Retry zip creation  |
| Zip not corrupted | `unzip -t` passes               | Delete and recreate |
| Contains README   | README.md in zip listing        | Warning only        |
| Contains prompts  | prompts/ directory present      | Warning only        |

### Zip Cleanup Behavior

The previous zip file is always replaced during export. This is intentional because:

- Each export represents a complete, updated snapshot
- Keeping old zips could cause confusion about which version to use
- The product-plan/ folder is always preserved for comparison

**If you need to preserve old exports:**

- Rename the existing zip before running export: `mv product-plan.zip product-plan-backup.zip`
- Or use version control to track export history

This creates `product-plan.zip` in the project root, which will be available for download on the Export page.

## Step 18: Confirm Completion

Let the user know:

"I've created the complete export package at `product-plan/` and `product-plan.zip`.

**What's Included:**

**Ready-to-Use Prompts:**

- `prompts/one-shot-prompt.md` — Prompt for full implementation
- `prompts/section-prompt.md` — Prompt template for section-by-section

**Instructions:**

- `product-overview.md` — Product summary (always provide with instructions)
- `instructions/one-shot-instructions.md` — All milestones combined
- `instructions/incremental/` — [N] milestone instructions (foundation, then sections)

**Design Assets:**

- `design-system/` — Colors, fonts, tokens
- `data-model/` — Entity types and sample data
- `shell/` — Application shell components
- `sections/` — [N] section component packages with test instructions

**Download:**

Restart your dev server and visit the Export page to download `product-plan.zip`.

**How to Use:**

1. Copy `product-plan/` to your implementation codebase
2. Open `prompts/one-shot-prompt.md` or `prompts/section-prompt.md`
3. Add any additional notes, then copy/paste into your coding agent
4. Answer the agent's clarifying questions about auth, data modeling, etc.
5. Let the agent implement based on the instructions

The components are props-based and portable — they accept data and callbacks, letting your implementation agent handle routing, data fetching, and state management however fits your stack."

## Important Notes

- Always transform import paths when copying components
- Include `product-overview.md` context with every implementation session
- Use the pre-written prompts — they prompt for important clarifying questions
- Screenshots provide visual reference for fidelity checking
- Sample data files are for testing before real APIs are built
- The export is self-contained — no dependencies on Design OS
- Components are portable — they work with any React setup

### Rollback / Recovery

If the export process fails or produces unexpected results, here's how to recover:

**Before Starting Export (Recommended):**

Create a backup of any existing export before starting a new one:

```bash
# Backup existing export folder
if [ -d "product-plan" ]; then
  mv product-plan product-plan-backup-$(date +%Y%m%d-%H%M%S)
fi

# Backup existing zip file
if [ -f "product-plan.zip" ]; then
  mv product-plan.zip product-plan-backup-$(date +%Y%m%d-%H%M%S).zip
fi
```

**If Export Fails Mid-Process:**

1. **Delete the partial export:**

   ```bash
   rm -rf product-plan/
   rm -f product-plan.zip
   ```

2. **Fix the issue** (usually a validation error from Step 1 or Step 8)

3. **Re-run `/export-product`** — the command is idempotent and will recreate everything

**If Export Completes But Has Issues:**

| Problem             | Solution                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Missing components  | Check Step 8-9 logs for validation failures. Re-run export after fixing component issues. |
| Wrong import paths  | Check Step 9 path transformations. May need to manually fix paths in copied files.        |
| Missing screenshots | Run `/screenshot-design` for each section, then re-run export.                            |
| Corrupt prompts     | Check template files in `.claude/templates/design-os/`. Restore from git if needed.       |
| Zip file corrupt    | Delete `product-plan.zip` and recreate manually: `zip -r product-plan.zip product-plan/`  |

**Restore from Backup:**

If you have a backup and need to restore:

```bash
# Remove failed export
rm -rf product-plan/
rm -f product-plan.zip

# Restore from backup
mv product-plan-backup-[timestamp] product-plan
mv product-plan-backup-[timestamp].zip product-plan.zip
```

**Git-Based Recovery:**

If the export folder is tracked in git:

```bash
# Discard all changes to product-plan/
git checkout -- product-plan/

# Or restore specific files
git checkout HEAD -- product-plan/prompts/one-shot-prompt.md
```

**When to Start Fresh:**

Sometimes it's easier to delete everything and regenerate:

```bash
rm -rf product-plan/
rm -f product-plan.zip
# Then re-run /export-product
```

The export process is designed to be repeatable — running it multiple times will produce the same output (given the same source files).

### Progress Reporting

During the export process, provide progress updates to keep the user informed:

**Report at the start of each major step:**

```
[Step X/18] Starting: [Step Name]...
```

**Report after completing key milestones:**

```
[DONE] Step 3: Created export directory structure
[DONE] Step 4: Generated product-overview.md
[DONE] Step 5-6: Generated milestone instructions (4 milestones)
[DONE] Step 8: Validated all components (12 components, 0 issues)
[DONE] Step 9: Copied and transformed components
...
```

**For long-running steps, report progress within the step:**

```
[Step 9] Copying section components...
  - invoices: 3 components copied
  - projects: 4 components copied
  - reports: 2 components copied
```

**Summary at completion:**

```
Export Complete!
- Total steps: 18
- Milestones generated: 4
- Components exported: 9
- Screenshots copied: 3
- Zip file: product-plan.zip (2.4MB)
```

This helps users understand what's happening during longer exports and provides confidence that the process is progressing correctly.

### Performance Note

This command performs many file operations and may take longer for products with many sections. The most resource-intensive steps are:

- **Component validation** (Step 8) — Reads and validates all component files
- **Prompt generation** (Step 14) — Reads and assembles multiple template files
- **Zip creation** (Step 17) — Creates archive of entire export folder

For large products (5+ sections), expect this command to take more time. Progress updates are provided throughout.
