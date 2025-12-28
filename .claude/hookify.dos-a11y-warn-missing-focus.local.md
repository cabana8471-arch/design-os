---
name: dos-a11y-warn-missing-focus
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/(sections|shell)/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: <button[^>]*className="[^"]*"
  - field: new_text
    operator: not_contains
    pattern: focus:
---

## WARNING: Button without focus styles

Interactive elements need **visible focus indicators** for keyboard users.

### Without Focus Styles

```tsx
<button className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg">
  Save
</button>
```

Keyboard users can't see which button is focused!

### With Focus Styles

```tsx
<button className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2">
  Save
</button>
```

### Focus Ring Pattern

```tsx
focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2
```

| Class                 | Purpose                         |
| --------------------- | ------------------------------- |
| `focus:outline-none`  | Remove default browser outline  |
| `focus:ring-2`        | Add 2px ring                    |
| `focus:ring-lime-500` | Ring color (match your primary) |
| `focus:ring-offset-2` | Space between element and ring  |

### Focus Styles by Element

**Primary buttons:**

```tsx
focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2
```

**Secondary/ghost buttons:**

```tsx
focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2
```

**Links:**

```tsx
focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 rounded
```

**Input fields:**

```tsx
focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500
```

### Dark Mode

Include dark mode variants:

```tsx
focus:ring-offset-2 dark:focus:ring-offset-stone-900
```

### shadcn/ui Components

If using shadcn/ui `<Button>`, focus styles are included:

```tsx
import { Button } from "@/components/ui/button";

// Focus styles included automatically
<Button>Save</Button>;
```

### Why Focus Styles Matter

- **Keyboard navigation**: Tab key users need visual feedback
- **Motor impairments**: Some users can't use a mouse
- **Power users**: Many developers navigate by keyboard
- **WCAG compliance**: Required for accessibility

### See Also

- WCAG 2.1 Success Criterion 2.4.7 (Focus Visible)
- Tailwind CSS Ring documentation
