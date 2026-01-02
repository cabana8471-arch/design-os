---
name: dos-structure-warn-circular-deps
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/[^/]+/components/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: "from\\s+['\"]\\.\\./"
---

## Purpose

Warns about imports from parent directories that may cause circular dependencies.

## Example

```tsx
import { Something } from "../";
```

## Resolution

Use absolute imports with @/ alias:

```tsx
import { Something } from "@/components/Something";
```

Or restructure to avoid circular dependencies.
