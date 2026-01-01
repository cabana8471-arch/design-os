<!-- v1.0.0 -->

# Phase 2: Structure and Documentation (Steps 3-7)

This phase creates the export directory structure and generates the core documentation files.

---

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

1. **Foundation** — Set up design tokens, data model types, routing structure[IF INCLUDE_SHELL=true], and application shell[/IF]
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
>
> **Example:** If `INCLUDE_SHELL=true`, the section `[IF INCLUDE_SHELL=true] Shell renders with navigation` becomes simply `- [ ] Shell renders with navigation`. If `INCLUDE_SHELL=false`, that line is omitted entirely and the `[IF INCLUDE_SHELL=false]` alternatives are included instead.

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

**[IF INCLUDE_SHELL=true]:**

- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components
- `product-plan/shell/screenshot.png` — Shell visual reference

**[IF INCLUDE_SHELL=false]:**

- No shell files included — implement your own navigation

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

Place in `product-plan/instructions/incremental/[NN]-[section-id].md` (starting at 02 for the first section).

> **Zero-Padding:** Milestone numbers MUST be zero-padded to 2 digits: `01`, `02`, `03`, etc. Examples: `02-invoices.md`, `03-projects.md` (NOT `2-invoices.md`).

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

1. **Foundation** — Design tokens, data model types, routing structure[IF INCLUDE_SHELL=true], and application shell[/IF] (all together)
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
> **Includes:** Design tokens, data model types, routing structure[IF INCLUDE_SHELL=true], AND application shell[/IF]

[Include 01-foundation.md content WITHOUT the preamble — it's already at the top. Foundation includes design tokens, data model, routing[IF INCLUDE_SHELL=true], AND application shell[/IF].]

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

1. **Verify directory exists** (should have been created in Step 3):

```bash
if [ ! -d "product-plan/design-guidance" ]; then
  mkdir -p product-plan/design-guidance
fi
```

2. **Read** `.claude/skills/frontend-design/SKILL.md`
3. **Copy** its contents to `product-plan/design-guidance/frontend-design.md`

This ensures implementation agents (Claude, Cursor, etc.) have access to design guidance for creating distinctive, production-grade components with the same quality as the Design OS screen designs.

Reference this file in implementation prompts:

> **Before creating components, read `product-plan/design-guidance/frontend-design.md` and follow its guidance on distinctive UI, bold design directions, thoughtful typography, and effective motion.**

---

**Next Phase:** Continue to `phase-3-validation.md` for Steps 8-9 (component validation and copying).
