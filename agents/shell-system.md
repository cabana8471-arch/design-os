# Shell System

This document covers shell relationships, shell props passthrough, and shell utility components.

---

## Shell Relationships

Similar to View Relationships for sections, Shell Relationships wire interactive shell elements (header actions, user menu items) to their corresponding secondary components (drawers, modals).

### Defining Relationships in shell spec.md

The `/design-shell` command (Step 3.6) asks about interactive elements and stores relationships in the spec.

> **Note on step references:** Step numbers use decimal notation (e.g., "Step 3.6", "Step 6.5") to indicate sub-steps or refinements within major workflow phases. The integer part indicates the major step, and the decimal indicates a sub-step within that phase. These refer to steps within the command file itself (e.g., `.claude/commands/design-os/design-shell.md`). Check the command file for the complete step breakdown.

```markdown
## Shell Relationships

- HeaderAction.notifications -> NotificationsDrawer (drawer, notifications)
- HeaderAction.search -> SearchModal (modal, none)
- HeaderAction.help -> HelpPanel (drawer, helpTopics)
- HeaderAction.theme -> ThemeToggle (inline, none)
- UserMenu.profile -> ProfileModal (modal, user)
- UserMenu.settings -> SettingsModal (modal, settings)
- UserMenu.feedback -> FeedbackModal (modal, none)
- MobileNav.toggle -> MobileMenuDrawer (drawer, none)
```

**Format:** `- [Trigger].[action] -> [Component] ([type], [dataRef])`

> **Important:** The `- ` prefix (hyphen + space) is REQUIRED for markdown list parsing. Lines without this prefix will be ignored by the relationship parser.

### Trigger Types

| Trigger        | Source                   | Example Action                    |
| -------------- | ------------------------ | --------------------------------- |
| `HeaderAction` | Header toolbar buttons   | `notifications`, `search`, `help` |
| `UserMenu`     | User dropdown menu items | `profile`, `settings`, `feedback` |
| `MobileNav`    | Mobile navigation        | `toggle`                          |

### Relationship Types

| Type     | UI Component  | Use Case                                        |
| -------- | ------------- | ----------------------------------------------- |
| `drawer` | `<Sheet>`     | Side panel for notifications, help, mobile menu |
| `modal`  | `<Dialog>`    | Centered overlay for search, settings, profile  |
| `inline` | Direct render | Theme toggle button rendered directly in header |

### Data References

| Ref             | Description                       | Props Interface                   |
| --------------- | --------------------------------- | --------------------------------- |
| `notifications` | Notification list from shell data | `NotificationsDrawerProps`        |
| `user`          | User profile data                 | `ProfileModalProps`               |
| `settings`      | Settings configuration            | `SettingsModalProps`              |
| `helpTopics`    | Help documentation                | `HelpPanelProps`                  |
| `none`          | No data needed (just callbacks)   | Component-specific callbacks only |

**Data Structure Examples (from `product/shell/data.json`):**

```json
{
  "notifications": [
    {
      "id": "n1",
      "title": "New message",
      "read": false,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "user": {
    "id": "u1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "avatar": "/avatars/jane.jpg"
  },
  "settings": {
    "theme": "system",
    "notifications": true,
    "language": "en"
  }
}
```

### How It Works

1. **`/design-shell` Step 3.6** — Asks about interactive elements, records selections
2. **`/design-shell` Step 6.6** — Adds `## Shell Relationships` to spec.md
3. **`/design-shell` Step 6.7-6.8** — Creates `data.json` and `types.ts` for shell
4. **`/design-shell` Step 7** — Creates secondary components based on selections
5. **`/design-shell` Step 8** — Creates wired ShellPreview with state management
6. **Preview** — Click works! Opens drawer/modal with actual data

### Wired Shell Preview Pattern

ShellPreview uses state to wire handlers instead of console.log:

```tsx
// Wired shell preview (Design OS only)
export default function ShellPreview() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // ... state for each secondary component

  return (
    <>
      <AppShell
        onHeaderAction={(actionId) => {
          if (actionId === "notifications") setIsNotificationsOpen(true);
          if (actionId === "search") setIsSearchOpen(true);
        }}
        onProfileClick={() => setIsProfileOpen(true)}
        // ... other wired handlers
      >
        {/* Content */}
      </AppShell>

      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent>
          <NotificationsDrawer
            notifications={data.notifications}
            onClose={() => setIsNotificationsOpen(false)}
            // ... other props
          />
        </SheetContent>
      </Sheet>

      {/* ... other secondary components */}
    </>
  );
}
```

