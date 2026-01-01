<!-- v1.0.0 -->

# Design Screen

You are helping the user create a screen design for a section of their product. The screen design will be a props-based React component that can be exported and integrated into any React codebase.

---

## Documentation Structure

This command is split into modular phase files for maintainability:

| Phase                              | Steps | Contents                                            |
| ---------------------------------- | ----- | --------------------------------------------------- |
| `design-screen/phase-1-setup.md`   | 0-2   | Context validation, prerequisites, design direction |
| `design-screen/phase-2-analyze.md` | 3-5   | Requirements analysis, scope, design guidance       |
| `design-screen/phase-3-create.md`  | 6-11  | Component creation, preview wrappers, completion    |

---

## Step Index

| Step | Purpose                                | Phase |
| ---- | -------------------------------------- | ----- |
| 0    | Validate Product Context               | 1     |
| 1    | Check Prerequisites                    | 1     |
| 2    | Design System, Shell, Design Direction | 1     |
| 3    | Analyze Requirements                   | 2     |
| 4    | Clarify Screen Design Scope            | 2     |
| 5    | Apply Frontend Design Guidance         | 2     |
| 6    | Create Props-Based Component           | 3     |
| 7    | Create Sub-Components (If Needed)      | 3     |
| 8    | Create Secondary Views (If Needed)     | 3     |
| 9    | Create Preview Wrapper                 | 3     |
| 10   | Create Component Index                 | 3     |
| 11   | Confirm and Next Steps                 | 3     |

---

## Workflow Overview

### Phase 1: Setup & Validation (Steps 0-2)

**Read:** `design-screen/phase-1-setup.md`

- Validate product context (≥50% completeness)
- Multi-view workflow context (preamble)
- Check prerequisites (skill file, UI components, section files)
- Identify target section
- Check for design tokens, shell, design direction
- Parse design direction settings

### Phase 2: Analysis & Scope (Steps 3-5)

**Read:** `design-screen/phase-2-analyze.md`

- Analyze requirements (spec.md, data.json, types.ts)
- Extract views, layout patterns, view relationships
- Clarify screen design scope
- Check for existing views
- Offer to create related views together
- Apply frontend design guidance

### Phase 3: Component Creation (Steps 6-11)

**Read:** `design-screen/phase-3-create.md`

- Create props-based component
- Create sub-components if needed
- Create secondary view components (if relationships exist)
- Create preview wrapper (simple or wired)
- Create component index
- Confirm and provide next steps
- Recovery patterns for troubleshooting

---

## Quick Reference

### Files Generated

| File                                            | Location                        | Purpose                          |
| ----------------------------------------------- | ------------------------------- | -------------------------------- |
| `[ViewName].tsx`                                | `src/sections/[id]/components/` | Exportable props-based component |
| `[SubComponent].tsx`                            | `src/sections/[id]/components/` | Reusable sub-components          |
| `index.ts`                                      | `src/sections/[id]/components/` | Component exports                |
| `[ViewName]View.tsx` or `[ViewName]Preview.tsx` | `src/sections/[id]/`            | Preview wrapper (Design OS only) |

### Prerequisites

| Prerequisite          | Required | Notes                                       |
| --------------------- | -------- | ------------------------------------------- |
| `product-context.md`  | Yes      | Must be ≥50% complete                       |
| `spec.md`             | Yes      | Section specification from `/shape-section` |
| `data.json`           | Yes      | Sample data from `/sample-data`             |
| `types.ts`            | Yes      | TypeScript interfaces from `/sample-data`   |
| Design tokens         | No       | Defaults to stone/lime if missing           |
| Shell                 | No       | Screen renders standalone if missing        |
| `design-direction.md` | No       | Uses fallback design principles if missing  |
| `SKILL.md`            | No       | Uses fallback guidance if missing           |

### Multi-View Workflow

For sections with multiple views:

1. Run `/design-screen` once for each view
2. Start with the primary view (usually list/dashboard)
3. Create secondary views (drawers, modals) in subsequent runs
4. View Relationships wire them together automatically

### Key Principles

- **Props-based components** — Never import data.json in exportable components
- **Preview wrappers only** — data.json imports allowed only in preview files
- **Mobile-first responsive** — Single-column mobile, enhanced for desktop
- **Design direction priority** — design-direction.md > SKILL.md > fallback

---

## See Also

- `agents/section-system.md` → View Relationships, Enhanced Fallback Design Guidance, Skill File Validation Pattern
- `agents/shell-system.md` → Shell Relationships
- `agents/design-system.md` → Design Requirements, Content Container Standard, Design Token Shade Guide
- `/shape-section` → Section specification with views
- `/sample-data` → Sample data and types generation
- `/screenshot-design` → Capture screenshots after design
- `/export-product` → Export components to product-plan
