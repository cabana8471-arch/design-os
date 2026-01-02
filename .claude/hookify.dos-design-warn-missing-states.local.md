---
name: dos-design-warn-missing-states
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/[^/]+/components/.*\.tsx$
  - field: new_text
    operator: contains
    pattern: "onClick"
  - field: new_text
    operator: not_contains
    pattern: "hover:"
---

## Purpose

Warns when interactive elements lack hover states.

## Example

```tsx
<button onClick={handleClick}>Click me</button>
```

## Resolution

Add hover state styling:

```tsx
<button onClick={handleClick} className="hover:bg-stone-100">
  Click me
</button>
```
