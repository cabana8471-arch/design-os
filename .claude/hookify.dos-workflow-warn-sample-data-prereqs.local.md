---
name: dos-workflow-warn-sample-data-prereqs
enabled: true
event: prompt
action: warn
conditions:
  - field: user_prompt
    operator: regex_match
    pattern: ^/?sample-data
---

## WORKFLOW CHECK: /sample-data prerequisites

Before running `/sample-data`, ensure you have completed these steps:

### Required File

| File                                    | Created By       | Purpose                                    |
| --------------------------------------- | ---------------- | ------------------------------------------ |
| `product/sections/[section-id]/spec.md` | `/shape-section` | Defines views, data requirements, entities |

### What spec.md Provides

The `/sample-data` command reads `spec.md` to understand:

1. **Views** — What screens need data
2. **Entities** — What data models to create
3. **Relationships** — How entities connect
4. **User flows** — What states/scenarios to cover

Without `spec.md`, the command can't generate accurate data.

### Quick Check

```bash
# List all section specs
ls product/sections/*/spec.md
```

### Optional but Helpful

| File                               | Created By    | Benefit                                 |
| ---------------------------------- | ------------- | --------------------------------------- |
| `product/data-model/data-model.md` | `/data-model` | Consistent entity names across sections |

### Command Sequence

```
1. /product-vision      → product-overview.md
2. /product-roadmap     → product-roadmap.md
3. /data-model          → data-model.md (optional)
4. /shape-section       → spec.md
5. /sample-data         → YOU ARE HERE
6. /design-screen       → screen components
```

### If spec.md Is Missing

Run `/shape-section` first to create the section specification.

The `/shape-section` command will:

- Ask about the section's purpose
- Define the views (list, detail, form, etc.)
- Document user flows
- Identify data requirements

### See Also

- `agents.md` > "Command Prerequisites"
- `/shape-section` command documentation
