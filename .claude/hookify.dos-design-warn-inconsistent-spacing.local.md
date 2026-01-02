---
name: dos-design-warn-inconsistent-spacing
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: "(p-[0-9]+|m-[0-9]+).*\\1"
---

## Purpose

Warns about inconsistent spacing values in the same file.

## Example

```tsx
<div className="p-4">
  <div className="p-3">  // Inconsistent
```

## Resolution

Use consistent spacing scale. Check design-direction.md for guidance.