### Shell Data & Types

**`product/shell/data.json`** — Sample data for secondary components:

```json
{
  "_meta": {
    "description": "Sample data for shell interactive components",
    "generatedBy": "/design-shell",
    "models": {
      "notifications": "List of user notifications",
      "user": "Current user profile",
      "settings": "User preferences"
    }
  },
  "notifications": [...],
  "user": {...},
  "settings": {...}
}
```

**`product/shell/types.ts`** — TypeScript interfaces for all shell components.

### Keyboard Shortcuts

When SearchModal is selected, ShellPreview wires keyboard shortcuts:

- **Cmd+K / Ctrl+K** — Opens search modal
- **Escape** — Closes any open modal/drawer

### Export Behavior

Shell relationships are documented but ShellPreview is NOT exported:

- Secondary components are exported to `product-plan/shell/components/`
- Shell README.md documents the relationships
- Wiring implementation depends on target codebase's state management

### Data Flow: Preview vs Export

| Context     | Data Source                        | Wiring                                       |
| ----------- | ---------------------------------- | -------------------------------------------- |
| **Preview** | ScreenDesignPage passes mock data  | `<Component {...shellData.secondaryData} />` |
| **Export**  | Target codebase provides real data | Consumer wires to actual API/state           |

**Preview Time:**

- Shell data parsed from spec.md
- ScreenDesignPage creates mock state
- Secondary components receive props through shell

**Export Time:**

- Components export as standalone
- No shell wrapper needed
- Consumer integrates with their own data layer

### Relationship Format Standard

Both View Relationships (sections) and Shell Relationships use the same format:

```
- [Source].[callback] -> [Target] ([type], [dataRef])
```

| Component | View Relationships                              | Shell Relationships                                    |
| --------- | ----------------------------------------------- | ------------------------------------------------------ |
| Source    | View component name (e.g., `AgentListView`)     | Trigger type (`HeaderAction`, `UserMenu`, `MobileNav`) |
| callback  | Handler name (`onView`, `onCreate`)             | Action name (`notifications`, `search`, `profile`)     |
| Target    | Secondary component (e.g., `AgentDetailDrawer`) | Secondary component (e.g., `NotificationsDrawer`)      |
| type      | `drawer`, `modal`, `inline`                     | `drawer`, `modal`, `inline`                            |
| dataRef   | `entityId`, `entity`, `none`                    | `notifications`, `user`, `settings`, `none`            |

The `- ` prefix is required in spec.md files for markdown list parsing.

---

## Shell Props Passthrough

When viewing screen designs in Design OS, `ScreenDesignPage.tsx` wraps them in AppShell. To ensure ALL shell features appear in preview (breadcrumbs, context selector, header actions, etc.), Design OS uses a **complete passthrough pattern**.

> **Note:** `ScreenDesignPage` uses iframe isolation for CSS encapsulation. The actual shell wrapping occurs in `ScreenDesignFullscreen` (the `/fullscreen` route), which calls `getShellProps()` and passes props to AppShell.

### How It Works

1. **Shell spec defines features** — `product/shell/spec.md` contains sections like `## Context Selector`, `## Breadcrumbs`, `## Header Actions`
2. **`getShellProps()` parses everything** — In `shell-loader.ts`, this function reads the spec and returns all props
3. **ScreenDesignPage spreads props** — `<AppShell {...shellProps}>` passes everything to the shell component
4. **No props left behind** — Whatever you define in the spec appears in preview automatically

### Adding New Shell Features

When you need a new feature in AppShell:

| Step | File              | Action                                         |
| ---- | ----------------- | ---------------------------------------------- |
| 1    | `shell-loader.ts` | Add type to `ShellProps` interface             |
| 2    | `shell-loader.ts` | Add parser function (e.g., `parseMyFeature()`) |
| 3    | `shell-loader.ts` | Include in `getShellProps()` return object     |
| 4    | `design-shell.md` | Document the new spec section format           |

**ScreenDesignPage needs NO changes** — props are passed through automatically.

### ShellProps Interface

The complete `ShellProps` interface (from `src/lib/shell-loader.ts`):

