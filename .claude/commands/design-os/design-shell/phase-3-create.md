<!-- v1.0.0 -->

# Phase 3: Create Shell

This phase covers Steps 6-10: creating the shell specification, design direction, relationships, sample data, types, components, preview, applying tokens, and confirming completion.

---

## Step 6: Create the Shell Specification

### Create Directory

First, ensure the shell directory exists:

```bash
mkdir -p product/shell
mkdir -p src/shell/components
```

Then validate the directories were created:

```bash
if [ ! -d "product/shell" ]; then
  echo "Error: product/shell/ - Directory creation failed. Check write permissions."
  exit 1
fi
if [ ! -d "src/shell/components" ]; then
  echo "Error: src/shell/components/ - Directory creation failed. Check write permissions."
  exit 1
fi

echo "Directories created successfully"
```

### Create the Specification File

Then create `/product/shell/spec.md`:

```markdown
# [Product Name] Shell Specification

**Note:** Replace `[Product Name]` with the actual product name from `product/product-overview.md` to maintain consistency with other documentation files.

## Overview

[Description of the shell design and its purpose]

## Navigation Structure

- [Nav Item 1] → [Section 1]
- [Nav Item 2] → [Section 2]
- [Nav Item 3] → [Section 3]
- [Any additional nav items]

## User Menu

[Description of user menu location and contents]

## Layout Pattern

[Description of the layout — sidebar, top nav, etc.]

## Responsive Behavior

- **Desktop:** [Behavior]
- **Tablet:** [Behavior]
- **Mobile:** [Behavior]

## Design Notes

[Any additional design decisions or notes]

## Context Selector

_(Optional)_ Define if your app needs an organization/client/workspace picker.
type: organization
label: "Select Organization"
position: header-left
items:

- { id: "org-1", name: "Acme Corp", icon: "building" }
- { id: "org-2", name: "Globex Inc", icon: "building" }

## Breadcrumbs

_(Optional)_ Define breadcrumb paths for navigation hierarchy.
mode: manual
default:

- { label: "Home", href: "/" }
  sections:
  [section-id]: - { label: "Parent", href: "/parent" } - { label: "Section", href: "/sections/[section-id]" }

## Header Actions

_(Optional)_ Define action buttons in the header area.

- { id: "notifications", icon: "bell", badge: true }
- { id: "search", icon: "search" }
- { id: "help", icon: "help-circle", label: "Help" }

## Shell Relationships

_(Generated based on Step 3.6 selections)_

- HeaderAction.notifications -> NotificationsDrawer (drawer, notifications)
- HeaderAction.search -> SearchModal (modal, none)
- HeaderAction.help -> HelpPanel (drawer, helpTopics)
- UserMenu.profile -> ProfileModal (modal, user)
- UserMenu.settings -> SettingsModal (modal, settings)
- MobileNav.toggle -> MobileMenuDrawer (drawer, none)
```

### Extended Shell Sections

The shell spec supports additional sections for enhanced functionality:

| Section                  | Purpose                                             | Required |
| ------------------------ | --------------------------------------------------- | -------- |
| `## Context Selector`    | Organization/client/workspace picker                | No       |
| `## Breadcrumbs`         | Navigation hierarchy paths                          | No       |
| `## Header Actions`      | Header action buttons (notifications, search, help) | No       |
| `## Shell Relationships` | Mapping of triggers to secondary components         | No       |

These sections are parsed by `getShellProps()` in `shell-loader.ts` and passed to AppShell automatically via the complete passthrough pattern.

### Multi-View Navigation Routing

When a section has multiple views (e.g., ListView and DetailView), here's how routing works:

### Default Route Behavior

When navigating to `/sections/[section-id]`:

- The **first view defined in the spec** becomes the default view
- Example: If spec lists "ListView" then "DetailView", ListView loads by default

### View-Specific Routes

For direct navigation to specific views:

- `/sections/[section-id]/screen-designs/[view-name]` — Loads a specific view
- Example: `/sections/invoice-management/screen-designs/invoice-detail`

### Navigation Between Views

Views should NOT include internal routing logic. Instead:

- Use callback props (e.g., `onView`, `onBack`) to signal navigation intent
- The shell or parent application handles actual route changes
- This keeps components portable and testable

**Example navigation pattern:**

```tsx
// In ListView - signal intent to navigate
<button onClick={() => onView?.(item.id)}>View Details</button>

// In DetailView - signal intent to go back
<button onClick={() => onBack?.()}>Back to List</button>
```

The shell receives these callbacks and performs actual navigation (which may vary by framework).

## Step 6.5: Document Design Direction

After creating the shell specification, document the user's design direction choices from Step 3.5. This ensures future `/design-screen` commands maintain visual consistency.

### Extract Skill File Guidance

Before generating the design direction, read the skill file to inform AI-generated sections:

```bash
SKILL_FILE=".claude/skills/frontend-design/SKILL.md"

if [ -f "$SKILL_FILE" ]; then
  echo "Reading skill file for design guidance..."
  # The skill file was validated in Step 1
  # Extract and apply guidance from:
  #   - "## Design Thinking" section
  #   - "## Frontend Aesthetics Guidelines" section
fi
```

**When generating AI guidance sections (Visual Signatures, Color Application, Motion & Interaction):**

1. **If skill file was validated in Step 1:** Read the "Design Thinking" and "Frontend Aesthetics Guidelines" sections and use them to generate distinctive, product-specific guidance
2. **If skill file was not available:** Use the "Enhanced Fallback Design Guidance" from agents.md to generate guidance

**The AI-generated sections should reflect:**

- Distinctive choices from the skill file's guidance on avoiding "AI slop"
- Product-specific context from the product overview
- User preferences from Step 3.5

### Ensure Directory Exists

```bash
mkdir -p product/design-system
```

### Create the Design Direction Document

Create `/product/design-system/design-direction.md` using the choices from Step 3.5 AND AI-generated specific guidance.

