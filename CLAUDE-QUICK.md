# Design OS - Quick Reference

> **Light version** (~10 KB vs 110 KB full). For complete documentation, see `agents.md`.

---

## What is Design OS?

A **product planning and design tool** that helps define product vision, structure data models, design UI screens, and prepare export packages for implementation.

**Key distinction:** Design OS is a planning tool, NOT the final product codebase.

---

## Quick Start Commands

| Phase   | Command              | Purpose                                 |
| ------- | -------------------- | --------------------------------------- |
| **0**   | `/product-interview` | Gather product context (REQUIRED first) |
| **0.5** | `/audit-context`     | Validate context quality                |
| **1**   | `/product-vision`    | Define product overview                 |
| **2**   | `/product-roadmap`   | Break into sections                     |
| **3**   | `/data-model`        | Define entities                         |
| **4**   | `/design-tokens`     | Choose colors & fonts                   |
| **5**   | `/design-shell`      | Design navigation shell                 |
| **6a**  | `/shape-section`     | Define section spec                     |
| **6b**  | `/sample-data`       | Create sample data                      |
| **6c**  | `/design-screen`     | Create screen designs                   |
| **6d**  | `/screenshot-design` | Capture screenshots                     |
| **7**   | `/export-product`    | Generate export package                 |

---

## File Structure (Essential)

```
product/                    # Product definition (portable)
├── product-context.md      # From /product-interview
├── product-overview.md     # From /product-vision
├── product-roadmap.md      # From /product-roadmap
├── data-model/             # From /data-model
├── design-system/          # From /design-tokens
├── shell/                  # From /design-shell
└── sections/[id]/          # From /shape-section, /sample-data
    ├── spec.md
    ├── data.json
    └── types.ts

src/
├── shell/components/       # Shell components from /design-shell
└── sections/[id]/          # Screen designs from /design-screen
    ├── components/
    └── [ViewName].tsx

product-plan/               # Export package from /export-product
```

---

## Key Rules

1. **Language:** All generated files MUST be in English
2. **Tailwind v4:** No `tailwind.config.js` (uses CSS-based config)
3. **Props-based:** Components receive data via props, never import data.json directly
4. **Responsive:** Use Tailwind prefixes (`sm:`, `md:`, `lg:`)
5. **Dark mode:** Use `dark:` variants for all colors
6. **Import alias:** Use `@/` for imports from `src/`

---

## Command Prerequisites (Quick Reference)

| Command                                            | Required Files               |
| -------------------------------------------------- | ---------------------------- |
| All commands except `/product-interview`           | `product/product-context.md` |
| `/product-roadmap`                                 | + `product-overview.md`      |
| `/shape-section`, `/sample-data`, `/design-screen` | + section `spec.md`          |
| `/design-screen`                                   | + `data.json`, `types.ts`    |

---

## Default Design System

When tokens not defined:

- **Neutral:** Stone palette
- **Accent:** Lime
- **Typography:** DM Sans (heading/body), IBM Plex Mono (code)

---

## For More Details

| Topic                  | See                                                 |
| ---------------------- | --------------------------------------------------- |
| Complete workflow      | `agents.md` → "Getting Started — The Planning Flow" |
| File structure details | `agents.md` → "File Structure"                      |
| Design requirements    | `agents.md` → "Design Requirements"                 |
| Shell relationships    | `agents.md` → "Shell Relationships"                 |
| View relationships     | `agents.md` → "View Relationships"                  |
| Export process         | `agents.md` → "Export & Handoff"                    |
| Skills system          | `agents.md` → "Skills & Design Guidance"            |
| Template system        | `agents.md` → "Template System"                     |

---

## Using This File

To use the light reference instead of full agents.md:

1. Edit `CLAUDE.md`
2. Change `Refer to @agents.md` to `Refer to @CLAUDE-QUICK.md`
3. Full documentation remains available in `agents.md` when needed

**Trade-off:** Saves ~23k tokens per conversation, but may need manual lookup for complex workflows.
