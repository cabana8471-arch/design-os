# Design Shell

You are helping the user design the application shell — the persistent navigation and layout that wraps all sections. This is a screen design, not implementation code.

## Step 1: Check Prerequisites

First, verify prerequisites exist:

1. Read `/product/product-overview.md` — Product name and description
2. Read `/product/product-roadmap.md` — Sections for navigation
3. Check if `/product/design-system/colors.json` and `/product/design-system/typography.json` exist
4. Check if `.claude/skills/frontend-design/SKILL.md` exists and has content

If any required file is missing, show a specific error message:

**If `/product/product-overview.md` is missing:**

```
Error: product-overview.md - File not found. Run /product-vision to create it.
```

**If `/product/product-roadmap.md` is missing:**

```
Error: product-roadmap.md - File not found. Run /product-roadmap to create it.
```

Stop here if any required file is missing.

### Validate Design Guidance (Skill File)

Check that the frontend-design skill file exists and has meaningful content:

```bash
# Check file exists
if [ ! -f ".claude/skills/frontend-design/SKILL.md" ]; then
  echo "Warning: SKILL.md - File not found at .claude/skills/frontend-design/SKILL.md"
  exit 1
fi

# Check file has meaningful content (>100 characters after frontmatter)
CONTENT_LENGTH=$(sed '/^---$/,/^---$/d' .claude/skills/frontend-design/SKILL.md | tr -d '[:space:]' | wc -c)
if [ "$CONTENT_LENGTH" -lt 100 ]; then
  echo "Warning: SKILL.md - Insufficient content (< 100 chars). Add meaningful design guidance."
fi
```

**If the file is missing or has insufficient content:**

Show a warning and offer to continue with fallback guidance:

```
Note: The frontend-design skill file at `.claude/skills/frontend-design/SKILL.md` is missing or empty.

Without this guidance, the shell design may be more generic. You can:
1. Continue anyway — I'll use basic design principles (results may be less distinctive)
2. Stop here — Add the skill file first for better design quality

The skill file provides guidance on creating distinctive, production-grade interfaces.
```

Use AskUserQuestion with options:

- "Continue with basic design principles" — Proceed using fallback guidance
- "Stop — I'll add the skill file first" — END COMMAND

Track user's choice - if continuing without skill file, use these **enhanced fallback design principles** (see agents.md → "Enhanced Fallback Design Guidance" for full details):

**Aesthetic Tone Options** (ask user to choose one):

- **Refined Utility**: Clean, purposeful, subtle shadows, muted accents, professional feel
- **Bold & Bright**: High contrast, vibrant colors, strong typography, energetic
- **Soft & Approachable**: Rounded corners, pastel accents, generous spacing, friendly
- **Professional Dense**: Compact layout, neutral palette, efficient use of space, data-focused

**Visual Hierarchy** (beyond just sizes):

- Create clear distinction using size, weight, AND color together
- Use generous whitespace around primary actions
- Group related elements with subtle background colors
- Apply contrast intentionally to guide the eye

**Spacing System:**

- Use 8px increments for padding and margins (8, 16, 24, 32, 48, 64)
- Maintain consistent gutter widths (16px on mobile, 24px on tablet, 32px on desktop)
- Apply generous whitespace around primary actions

**Color Application:**

- Primary: Reserve for key actions and active states (buttons, links, selected items)
- Secondary: Use for supportive elements (badges, highlights, secondary buttons)
- Neutral: Create hierarchy with 3-4 distinct shades (not more)
- Accent: One unexpected color choice for distinctiveness

**Typography Choices:**

- Headings: Slightly heavier weight (600-700), moderate tracking
- Body: Regular weight (400), comfortable line height (1.5-1.7)
- Use size differences of at least 4px between hierarchy levels
- Consider one distinctive font choice (avoid Inter, Roboto unless product specifically requires them)

**Motion & Interaction:**

- Prefer CSS transitions over JavaScript animations
- Use 150-200ms for hover states
- Use 250-300ms for entry/exit animations
- Avoid bounce or overshoot effects unless matching a playful tone

**Responsive Breakpoints:**

- Mobile: < 640px (single column, stacked nav)
- Tablet: 640-1024px (condensed sidebar or collapsible nav)
- Desktop: > 1024px (full sidebar, multi-column layouts)

**Dark Mode:**

- Backgrounds: stone-900 to stone-950 (never pure black)
- Text: stone-100 to stone-300
- Borders: stone-700 to stone-800
- Increase contrast for interactive elements

**Distinctiveness Requirement:**
Even without the full skill file, make at least ONE distinctive choice:

