# Hookify Rule Categories

Detailed explanations of each rule category and why these rules exist.

> **See also:** `agents.md` → "Hookify Guardrails" section for an overview of how these rules integrate with Design OS.

---

## Category 1: Code Patterns (`dos-code-*`)

**Purpose:** Prevent code that won't work correctly or breaks Design OS conventions.

### Why These Rules Exist

Design OS generates **exportable components** that must be portable to any React codebase. This requires strict separation between:

- **Exportable components** (in `components/`) — Props-based, no direct data imports
- **Preview wrappers** (in section root) — Import data.json, pass to components

If exportable components import data directly, they become tied to Design OS and can't be exported.

### Rules in This Category

| Rule                          | Action | Catches                                                        |
| ----------------------------- | ------ | -------------------------------------------------------------- |
| `block-direct-data-import`    | Block  | `import data from '@/../product/.../data.json'` in components/ |
| `block-tailwind-config`       | Block  | Creating `tailwind.config.js` (Tailwind v4 is CSS-based)       |
| `warn-missing-dark-mode`      | Warn   | Color classes without `dark:` variants                         |
| `warn-relative-imports`       | Warn   | `../../../` instead of `@/` alias                              |
| `warn-missing-responsive`     | Warn   | Grid layouts without breakpoint prefixes                       |
| `warn-missing-default-export` | Warn   | Preview wrappers without `export default`                      |

---

## Category 2: Workflow (`dos-workflow-*`)

**Purpose:** Guide users through the correct command sequence.

### Why These Rules Exist

Design OS commands have dependencies:

> **Note:** This diagram shows the **recommended workflow order**, not strict dependencies. For actual prerequisites per command, see `agents.md` → "Command Prerequisites" table.

```
RECOMMENDED WORKFLOW ORDER
==========================
(Arrows show typical sequence, NOT strict dependencies)

/product-vision .............. [No prerequisites]
    ↓
/product-roadmap ............. [Requires: product-overview.md]
    ↓
/data-model .................. [Requires: product-overview.md, product-roadmap.md]
    ↓
/design-tokens ............... [Requires: product-overview.md only]
    ↓
/design-shell ................ [Requires: product-overview.md, product-roadmap.md]
    ↓
/shape-section ←─┐ ........... [Requires: product-overview.md, product-roadmap.md]
    ↓            │
/sample-data ───→┘ ........... [Requires: section spec.md]
    ↓
/design-screen ............... [Requires: spec.md, data.json, types.ts]
    ↓
/screenshot-design ........... [Requires: screen design components]
    ↓
/export-product .............. [Requires: product-overview.md, at least one section]
```

**Key:** Dotted lines show what each command requires. The vertical arrows are the typical workflow order, but you can run commands whenever their prerequisites are met.

Running commands out of order causes:

- Missing files that later commands expect
- Inconsistent data across sections
- Incomplete exports

### Rules in This Category

| Rule                         | Action | When It Triggers             |
| ---------------------------- | ------ | ---------------------------- |
| `warn-design-screen-prereqs` | Warn   | User types `/design-screen`  |
| `warn-sample-data-prereqs`   | Warn   | User types `/sample-data`    |
| `warn-export-prereqs`        | Warn   | User types `/export-product` |

Each rule displays a **checklist** of prerequisites to verify.

---

## Category 3: Data Integrity (`dos-data-*`)

**Purpose:** Ensure data.json files are correct and consistent.

### Why These Rules Exist

The `/sample-data` command generates `data.json` files with a specific structure:

```json
{
  "_meta": {
    "description": "Sample data for invoices section",
    "generatedBy": "/sample-data",
    "models": {
      "invoices": "Invoice records with client info and line items"
    },
    "relationships": [
      { "from": "Invoice", "to": "LineItem", "type": "hasMany" }
    ]
  },
  "invoices": [...]
}
```

The `_meta` object is required for:

- Documentation of what the data represents
- Validation during export
- Consistency across sections

### Rules in This Category

