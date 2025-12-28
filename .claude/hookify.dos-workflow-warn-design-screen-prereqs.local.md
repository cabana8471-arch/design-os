---
name: dos-workflow-warn-design-screen-prereqs
enabled: true
event: prompt
action: warn
conditions:
  - field: user_prompt
    operator: regex_match
    pattern: ^/?design-screen
---

## WORKFLOW CHECK: /design-screen prerequisites

Before running `/design-screen`, ensure you have completed these steps:

### Required Files

| File                                      | Created By         | Status          |
| ----------------------------------------- | ------------------ | --------------- |
| `product/product-overview.md`             | `/product-vision`  | Check if exists |
| `product/product-roadmap.md`              | `/product-roadmap` | Check if exists |
| `product/sections/[section-id]/spec.md`   | `/shape-section`   | Check if exists |
| `product/sections/[section-id]/data.json` | `/sample-data`     | Check if exists |
| `product/sections/[section-id]/types.ts`  | `/sample-data`     | Check if exists |

### Optional but Recommended

| File                                        | Created By       | Benefit                  |
| ------------------------------------------- | ---------------- | ------------------------ |
| `product/design-system/colors.json`         | `/design-tokens` | Consistent color palette |
| `product/design-system/typography.json`     | `/design-tokens` | Consistent fonts         |
| `product/shell/spec.md`                     | `/design-shell`  | Preview with shell       |
| `product/design-system/design-direction.md` | `/design-shell`  | Consistent aesthetics    |
| `.claude/skills/frontend-design/SKILL.md`   | Pre-existing     | Distinctive design       |

### Quick Check Commands

```bash
# Check required files
ls product/product-overview.md
ls product/product-roadmap.md
ls product/sections/*/spec.md
ls product/sections/*/data.json
ls product/sections/*/types.ts
```

### Command Sequence

```
1. /product-vision      → product-overview.md
2. /product-roadmap     → product-roadmap.md
3. /data-model          → data-model.md (optional)
4. /design-tokens       → colors.json, typography.json (recommended)
5. /design-shell        → shell spec, components (recommended)
6. /shape-section       → spec.md
7. /sample-data         → data.json, types.ts
8. /design-screen       → YOU ARE HERE
9. /screenshot-design   → screenshots
10. /export-product     → export package
```

### If Files Are Missing

Run the prerequisite command first:

- Missing `spec.md`? Run `/shape-section`
- Missing `data.json` or `types.ts`? Run `/sample-data`
- Missing product overview? Run `/product-vision`

### See Also

- `agents.md` > "Getting Started - The Planning Flow"
- `agents.md` > "Command Prerequisites"
