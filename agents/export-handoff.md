# Export & Handoff

This document covers the export process, product context system, and template state management.

---

## Export & Handoff Overview

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

## Product Context System

The `/product-interview` command creates `product/product-context.md`, which serves as the central source of truth for all Design OS commands.

### Why Product Context is Required

Before `/product-interview`, users often encountered these problems:

- **Incomplete designs** — Missing error states, loading states, edge cases
- **Inconsistent decisions** — Different assumptions across sections
- **Repeated questions** — Same clarifications asked in multiple commands
- **Design gaps** — Accessibility, mobile patterns, or performance considerations overlooked

Product context solves this by gathering comprehensive information upfront.

### Context Categories

| #   | Category                 | Qty | Topics                                                                       | Used By Commands                                    |
| --- | ------------------------ | --- | ---------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | Product Foundation       | 6   | Target audience, problem space, competitors, success metrics, business model | `/product-vision`, `/product-roadmap`               |
| 2   | User Research & Personas | 4   | Personas, accessibility needs, geographic distribution                       | `/product-vision`, `/design-shell`                  |
| 3   | Design Direction         | 5   | Aesthetic tone, animation, density, brand constraints                        | `/design-tokens`, `/design-shell`, `/design-screen` |
| 4   | Data Architecture        | 5   | Sensitivity, compliance, relationships, audit needs                          | `/data-model`, `/sample-data`                       |
| 5   | Section-Specific Depth   | 5   | User flows, edge cases, empty/loading/error states                           | `/shape-section`, `/sample-data`, `/design-screen`  |
| 6   | UI Patterns & Components | 5   | Data display, validation, notifications, confirmations                       | `/shape-section`, `/design-screen`                  |
| 7   | Mobile & Responsive      | 4   | Priority, touch interactions, navigation, offline                            | `/design-shell`, `/design-screen`                   |
| 8   | Performance & Scale      | 4   | User volume, data scale, real-time needs, search                             | `/product-roadmap`, `/shape-section`                |
| 9   | Integration Points       | 3   | Auth provider, external services, API exposure                               | `/design-shell`, `/export-product`                  |
| 10  | Security & Compliance    | 3   | Auth level, authorization model, audit logging                               | `/data-model`, `/export-product`                    |
| 11  | Error Handling           | 4   | Message style, retry behavior, undo/redo, data loss prevention               | `/shape-section`, `/design-screen`                  |
| 12  | Testing & Quality        | 4   | Coverage targets, E2E scope, accessibility testing, browser support          | `/export-product`                                   |

**Total:** 52 questions (~45-60 min for full interview, ~20-30 min for `--minimal`)

### Completeness Requirements

Commands require minimum 50% completeness to proceed:

```markdown
Completeness Calculation:

- 12 total categories
- Each category status: ✅ Complete (all questions) / ⚠️ Partial (some) / ❌ Empty
- Overall = (count of ✅ Complete categories ÷ 12) × 100
- Minimum threshold: 50% (6+ categories fully complete)
```

> **Note:** Only ✅ Complete categories count toward the percentage. ⚠️ Partial categories do not increase completeness—they need to be finished.

**Behavior by completeness:**

| Completeness | Behavior                                                         |
| ------------ | ---------------------------------------------------------------- |
| 0% (missing) | ERROR: "Run /product-interview first"                            |
| 1-49%        | WARNING: "Context incomplete (X%). Continue or interview first?" |
| 50-74%       | PROCEED: Load context, note missing categories                   |
| 75-100%      | PROCEED: Full context available                                  |

### Quick Start with --minimal

For users who want to start quickly:

```bash
/product-interview --minimal
```

This covers 6 critical categories (1, 3, 5, 6, 7, 11) and takes ~29 questions instead of ~52. This meets the 50% completeness threshold required by other commands.

**Why these categories?**

| Category                     | Why Critical                                                                |
| ---------------------------- | --------------------------------------------------------------------------- |
| 1 (Product Foundation)       | Product name, audience, problem — needed for `/product-vision`              |
| 3 (Design Direction)         | Aesthetic tone, density — needed for `/design-tokens` and all visual design |
| 5 (Section-Specific Depth)   | User flows, states — needed for `/shape-section` and `/design-screen`       |
| 6 (UI Patterns & Components) | Component preferences — needed for all screen designs                       |
| 7 (Mobile & Responsive)      | Responsive strategy — needed for `/design-shell` and all screen designs     |
| 11 (Error Handling)          | Error states — needed for complete, production-ready designs                |

These 6 categories provide minimum viable context (50%) for the design workflow. You can always run `--stage=X` later to fill in gaps.

**Why other categories are excluded from `--minimal`:**

| Category Excluded            | Reason                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| 2 (User Research & Personas) | Helpful but not blocking — designs can proceed with basic audience understanding             |
| 4 (Data Architecture)        | Implementation detail — can be defined during `/data-model` when needed                      |
| 8 (Performance & Scale)      | Implementation concern — relevant at export/implementation phase, not design                 |
| 9 (Integration Points)       | Implementation detail — auth/API specifics defined during implementation                     |
| 10 (Security & Compliance)   | Implementation phase — security details typically defined by implementation team, not design |
| 12 (Testing & Quality)       | Implementation phase — testing strategy defined when actually writing tests                  |

These categories enhance the design but aren't required for the visual design workflow. They become relevant during `/export-product` and implementation.

### Updating Context

To add missing sections or update existing answers:

```bash
/product-interview              # Will detect existing and offer to complete
/product-interview --stage=X    # Focus on specific area
/product-interview --audit      # Check what's missing
```

### Context File Location

`product/product-context.md` — Committed to repository, shared with team, referenced by all commands.

---

## Template State (Boilerplate Directories)

The Design OS boilerplate includes several intentionally empty directories. This is by design — they serve as placeholders that users populate through the Design OS workflow commands.

### Intentionally Empty Directories

| Directory                | Purpose                            | Populated By                                                           |
| ------------------------ | ---------------------------------- | ---------------------------------------------------------------------- |
| `product/`               | Product definition files           | `/product-vision`, `/product-roadmap`, `/data-model`, `/design-tokens` |
| `product/sections/`      | Section specifications and data    | `/shape-section`, `/sample-data`                                       |
| `product/shell/`         | Shell specification                | `/design-shell`                                                        |
| `product/design-system/` | Design tokens (colors, typography) | `/design-tokens`, `/design-shell` (design-direction.md)                |
| `product/data-model/`    | Global data model                  | `/data-model`                                                          |
| `src/shell/components/`  | Shell primary/secondary components | `/design-shell` (adds to pre-existing utility components)              |
| `src/sections/`          | Section screen design components   | `/design-screen`                                                       |
| `product-plan/`          | Export package (generated)         | `/export-product`                                                      |

> **Note:** Subdirectories within sections (e.g., `product/sections/[id]/`, `src/sections/[id]/components/`) are also initially empty and created by their respective commands.

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
