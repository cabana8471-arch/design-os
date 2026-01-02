---
name: dos-code-warn-complex-conditionals
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: "\\?.*\\?.*\\?"
---

## Purpose

Warns about deeply nested ternary operators.

## Example

```tsx
// This will trigger the rule:
const value = a ? (b ? c : d) : e ? f : g;
```

## Resolution

Use early returns or switch statements:

```tsx
function getValue() {
  if (a && b) return c;
  if (a) return d;
  if (e) return f;
  return g;
}
```
