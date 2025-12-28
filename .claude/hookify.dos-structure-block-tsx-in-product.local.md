---
name: dos-structure-block-tsx-in-product
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: ^product/.*\.tsx$
---

## BLOCKED: React components don't belong in product/

The `product/` directory is for **specifications and data only** — files that are portable and don't contain React code.

### Directory Structure

```
product/                          # Portable specs & data
├── product-overview.md           # .md
├── product-roadmap.md            # .md
├── design-system/
│   ├── colors.json               # .json
│   └── typography.json           # .json
├── data-model/
│   └── data-model.md             # .md
├── shell/
│   ├── spec.md                   # .md
│   ├── data.json                 # .json
│   └── types.ts                  # .ts (types only, no JSX!)
└── sections/[section-id]/
    ├── spec.md                   # .md
    ├── data.json                 # .json
    ├── types.ts                  # .ts (types only, no JSX!)
    └── dashboard.png             # .png (screenshots)

src/                              # React components (Design OS only)
├── shell/components/             # Shell components
│   ├── AppShell.tsx              # .tsx
│   └── MainNav.tsx               # .tsx
└── sections/[section-id]/
    ├── components/               # Exportable components
    │   └── InvoiceList.tsx       # .tsx
    └── InvoiceListPreview.tsx    # .tsx (preview wrapper)
```

### Allowed Files in product/

| Extension | Purpose                       | Example                          |
| --------- | ----------------------------- | -------------------------------- |
| `.md`     | Specifications, documentation | `spec.md`, `product-overview.md` |
| `.json`   | Data, configuration           | `data.json`, `colors.json`       |
| `.ts`     | TypeScript types (NO JSX)     | `types.ts`                       |
| `.png`    | Screenshots                   | `dashboard.png`                  |

### Where to Put React Components

| Component Type   | Correct Location                        |
| ---------------- | --------------------------------------- |
| Screen designs   | `src/sections/[section-id]/components/` |
| Preview wrappers | `src/sections/[section-id]/` (root)     |
| Shell components | `src/shell/components/`                 |
| UI primitives    | `src/components/ui/`                    |

### Why This Matters

- **Portability**: `product/` files are copied to `product-plan/` during export
- **Clean separation**: Specs describe WHAT to build, not HOW
- **No React in export**: Target codebases may use different frameworks

### See Also

- `agents.md` > "File Structure"
- `agents.md` > "Components vs. Preview Wrappers"
