---
name: dos-code-block-inline-styles
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/[^/]+/components/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: "style=\\{"
---

## Purpose

Prevents inline style objects in exportable components.

## Example

```tsx
// This will trigger the rule:
<div style={{ margin: '10px' }}>
```

## Resolution

Use Tailwind utility classes:

```tsx
<div className="m-2.5">
```
