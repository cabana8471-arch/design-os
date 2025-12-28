---
name: dos-code-warn-relative-imports
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/.*\.tsx?$
  - field: new_text
    operator: regex_match
    pattern: from\s+['"]\.\./\.\./\.\./
---

## WARNING: Deep relative imports detected

Design OS uses the `@/` path alias for cleaner imports.

### Instead of

```tsx
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import type { Invoice } from "../../../types/section";
```

### Use

```tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/../product/sections/invoices/types";
```

### Path Alias Reference

| Pattern          | Resolves To        | Use Case                   |
| ---------------- | ------------------ | -------------------------- |
| `@/components/*` | `src/components/*` | UI components              |
| `@/lib/*`        | `src/lib/*`        | Utilities                  |
| `@/hooks/*`      | `src/hooks/*`      | Custom hooks               |
| `@/../product/*` | `product/*`        | Product specs, types, data |

### Configuration

The `@/` alias is configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Why This Matters

- **Readability**: `@/components/ui/button` is clearer than `../../../components/ui/button`
- **Refactoring**: Moving files doesn't break imports
- **Consistency**: All team members use the same import style
- **IDE support**: Better autocomplete and navigation

### When Relative Imports Are OK

Use relative imports only within the same directory:

```tsx
// src/sections/invoices/components/InvoiceList.tsx
import { InvoiceRow } from "./InvoiceRow"; // ✓ Same directory
```

### See Also

- `agents.md` > "Import Path Aliases"
- `tsconfig.json` > "paths" configuration
