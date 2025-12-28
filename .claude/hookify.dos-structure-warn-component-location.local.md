---
name: dos-structure-warn-component-location
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/[^/]+/[A-Z][^/]*\.tsx$
  - field: file_path
    operator: not_contains
    pattern: /components/
  - field: new_text
    operator: regex_match
    pattern: export (function|const) [A-Z][a-zA-Z]+\s*\(
  - field: new_text
    operator: not_contains
    pattern: export default
---

## WARNING: Possible component in wrong location

This file exports a named component but is **not in the components/ directory** and has **no default export**.

### Design OS File Structure

```
src/sections/[section-id]/
├── components/                  # Exportable components (named exports)
│   ├── InvoiceList.tsx         # export function InvoiceList()
│   ├── InvoiceRow.tsx          # export function InvoiceRow()
│   └── index.ts                # Re-exports all
└── InvoiceListPreview.tsx      # Preview wrapper (default export)
```

### The Rules

| Location             | Export Type    | Purpose                            |
| -------------------- | -------------- | ---------------------------------- |
| `components/*.tsx`   | Named export   | Exportable, props-based components |
| Section root `*.tsx` | Default export | Preview wrappers for Design OS     |

### If This Is an Exportable Component

Move it to the components directory:

```bash
# From
src/sections/invoices/InvoiceRow.tsx

# To
src/sections/invoices/components/InvoiceRow.tsx
```

### If This Is a Preview Wrapper

Add a default export:

```tsx
// Add default export
export default function InvoiceListPreview() {
  return <InvoiceList invoices={data.invoices} />;
}
```

### Why This Matters

- **Export process**: Only files in `components/` are exported
- **Routing**: Preview wrappers need default exports for Design OS
- **Organization**: Clear separation of concerns

### Quick Check

Ask yourself:

1. **Does it import data.json?** → It's a preview wrapper → needs default export
2. **Is it props-based only?** → It's an exportable component → move to components/

### See Also

- `agents.md` > "Components vs. Preview Wrappers"
- `/design-screen` > "Multiple Views File Structure"