**Document Structure:** The design direction document has TWO parts:

1. **User Preferences** — The predefined choices from Step 3.5 (structured table)
2. **AI-Generated Guidance** — Specific visual signatures and rules generated based on the product and choices

```markdown
# Design Direction for [Product Name]

## User Preferences

| Setting                 | Choice                                                         |
| ----------------------- | -------------------------------------------------------------- |
| **Aesthetic Tone**      | [User's choice: Professional/Modern/Minimal/Playful/Technical] |
| **Animation Style**     | [User's choice: None/Subtle/Standard/Rich]                     |
| **Information Density** | [User's choice: Compact/Comfortable/Spacious]                  |
| **Responsive Priority** | [User's choice: Desktop-first/Mobile-first/Balanced]           |

---

## Aesthetic Tone

[One sentence capturing the specific visual feeling for THIS product based on the chosen tone]

Example: "Clean, purposeful interface with subtle depth through shadows and a muted color palette that builds trust."

## Visual Signatures

Three distinctive visual elements that MUST appear consistently across all screens:

1. **[Signature 1]** — [Specific implementation description]
2. **[Signature 2]** — [Specific implementation description]
3. **[Signature 3]** — [Specific implementation description]

Example signatures:

- "Pill-shaped action buttons with subtle gradient on hover"
- "Left accent border (2px primary color) on active/selected items"
- "Subtle background blur on overlay cards and modals"

## Color Application

How to apply the design token colors consistently:

- **Primary usage:** [When and how to use primary color - specific scenarios]
- **Accent pattern:** [How accents are applied - specific treatment]
- **Neutral treatment:** [Background/border/text hierarchy - specific shades]

Example:

- "Primary: Reserved for CTAs and active navigation only — never for decorative elements"
- "Accent: Status indicators and badges — success/warning/error semantic colors"
- "Neutral: stone-50 backgrounds, stone-200 borders, stone-600 secondary text"

## Motion & Interaction

Animation approach based on the chosen style:

- **Animation style:** [Specific description of motion personality]
- **Key interactions:** [Primary interaction patterns that feel distinctive]
- **Timing:** [Specific durations - hover, entry, exit, micro-interactions]

Example:

- "Animation: Subtle and professional — fade + slight vertical slide (8px)"
- "Key interactions: Cards lift on hover (shadow-md → shadow-lg), buttons scale 1.02x on press"
- "Timing: 150ms hover, 200ms entry, 150ms exit, 100ms micro-interactions"

## Typography Treatment

How typography creates hierarchy and personality:

- **Heading style:** [Weight, tracking, case treatment]
- **Body approach:** [Line height, paragraph spacing]
- **Distinctive choices:** [One unique typographic decision for this product]

Example:

- "Headings: font-semibold (600), tight tracking (-0.02em), sentence case"
- "Body: 1.6 line height, generous paragraph spacing (1.5em margin)"
- "Distinctive: Monospace for data values and IDs (IBM Plex Mono)"

## Spacing Scale

Based on **[Information Density]**:

| Context           | Compact           | Comfortable       | Spacious          |
| ----------------- | ----------------- | ----------------- | ----------------- |
| Container Padding | px-3 py-3 sm:px-4 | px-4 py-4 sm:px-6 | px-6 py-6 sm:px-8 |
| Card Padding      | p-3               | p-5               | p-8               |
| Section Gap       | gap-4             | gap-6             | gap-10            |
| Base Unit         | 4px               | 8px               | 12px              |

## Responsive Approach

Based on **[Responsive Priority]**:

| Aspect           | Desktop-first  | Mobile-first      | Balanced        |
| ---------------- | -------------- | ----------------- | --------------- |
| Design starts at | 1280px+        | 375px             | 768px           |
| Then adapts      | Down to 375px  | Up to 1920px      | Both directions |
| Breakpoint focus | lg:, xl: first | Default, then sm: | All equally     |

## Consistency Guidelines

Three rules that ensure visual consistency across all screens:

1. **[Rule 1]** — [Specific consistency requirement]
2. **[Rule 2]** — [Specific consistency requirement]
3. **[Rule 3]** — [Specific consistency requirement]

Example rules:

- "All interactive elements use the same hover state (bg-stone-100 dark:bg-stone-800)"
- "Empty states always include an icon (from lucide), heading, and single CTA"
- "Card shadows are consistent: shadow-sm resting, shadow-md on hover"

---

## Applied From

- **Skill file used**: [Yes/No]
- **User choices**: Recorded in Step 3.5 of /design-shell
- **Design tokens**: [colors.json and typography.json if available]
- **Fallback tone**: [If skill file not used, which aesthetic tone was chosen from fallback options]

**Populate the document by:**

1. Extracting the aesthetic choices made when applying the frontend-design skill (or fallback options)
2. Documenting the layout pattern selected and key visual decisions from the shell design
3. Recording specific color, typography, and motion patterns used in the shell components
4. Noting any distinctive elements that make this shell unique (visual signatures, special interactions)
```

### How to Generate the AI Sections

**For each AI-generated section, base your content on:**

1. **Product context** — What does this product do? Who is it for?
2. **Aesthetic tone chosen** — Professional, Modern, Minimal, Playful, or Technical
3. **Animation style** — None, Subtle, Standard, or Rich
4. **Design tokens** — If colors.json and typography.json exist, reference specific colors

**Guidelines for each section:**

| Section                | Must Include                        | Be Specific About                              |
| ---------------------- | ----------------------------------- | ---------------------------------------------- |
| Aesthetic Tone         | One sentence capturing the feeling  | The emotional quality, not just adjectives     |
| Visual Signatures      | 3 concrete elements                 | Implementation details (sizes, colors, timing) |
| Color Application      | Primary, Accent, Neutral usage      | When to use each, specific shades              |
| Motion & Interaction   | Style, Key interactions, Timing     | Actual durations, specific effects             |
| Typography Treatment   | Heading, Body, Distinctive choice   | Weights, line heights, one unique decision     |
| Consistency Guidelines | 3 rules for maintaining consistency | Specific scenarios, exact values               |