- An unexpected color accent
- Asymmetric layout element
- Creative use of negative space
- Unique hover interaction
- Non-standard card treatment

### Check Optional Enhancements

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

## Step 3.5: Design Direction Preferences

After gathering layout details, explicitly ask about design direction to ensure consistency across all future screen designs. Use AskUserQuestion with these predefined options:

### Question 1: Aesthetic Tone

**"What aesthetic tone should [Product Name] have?"**

Options (present as predefined choices):

- **Professional** — Clean, corporate, trustworthy. Muted colors, clear hierarchy, no-nonsense typography.
- **Modern** — Bold, contemporary, cutting-edge. High contrast, strong typography, energetic feel.
- **Minimal** — Simple, focused, uncluttered. Maximum whitespace, essential elements only, subtle.
- **Playful** — Friendly, approachable, colorful. Rounded corners, warm colors, inviting.
- **Technical** — Data-dense, utility-focused. Compact layouts, monospace accents, efficient.

### Question 2: Animation Style

**"How much animation should the interface have?"**

Options:

- **None** — Instant transitions, no motion. Focus on speed and simplicity.
- **Subtle** — Fade and slight slide effects (150-200ms). Professional but alive.
- **Standard** — Smooth transitions, micro-interactions (200-300ms). Modern feel.
- **Rich** — Engaging animations, delight moments. Memorable and expressive.

### Question 3: Information Density

**"How dense should the information be?"**

Options:

- **Compact** — Dense layouts, minimal spacing. Power-user focused, more on screen.
- **Comfortable** — Balanced spacing. Works for most users and use cases.
- **Spacious** — Generous whitespace. Focused, easy to scan, luxurious feel.

### Question 4: Responsive Priority

**"Which screen size is most important?"**

Options:

- **Desktop-first** — Optimize for large screens, adapt down for mobile.
- **Mobile-first** — Optimize for mobile, enhance for larger screens.
- **Balanced** — Equal effort on all breakpoints. Best for diverse user base.

### Record the Choices

Store the user's answers for use in Step 6.5 (Design Direction Document):

```
DESIGN_DIRECTION:
  aesthetic_tone: [user's choice]
  animation_style: [user's choice]
  density: [user's choice]
  responsive_priority: [user's choice]
```

These choices will be documented in `product/design-system/design-direction.md` and read by `/design-screen` for consistency.

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

## Step 5: Apply Design Guidance

Before creating the shell specification and components, apply the design guidance (validated in Step 1) to ensure the shell has distinctive, production-grade aesthetics.

**If the skill file was validated in Step 1, read it now:** `.claude/skills/frontend-design/SKILL.md`

Apply the following guidance:

- Creating distinctive UI that avoids generic "AI slop" aesthetics
- Choosing bold design directions and unexpected layouts
- Applying thoughtful typography and color choices
- Using motion and transitions effectively

**If user chose to continue without the skill file in Step 1**, use the fallback design principles noted earlier.

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
  echo "Error: product/shell/ - Directory creation failed. Check write permissions."
  exit 1
fi
if [ ! -d "src/shell/components" ]; then
  echo "Error: src/shell/components/ - Directory creation failed. Check write permissions."
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
```

### Extended Shell Sections

The shell spec supports additional sections for enhanced functionality:

| Section               | Purpose                                             | Required |
| --------------------- | --------------------------------------------------- | -------- |
| `## Context Selector` | Organization/client/workspace picker                | No       |
| `## Breadcrumbs`      | Navigation hierarchy paths                          | No       |
| `## Header Actions`   | Header action buttons (notifications, search, help) | No       |

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

## Step 7: Create Shell Components

Create the shell components at `src/shell/components/`:

### AppShell.tsx

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

  // Callbacks
  onNavigate?: (href: string) => void;
  onLogout?: () => void;
}
```

### Props Passthrough Pattern

AppShell receives ALL props from the shell spec automatically via the passthrough pattern:

1. `getShellProps()` in `shell-loader.ts` parses all sections from `product/shell/spec.md`
2. `ScreenDesignPage.tsx` spreads these props to AppShell: `<AppShell {...shellProps}>`
3. When you add new features to AppShell:
   - Add the prop to `AppShellProps` interface
   - Add the section to shell spec template (Step 6)
   - Add a parser in `getShellProps()` (shell-loader.ts)
   - ScreenDesignPage passes it automatically — no changes needed there

**This means:** If you define a `## Context Selector` section in your shell spec, AppShell will receive it as the `contextSelector` prop automatically. Same for `breadcrumbs`, `headerActions`, and any future props.

### MainNav.tsx

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

### Navigation Href Format

Navigation item `href` values must follow this pattern to ensure compatibility with the application routing:

| Route Type    | Format                                         | Example                                                    |
| ------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| Section page  | `/sections/[section-id]`                       | `/sections/invoice-management`                             |
| Screen design | `/sections/[section-id]/screen-designs/[name]` | `/sections/invoice-management/screen-designs/invoice-list` |
| Static pages  | `/[page-name]`                                 | `/settings`, `/help`                                       |

**Important:**

- Section IDs must match the directory names in `src/sections/`
- The `href` values are used by both Design OS preview and the exported shell
- When exporting, these routes should be updated to match your application's actual routing structure

**Example navigation items:**

```tsx
const navigationItems = [
  { label: "Dashboard", href: "/sections/dashboard", isActive: true },
  { label: "Invoices", href: "/sections/invoice-management" },
  { label: "Reports", href: "/sections/reports-and-analytics" },
  { label: "Settings", href: "/settings" },
];
```

### UserMenu.tsx

The user menu with avatar and dropdown.

```tsx
interface UserMenuProps {
  user?: {
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  onLogout?: () => void;
  onSettings?: () => void;
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
import { AppShell } from "./components/AppShell";

export default function ShellPreview() {
  // Navigation items use REAL section names from the product roadmap
  // Replace these with actual section titles and IDs from product-roadmap.md
  const navigationItems = [
    { label: "Dashboard", href: "/sections/dashboard", isActive: true },
    { label: "Invoices", href: "/sections/invoice-management" },
    { label: "Reports", href: "/sections/reports-and-analytics" },
  ];

  // User menu uses placeholder data — not from sections
  const user = {
    name: "Alex Morgan",
    email: "alex@example.com",
    avatarUrl: undefined,
  };

  return (
    <AppShell
      navigationItems={navigationItems}
      user={user}
      onNavigate={(href) => console.log("Navigate to:", href)}
      onLogout={() => console.log("Logout")}
    >
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Content Area</h1>
        <p className="text-stone-600 dark:text-stone-400">
          Section content will render here.
        </p>
      </div>
    </AppShell>
  );
}
```

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

**Important:** When creating ShellPreview.tsx, replace the example navigation items above with the ACTUAL section titles and IDs from the user's `product/product-roadmap.md`. The section IDs should follow the standard transformation rules (lowercase, hyphens instead of spaces).

**Extracting Section IDs from Roadmap:**

Use this script to generate navigation items from `product/product-roadmap.md`:

```bash
# Extract sections and generate navigation items
if [ -f "product/product-roadmap.md" ]; then
  echo "// Navigation items extracted from product-roadmap.md"
  echo "const navigationItems = ["

  # Extract section titles (### N. Title format)
  grep -E "^### [0-9]+\." product/product-roadmap.md | \
    sed 's/^### [0-9]*\. //' | \
    while read title; do
      # Apply section ID transformation rules from agents.md
      id=$(echo "$title" | \
        tr '[:upper:]' '[:lower:]' | \
        sed 's/&/-and-/g' | \
        tr ' ' '-' | \
        tr -cd '[:alnum:]-' | \
        sed 's/^-//' | \
        sed 's/-$//')
      echo "  { label: '$title', href: '/sections/$id' },"
    done

  echo "]"
else
  echo "// product-roadmap.md not found - using placeholders"
fi
```

**Important:**

- **Navigation items** should use the REAL section names from `product/product-roadmap.md` (or placeholders if none exist)
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

**Example Shell Styling (replace `[primary]` and `[neutral]` with your token colors):**

```tsx
// Sidebar - use neutral palette from design tokens
<aside className="bg-white dark:bg-[neutral]-900 border-r border-[neutral]-200 dark:border-[neutral]-800">

// Active nav item - use primary palette from design tokens
<a className="bg-[primary]-50 dark:bg-[primary]-950 text-[primary]-700 dark:text-[primary]-400">

// Inactive nav item - use neutral palette
<a className="text-[neutral]-600 dark:text-[neutral]-400 hover:bg-[neutral]-100 dark:hover:bg-[neutral]-800">

// User avatar - use neutral palette
<div className="bg-[neutral]-200 dark:bg-[neutral]-700 text-[neutral]-700 dark:text-[neutral]-200">
```

**Note:** Replace `[primary]` with your primary color from `colors.json` (e.g., `lime`, `blue`, `indigo`) and `[neutral]` with your neutral color (e.g., `stone`, `slate`, `gray`).

## Step 10: Confirm Completion

Let the user know:

"I've designed the application shell for **[Product Name]**:

**Created files:**

- `/product/shell/spec.md` — Shell specification
- `/product/design-system/design-direction.md` — Design direction for consistency
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
