---
name: dos-design-warn-font-scaling
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: "text-\\[\\d+px\\]"
---

## Purpose

Warns about arbitrary font sizes that bypass the type scale.

## Example

```tsx
<h1 className="text-[47px]">Title</h1>
```

## Resolution

Use Tailwind's type scale:

```tsx
<h1 className="text-4xl">Title</h1>
```