| Rule                       | Action | Catches                                       |
| -------------------------- | ------ | --------------------------------------------- |
| `warn-missing-meta`        | Warn   | data.json without `_meta` object              |
| `warn-placeholder-content` | Warn   | "Test 1", "Lorem ipsum", "Foo", "Bar"         |
| `warn-trailing-comma`      | Warn   | JSON syntax errors                            |
| `warn-hardcoded-ids`       | Warn   | `id="inv-12345"` instead of `id={invoice.id}` |

---

## Category 4: Design System (`dos-design-*`)

**Purpose:** Enforce design consistency across sections.

### Why These Rules Exist

Design OS emphasizes **distinctive, non-generic design**. The frontend-design skill explicitly warns against:

> "NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial), cliched color schemes, predictable layouts..."

Additionally, Design OS uses:

- **Tailwind's built-in colors** — Not custom hex values
- **Content Container Standard** — Consistent padding across sections
- **Smooth transitions** — All hover states should animate

### Rules in This Category

| Rule                       | Action | Catches                                   |
| -------------------------- | ------ | ----------------------------------------- |
| `warn-generic-fonts`       | Warn   | `font-inter`, `font-roboto`, `font-arial` |
| `warn-custom-colors`       | Warn   | `#ff5733`, `rgb(...)`, `hsl(...)`         |
| `warn-container-padding`   | Warn   | Non-standard container padding (`p-1`)    |
| `warn-hover-no-transition` | Warn   | `hover:bg-*` without `transition` classes |

---

## Category 5: Accessibility (`dos-a11y-*`)

**Purpose:** Catch common accessibility issues.

### Why These Rules Exist

Accessible design is non-negotiable. Common issues include:

- **Icon-only buttons** — Screen readers can't announce purpose
- **Missing focus styles** — Keyboard users can't see focus

### Rules in This Category

| Rule                       | Action | Catches                                          |
| -------------------------- | ------ | ------------------------------------------------ |
| `warn-icon-button-no-aria` | Warn   | `<button><Icon /></button>` without `aria-label` |
| `warn-missing-focus`       | Warn   | Buttons without `focus:` styles                  |

---

## Category 6: File Structure (`dos-structure-*`)

**Purpose:** Ensure correct file organization.

### Why These Rules Exist

Design OS has a specific file structure:

```
product/                    # Specs, data, types (portable)
├── sections/[id]/
│   ├── spec.md            # ✓ Markdown specs
│   ├── data.json          # ✓ Sample data
│   ├── types.ts           # ✓ TypeScript types
│   └── *.tsx              # ✗ NO React components!

src/                        # React components (Design OS only)
├── sections/[id]/
│   ├── components/        # ✓ Exportable components
│   │   └── [Component].tsx
│   └── [ViewName].tsx     # ✓ Preview wrappers
└── shell/
    └── components/        # ✓ Shell components
```

Files in `product/` must be portable. React components belong in `src/`.

### Rules in This Category

| Rule                      | Action | Catches                                    |
| ------------------------- | ------ | ------------------------------------------ |
| `block-tsx-in-product`    | Block  | `.tsx` files in `product/` directory       |
| `warn-component-location` | Warn   | Exportable component outside `components/` |
| `warn-shell-location`     | Warn   | Shell components outside `src/shell/`      |

---

## Priority Levels

| Priority          | Description                        | Action  |
| ----------------- | ---------------------------------- | ------- |
| **P0 (Critical)** | Would break Design OS              | `block` |
| **P1 (High)**     | Common mistake, important to catch | `warn`  |
| **P2 (Medium)**   | Best practice enforcement          | `warn`  |
| **P3 (Low)**      | Polish and refinement              | `warn`  |

---

## Disabling Categories

To disable an entire category, run:

```bash
# Disable all design rules
for f in .claude/hookify.dos-design-*.local.md; do
  sed -i '' 's/enabled: true/enabled: false/' "$f"
done

# Re-enable all design rules
for f in .claude/hookify.dos-design-*.local.md; do
  sed -i '' 's/enabled: false/enabled: true/' "$f"
done
```
