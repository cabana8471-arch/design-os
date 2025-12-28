---
name: dos-code-warn-missing-dark-mode
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/(sections|shell)/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: className="[^"]*\b(bg|text|border)-(stone|slate|gray|zinc|neutral|lime|teal|blue|green|red|yellow|orange|purple|pink|indigo|cyan|emerald|amber|rose|fuchsia|violet|sky)-\d+
  - field: new_text
    operator: not_contains
    pattern: dark:
---

## WARNING: Color classes detected without dark: variants

Design OS requires **light & dark mode support** for all screen designs.

### Pattern to Follow

Every color class should have a corresponding `dark:` variant:

```tsx
// Background colors
bg-stone-50 dark:bg-stone-950
bg-white dark:bg-stone-900

// Text colors
text-stone-900 dark:text-stone-100
text-stone-600 dark:text-stone-400

// Border colors
border-stone-200 dark:border-stone-800
```

### Common Pairings

| Light Mode          | Dark Mode                |
| ------------------- | ------------------------ |
| `bg-stone-50`       | `dark:bg-stone-950`      |
| `bg-white`          | `dark:bg-stone-900`      |
| `text-stone-900`    | `dark:text-stone-100`    |
| `text-stone-600`    | `dark:text-stone-400`    |
| `border-stone-200`  | `dark:border-stone-800`  |
| `bg-lime-600`       | `dark:bg-lime-500`       |
| `hover:bg-lime-700` | `dark:hover:bg-lime-400` |

### Full Example

```tsx
<div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-4">
  <h2 className="text-stone-900 dark:text-stone-100 font-semibold">Title</h2>
  <p className="text-stone-600 dark:text-stone-400">Description text</p>
  <button className="bg-lime-600 dark:bg-lime-500 hover:bg-lime-700 dark:hover:bg-lime-400 text-white px-4 py-2 rounded-lg">
    Action
  </button>
</div>
```

### Why This Matters

- **User preference**: Many users prefer dark mode
- **Accessibility**: Dark mode reduces eye strain
- **Consistency**: All Design OS sections should support both modes
- **Export quality**: Exported components should work in dark mode out of the box

### See Also

- `agents.md` > "Design Requirements"
- `agents.md` > "Design Token Shade Guide"
