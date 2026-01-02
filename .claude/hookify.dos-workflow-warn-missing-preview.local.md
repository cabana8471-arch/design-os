---
name: dos-workflow-warn-missing-preview
enabled: true
event: prompt
action: warn
conditions:
  - field: user_prompt
    operator: regex_match
    pattern: "export.*without.*(preview|test|check)"
---

## Purpose

Warns when attempting to export without previewing.

## Example

```
export without previewing first
```

## Resolution

Always preview designs before export:

1. Run `npm run dev`
2. Check each screen design
3. Verify dark mode and responsive
4. Then run `/export-product`
