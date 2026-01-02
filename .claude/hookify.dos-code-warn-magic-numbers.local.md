---
name: dos-code-warn-magic-numbers
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: "(width|height|margin|padding):\\s*[0-9]+px"
---

## Purpose

Warns about magic number pixel values in styles.

## Example

```tsx
// This will trigger the rule:
<div style={{ width: '347px' }}>
```

## Resolution

Use Tailwind spacing scale or CSS variables:

```tsx
<div className="w-80"> // 320px
// or define a semantic variable
```
