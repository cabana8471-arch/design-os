---
name: dos-a11y-warn-missing-aria
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/.*\.tsx$
  - field: new_text
    operator: contains
    pattern: "<button"
  - field: new_text
    operator: regex_match
    pattern: "<button[^>]*>\\s*<(svg|img|span)[^>]*>"
  - field: new_text
    operator: not_contains
    pattern: "aria-label"
---

## Purpose

Warns when icon-only buttons lack aria-label.

## Example

```tsx
<button>
  <Icon />
</button>
```

## Resolution

Add accessible label:

```tsx
<button aria-label="Close dialog">
  <Icon />
</button>
```
