<!-- v1.0.0 -->

# Design Shell

You are helping the user design the application shell — the persistent navigation and layout that wraps all sections. This is a screen design, not implementation code.

---

## Documentation Structure

This command is split into modular phase files for maintainability:

| Phase                               | Steps | Contents                                                    |
| ----------------------------------- | ----- | ----------------------------------------------------------- |
| `design-shell/phase-1-setup.md`     | 0-2   | Product context validation, audit workflow, prerequisites   |
| `design-shell/phase-2-configure.md` | 3-5   | Design details, direction preferences, interactive elements |
| `design-shell/phase-3-create.md`    | 6-10  | Spec creation, components, preview, tokens, completion      |

---

## Step Index

| Step | Purpose                        | Phase |
| ---- | ------------------------------ | ----- |
| 0    | Validate Product Context       | 1     |
| 0.1  | Detect Existing Shell          | 1     |
| 0.5  | Run Audit Checklist            | 1     |
| 0.6  | Display Audit Report           | 1     |
| 0.7  | Post-Audit Actions             | 1     |
| 1    | Check Prerequisites            | 1     |
| 2    | Analyze Product Structure      | 1     |
| 3    | Gather Design Details          | 2     |
| 3.5  | Design Direction Preferences   | 2     |
| 3.6  | Shell Interactive Elements     | 2     |
| 4    | Present Shell Specification    | 2     |
| 5    | Apply Design Guidance          | 2     |
| 6    | Create the Shell Specification | 3     |
| 6.5  | Document Design Direction      | 3     |
| 6.6  | Define Shell Relationships     | 3     |
| 6.7  | Create Shell Sample Data       | 3     |
| 6.8  | Create Shell Types             | 3     |
| 7    | Create Shell Components        | 3     |
| 7.5  | Validate Section Availability  | 3     |
| 8    | Create Wired Shell Preview     | 3     |
| 8.0  | Validate Shell Data            | 3     |
| 8.0b | Validate Field-to-Component    | 3     |
| 8.1  | Parse Shell Relationships      | 3     |
| 8.2  | Generate ShellPreview          | 3     |
| 9    | Apply Design Tokens            | 3     |
| 9.5  | Inject Anti-Flicker Script     | 3     |
| 10   | Confirm Completion             | 3     |

---

## Workflow Overview

### Phase 1: Setup & Validation (Steps 0-2)

**Read:** `design-shell/phase-1-setup.md`

- Validate product context (mandatory)
- Detect existing shell and choose mode (audit/enhance/rebuild)
- Run comprehensive audit checklist if shell exists
- Check prerequisites (product overview, roadmap, skill file)
- Analyze product structure and recommend layout pattern

### Phase 2: Design Configuration (Steps 3-5)

**Read:** `design-shell/phase-2-configure.md`

- Gather design details (user menu, mobile behavior, nav items)
- Design direction preferences (aesthetic tone, animation, density, responsive priority)
- Shell interactive elements (notifications, search, help, settings, profile)
- Present shell specification for approval
- Apply design guidance from skill file or fallback

### Phase 3: Create Shell (Steps 6-10)

**Read:** `design-shell/phase-3-create.md`

- Create shell specification file
- Document design direction
- Define shell relationships
- Create sample data and types
- Create primary components (AppShell, MainNav, UserMenu)
- Create secondary components based on selections
- Create wired ShellPreview
- Apply design tokens
- Inject anti-flicker script (if theme toggle selected)
- Confirm completion

---

## Quick Reference

### Files Generated

**Specification & Data:**

- `product/shell/spec.md` — Shell specification with relationships
- `product/shell/data.json` — Sample data for shell components
- `product/shell/types.ts` — TypeScript interfaces
- `product/design-system/design-direction.md` — Design direction for consistency

**Primary Components (always created):**

- `src/shell/components/AppShell.tsx` — Main shell wrapper
- `src/shell/components/MainNav.tsx` — Navigation component
- `src/shell/components/UserMenu.tsx` — User menu component
- `src/shell/components/index.ts` — Component exports
- `src/shell/ShellPreview.tsx` — Wired preview wrapper

**Secondary Components (created if selected in Step 3.6):**

- `NotificationsDrawer.tsx` — Bell icon, notifications list
- `SearchModal.tsx` — Command palette (Cmd+K)
- `HelpPanel.tsx` — Help topics drawer
- `SettingsModal.tsx` — Settings form
- `ProfileModal.tsx` — Profile editor
- `FeedbackModal.tsx` — Feedback form
- `MobileMenuDrawer.tsx` — Mobile navigation

### Prerequisites

| Prerequisite                  | Required | Notes                             |
| ----------------------------- | -------- | --------------------------------- |
| `product/product-context.md`  | Yes      | ≥50% completeness                 |
| `product/product-overview.md` | Yes      | Product name and description      |
| `product/product-roadmap.md`  | Yes      | Sections for navigation           |
| Design tokens                 | No       | Uses defaults if missing          |
| `SKILL.md`                    | No       | Uses fallback guidance if missing |
| UI components (Sheet, Dialog) | No       | Required for secondary components |

### Responsive Strategy

Shell components use **desktop-first** design:

- Full navigation layout is designed first
- Then simplified for mobile (hamburger menu, collapsible sidebar)

See `agents/validation-patterns.md` → "Responsive Strategy Clarification" for details.

### Shell Component Categories

| Category      | Created By                  | Examples                               | Exported? |
| ------------- | --------------------------- | -------------------------------------- | --------- |
| **Primary**   | This command (always)       | AppShell, MainNav, UserMenu            | Yes       |
| **Secondary** | This command (if selected)  | NotificationsDrawer, SearchModal, etc. | Yes       |
| **Utility**   | Pre-existing in boilerplate | SkipLink, ShellErrorBoundary           | No        |

---

## See Also

- `agents/shell-system.md` → Shell Relationships, Shell Props Passthrough, Shell Utility Components
- `agents/shell-system.md` → Detailed shell system documentation
- `agents/validation-patterns.md` → Error handling and recovery patterns
