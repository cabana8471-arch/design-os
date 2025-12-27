# Design Shell

You are helping the user design the application shell — the persistent navigation and layout that wraps all sections. This is a screen design, not implementation code.

## Step 1: Check Prerequisites

First, verify prerequisites exist:

1. Read `/product/product-overview.md` — Product name and description
2. Read `/product/product-roadmap.md` — Sections for navigation
3. Check if `/product/design-system/colors.json` and `/product/design-system/typography.json` exist

If either file is missing, show a specific error message:

**If `/product/product-overview.md` is missing:**
```
Missing: product/product-overview.md. Run /product-vision to create it.
```

**If `/product/product-roadmap.md` is missing:**
```
Missing: product/product-roadmap.md. Run /product-roadmap to create it.
```

Stop here if any required file is missing.

If design tokens are missing, show a warning but continue:

"Note: Design tokens haven't been defined yet. I'll proceed with default styling, but you may want to run `/design-tokens` first for consistent colors and typography."

## Step 2: Analyze Product Structure

Review the roadmap sections and present navigation options with recommendations based on product size:

"I'm designing the shell for **[Product Name]**. Based on your roadmap, you have [N] sections:

1. **[Section 1]** — [Description]
2. **[Section 2]** — [Description]
3. **[Section 3]** — [Description]

Let's decide on the shell layout. Common patterns:

**A. Sidebar Navigation** — Vertical nav on the left, content on the right
   Best for: Apps with many sections, dashboard-style tools, admin panels
   **Recommended when:** 5+ sections, complex navigation hierarchy, or data-heavy applications

**B. Top Navigation** — Horizontal nav at top, content below
   Best for: Simpler apps, marketing-style products, fewer sections
   **Recommended when:** 3-4 sections, content-focused products, or public-facing sites

**C. Minimal Header** — Just logo + user menu, sections accessed differently
   Best for: Single-purpose tools, wizard-style flows
   **Recommended when:** 1-2 sections, focused workflows, or embedded applications

**Based on your [N] sections, I'd recommend [Pattern A/B/C]** because [reason based on section count and product type].

Which pattern fits **[Product Name]** best?"

Wait for their response.

## Step 3: Gather Design Details

Use AskUserQuestion to clarify:

- "Where should the user menu (avatar, logout) appear?"
- "Do you want the sidebar collapsible on mobile, or should it become a hamburger menu?"
- "Any additional items in the navigation? (Settings, Help, etc.)"
- "What should the 'home' or default view be when the app loads?"

## Step 4: Present Shell Specification

Once you understand their preferences:

"Here's the shell design for **[Product Name]**:

**Layout Pattern:** [Sidebar/Top Nav/Minimal]

**Navigation Structure:**
- [Nav Item 1] → [Section]
- [Nav Item 2] → [Section]
- [Nav Item 3] → [Section]
- [Additional items like Settings, Help]

**User Menu:**
- Location: [Top right / Bottom of sidebar]
- Contents: Avatar, user name, logout

**Responsive Behavior:**
- Desktop: [How it looks]
- Mobile: [How it adapts]

Does this match what you had in mind?"

Iterate until approved.

## Step 5: Read Design Guidance

Before creating the shell specification and components, read the design guidance to ensure the shell has distinctive, production-grade aesthetics.

### Validate Skill File Exists and Has Content

First, check that the frontend-design skill file exists at `.claude/skills/frontend-design/SKILL.md` and contains meaningful content.

**Validation Steps:**

1. **Check file exists:**
   ```bash
   if [ ! -f ".claude/skills/frontend-design/SKILL.md" ]; then
     echo "Missing: .claude/skills/frontend-design/SKILL.md"
     exit 1
   fi
   ```

2. **Check file has meaningful content (>100 characters after frontmatter):**
   ```bash
   # Count content length excluding frontmatter and blank lines
   CONTENT_LENGTH=$(sed '/^---$/,/^---$/d' .claude/skills/frontend-design/SKILL.md | tr -d '[:space:]' | wc -c)
   if [ "$CONTENT_LENGTH" -lt 100 ]; then
     echo "The skill file exists but appears to be empty or contains only frontmatter."
     exit 1
   fi
   ```

**If the file is missing or has insufficient content:**

Show a warning and offer to continue with fallback guidance:

```
Note: The frontend-design skill file at `.claude/skills/frontend-design/SKILL.md` is missing or empty.

Without this guidance, the shell design may be more generic. You can:
1. Continue anyway — I'll use basic design principles (results may be less distinctive)
2. Stop here — Add the skill file first for better design quality

The skill file provides guidance on creating distinctive, production-grade interfaces that avoid common "AI-generated" aesthetics.
```

Use AskUserQuestion with options:
- "Continue with basic design principles" — Proceed to Step 6 using fallback guidance
- "Stop — I'll add the skill file first" — END COMMAND

**If user chooses to continue without the skill file:**

Use these fallback design principles:
- Create clean, functional interfaces with clear visual hierarchy
- Use consistent spacing and alignment
- Apply the design tokens (colors, typography) thoughtfully
- Ensure responsive design and dark mode support
- Focus on usability over decoration

Note: Results will be functional but may lack the distinctive character that the frontend-design skill provides.

### Read Design Guidance

**Read the file `.claude/skills/frontend-design/SKILL.md` now.** Apply the following guidance:
- Creating distinctive UI that avoids generic "AI slop" aesthetics
- Choosing bold design directions and unexpected layouts
- Applying thoughtful typography and color choices
- Using motion and transitions effectively

