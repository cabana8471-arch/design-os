---
name: dos-design-warn-container-padding
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/[^/]+/components/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: <div className="h-full[^"]*\bp-1\b
---

## WARNING: Non-standard container padding detected

Screen design containers should follow the **Content Container Standard**.

### Standard Pattern

```tsx
<div className="h-full bg-stone-50 dark:bg-stone-950 px-4 py-4 sm:px-6">
  {/* Section content */}
</div>
```

### Padding by Information Density

| Density         | Container Padding   | Background       |
| --------------- | ------------------- | ---------------- |
| **Compact**     | `px-3 py-3 sm:px-4` | `bg-stone-50/50` |
| **Comfortable** | `px-4 py-4 sm:px-6` | `bg-stone-50`    |
| **Spacious**    | `px-6 py-6 sm:px-8` | `bg-stone-50`    |

### Where Density Comes From

1. **design-direction.md** — If exists, check Information Density value
2. **Existing sections** — Match existing section patterns
3. **Default** — Use "Comfortable" (`px-4 py-4 sm:px-6`)

### Why Consistent Padding Matters

- **Visual harmony**: All sections look like part of the same app
- **User experience**: Predictable spacing reduces cognitive load
- **Export quality**: Consistent components in the export package

### Responsive Pattern

Always include responsive padding:

```tsx
// Mobile: px-4
// Tablet+: sm:px-6
<div className="px-4 sm:px-6">
```

### Edge-to-Edge Exception

For dashboards or visualizations that need full width:

```tsx
<div className="h-full bg-stone-50 dark:bg-stone-950">
  {/* Header with standard padding */}
  <div className="px-4 sm:px-6 py-4 border-b">
    <h1>Dashboard</h1>
  </div>

  {/* Full-width chart area */}
  <div className="flex-1">{/* Charts, maps, etc. */}</div>
</div>
```

### See Also

- `agents.md` > "Content Container Standard"
- `/design-screen` > "Content Container Pattern (MANDATORY)"
