---
name: dos-structure-warn-shell-location
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/(?!shell/).*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: (AppShell|MainNav|UserMenu|NotificationsDrawer|SearchModal|ThemeToggle|SettingsModal|ProfileModal|HelpPanel|FeedbackModal|MobileMenuDrawer)
---

## WARNING: Shell component referenced outside src/shell/

Shell components should only be **defined in** and **used from** `src/shell/`.

### Shell Component Locations

```
src/shell/
├── components/
│   ├── AppShell.tsx              # Main shell wrapper
│   ├── MainNav.tsx               # Navigation component
│   ├── UserMenu.tsx              # User dropdown menu
│   ├── NotificationsDrawer.tsx   # (optional)
│   ├── SearchModal.tsx           # (optional)
│   ├── ThemeToggle.tsx           # (optional)
│   ├── SettingsModal.tsx         # (optional)
│   ├── ProfileModal.tsx          # (optional)
│   ├── HelpPanel.tsx             # (optional)
│   ├── FeedbackModal.tsx         # (optional)
│   ├── MobileMenuDrawer.tsx      # (optional)
│   └── index.ts
├── hooks/
│   └── index.ts
└── index.ts
```

### Where Shell Components Are Used

| Location                              | Can Use Shell Components?                        |
| ------------------------------------- | ------------------------------------------------ |
| `src/shell/`                          | Yes - definition and composition                 |
| `src/components/ScreenDesignPage.tsx` | Yes - wraps screen designs                       |
| `src/sections/*/`                     | No - section components should be shell-agnostic |

### If Creating a New Shell Component

Put it in `src/shell/components/`:

```tsx
// src/shell/components/NewShellComponent.tsx
export function NewShellComponent() {
  // ...
}
```

Update the index:

```tsx
// src/shell/components/index.ts
export { NewShellComponent } from "./NewShellComponent";
```

### If Referencing in Section Code

Section screen designs should **not** reference shell components directly:

```tsx
// WRONG - section component importing shell
import { MainNav } from "@/shell/components";

export function InvoiceList() {
  return (
    <div>
      <MainNav /> {/* Shell handles nav, not sections! */}
      <InvoiceTable />
    </div>
  );
}
```

```tsx
// CORRECT - section component is shell-agnostic
export function InvoiceList({ invoices, onView }: InvoiceListProps) {
  return (
    <div>
      <InvoiceTable invoices={invoices} onView={onView} />
    </div>
  );
}
```

### Why This Matters

- **Separation of concerns**: Sections shouldn't know about shell
- **Export portability**: Section components work in any shell
- **Maintainability**: Shell changes don't affect sections

### See Also

- `agents.md` > "File Structure"
- `/design-shell` command documentation
