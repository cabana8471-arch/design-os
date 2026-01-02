---
name: dos-workflow-warn-batch-changes
enabled: true
event: prompt
action: warn
conditions:
  - field: user_prompt
    operator: regex_match
    pattern: "(all|every|each).*(section|component|file).*at once"
---

## Purpose

Warns when attempting to modify multiple sections simultaneously.

## Example

```
update all sections at once
```

## Resolution

Process sections one at a time to ensure quality:

1. Complete one section
2. Verify it works
3. Move to the next
