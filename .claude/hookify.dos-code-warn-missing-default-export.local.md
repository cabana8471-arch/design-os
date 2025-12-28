---
name: dos-code-warn-missing-default-export
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
    operator: not_contains
    pattern: export default
---

## WARNING: Preview wrapper missing default export

Design OS routing requires preview wrappers to have a **default export**.

### Preview Wrapper Pattern

Preview wrappers must use `export default`:

```tsx
// src/sections/invoices/InvoiceListPreview.tsx

import data from "@/../product/sections/invoices/data.json";
import { InvoiceList } from "./components/InvoiceList";

export default function InvoiceListPreview() {
  return (
    <InvoiceList
      invoices={data.invoices}
      onView={(id) => console.log("View:", id)}
    />
  );
}
```

### Why Default Export?

Design OS dynamically loads preview wrappers using:

```tsx
const module = await import(`../sections/${sectionId}/${viewName}.tsx`);
const Component = module.default; // Requires default export!
```

Without a default export, the component won't render.

### Named vs Default Exports

| File Type            | Export Style     | Example                                        |
| -------------------- | ---------------- | ---------------------------------------------- |
| Preview wrapper      | `export default` | `export default function InvoiceListPreview()` |
| Exportable component | Named export     | `export function InvoiceList()`                |
| Sub-component        | Named export     | `export function InvoiceRow()`                 |

### File Locations

| Location                             | Has Default Export?   |
| ------------------------------------ | --------------------- |
| `src/sections/[id]/[ViewName].tsx`   | Yes (preview wrapper) |
| `src/sections/[id]/components/*.tsx` | No (named exports)    |

### Common Mistake

```tsx
// WRONG - missing default export
export function InvoiceListPreview() {
  return <InvoiceList ... />
}

// CORRECT - has default export
export default function InvoiceListPreview() {
  return <InvoiceList ... />
}

// ALSO CORRECT - separate default export
function InvoiceListPreview() {
  return <InvoiceList ... />
}
export default InvoiceListPreview
```

### See Also

- `agents.md` > "Components vs. Preview Wrappers"
- `/design-screen` > "Step 8: Create the Preview Wrapper"