**Why this matters:** This document serves as the definitive reference for all subsequent `/design-screen` commands. The combination of structured tables (for quick reference) and AI-generated specifics (for implementation guidance) ensures both consistency and distinctiveness.

> **Recovery:** If this step fails, manually create the file at `product/design-system/design-direction.md` with the template above. The `/design-screen` command will warn if this file is missing but can still proceed.

## Step 6.6: Define Shell Relationships

**NEW:** Based on the interactive elements selected in Step 3.6, add the `## Shell Relationships` section to `product/shell/spec.md`.

> **See also:** `agents/shell-system.md` → "Shell Relationships" section for complete specification including all valid trigger types, relationship types, and data references.

**Format:** `[Trigger].[action] -> [Component] ([type], [dataRef])`

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

**Relationship Types:**

| Type     | UI Component  | Use Case                                        |
| -------- | ------------- | ----------------------------------------------- |
| `drawer` | `<Sheet>`     | Side panel for notifications, help, mobile menu |
| `modal`  | `<Dialog>`    | Centered overlay for search, settings, profile  |
| `inline` | Direct render | Theme toggle button in header                   |

**Data References:**

| Ref             | Description                       | Props                           |
| --------------- | --------------------------------- | ------------------------------- |
| `notifications` | Notification list from shell data | `notifications: Notification[]` |
| `user`          | User profile data                 | `user: User`                    |
| `settings`      | Settings configuration            | `settings: Settings`            |
| `helpTopics`    | Help documentation                | `topics: HelpTopic[]`           |
| `none`          | No data needed                    | Just callbacks                  |

> **Note:** Shell Relationships are distinct from View Relationships:
>
> | Concept             | Scope            | Defined In       |
> | ------------------- | ---------------- | ---------------- |
> | View Relationships  | Within a section | `/shape-section` |
> | Shell Relationships | Global shell UI  | `/design-shell`  |
>
> View Relationships wire views within a section (e.g., list → detail drawer). Shell Relationships wire global shell elements (e.g., header action → notifications drawer).

## Step 6.7: Create Shell Sample Data

**NEW:** Create `/product/shell/data.json` with sample data for all selected secondary components.

```bash
mkdir -p product/shell
```

```json
{
  "_meta": {
    "description": "Sample data for shell interactive components",
    "generatedBy": "/design-shell",
    "models": {
      "notifications": "List of user notifications",
      "user": "Current user profile",
      "settings": "User preferences and app settings",
      "helpTopics": "Help documentation topics"
    },
    "relationships": []
  },
  "notifications": [
    {
      "id": "n1",
      "type": "info",
      "title": "Welcome!",
      "message": "Thanks for using our app. Get started with the dashboard.",
      "timestamp": "2024-01-15T10:30:00Z",
      "read": false
    },
    {
      "id": "n2",
      "type": "success",
      "title": "Task Completed",
      "message": "Your export has finished successfully.",
      "timestamp": "2024-01-15T09:15:00Z",
      "read": true
    },
    {
      "id": "n3",
      "type": "warning",
      "title": "Storage Warning",
      "message": "You're using 80% of your storage quota.",
      "timestamp": "2024-01-14T16:45:00Z",
      "read": false
    }
  ],
  "user": {
    "id": "u1",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "avatar": null,
    "role": "Admin",
    "initials": "AM"
  },
  "settings": {
    "theme": "system",
    "notifications": {
      "email": true,
      "push": true,
      "digest": "daily"
    },
    "language": "en",
    "timezone": "America/New_York"
  },
  "helpTopics": [
    {
      "id": "h1",
      "title": "Getting Started",
      "icon": "rocket",
      "content": "Welcome to the app. Here's how to get started..."
    },
    {
      "id": "h2",
      "title": "Keyboard Shortcuts",
      "icon": "keyboard",
      "content": "Use Cmd+K to open search, Escape to close modals..."
    },
    {
      "id": "h3",
      "title": "Contact Support",
      "icon": "headphones",
      "content": "Need help? Email us at support@example.com"
    }
  ]
}
```

**If SearchModal was selected in Step 3.6, also include:**

```json
{
  "searchRecent": [
    { "id": "r1", "label": "Dashboard", "href": "/sections/dashboard" },
    { "id": "r2", "label": "Create Invoice", "href": "/sections/invoices/new" }
  ],
  "searchShortcuts": [
    {
      "id": "s1",
      "label": "New Invoice",
      "shortcut": "Cmd+N",
      "action": "create-invoice"
    },
    {
      "id": "s2",
      "label": "Search",
      "shortcut": "Cmd+K",
      "action": "open-search"
    },
    {
      "id": "s3",
      "label": "Settings",
      "shortcut": "Cmd+,",
      "action": "open-settings"
    }
  ]
}
```

**Only include data for selected components.** If user didn't select notifications, don't include the notifications array.

## Step 6.8: Create Shell Types

**NEW:** Create `/product/shell/types.ts` with TypeScript interfaces for all shell components.