This guidance applies to both the shell specification and shell components — the shell is a critical user-facing interface that should reflect your product's distinctive visual identity.

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
  echo "Error: Failed to create directory product/shell."
  exit 1
fi
if [ ! -d "src/shell/components" ]; then
  echo "Error: Failed to create directory src/shell/components."
  exit 1
fi
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
```

## Multi-View Navigation Routing

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

## Step 7: Create Shell Components

Create the shell components at `src/shell/components/`:

### AppShell.tsx
The main wrapper component that accepts children and provides the layout structure.

```tsx
interface AppShellProps {
  children: React.ReactNode
  navigationItems: Array<{ label: string; href: string; isActive?: boolean }>
  user?: { name: string; avatarUrl?: string }
  onNavigate?: (href: string) => void
  onLogout?: () => void
}
```

### MainNav.tsx
The navigation component (sidebar or top nav based on the chosen pattern).

```tsx
interface MainNavProps {
  items: Array<{ label: string; href: string; isActive?: boolean; icon?: React.ReactNode }>
  onNavigate?: (href: string) => void
  collapsed?: boolean
}
```

### Navigation Href Format

Navigation item `href` values must follow this pattern to ensure compatibility with the application routing:

| Route Type | Format | Example |
|------------|--------|---------|
| Section page | `/sections/[section-id]` | `/sections/invoice-management` |
| Screen design | `/sections/[section-id]/screen-designs/[name]` | `/sections/invoice-management/screen-designs/invoice-list` |
| Static pages | `/[page-name]` | `/settings`, `/help` |

**Important:**
- Section IDs must match the directory names in `src/sections/`
- The `href` values are used by both Design OS preview and the exported shell
- When exporting, these routes should be updated to match your application's actual routing structure

**Example navigation items:**
```tsx
const navigationItems = [
  { label: 'Dashboard', href: '/sections/dashboard', isActive: true },
  { label: 'Invoices', href: '/sections/invoice-management' },
  { label: 'Reports', href: '/sections/reports-and-analytics' },
  { label: 'Settings', href: '/settings' },
]
```

### UserMenu.tsx
The user menu with avatar and dropdown.

```tsx
interface UserMenuProps {
  user?: {
    name: string
    email?: string
    avatarUrl?: string
  }
  onLogout?: () => void
  onSettings?: () => void
}
```

### index.ts
Export all components.

**Component Requirements:**
- Use props for all data and callbacks (portable)
- Apply design tokens if they exist (colors, fonts)
- Support light and dark mode with `dark:` variants
- Be mobile responsive
- Use Tailwind CSS for styling
- Use lucide-react for icons

## Step 8: Create Shell Preview

Create `src/shell/ShellPreview.tsx` — a preview wrapper for viewing the shell in Design OS:

```tsx
import { AppShell } from './components/AppShell'

export default function ShellPreview() {
  // Navigation items use REAL section names from the product roadmap
  // User menu and other chrome use placeholder mock data
  const navigationItems = [
    { label: '[Section 1 from roadmap]', href: '/section-1', isActive: true },
    { label: '[Section 2 from roadmap]', href: '/section-2' },
    { label: '[Section 3 from roadmap]', href: '/section-3' },
  ]

  // User menu uses placeholder data — not from sections
  const user = {
    name: 'Alex Morgan',
    email: 'alex@example.com',
    avatarUrl: undefined,
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      user={user}
      onNavigate={(href) => console.log('Navigate to:', href)}
      onLogout={() => console.log('Logout')}
    >
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Content Area</h1>
        <p className="text-stone-600 dark:text-stone-400">
          Section content will render here.
        </p>
      </div>
    </AppShell>
  )
}
```

**Important:**
- **Navigation items** should use the REAL section names from `product/product-roadmap.md`
- **User menu, notifications, and other chrome** should use placeholder mock data
- Do NOT import data from section folders — this ensures the shell preview works even if no sections have been designed yet

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

Use these specific shades for shell UI elements:

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

**Example Shell Styling:**
```tsx
// Sidebar
<aside className="bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800">

// Active nav item
<a className="bg-lime-50 dark:bg-lime-950 text-lime-700 dark:text-lime-400">

// Inactive nav item
<a className="text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800">

// User avatar
<div className="bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200">
```

## Step 10: Confirm Completion

Let the user know:

"I've designed the application shell for **[Product Name]**:

**Created files:**
- `/product/shell/spec.md` — Shell specification
- `src/shell/components/AppShell.tsx` — Main shell wrapper
- `src/shell/components/MainNav.tsx` — Navigation component
- `src/shell/components/UserMenu.tsx` — User menu component
- `src/shell/components/index.ts` — Component exports
- `src/shell/ShellPreview.tsx` — Preview wrapper

**Shell features:**
- [Layout pattern] layout
- Navigation for all [N] sections
- User menu with avatar and logout
- Mobile responsive design
- Light/dark mode support

**Important:** Restart your dev server to see the changes.

When you design section screens with `/design-screen`, they will render inside this shell, showing the full app experience.

Next: Run `/shape-section` to start designing your first section."

## Important Notes

- The shell is a screen design — it demonstrates the navigation and layout design
- Components are props-based and portable to the user's codebase
- The preview wrapper is for Design OS only — not exported
- Apply design tokens when available for consistent styling
- Keep the shell focused on navigation chrome — no authentication UI
- Section screen designs will render inside the shell's content area
