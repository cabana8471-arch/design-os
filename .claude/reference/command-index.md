# Design OS Commands Index

Quick reference for all Design OS commands with their purpose and outputs.

---

## Planning Commands

### `/product-interview` (v1.3.5)

**Purpose:** Gather comprehensive product context through structured interview.
**Output:** `product/product-context.md`
**Modes:** `--minimal`, `--stage=X`, `--audit`, `--skip-validation`
**Required by:** All subsequent commands

### `/audit-context` (v1.1.6)

**Purpose:** Analyze product-context.md for issues before implementation.
**Output:** `product/audit-report.md`
**Prereqs:** `product-context.md`

### `/product-vision` (v1.0.0)

**Purpose:** Define product overview, problems solved, key features.
**Output:** `product/product-overview.md`
**Prereqs:** `product-context.md` (≥50%)

### `/product-roadmap` (v1.0.0)

**Purpose:** Break product into 3-5 development sections.
**Output:** `product/product-roadmap.md`
**Prereqs:** `product-context.md`, `product-overview.md`

---

## Data & Design System Commands

### `/data-model` (v1.0.0)

**Purpose:** Define core entities and relationships.
**Output:** `product/data-model/data-model.md`
**Prereqs:** `product-context.md`, `product-overview.md`, `product-roadmap.md`

### `/design-tokens` (v1.0.0)

**Purpose:** Choose color palette and typography.
**Output:** `product/design-system/colors.json`, `typography.json`
**Prereqs:** `product-context.md`, `product-overview.md`

---

## Shell & Section Commands

### `/design-shell` (v1.0.0)

**Purpose:** Design application shell (navigation, layout).
**Output:**

- `product/shell/spec.md`, `data.json`, `types.ts`
- `product/design-system/design-direction.md`
- `src/shell/components/` (AppShell, MainNav, UserMenu, + selected secondary components)
  **Prereqs:** `product-context.md`, `product-overview.md`, `product-roadmap.md`
  **Steps:** 23 (includes 7-step audit checklist)

### `/shape-section` (v1.0.0)

**Purpose:** Define section specification.
**Output:** `product/sections/[section-id]/spec.md`
**Prereqs:** `product-context.md`, `product-overview.md`, `product-roadmap.md`

### `/sample-data` (v1.0.0)

**Purpose:** Create sample data and TypeScript types.
**Output:** `product/sections/[section-id]/data.json`, `types.ts`
**Prereqs:** `product-context.md`, section `spec.md`

### `/design-screen` (v1.0.0)

**Purpose:** Create React screen design components.
**Output:** `src/sections/[section-id]/components/`, `[ViewName].tsx`
**Prereqs:** `product-context.md`, section `spec.md`, `data.json`, `types.ts`
**Uses:** SKILL.md for design quality (optional)

### `/screenshot-design` (v1.0.0)

**Purpose:** Capture screenshots of screen designs.
**Output:** `product/sections/[section-id]/*.png`
**Prereqs:** Screen design components must exist

---

## Export Command

### `/export-product` (v1.0.0)

**Purpose:** Generate complete export package for implementation.
**Output:** `product-plan/` directory with:

- `README.md` (quick start)
- `product-overview.md`
- `prompts/` (one-shot-prompt.md, section-prompt.md)
- `instructions/` (one-shot + incremental)
- `design-system/`
- `data-model/`
- `shell/` (if exists)
- `sections/[id]/`
  **Prereqs:** `product-context.md`, `product-overview.md`, at least one section
  **Steps:** 18+ (largest command)

---

## Command Sizes

| Command              | Size   | Complexity  |
| -------------------- | ------ | ----------- |
| `/export-product`    | 122 KB | Very High   |
| `/design-shell`      | 89 KB  | Very High   |
| `/product-interview` | 89 KB  | Very High   |
| `/design-screen`     | 83 KB  | Very High   |
| `/audit-context`     | 56 KB  | High        |
| `/sample-data`       | 47 KB  | High        |
| `/shape-section`     | 41 KB  | Medium-High |
| `/design-tokens`     | 26 KB  | Medium      |
| `/data-model`        | 21 KB  | Medium      |
| `/screenshot-design` | 19 KB  | Low-Medium  |
| `/product-vision`    | 18 KB  | Low-Medium  |
| `/product-roadmap`   | 17 KB  | Low-Medium  |

---

## Recommended Workflow

```
1. /product-interview          ← Start here (REQUIRED)
2. /audit-context              ← Verify quality
3. /product-vision             ← Define overview
4. /product-roadmap            ← Plan sections
5. /data-model                 ← Define entities
6. /design-tokens              ← Choose aesthetics
7. /design-shell               ← Create navigation
8. For each section:
   a. /shape-section
   b. /sample-data
   c. /design-screen
   d. /screenshot-design
9. /export-product             ← Generate handoff
```

---

## Full Command Documentation

Each command is documented in `.claude/commands/design-os/[command].md`.

To read a command's full documentation:

```
cat .claude/commands/design-os/[command].md
```