```typescript
/**
 * Shell Types
 * Generated by /design-shell
 */

// Notification types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export interface NotificationsDrawerProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClear: (id: string) => void;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
  initials?: string;
}

export interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
}

// Settings types
export interface Settings {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    digest: "none" | "daily" | "weekly";
  };
  language: string;
  timezone: string;
}

export interface SettingsModalProps {
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Partial<Settings>) => void;
}

// Help types
export interface HelpTopic {
  id: string;
  title: string;
  icon?: string;
  content: string;
}

export interface HelpPanelProps {
  topics: HelpTopic[];
  onClose: () => void;
  onTopicSelect: (id: string) => void;
}

// Search types
export interface SearchItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  category?: string;
}

export interface SearchShortcut {
  id: string;
  label: string;
  shortcut: string;
  action: string;
}

export interface SearchModalProps {
  onClose: () => void;
  onSelect: (item: SearchItem) => void;
  recentItems?: SearchItem[];
  shortcuts?: SearchShortcut[];
}

// Feedback types
export interface FeedbackModalProps {
  onClose: () => void;
  onSubmit: (feedback: { type: string; message: string }) => void;
}

// Mobile menu types
export interface MobileMenuDrawerProps {
  navigationItems: Array<{ label: string; href: string; icon?: string }>;
  user?: User;
  onClose: () => void;
  onNavigate: (href: string) => void;
  onLogout: () => void;
}

// Shell data structure
export interface ShellData {
  notifications?: Notification[];
  user?: User;
  settings?: Settings;
  helpTopics?: HelpTopic[];
  searchRecent?: SearchItem[];
  searchShortcuts?: SearchShortcut[];
}
```

**Only include types for selected components.**

## Step 7: Create Shell Components

Create the shell components at `src/shell/components/`:

> **Terminology Note:** This step creates **PRIMARY** and **SECONDARY** components:
>
> | Category      | Created By                 | Examples                                  | Exported? |
> | ------------- | -------------------------- | ----------------------------------------- | --------- |
> | **Primary**   | This step (always)         | AppShell, MainNav, UserMenu               | Yes       |
> | **Secondary** | This step (if selected)    | NotificationsDrawer, SearchModal, etc.    | Yes       |
> | **Utility**   | Pre-existing (boilerplate) | SkipLink, ShellErrorBoundary, ThemeToggle | No        |
>
> Utility components are NOT created by this command — they're already in the boilerplate.
> See `agents/shell-system.md` → "Shell Utility Components" for details.

### Primary Components (Always Created by /design-shell)

These three components form the core shell structure and are always created by this command.

#### AppShell.tsx

The main wrapper component that accepts children and provides the layout structure.

```tsx
interface AppShellProps {
  children: React.ReactNode;

  // Navigation
  navigationItems?: Array<{ label: string; href: string; isActive?: boolean }>;
  categories?: Array<{ id: string; label: string; items: NavigationItem[] }>;

  // User
  user?: { name: string; email?: string; avatarUrl?: string };

  // Context selector (organization/client picker - from spec)
  contextSelector?: {
    type: string;
    label: string;
    items: Array<{ id: string; name: string; icon?: string }>;
    selectedId?: string;
    onSelect?: (id: string) => void;
  };

  // Breadcrumbs (from spec)
  breadcrumbs?: Array<{ label: string; href?: string }>;
  onBreadcrumbClick?: (href: string) => void;

  // Header actions (from spec)
  headerActions?: Array<{
    id: string;
    icon: string;
    label?: string;
    badge?: boolean | number;
  }>;
  onHeaderAction?: (actionId: string) => void;

  // Layout
  layoutVariant?: "sidebar" | "topnav" | "minimal";
  currentSection?: string;

  // Callbacks for secondary components
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
  onHelpClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onFeedbackClick?: () => void;
  onMobileMenuToggle?: () => void;

  // Standard callbacks
  onNavigate?: (href: string) => void;
  onLogout?: () => void;
}
```

#### MainNav.tsx

The navigation component (sidebar or top nav based on the chosen pattern).

```tsx
interface MainNavProps {
  items: Array<{
    label: string;
    href: string;
    isActive?: boolean;
    icon?: React.ReactNode;
  }>;
  onNavigate?: (href: string) => void;
  collapsed?: boolean;
}
```

#### UserMenu.tsx

The user menu with avatar and dropdown.

```tsx
interface UserMenuProps {
  user?: {
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onFeedbackClick?: () => void;
}
```

### Secondary Components (Generated Based on Step 3.6 Selections)

These components are created by /design-shell only if the user selected them in Step 3.6.

> **Note:** Secondary components provide interactive shell features (notifications, search, settings, etc.). They are distinct from **utility components** which are pre-existing in the boilerplate.

#### NotificationsDrawer.tsx

```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { NotificationsDrawerProps } from "../../../product/shell/types";

export function NotificationsDrawer({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onClear,
}: NotificationsDrawerProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <span className="text-sm font-normal text-stone-500">
              {unreadCount} unread
            </span>
          )}
        </SheetTitle>
      </SheetHeader>
      {/* Notification list */}
      <div className="mt-4 space-y-2">
        {notifications.length === 0 ? (
          <p className="text-center text-stone-500 py-8">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-3 rounded-lg border",
                notification.read
                  ? "bg-stone-50 dark:bg-stone-900"
                  : "bg-white dark:bg-stone-800 border-primary-200",
              )}
            >
              <div className="flex items-start gap-3">
                <NotificationIcon type={notification.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-sm text-stone-500 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-stone-400 mt-2">
                    {formatRelativeTime(notification.timestamp)}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => onMarkRead(notification.id)}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
```

#### SearchModal.tsx (Command Palette)

```tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import type { SearchModalProps } from "../../../product/shell/types";

export function SearchModal({
  onClose,
  onSelect,
  recentItems,
  shortcuts,
}: SearchModalProps) {
  const [search, setSearch] = useState("");

  // Handle keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Focus is managed by Dialog
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput
        placeholder="Search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {recentItems && recentItems.length > 0 && (
          <CommandGroup heading="Recent">
            {recentItems.map((item) => (
              <CommandItem key={item.id} onSelect={() => onSelect(item)}>
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {shortcuts && shortcuts.length > 0 && (
          <CommandGroup heading="Shortcuts">
            {shortcuts.map((shortcut) => (
              <CommandItem key={shortcut.id}>
                <span className="flex-1">{shortcut.label}</span>
                <kbd className="text-xs bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                  {shortcut.shortcut}
                </kbd>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
```

#### ThemeToggle.tsx

