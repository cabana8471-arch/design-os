# Command Reference

This document contains the command quick reference tables, prerequisites, step numbering conventions, and template system documentation.

---

## Command Quick Reference

### Files Generated Per Command

| Command              | Creates                                                                                                                                                                                                                                                       | Location                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `/product-interview` | `product-context.md`                                                                                                                                                                                                                                          | `product/`                       |
| `/audit-context`     | `audit-report.md`                                                                                                                                                                                                                                             | `product/`                       |
| `/product-vision`    | `product-overview.md`                                                                                                                                                                                                                                         | `product/`                       |
| `/product-roadmap`   | `product-roadmap.md`                                                                                                                                                                                                                                          | `product/`                       |
| `/data-model`        | `data-model.md`                                                                                                                                                                                                                                               | `product/data-model/`            |
| `/design-tokens`     | `colors.json`, `typography.json` [2]                                                                                                                                                                                                                          | `product/design-system/`         |
| `/design-shell`      | `spec.md`, `data.json`, `types.ts`, `design-direction.md`, Primary components (`AppShell.tsx`, `MainNav.tsx`, `UserMenu.tsx`), Secondary components (based on selection: `NotificationsDrawer.tsx`, `SearchModal.tsx`, `SettingsModal.tsx`, etc.), `index.ts` | See note below [1]               |
| `/shape-section`     | `spec.md`                                                                                                                                                                                                                                                     | `product/sections/[section-id]/` |
| `/sample-data`       | `data.json`, `types.ts`                                                                                                                                                                                                                                       | `product/sections/[section-id]/` |
| `/design-screen`     | `[ViewName].tsx`, `components/*.tsx`, `components/index.ts`                                                                                                                                                                                                   | `src/sections/[section-id]/`     |
| `/screenshot-design` | `[view-name].png`                                                                                                                                                                                                                                             | `product/sections/[section-id]/` |
| `/export-product`    | Complete export package                                                                                                                                                                                                                                       | `product-plan/`                  |

**[1] /design-shell file locations:**

- `spec.md`, `data.json`, `types.ts` → `product/shell/`
- `design-direction.md` → `product/design-system/`
- Primary components (`AppShell.tsx`, `MainNav.tsx`, `UserMenu.tsx`) → `src/shell/components/`
- Secondary components (if selected in Step 3.6) → `src/shell/components/`
- `index.ts` → `src/shell/components/`
- `ShellPreview.tsx` → `src/shell/` (Generated by `/design-shell`, Design OS only, not exported)

**[2] /design-tokens typography requirement:** `typography.json` MUST include a `mono` font field for code/data display. If not specified by user, defaults to IBM Plex Mono. This is validated in `/design-tokens` Step 3 (Typography Selection).

### Command Prerequisites

| Command              | Required                                                          | Optional                                    |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| `/product-interview` | —                                                                 | —                                           |
| `/audit-context`     | `product-context.md`                                              | —                                           |
| `/product-vision`    | `product-context.md` (≥50%)                                       | —                                           |
| `/product-roadmap`   | `product-context.md`, `product-overview.md`                       | —                                           |
| `/data-model`        | `product-context.md`, `product-overview.md`, `product-roadmap.md` | —                                           |
| `/design-tokens`     | `product-context.md`, `product-overview.md`                       | —                                           |
| `/design-shell`      | `product-context.md`, `product-overview.md`, `product-roadmap.md` | Design tokens, Sections, `SKILL.md`         |
| `/shape-section`     | `product-context.md`, `product-overview.md`, `product-roadmap.md` | Data model, Shell spec                      |
| `/sample-data`       | `product-context.md`, Section `spec.md`                           | Data model                                  |
| `/design-screen`     | `product-context.md`, Section `spec.md`, `data.json`, `types.ts`  | Design tokens, Shell components, `SKILL.md` |
| `/screenshot-design` | Screen design components                                          | Playwright MCP                              |
| `/export-product`    | `product-context.md`, `product-overview.md`, at least one section | Shell components, All sections              |

**Legend:**

- **Required**: Command will STOP if missing
- **Optional**: Command will WARN and continue with defaults if missing

**Note on Design Tokens for /design-shell:** While design tokens are optional, if they don't exist, `/design-shell` will use default stone/lime colors. For product-specific branding, run `/design-tokens` before `/design-shell`.

> **Relationship to /audit-context Command Readiness:** The table above shows FILE prerequisites (what files must exist). The `/audit-context` command has a separate "Command Readiness" table showing CATEGORY completeness requirements. A command needs BOTH: the required files must exist AND the relevant categories must have sufficient content.

---

## Step Numbering Convention

Design OS commands use decimal step notation for granularity:

| Notation     | Meaning                             | Example                           |
| ------------ | ----------------------------------- | --------------------------------- |
| `Step N`     | Major workflow phase                | Step 1: Check Prerequisites       |
| `Step N.M`   | Sub-step within phase               | Step 3.6: Ask about relationships |
| `Step 0.N`   | Audit/pre-check steps (conditional) | Step 0.5: Audit existing shell    |
| `Step NA`    | Conditional branch                  | Step 8A: Shell validation         |
| `Step N-N.M` | Range of steps (inclusive)          | Step 0-0.7: All audit steps       |

**Range Notation:** `Step 0-0.7` refers to discrete steps in that range (e.g., Steps 0, 0.5, 0.6, 0.7), not a continuous mathematical range. The actual steps included depend on what's defined in the command file.

**Examples from /design-shell:**

