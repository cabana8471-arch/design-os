---
name: dos-code-warn-missing-responsive
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: className="[^"]*\bgrid-cols-[2-9]
  - field: new_text
    operator: not_contains
    pattern: grid-cols-1
---

## WARNING: Grid layout without responsive breakpoints

Multi-column grids should adapt to screen size using Tailwind's responsive prefixes.

### Pattern

Always start with single column (mobile-first) and expand:

```tsx
// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item) => (
    <Card key={item.id} />
  ))}
</div>
```

### Breakpoints

| Prefix | Min Width | Typical Device             |
| ------ | --------- | -------------------------- |
| (none) | 0px       | Mobile                     |
| `sm:`  | 640px     | Large phone / small tablet |
| `md:`  | 768px     | Tablet                     |
| `lg:`  | 1024px    | Laptop                     |
| `xl:`  | 1280px    | Desktop                    |
| `2xl:` | 1536px    | Large desktop              |

### Common Patterns

**2-column layout:**

```tsx
grid grid-cols-1 md:grid-cols-2 gap-4
```

**3-column layout:**

```tsx
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4
```

**4-column layout:**

```tsx
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4
```

**Sidebar + content:**

```tsx
<div className="flex flex-col lg:flex-row">
  <aside className="w-full lg:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

### Why This Matters

- **Mobile users**: Many users browse on phones
- **Accessibility**: Content should be usable on any device
- **Export quality**: Components should work responsively out of the box

### Testing

Test your designs at these widths:

- 375px (iPhone SE)
- 768px (iPad)
- 1024px (laptop)
- 1280px (desktop)

### See Also

- `agents.md` > "Design Requirements"
- `/design-screen` > "Content Container Pattern"