```tsx
import { Sun, Moon, Monitor, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "system";
    }
    return "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (theme === "dark" || (theme === "system" && systemDark)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-4 w-4 dark:hidden" strokeWidth={1.5} />
          <Moon className="h-4 w-4 hidden dark:block" strokeWidth={1.5} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Light
          {theme === "light" && (
            <Check className="ml-auto h-4 w-4" strokeWidth={2} />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Dark
          {theme === "dark" && (
            <Check className="ml-auto h-4 w-4" strokeWidth={2} />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" strokeWidth={1.5} />
          System
          {theme === "system" && (
            <Check className="ml-auto h-4 w-4" strokeWidth={2} />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### Additional Secondary Components

Create these only if selected:

- **SettingsModal.tsx** — Settings form with sections for theme, notifications, language
- **ProfileModal.tsx** — User profile view/edit form
- **HelpPanel.tsx** — Help topics, keyboard shortcuts, support links
- **FeedbackModal.tsx** — Feedback form with type selector and message
- **MobileMenuDrawer.tsx** — Full-screen navigation drawer for mobile

### index.ts

Export all components:

```typescript
// Primary components
export { AppShell } from "./AppShell";
export { MainNav } from "./MainNav";
export { UserMenu } from "./UserMenu";

// Secondary components (only export if created)
export { NotificationsDrawer } from "./NotificationsDrawer";
export { SearchModal } from "./SearchModal";
export { ThemeToggle } from "./ThemeToggle";
export { SettingsModal } from "./SettingsModal";
export { ProfileModal } from "./ProfileModal";
export { HelpPanel } from "./HelpPanel";
export { FeedbackModal } from "./FeedbackModal";
export { MobileMenuDrawer } from "./MobileMenuDrawer";
```

**Component Requirements:**

- Use props for all data and callbacks (portable)
- Apply design tokens if they exist (colors, fonts)
- Support light and dark mode with `dark:` variants
- Be mobile responsive
- Use Tailwind CSS for styling
- Use lucide-react for icons

## Step 7.5: Validate Section Availability

Before creating ShellPreview, check if sections exist to avoid import failures:

```bash
SECTIONS_EXIST=false
if ls -d product/sections/*/ 2>/dev/null | grep -q .; then
  SECTIONS_EXIST=true
  echo "Sections found: $(ls -d product/sections/*/)"
else
  echo "No sections found yet. ShellPreview will use placeholder content."
fi
```

**If `SECTIONS_EXIST=false`:**

The ShellPreview will render with placeholder content instead of section routes:

```tsx
// Placeholder content when no sections exist
<div className="flex-1 flex items-center justify-center bg-stone-50 dark:bg-stone-900">
  <div className="text-center text-muted-foreground">
    <p className="text-lg font-medium">Shell preview ready</p>
    <p className="text-sm mt-2">Run /shape-section to add sections.</p>
  </div>
</div>
```

**If `SECTIONS_EXIST=true`:**

Generate navigation items from section directories and proceed with full ShellPreview (see Step 8).

## Step 8: Create Wired Shell Preview

**CRITICAL:** Before creating ShellPreview, validate prerequisites and parse Shell Relationships.

### Step 8.0: Validate Shell Data Prerequisites

Before creating ShellPreview, verify that required files from previous steps exist:

```bash
# Check data.json exists (created in Step 6.7)
if [ ! -f "product/shell/data.json" ]; then
  echo "Error: product/shell/data.json - File not found. Step 6.7 may have failed."
  echo "Recovery: Re-run /design-shell or manually create data.json"
  exit 1
fi

# Check types.ts exists (created in Step 6.8)
if [ ! -f "product/shell/types.ts" ]; then
  echo "Error: product/shell/types.ts - File not found. Step 6.8 may have failed."
  echo "Recovery: Re-run /design-shell or manually create types.ts"
  exit 1
fi

# Validate data.json is valid JSON
if ! python3 -c "import json; json.load(open('product/shell/data.json'))" 2>/dev/null; then
  echo "Error: product/shell/data.json - Invalid JSON syntax."
  echo "Recovery: Check the file for missing commas or brackets."
  exit 1
fi

echo "Shell data prerequisites validated"
```

### Step 8.0b: Validate Field-to-Component Matching

After JSON syntax validation, verify that selected components have corresponding data fields:

```bash
DATA_FILE="product/shell/data.json"
SPEC_FILE="product/shell/spec.md"
VALIDATION_WARNINGS=""

# Parse selected components from Shell Relationships in spec.md
# Extract components from lines like: HeaderAction.notifications -> NotificationsDrawer (drawer, notifications)

# Check notifications data if NotificationsDrawer selected
if grep -q "NotificationsDrawer" "$SPEC_FILE"; then
  if ! python3 -c "import json; d=json.load(open('$DATA_FILE')); assert 'notifications' in d" 2>/dev/null; then
    VALIDATION_WARNINGS="${VALIDATION_WARNINGS}\n  - NotificationsDrawer selected but data.json missing 'notifications' field"
  fi
fi

# Check user data if ProfileModal selected
if grep -q "ProfileModal" "$SPEC_FILE"; then
  if ! python3 -c "import json; d=json.load(open('$DATA_FILE')); assert 'user' in d" 2>/dev/null; then
    VALIDATION_WARNINGS="${VALIDATION_WARNINGS}\n  - ProfileModal selected but data.json missing 'user' field"
  fi
fi

# Check settings data if SettingsModal selected
if grep -q "SettingsModal" "$SPEC_FILE"; then
  if ! python3 -c "import json; d=json.load(open('$DATA_FILE')); assert 'settings' in d" 2>/dev/null; then
    VALIDATION_WARNINGS="${VALIDATION_WARNINGS}\n  - SettingsModal selected but data.json missing 'settings' field"
  fi
fi

# Check helpTopics data if HelpPanel selected
if grep -q "HelpPanel" "$SPEC_FILE"; then
  if ! python3 -c "import json; d=json.load(open('$DATA_FILE')); assert 'helpTopics' in d" 2>/dev/null; then
    VALIDATION_WARNINGS="${VALIDATION_WARNINGS}\n  - HelpPanel selected but data.json missing 'helpTopics' field"
  fi
