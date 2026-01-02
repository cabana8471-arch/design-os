---
name: dos-design-warn-color-contrast
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: "text-(\\w+)-[123]00"
---

## Purpose

Warns about light text colors that may have poor contrast.

## Example

```tsx
<p className="text-stone-200">Light text</p>
```

## Resolution

Use darker shades for better contrast:

```tsx
<p className="text-stone-600 dark:text-stone-400">Readable text</p>
```