| Property             | Type                             | Source           | Description                             |
| -------------------- | -------------------------------- | ---------------- | --------------------------------------- |
| `categories`         | `NavigationCategory[]`           | ScreenDesignPage | Navigation menu structure               |
| `user`               | `UserConfig`                     | ScreenDesignPage | Current user profile                    |
| `contextSelector`    | `ContextSelectorConfig`          | spec.md          | Organization/client/workspace picker    |
| `breadcrumbs`        | `BreadcrumbItem[]`               | spec.md          | Navigation hierarchy paths              |
| `headerActions`      | `HeaderAction[]`                 | spec.md          | Header action buttons                   |
| `shellRelationships` | `ShellRelationship[]`            | spec.md          | Trigger-to-component mappings           |
| `sidebarCollapsed`   | `boolean`                        | User preference  | Sidebar collapse state                  |
| `layoutVariant`      | `'sidebar'\|'topnav'\|'minimal'` | spec.md          | Shell layout style                      |
| `currentSection`     | `string`                         | ScreenDesignPage | Active section ID                       |
| `currentView`        | `string`                         | ScreenDesignPage | Active view name                        |
| `[key: string]`      | `unknown`                        | spec.md          | Additional custom props (extensibility) |

> **Note:** The interface includes a catchall `[key: string]: unknown` allowing additional props from spec.md to pass through to AppShell. This enables custom shell features without modifying the interface.

### Shell Spec Sections

The following sections in `product/shell/spec.md` are parsed into ShellProps:

| Section                  | Prop                 | Description                                 |
| ------------------------ | -------------------- | ------------------------------------------- |
| `## Context Selector`    | `contextSelector`    | Organization/client/workspace picker        |
| `## Breadcrumbs`         | `breadcrumbs`        | Navigation hierarchy paths                  |
| `## Header Actions`      | `headerActions`      | Header action buttons                       |
| `## Layout Pattern`      | `layoutVariant`      | Shell layout style                          |
| `## Shell Relationships` | `shellRelationships` | Mapping of triggers to secondary components |

> **Note:** Props like `categories`, `user`, `currentSection`, and `currentView` are provided by ScreenDesignPage at runtime and are NOT parsed from spec.md.

### Secondary Component Passthrough

When viewing screen designs, ScreenDesignPage also manages secondary shell components:

1. **Shell relationships parsed** — `getShellProps()` parses `## Shell Relationships` from spec.md
2. **State managed in ScreenDesignPage** — State for each secondary component (isNotificationsOpen, etc.)
3. **Handlers wired** — onHeaderAction, onProfileClick, etc. update state
4. **Secondary components rendered** — Sheet/Dialog wrappers with actual components

> **Note:** These callbacks are NOT part of the base ShellProps interface from `shell-loader.ts`. They are added by ScreenDesignPage when rendering the shell wrapper. See `src/components/ScreenDesignPage.tsx` (ShellComponentProps interface) for the complete callback definitions.

**Key callbacks passed to AppShell:**

| Callback               | Purpose               | Wires To                       |
| ---------------------- | --------------------- | ------------------------------ |
| `onNavigate`           | Navigation link click | Preview console logging        |
| `onLogout`             | User logout action    | Preview console logging        |
| `onContextSelect`      | Context selector      | Preview console logging        |
| `onBreadcrumbClick`    | Breadcrumb navigation | Preview console logging        |
| `onHeaderAction`       | Header button clicks  | Opens drawer/modal by ID       |
| `onNotificationsClick` | Bell icon click       | `setIsNotificationsOpen(true)` |
| `onSearchClick`        | Search icon / Cmd+K   | `setIsSearchOpen(true)`        |
| `onHelpClick`          | Help icon click       | `setIsHelpOpen(true)`          |
| `onProfileClick`       | Profile menu item     | `setIsProfileOpen(true)`       |
| `onSettingsClick`      | Settings menu item    | `setIsSettingsOpen(true)`      |
| `onFeedbackClick`      | Feedback menu item    | `setIsFeedbackOpen(true)`      |
| `onMobileMenuToggle`   | Mobile hamburger menu | `setIsMobileMenuOpen(true)`    |

This ensures secondary shell components work in preview just like section view relationships.

### Example: Context Selector

**In `product/shell/spec.md`:**

```markdown
## Context Selector

type: organization
label: "Select Organization"
position: header-left
items:

- { id: "org-1", name: "Acme Corp", icon: "building" }
- { id: "org-2", name: "Globex Inc", icon: "building" }
```

**Automatically available in AppShell as:**