fi

# Report warnings
if [ -n "$VALIDATION_WARNINGS" ]; then
  echo "⚠️ Field-to-component validation warnings:$VALIDATION_WARNINGS"
  echo ""
  echo "Recovery: Update data.json to include missing fields, or re-run Step 6.7."
  # Continue with warning — components may have fallback handling
fi
```

**Field-to-Component Mapping:**

| Component             | Required Data Field | Purpose                    |
| --------------------- | ------------------- | -------------------------- |
| `NotificationsDrawer` | `notifications`     | List of notification items |
| `ProfileModal`        | `user`              | Current user profile data  |
| `SettingsModal`       | `settings`          | User preferences           |
| `HelpPanel`           | `helpTopics`        | Help documentation         |
| `SearchModal`         | (none required)     | Uses search state only     |
| `FeedbackModal`       | (none required)     | Form only, no data         |
| `MobileMenuDrawer`    | (none required)     | Uses nav items from props  |

> **Note:** This validation produces warnings, not errors. Components may have fallback handling for missing data. However, missing fields should be addressed for complete preview functionality.

**If validation fails:** Do NOT proceed with ShellPreview creation. The import statement will fail at runtime if data.json is missing or invalid.

### Step 8.1: Parse Shell Relationships

Read `product/shell/spec.md` and extract the `## Shell Relationships` section. Parse each relationship line:

```
Format: [Trigger].[action] -> [Component] ([type], [dataRef])
Example: HeaderAction.notifications -> NotificationsDrawer (drawer, notifications)
```

**Create a list of components to include based on parsed relationships:**

| Trigger.action               | Component             | State Variable        | Wrapper  |
| ---------------------------- | --------------------- | --------------------- | -------- |
| `HeaderAction.notifications` | `NotificationsDrawer` | `isNotificationsOpen` | `Sheet`  |
| `HeaderAction.search`        | `SearchModal`         | `isSearchOpen`        | `Dialog` |
| `HeaderAction.help`          | `HelpPanel`           | `isHelpOpen`          | `Sheet`  |
| `UserMenu.profile`           | `ProfileModal`        | `isProfileOpen`       | `Dialog` |
| `UserMenu.settings`          | `SettingsModal`       | `isSettingsOpen`      | `Dialog` |
| `UserMenu.feedback`          | `FeedbackModal`       | `isFeedbackOpen`      | `Dialog` |
| `MobileNav.toggle`           | `MobileMenuDrawer`    | `isMobileMenuOpen`    | `Sheet`  |

**Only include components that appear in the parsed relationships.** If a component was not selected in Step 3.6, it will not appear in Shell Relationships and must NOT be included in ShellPreview.

### Step 8.2: Generate ShellPreview

Create `src/shell/ShellPreview.tsx` with state management ONLY for the components identified in Step 8.1.

**Navigation Items:** Generate `navigationItems` array from `product/product-roadmap.md` sections. If `SECTIONS_EXIST=false` (from Step 7.5), use a single placeholder item `[{ label: "Home", href: "/", isActive: true }]`.

**IMPORTANT:** The template below shows ALL possible components. You MUST:

1. Only import components that appear in the Shell Relationships parsed in Step 8.1
2. Only create state for components that were imported
3. Only render components that were imported
4. Add null checks for data properties that may not exist if component wasn't selected

> **Template Instructions:** Lines with `// ⚠️ CONDITIONAL:` are template instructions, NOT code comments.
> When generating actual code, REMOVE these instruction comments entirely and ONLY include
> the lines where the condition is met based on Step 3.6 selections.

