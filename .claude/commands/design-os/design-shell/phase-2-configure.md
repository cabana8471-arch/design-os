<!-- v1.0.0 -->

# Phase 2: Design Configuration

This phase covers Steps 3-5: gathering design details, design direction preferences, shell interactive elements, presenting the specification, and applying design guidance.

---

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

## Step 3.6: Shell Interactive Elements

**NEW:** Ask the user what interactive elements they want in the shell. This determines which secondary components will be created.

```
What interactive elements would you like in the shell?

**Header Actions:**
□ Notifications drawer — Bell icon, shows recent notifications
□ Search modal (Command Palette) — Cmd+K, fuzzy search, shortcuts
□ Help panel — Documentation, keyboard shortcuts, support
□ Theme toggle — Light/dark/system mode switcher
□ [None] — No header actions beyond navigation

**User Menu:**
□ Profile modal — View and edit user profile
□ Settings modal — App preferences and configuration
□ Feedback modal — Send feedback or report issues
□ [None] — Basic user menu (logout only)

**Navigation:**
□ Mobile menu drawer — Hamburger menu for mobile screens
□ Nested navigation — Expandable sub-menus in sidebar
□ [None] — Simple single-level navigation

Select all that apply (selecting [None] in a category skips all options in that category):
```

Use AskUserQuestion with multiSelect: true for each category.

**Track Selected Elements:**

```
SELECTED_INTERACTIVE_ELEMENTS:
  header_actions: [notifications, search, help, theme_toggle]
  user_menu: [profile, settings, feedback]
  navigation: [mobile_menu, nested_nav]
```

**Map Elements to Components:**

| Element       | Component           | Type   | Data Ref      |
| ------------- | ------------------- | ------ | ------------- |
| notifications | NotificationsDrawer | drawer | notifications |
| search        | SearchModal         | modal  | none          |
| help          | HelpPanel           | drawer | helpTopics    |
| theme_toggle  | ThemeToggle         | inline | none          |
| profile       | ProfileModal        | modal  | user          |
| settings      | SettingsModal       | modal  | settings      |
| feedback      | FeedbackModal       | modal  | none          |
| mobile_menu   | MobileMenuDrawer    | drawer | none          |

**Important:** If user selects `theme_toggle`, mark for Step 9.5 (anti-flicker script injection).

## Step 4: Present Shell Specification

Once you understand their preferences:

"Here's the shell design for **[Product Name]**:

**Layout Pattern:** [Sidebar/Top Nav/Minimal]

**Navigation Structure:**

- [Nav Item 1] → [Section 1]
- [Nav Item 2] → [Section 2]
- [Nav Item 3] → [Section 3]
- [Additional items like Settings, Help]

**User Menu:**

- Location: [Top right / Bottom of sidebar]
- Contents: Avatar, user name, logout

**Interactive Elements:**

- Header: [Notifications, Search, Help, Theme Toggle]
- User Menu: [Profile, Settings, Feedback]
- Mobile: [Mobile Menu Drawer]

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

---

**Next:** Continue to Phase 3 (Steps 6-10) for creating the shell specification and components.
