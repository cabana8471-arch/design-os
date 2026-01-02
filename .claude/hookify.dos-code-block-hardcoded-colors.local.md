---
name: dos-code-block-hardcoded-colors
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/[^/]+/components/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: "#[0-9a-fA-F]{3,6}"
---

## Purpose

Prevents hardcoded hex colors in exportable components.

## Example

```tsx
// This will trigger the rule:
<div style={{ color: '#ff0000' }}>
```

## Resolution

Use Tailwind color classes instead:

```tsx
<div className="text-red-500">
```
