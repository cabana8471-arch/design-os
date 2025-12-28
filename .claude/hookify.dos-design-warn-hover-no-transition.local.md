---
name: dos-design-warn-hover-no-transition
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/(sections|shell)/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: hover:(bg|text|border|shadow|scale|opacity)-
  - field: new_text
    operator: not_contains
    pattern: transition
---

## WARNING: Hover state without transition

Hover effects should include **smooth transitions** for polished interactions.

### Without Transition (Jarring)

```tsx
<button className="bg-lime-600 hover:bg-lime-700">
  Save {/* Instant color change - feels broken */}
</button>
```

### With Transition (Smooth)

```tsx
<button className="bg-lime-600 hover:bg-lime-700 transition-colors duration-200">
  Save {/* Smooth 200ms fade */}
</button>
```

### Transition Classes

| Class                  | What It Animates                |
| ---------------------- | ------------------------------- |
| `transition-colors`    | Background, text, border colors |
| `transition-shadow`    | Box shadow                      |
| `transition-transform` | Scale, rotate, translate        |
| `transition-opacity`   | Opacity                         |
| `transition-all`       | All properties (use sparingly)  |

### Duration Classes

| Class          | Duration | Use Case              |
| -------------- | -------- | --------------------- |
| `duration-150` | 150ms    | Subtle, fast          |
| `duration-200` | 200ms    | Standard hover        |
| `duration-300` | 300ms    | Entry/exit animations |
| `duration-500` | 500ms    | Slow, deliberate      |

### Common Patterns

**Button hover:**

```tsx
className = "bg-lime-600 hover:bg-lime-700 transition-colors duration-200";
```

**Card hover with shadow:**

```tsx
className = "shadow-sm hover:shadow-lg transition-shadow duration-200";
```

**Scale on hover:**

```tsx
className = "hover:scale-105 transition-transform duration-200";
```

**Multiple properties:**

```tsx
className =
  "bg-white hover:bg-stone-50 shadow-sm hover:shadow-md transition-all duration-200";
```

### Animation Style from Design Direction

If `design-direction.md` exists, check the Animation Style setting:

| Style    | Hover Duration             |
| -------- | -------------------------- |
| None     | 0ms (no transition needed) |
| Subtle   | 150ms                      |
| Standard | 200ms                      |
| Rich     | 250ms                      |

### See Also

- `agents.md` > "Motion & Interaction"
- `design-direction.md` > "Animation Style"