```tsx
import { useState, useEffect } from "react";
import { AppShell } from "./components/AppShell";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// CONDITIONAL IMPORTS: Only include components that appear in Shell Relationships
// Remove any import for components NOT selected in Step 3.6
import { NotificationsDrawer } from "./components/NotificationsDrawer"; // ⚠️ CONDITIONAL: Only include if HeaderAction.notifications in relationships
import { SearchModal } from "./components/SearchModal"; // ⚠️ CONDITIONAL: Only include if HeaderAction.search in relationships
import { SettingsModal } from "./components/SettingsModal"; // ⚠️ CONDITIONAL: Only include if UserMenu.settings in relationships
import { ProfileModal } from "./components/ProfileModal"; // ⚠️ CONDITIONAL: Only include if UserMenu.profile in relationships
import { HelpPanel } from "./components/HelpPanel"; // ⚠️ CONDITIONAL: Only include if HeaderAction.help in relationships
import { MobileMenuDrawer } from "./components/MobileMenuDrawer"; // ⚠️ CONDITIONAL: Only include if MobileNav.toggle in relationships

// Import shell data and types
// Note: These imports require Step 6.7-6.8 to have completed successfully
// If data.json doesn't exist, the dev server will show a clear error
import shellData from "../../../product/shell/data.json";
import type { ShellData } from "../../../product/shell/types";

export default function ShellPreview() {
  // CONDITIONAL STATE: Only create state for components that were imported
  // Remove state for components NOT selected in Step 3.6
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // ⚠️ CONDITIONAL: Only include if NotificationsDrawer imported
  const [isSearchOpen, setIsSearchOpen] = useState(false); // ⚠️ CONDITIONAL: Only include if SearchModal imported
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // ⚠️ CONDITIONAL: Only include if SettingsModal imported
  const [isProfileOpen, setIsProfileOpen] = useState(false); // ⚠️ CONDITIONAL: Only include if ProfileModal imported
  const [isHelpOpen, setIsHelpOpen] = useState(false); // ⚠️ CONDITIONAL: Only include if HelpPanel imported
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ⚠️ CONDITIONAL: Only include if MobileMenuDrawer imported

  // Type the shell data
  const data = shellData as ShellData;

  // Navigation items from product roadmap
  // ⚠️ IMPORTANT: Replace these example items with ACTUAL sections from product/product-roadmap.md
  // If no sections exist yet (SECTIONS_EXIST=false from Step 7.5), use placeholder:
  // const navigationItems = [{ label: "Home", href: "/", isActive: true }];
  const navigationItems = [
    { label: "Dashboard", href: "/sections/dashboard", isActive: true },
    { label: "Invoices", href: "/sections/invoice-management" },
    { label: "Reports", href: "/sections/reports-and-analytics" },
  ];

  // CONDITIONAL KEYBOARD SHORTCUTS: Only include shortcuts for imported components
  // Remove the Cmd+K handler if SearchModal is NOT in Shell Relationships
  // Keep Escape handler but remove setters for non-imported components
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K for search - INCLUDE ONLY IF SearchModal imported
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Escape closes all - adjust setters based on imported components
      if (e.key === "Escape") {
        // Close whichever is open (remove setters for non-imported components)
        setIsNotificationsOpen(false); // ⚠️ CONDITIONAL: Only include if NotificationsDrawer imported
        setIsSearchOpen(false); // ⚠️ CONDITIONAL: Only include if SearchModal imported
        setIsSettingsOpen(false); // ⚠️ CONDITIONAL: Only include if SettingsModal imported
        setIsProfileOpen(false); // ⚠️ CONDITIONAL: Only include if ProfileModal imported
        setIsHelpOpen(false); // ⚠️ CONDITIONAL: Only include if HelpPanel imported
        setIsMobileMenuOpen(false); // ⚠️ CONDITIONAL: Only include if MobileMenuDrawer imported
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <AppShell
        navigationItems={navigationItems}
        user={data.user}
        onNavigate={(href) => console.log("Navigate:", href)}
        onLogout={() => console.log("Logout")}
        // Wired handlers for header actions
        onHeaderAction={(actionId) => {
          if (actionId === "notifications") setIsNotificationsOpen(true);
          if (actionId === "search") setIsSearchOpen(true);
          if (actionId === "help") setIsHelpOpen(true);
        }}
        // Wired handlers for user menu
        onProfileClick={() => setIsProfileOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
      >
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Content Area</h1>
          <p className="text-stone-600 dark:text-stone-400">
            Section content will render here.
          </p>
        </div>
      </AppShell>

      {/* CONDITIONAL RENDERING: Only include secondary components that were selected in Step 3.6 */}
      {/* Remove any JSX block for components NOT in Shell Relationships */}

      {/* Notifications Drawer - INCLUDE ONLY IF HeaderAction.notifications in relationships */}
      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent side="right" className="w-[400px]">
          <NotificationsDrawer
            notifications={data.notifications ?? []}
            onClose={() => setIsNotificationsOpen(false)}
            onMarkRead={(id) => console.log("Mark read:", id)}
            onMarkAllRead={() => console.log("Mark all read")}
            onClear={(id) => console.log("Clear:", id)}
          />
        </SheetContent>
      </Sheet>

      {/* Search Modal - INCLUDE ONLY IF HeaderAction.search in relationships */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="p-0 max-w-lg">
          <SearchModal
            onClose={() => setIsSearchOpen(false)}
            onSelect={(item) => {
              console.log("Search select:", item);
              setIsSearchOpen(false);
            }}
            recentItems={data.searchRecent ?? []}
            shortcuts={data.searchShortcuts ?? []}
          />
        </DialogContent>
      </Dialog>

      {/* Settings Modal - INCLUDE ONLY IF UserMenu.settings in relationships */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <SettingsModal
            settings={
              data.settings ?? {
                theme: "system",
                notifications: { email: true, push: true, digest: "daily" },
                language: "en",
                timezone: "UTC",
              }
            }
            onClose={() => setIsSettingsOpen(false)}
            onSave={(settings) => {
              console.log("Save settings:", settings);
              setIsSettingsOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Profile Modal - INCLUDE ONLY IF UserMenu.profile in relationships */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <ProfileModal
            user={
              data.user ?? { id: "u1", name: "User", email: "user@example.com" }
            }
            onClose={() => setIsProfileOpen(false)}
            onSave={(user) => {
              console.log("Save profile:", user);
              setIsProfileOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Help Panel - INCLUDE ONLY IF HeaderAction.help in relationships */}
      <Sheet open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <SheetContent side="right" className="w-[400px]">
          <HelpPanel
            topics={data.helpTopics ?? []}
            onClose={() => setIsHelpOpen(false)}
            onTopicSelect={(id) => console.log("Topic selected:", id)}
          />
        </SheetContent>
      </Sheet>

      {/* Mobile Menu Drawer - INCLUDE ONLY IF MobileNav.toggle in relationships */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px]">
          <MobileMenuDrawer
            navigationItems={navigationItems}
            user={data.user ?? { id: "u1", name: "User" }}
            onClose={() => setIsMobileMenuOpen(false)}
            onNavigate={(href) => {
              console.log("Navigate:", href);
              setIsMobileMenuOpen(false);
            }}
            onLogout={() => console.log("Logout")}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
```

**Important:**

- **Only include imports and JSX for components parsed from Shell Relationships** (Step 8.1)
- The template above is a COMPLETE example — trim it down to match your parsed relationships
- Handlers are wired to state, not console.log (except for actual actions like navigation)
- Keyboard shortcut (Cmd+K) only needed if SearchModal was selected
- Escape key closes any open modal/drawer

### Handling Missing Sections

**If `/product/product-roadmap.md` doesn't exist or has no sections:**

The shell can still be created with placeholder navigation items:

```tsx
// Placeholder navigation when no sections exist yet
const navigationItems = [
  { label: "Home", href: "/", isActive: true },
  { label: "Section 1", href: "/sections/section-1" },
  { label: "Section 2", href: "/sections/section-2" },
];
```

Inform the user:

```
Note: No sections defined in product-roadmap.md yet.
I'm using placeholder navigation items. Run /product-roadmap to define your sections,
then update the shell navigation to match.
```

## Step 9: Apply Design Tokens

If design tokens exist, apply them to the shell components:

**Colors:**

- Read `/product/design-system/colors.json`
- Use primary color for active nav items, key accents
- Use secondary color for hover states, subtle highlights
- Use neutral color for backgrounds, borders, text

**Typography:**

- Read `/product/design-system/typography.json`
- Apply heading font to nav items and titles
- Apply body font to other text
- Include Google Fonts import in the preview

### Shell-Specific Design Token Shades

Use these specific shades for shell UI elements.

> **Note on Minimal Palettes:** If only a neutral color is defined (no primary), skip primary-specific styles and use neutral shades throughout. For active states without a primary color, use a darker neutral shade instead (e.g., `[neutral]-800` for active nav items).

**Navigation Shades:**
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Sidebar/header background | `white` | `[neutral]-900` |
| Nav item text (inactive) | `[neutral]-600` | `[neutral]-400` |
| Nav item text (active) | `[primary]-700` | `[primary]-400` |
| Nav item background (active) | `[primary]-50` | `[primary]-950` |
| Nav item hover | `[neutral]-100` | `[neutral]-800` |
| Nav divider | `[neutral]-200` | `[neutral]-800` |

**User Menu Shades:**
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Avatar background | `[neutral]-200` | `[neutral]-700` |
| Avatar text (initials) | `[neutral]-700` | `[neutral]-200` |
| Dropdown background | `white` | `[neutral]-800` |
| Dropdown item hover | `[neutral]-100` | `[neutral]-700` |
| Username text | `[neutral]-900` | `[neutral]-100` |
| Email text | `[neutral]-500` | `[neutral]-400` |

**Layout Shades:**
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Content area background | `[neutral]-50` | `[neutral]-950` |
| Main border | `[neutral]-200` | `[neutral]-800` |
| Mobile overlay | `black/50` | `black/70` |

## Step 9.5: Inject Anti-Flicker Script

**NEW:** If ThemeToggle was selected in Step 3.6, inject the anti-flicker script into `index.html`.

### Check if Script Exists

```bash
if grep -q "Anti-flicker" index.html; then
  echo "Anti-flicker script already exists"
  ANTIFLICKER_EXISTS=true
else
  echo "Anti-flicker script needs to be added"
  ANTIFLICKER_EXISTS=false
fi
```

### Inject Script if Missing

If `ANTIFLICKER_EXISTS` is false AND ThemeToggle was selected:

Read `index.html` and inject the following script **immediately after `<head>` and before any `<link>` or other `<script>` tags**:

```html
<!-- Anti-flicker: Apply theme BEFORE render to prevent flash -->
<script>
  // Anti-flicker: Apply theme synchronously before render
  // Generated by /design-shell
  (function () {
    try {
      var theme = localStorage.getItem("theme") || "system";
      var systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (theme === "dark" || (theme === "system" && systemDark)) {
        document.documentElement.classList.add("dark");
      }
    } catch (e) {}
  })();
</script>
```

**Exact Placement in index.html:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- ⬇️ ANTI-FLICKER SCRIPT - MUST BE FIRST ⬇️ -->
    <script>
      // Anti-flicker: Apply theme synchronously before render
      // Generated by /design-shell
      (function () {
        try {
          var theme = localStorage.getItem("theme") || "system";
          var systemDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
          ).matches;
          if (theme === "dark" || (theme === "system" && systemDark)) {
            document.documentElement.classList.add("dark");
          }
        } catch (e) {}
      })();
    </script>
    <!-- ⬆️ ANTI-FLICKER SCRIPT ⬆️ -->

    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <title>App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Confirm Injection

```
✓ Anti-flicker script added to index.html

This prevents theme flash on page load by applying the saved theme
before any CSS or JavaScript loads.
```

## Step 10: Confirm Completion

Let the user know:

"I've designed the application shell for **[Product Name]**:

**Created files:**

**Specification & Data:**

- `/product/shell/spec.md` — Shell specification with relationships
- `/product/shell/data.json` — Sample data for shell components
- `/product/shell/types.ts` — TypeScript interfaces
- `/product/design-system/design-direction.md` — Design direction for consistency

**Primary Components:**

- `src/shell/components/AppShell.tsx` — Main shell wrapper
- `src/shell/components/MainNav.tsx` — Navigation component
- `src/shell/components/UserMenu.tsx` — User menu component
- `src/shell/components/index.ts` — Component exports
- `src/shell/ShellPreview.tsx` — Wired preview wrapper

**Secondary Components:** (based on your selections)

- [List each created secondary component]

**Shell features:**

- [Layout pattern] layout
- Navigation for all [N] sections
- User menu with avatar and logout
- Mobile responsive design
- Light/dark mode support
- [List selected interactive elements]

**Interactive Wiring:**

- Notifications: Click bell → Opens drawer
- Search: Cmd+K or click → Opens command palette
- Settings: User menu → Opens modal
- [etc. based on selections]

**Important:** Restart your dev server to see the changes.

When you design section screens with `/design-screen`, they will render inside this shell, showing the full app experience with working interactions.

Next: Run `/shape-section` to start designing your first section."

## Important Notes

- The shell is a screen design — it demonstrates the navigation and layout design
- Components are props-based and portable to the user's codebase
- The preview wrapper is for Design OS only — not exported
- Apply design tokens when available for consistent styling
- Keep the shell focused on navigation chrome — no authentication UI
- Section screen designs will render inside the shell's content area
- Secondary components use Sheet (for drawers) and Dialog (for modals) from shadcn/ui
- Shell Relationships map triggers to secondary components for wired preview
- For Lucide icons, follow stroke width conventions: 1.5 default, 2 for small icons, 2.5+ for emphasis (see `agents/design-system.md` → "Icon Stroke Width Convention")
