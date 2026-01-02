---
name: dos-code-block-missing-dark-mode
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/(sections|shell)/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: "bg-(white|black|\\w+-50|\\w+-100)"
  - field: new_text
    operator: not_contains
    pattern: "dark:"
---

## Purpose

Blocks light mode background colors without corresponding dark mode variants.

## Example

```tsx
// This will trigger the rule:
<div className="bg-stone-50">
```

## Resolution

Add dark mode variant:

```tsx
<div className="bg-stone-50 dark:bg-stone-950">
```
