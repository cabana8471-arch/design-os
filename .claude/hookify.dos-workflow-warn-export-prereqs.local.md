---
name: dos-workflow-warn-export-prereqs
enabled: true
event: prompt
action: warn
conditions:
  - field: user_prompt
    operator: regex_match
    pattern: ^/?export-product
---

## WORKFLOW CHECK: /export-product prerequisites

Before exporting, verify your product is complete:

### Required

| Requirement                   | Location                      | Created By        |
| ----------------------------- | ----------------------------- | ----------------- |
| Product overview              | `product/product-overview.md` | `/product-vision` |
| At least one complete section | See below                     | Multiple commands |

### Complete Section Checklist

For each section, verify these files exist:

```
product/sections/[section-id]/
├── spec.md          # /shape-section
├── data.json        # /sample-data
└── types.ts         # /sample-data

src/sections/[section-id]/
├── components/      # /design-screen
│   ├── [View].tsx
│   └── index.ts
└── [View]Preview.tsx # /design-screen
```

### Recommended (for quality export)

| Component        | Location                                    | Created By           |
| ---------------- | ------------------------------------------- | -------------------- |
| Shell components | `src/shell/components/`                     | `/design-shell`      |
| Design tokens    | `product/design-system/`                    | `/design-tokens`     |
| Screenshots      | `product/sections/[id]/*.png`               | `/screenshot-design` |
| Design direction | `product/design-system/design-direction.md` | `/design-shell`      |

### Quick Verification

```bash
# Check product overview
ls product/product-overview.md

# List all sections
ls product/sections/

# For each section, check completeness
ls product/sections/*/spec.md
ls product/sections/*/data.json
ls product/sections/*/types.ts
ls src/sections/*/components/*.tsx

# Check shell (recommended)
ls src/shell/components/AppShell.tsx
```

### What Gets Exported

The `/export-product` command creates:

```
product-plan/
├── README.md                    # Quick start guide
├── product-overview.md          # Product summary
├── design-guidance/             # Design principles
├── prompts/                     # Ready-to-use prompts
├── instructions/                # Implementation guides
├── design-system/               # Tokens, colors, fonts
├── data-model/                  # Types and sample data
├── shell/                       # Shell components
└── sections/[id]/               # Section components
    ├── components/
    ├── sample-data.json
    ├── types.ts
    └── README.md
```

### If Components Are Missing

| Missing            | Run This Command     |
| ------------------ | -------------------- |
| Section spec       | `/shape-section`     |
| Section data/types | `/sample-data`       |
| Screen components  | `/design-screen`     |
| Shell              | `/design-shell`      |
| Screenshots        | `/screenshot-design` |

### See Also

- `agents.md` > "Export & Handoff"
- `/export-product` command documentation