```typescript
props.contextSelector = {
  type: "organization",
  label: "Select Organization",
  position: "header-left",
  items: [
    { id: "org-1", name: "Acme Corp", icon: "building" },
    { id: "org-2", name: "Globex Inc", icon: "building" },
  ],
};
```

### Why This Pattern?

| Without Passthrough             | With Passthrough           |
| ------------------------------- | -------------------------- |
| Add prop to AppShell            | Add prop to AppShell       |
| Add to ScreenDesignPage         | _(no change needed)_       |
| Risk forgetting props           | Impossible to forget       |
| Maintenance grows with features | Maintenance stays constant |

---

## Shell Utility Components

Utility components and hooks available in `src/shell/` for building shell features. Used by `/design-shell` audit checklist (sections I-L).

> **Note:** These utility components are **pre-existing** in the boilerplate. They are distinct from the **secondary components** (NotificationsDrawer, SearchModal, SettingsModal, ProfileModal, etc.) which are **generated** by `/design-shell` based on user selections. The utility components provide accessibility, error handling, and loading states; the secondary components provide interactive shell features.

**Components (`src/shell/components/`):**

| Component            | Priority | Purpose                                 |
| -------------------- | -------- | --------------------------------------- |
| `SkipLink`           | High     | Skip-to-content accessibility link      |
| `ShellErrorBoundary` | High     | Error boundary for secondary components |
| `LogoArea`           | Medium   | Customizable logo/branding area         |
| `ThemeToggle`        | Medium   | Light/dark/system theme switcher        |
| `ShellSkeleton`      | Medium   | Loading skeleton states                 |
| `ShellFooter`        | Low      | Optional footer with version/links      |

**Hooks (`src/shell/hooks/`):**

| Hook                 | Priority | Purpose                                   |
| -------------------- | -------- | ----------------------------------------- |
| `useFocusManagement` | High     | Focus trap and restoration for modals     |
| `useShellShortcuts`  | Medium   | Global keyboard shortcuts (Cmd+K, etc.)   |
| `useShellState`      | Medium   | Persistent UI state (sidebar, nav groups) |
| `useSessionTimeout`  | Low      | Session inactivity timeout with warning   |

**Usage:**

```tsx
import { SkipLink, ShellErrorBoundary, ThemeToggle } from "@/shell/components";

import {
  useFocusManagement,
  useShellShortcuts,
  useShellState,
} from "@/shell/hooks";
```

### Shell Hooks Usage Examples

**useFocusManagement:**

```tsx
const { focusRef, handleFocus } = useFocusManagement();
// Use for modal focus trapping
<Dialog ref={focusRef} onFocus={handleFocus}>
```

**useShellShortcuts:**

```tsx
useShellShortcuts({
  "cmd+k": () => setSearchOpen(true),
  escape: () => setSearchOpen(false),
});
```

**useShellState:**

```tsx
const { sidebarCollapsed, setSidebarCollapsed } = useShellState();
// Persists sidebar state across navigation
```

**useSessionTimeout:**

```tsx
useSessionTimeout({
  timeout: 30 * 60 * 1000, // 30 minutes
  onTimeout: () => logout(),
});
```

### Testing Shell Components

**Testing Callbacks:**

```tsx
it("calls onSelect when item clicked", () => {
  const onSelect = vi.fn();
  render(<NavigationItem onSelect={onSelect} />);
  fireEvent.click(screen.getByRole("button"));
  expect(onSelect).toHaveBeenCalledWith(expectedId);
});
```

**Testing Props Passthrough:**

```tsx
it("passes shell props to secondary components", () => {
  const shellProps = { user: mockUser, notifications: mockNotifications };
  render(<ShellPreview {...shellProps} />);
  expect(screen.getByText(mockUser.name)).toBeInTheDocument();
});
```

### Mobile Navigation (MobileMenuDrawer)

**Trigger:** Hamburger icon in mobile header
**Behavior:**

- Opens as full-height drawer from left
- Contains all nav items from sidebar
- Closes on: item select, outside click, swipe left

```tsx
<MobileMenuDrawer
  open={menuOpen}
  onClose={() => setMenuOpen(false)}
  items={navigationItems}
  onSelect={(id) => {
    navigate(id);
    setMenuOpen(false);
  }}
/>
```

> **Note:** `/design-shell` creates `product/design-system/design-direction.md` which defines the visual language for all screen designs. See `design-system.md` for the schema.
