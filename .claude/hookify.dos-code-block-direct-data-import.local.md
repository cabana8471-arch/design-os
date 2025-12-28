---
name: dos-code-block-direct-data-import
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/[^/]+/components/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: import.*from\s+['"].*data\.json['"]
---

## BLOCKED: Direct data import in exportable component

Exportable components must receive data via props, not import directly.

### Wrong

```tsx
// src/sections/invoices/components/InvoiceList.tsx
import data from '@/../product/sections/invoices/data.json'

export function InvoiceList() {
  return <div>{data.invoices.map(...)}</div>
}
```

### Correct

```tsx
// src/sections/invoices/components/InvoiceList.tsx
import type { InvoiceListProps } from '@/../product/sections/invoices/types'

export function InvoiceList({ invoices, onView }: InvoiceListProps) {
  return <div>{invoices.map(...)}</div>
}
```

### Why This Matters

- **Portability**: Components with direct imports can't be exported to other codebases
- **Testing**: Props-based components are easier to test with mock data
- **Flexibility**: The same component can display different data

### Where to Import Data

Only **preview wrappers** (in section root, not `components/`) should import data.json:

```tsx
// src/sections/invoices/InvoiceListPreview.tsx (PREVIEW WRAPPER)
import data from "@/../product/sections/invoices/data.json";
import { InvoiceList } from "./components/InvoiceList";

export default function InvoiceListPreview() {
  return (
    <InvoiceList invoices={data.invoices} onView={(id) => console.log(id)} />
  );
}
```

### See Also

- `agents.md` > "Components vs. Preview Wrappers"
- `/design-screen` command documentation
