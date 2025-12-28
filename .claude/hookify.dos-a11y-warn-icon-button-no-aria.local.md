---
name: dos-a11y-warn-icon-button-no-aria
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: <button[^>]*>\s*<[A-Z][a-zA-Z]+\s+(className|strokeWidth)
  - field: new_text
    operator: not_contains
    pattern: aria-label
---

## WARNING: Icon-only button without aria-label

Buttons containing only icons need **accessible labels** for screen readers.

### Wrong

```tsx
<button onClick={onClose}>
  <X className="w-4 h-4" />
</button>
```

Screen reader announces: "button" (no context!)

### Correct

```tsx
<button onClick={onClose} aria-label="Close dialog">
  <X className="w-4 h-4" />
</button>
```

Screen reader announces: "Close dialog, button"

### Common Icon Buttons

| Icon        | aria-label                               |
| ----------- | ---------------------------------------- |
| X (close)   | `aria-label="Close"` or `"Close dialog"` |
| Menu        | `aria-label="Open menu"`                 |
| Search      | `aria-label="Search"`                    |
| Settings    | `aria-label="Settings"`                  |
| Edit        | `aria-label="Edit"`                      |
| Delete      | `aria-label="Delete"`                    |
| ChevronLeft | `aria-label="Go back"`                   |
| Plus        | `aria-label="Add new"`                   |

### With Context

Make labels specific when possible:

```tsx
// Generic
aria-label="Delete"

// Better - includes context
aria-label="Delete invoice"
aria-label={`Delete ${invoice.name}`}
```

### Alternative: Visually Hidden Text

```tsx
<button onClick={onClose}>
  <X className="w-4 h-4" />
  <span className="sr-only">Close dialog</span>
</button>
```

### When aria-label Isn't Needed

If the button has visible text, no aria-label needed:

```tsx
// Has visible text - OK
<button>
  <Plus className="w-4 h-4 mr-2" />
  Add Invoice
</button>
```

### Why This Matters

- **Screen reader users**: ~8 million in the US alone
- **Keyboard users**: Need to understand button purpose
- **Legal compliance**: WCAG 2.1 requires accessible names

### See Also

- MDN: aria-label
- WCAG 2.1 Success Criterion 4.1.2