- Step 0-0.7: Audit steps — includes Step 0, 0.5, 0.6, 0.7 (discrete sub-steps)
- Step 1-2: Prerequisite checks — includes Step 1, 2 (two major steps)
- Step 3.1-3.6: Shell configuration questions — includes Steps 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
- Step 6.5: Create design-direction.md
- Step 7: Create components

**Cross-Command References:**

When referencing steps in other commands, use format: `/[command] Step N.M`

Example: "See `/design-shell` Step 6.5 for design direction creation"

> **Maintenance Note:** When modifying step numbers in a command file, search for references to those steps in agents.md and other command files. Use grep: `grep -r "Step [number]" .claude/` to find all references that may need updating.

---

## Template System

Design OS uses a modular template system for generating implementation prompts and instructions.

### Location

`.claude/templates/design-os/` contains:

- `common/` — Shared templates (top-rules, verification, TDD workflow)
- `one-shot/` — Full implementation prompt templates
- `section/` — Section-by-section prompt templates
- `README.md` — Complete template system documentation

### Template Versions

| Template                           | Version        | Notes                          |
| ---------------------------------- | -------------- | ------------------------------ |
| `common/top-rules.md`              | v1.0.0         | Core rules for implementation  |
| `common/reporting-protocol.md`     | v1.0.0         | Progress reporting format      |
| `common/model-guidance.md`         | v1.1.0         | Model behavior guidance        |
| `common/verification-checklist.md` | v1.0.0         | Final verification steps       |
| `common/clarifying-questions.md`   | v1.0.0         | Questions for foundation setup |
| `common/tdd-workflow.md`           | v1.1.0         | Test-driven development flow   |
| `one-shot/preamble.md`             | v1.1.0         | One-shot prompt intro          |
| `one-shot/prompt-template.md`      | v1.0.0         | One-shot file references       |
| `section/preamble.md`              | v1.1.0         | Section prompt intro           |
| `section/prompt-template.md`       | v1.0.0         | Section file references        |
| `section/clarifying-questions.md`  | v1.1.0-section | Section-specific questions     |
| `section/tdd-workflow.md`          | v1.2.0-section | Section-specific TDD           |

> **Version Format:** `v{major}.{minor}.{patch}[-suffix]`. The `-section` suffix indicates section-specific variants.

> **Maintenance Process:** When updating template files:
>
> 1. Bump version in template file header (e.g., `<!-- v1.0.1 -->`)
> 2. Update corresponding entry in this table
> 3. Run `grep -h "^<!-- v" .claude/templates/design-os/**/*.md` to verify all versions
> 4. Document changes in commit message

### Command Versions

Commands in `.claude/commands/design-os/` include version headers (`<!-- vX.X.X -->`) at the top of each file:

| Command              | Version | Notes                                                                                                                               |
| -------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `/product-interview` | v1.3.5  | + Warning behavior for --minimal --skip-validation, mid-interview correction, file write verification, completeness math validation |
| `/audit-context`     | v1.1.6  | + awk portability fix, output capture wrapper, category guards, Consistency Matrix clarification, variable scope notes              |
| `/product-vision`    | v1.0.0  | Initial stable version                                                                                                              |
| `/product-roadmap`   | v1.0.0  | Initial stable version                                                                                                              |
| `/data-model`        | v1.0.0  | Initial stable version                                                                                                              |
| `/design-tokens`     | v1.0.0  | Initial stable version                                                                                                              |
| `/design-shell`      | v1.0.0  | Initial stable version                                                                                                              |
| `/shape-section`     | v1.0.0  | Initial stable version                                                                                                              |
| `/sample-data`       | v1.0.0  | Initial stable version                                                                                                              |
| `/design-screen`     | v1.0.0  | Initial stable version                                                                                                              |
| `/screenshot-design` | v1.0.0  | Initial stable version                                                                                                              |
| `/export-product`    | v1.1.0  | Refactored into phases                                                                                                              |

> **Maintenance Note:** When updating a command, bump its version and update this table. Use semantic versioning: patch for fixes, minor for features, major for breaking changes.

### Usage

The `/export-product` command assembles these templates (see Step 14: Generate Prompt Files) into ready-to-use prompts:

- `product-plan/prompts/one-shot-prompt.md`
- `product-plan/prompts/section-prompt.md`

See `.claude/templates/design-os/README.md` for template authoring and assembly details.

### Foundation Milestone Definition

The "Foundation" milestone (milestone 01) includes core infrastructure that all sections depend on:

1. **Project Setup**: Package.json, build config, linting, TypeScript configuration
2. **Authentication**: Auth provider integration, protected routes, session management
3. **Core Layout**: Shell components (AppShell, MainNav, UserMenu) — **CONDITIONAL** (see Shell Conditional Logic below)
4. **Design System**: Theme provider, color tokens, typography classes
5. **Routing**: Router setup, navigation structure, route guards
6. **Data Layer**: API client setup, state management, data fetching patterns

> **Shell Conditional Logic:** During `/export-product` Step 1, if shell components don't exist or user chooses to proceed without shell, `INCLUDE_SHELL=false` is set. This flag affects:
>
> | INCLUDE_SHELL | 01-foundation.md         | product-plan/shell/ | Implementation Notes                 |
> | ------------- | ------------------------ | ------------------- | ------------------------------------ |
> | `true`        | Includes shell setup     | Created with files  | Use provided AppShell, MainNav, etc. |
> | `false`       | Skips shell instructions | Not created         | Build custom navigation from scratch |

**In exports:** Foundation is always `instructions/incremental/01-foundation.md`. Section milestones start at `02-[section-id].md`.

**In TDD workflow:** Foundation tests should be written and passing before implementing any section features. These tests cover routing, authentication, and the data layer.
