# Shape Section

You are helping the user define the specification for a section of their product. This is a conversational process to establish the scope of functionality, user flows, and UI requirements.

## Step 1: Check Prerequisites

First, verify that both required files exist:

1. `/product/product-roadmap.md` — Required for section list
2. `/product/product-overview.md` — Required for scope detection (Step 1.5)

If either file is missing:

```
Error: product/product-roadmap.md - File not found. Run /product-roadmap to create it.
Error: product/product-overview.md - File not found. Run /product-vision to create it.
```

Stop here if any required file doesn't exist.

## Step 1.5: Load Product Context

Read `/product/product-overview.md` to understand the product context and scope.

### Extract Product Scope

Check if the product overview contains a scope indicator (set by `/product-vision`):

- Look for keywords like "MVP", "Standard", "Enterprise", or "Comprehensive" in the description or features
- If explicitly stated, record the scope level

**Scope Levels and Their Impact:**

| Scope          | Section Complexity | Feature Suggestions                              |
| -------------- | ------------------ | ------------------------------------------------ |
| **MVP**        | Core features only | Minimal views (1-2), essential actions           |
| **Standard**   | Full feature set   | Multiple views (2-4), common patterns            |
| **Enterprise** | Comprehensive      | All views, advanced features, admin capabilities |

**Apply Scope to Section Design:**

When the scope is MVP:

- Suggest simpler layouts (single view, basic list)
- Focus on core user flows only
- Recommend fewer UI patterns

When the scope is Standard:

- Suggest standard patterns (list + detail views)
- Include common features (filtering, search)
- Recommend moderate complexity

When the scope is Enterprise:

- Suggest comprehensive patterns (list + detail + forms + settings)
- Include advanced features (bulk operations, analytics, export)
- Recommend full feature set

**Display Context:**

Show the user what context was loaded:

```
Product Context Loaded:
- **Product:** [Product Name]
- **Scope:** [MVP/Standard/Enterprise or "Not specified"]
- **Description:** [First sentence of description]

I'll tailor the section specification to match this scope level.
```

## Step 2: Identify the Target Section

Read `/product/product-roadmap.md` to get the list of available sections.

If there's only one section, auto-select it. If there are multiple sections, use the AskUserQuestion tool to ask which section the user wants to work on:

"Which section would you like to define the specification for?"

Present the available sections as options.

### Validate Section ID

Once a section is selected, immediately generate and validate its section-id:

**Section ID Generation Rules:**

1. Convert to lowercase
2. Replace spaces with hyphens
3. Replace "&" with "-and-"
4. Remove special characters except hyphens
5. Remove diacritics (e.g., "Café" → "cafe", "Señor" → "senor")
6. Collapse consecutive hyphens to single hyphen
7. Cannot start or end with hyphen
8. Maximum 50 characters

**Examples:**

- "Invoice Management" → `invoice-management`
- "Reports & Analytics" → `reports-and-analytics`
- "User Settings" → `user-settings`

**Edge Case Examples:**

- "ABC" → `abc` (all-caps abbreviations become lowercase)
- " Spaces Around " → `spaces-around` (multiple spaces collapse to single hyphens, trimmed)
- "&Invoices & Reports" → `invoices-and-reports` (leading `&` removed, internal `&` becomes `-and-`)
- "Q&A Forum" → `q-and-a-forum` (single letters preserved around `&`)
- "Reports..." → `reports` (trailing punctuation removed)
- "100% Complete" → `100-complete` (special chars removed, numbers preserved)

> **See also:** `agents.md` → "Standardized Prerequisite Checks" → "Section ID Generation Rules" for the standardized specification used across all commands.

**Validate against roadmap:**

```bash
# Extract section titles from roadmap
section_titles=$(grep -E '^### [0-9]+\.' product/product-roadmap.md | sed 's/### [0-9]*\. //')

# Generate expected IDs and compare with selected section
```

**If section title doesn't match any roadmap section:**

```
Error: [selected-title] - Section not found in product-roadmap.md. Select from existing sections below.

Existing roadmap sections:
- [section-1-title]
- [section-2-title]
```

Use AskUserQuestion with options from existing roadmap sections.

This validation ensures we don't create orphaned specifications for non-existent sections.

### Check for Existing Specification

After validating the section ID, check if a spec already exists at `product/sections/[section-id]/spec.md`.

**If spec.md already exists:**

```
"A specification already exists for **[Section Title]** at `product/sections/[section-id]/spec.md`.

What would you like to do?"
```

Use AskUserQuestion with options:

- "Revise existing spec" — Use current spec as reference, regenerate with modifications
- "Start fresh" — Replace the existing spec entirely (ignores current content)
- "View current spec" — Read and display the current specification first

**If user chooses "Revise existing spec":**

- Read the current spec.md to understand existing structure
- Ask which aspects they want to change or improve
- Skip Step 3 (initial input) since existing spec provides context
- Jump directly to Step 3.5 (Feature Suggestions) or Step 4 (Questions) based on what needs to change
- Regenerate the full spec, incorporating requested changes
- Note: This replaces the file but uses existing content as context

**If user chooses "Start fresh":**

- Warn: "This will replace your existing specification. Any manual edits will be lost. Are you sure?"
- If confirmed, proceed with the normal flow starting from Step 3

**If user chooses "View current spec":**

- Display the current spec content
- Ask what they'd like to do next

This prevents accidental overwrites of carefully crafted specifications.

## Step 3: Gather Initial Input

Once the section is identified, invite the user to share any initial thoughts:

"Let's define the scope and requirements for **[Section Title]**.

Do you have any notes or ideas about what this section should include? Share any thoughts about the features, user flows, or UI patterns you're envisioning. If you're not sure yet, we can start with questions."

Wait for their response. The user may provide raw notes or ask to proceed with questions.

## Step 3.5: AI-Generated Feature Suggestions

> **Conditional Step:** This step runs after Step 3. If the user provided initial notes, use them to tailor suggestions. If the user chose "proceed with questions" without providing notes, generate generic section-type suggestions based on the roadmap description.

Generate feature suggestions based on:

1. **The section title and description** (from roadmap)
2. **The product scope** (from Step 1.5)
3. **The user's initial notes** (from Step 3, if provided)

### Generate Section-Specific Suggestions

Analyze the section type and generate relevant feature suggestions:

```
Based on **[Section Title]** and your [Product Scope] scope, here are features commonly found in similar sections:

**Core Features (essential for this section):**
- [ ] [Dynamically generated based on section type]
- [ ] [Dynamically generated]
- [ ] [Dynamically generated]

**Standard Features (recommended for most products):**
- [ ] [Dynamically generated]
- [ ] [Dynamically generated]

**Advanced Features (for comprehensive implementations):**
- [ ] [Dynamically generated]
- [ ] [Dynamically generated]

Which features are relevant for your **[Section Title]**? Select all that apply, or describe additional features.
```

### Example Suggestions by Section Type

| Section Type        | Core Features                      | Standard Features                | Advanced Features                 |
| ------------------- | ---------------------------------- | -------------------------------- | --------------------------------- |
| **List/Management** | View list, Add item, Delete item   | Filter, Search, Sort             | Bulk operations, Export, Import   |
| **Dashboard**       | Key metrics, Charts, Summary cards | Date range selection, Drill-down | Custom widgets, Real-time updates |
| **Settings**        | View settings, Edit settings, Save | Categories, Reset to defaults    | Audit log, Permissions            |
| **Detail View**     | View details, Edit, Delete         | Related items, History           | Versioning, Comments, Attachments |
| **Forms**           | Input fields, Validation, Submit   | Multi-step, Autosave             | Conditional fields, Templates     |
| **Reports**         | View reports, Basic filters        | Date ranges, Export PDF/CSV      | Scheduled reports, Custom queries |

### Scope-Aware Suggestions

Adjust suggestions based on the product scope (from Step 1.5):

| Scope          | Suggested Feature Set                |
| -------------- | ------------------------------------ |
| **MVP**        | Core features only — keep it minimal |
| **Standard**   | Core + Standard features             |
| **Enterprise** | Core + Standard + Advanced features  |

**Example for MVP scope:**

```
Since your product scope is **MVP**, I recommend focusing on just the core features:

- [ ] View [items] in a list
- [ ] Add new [item]
- [ ] View [item] details
- [ ] Delete [item]

We can always add more features later. Does this scope feel right?
```

**Example for Enterprise scope:**

```
Since your product scope is **Enterprise**, you may want the full feature set:

**Core:** View, Add, Edit, Delete [items]
**Standard:** Filter, Search, Sort, Export
**Advanced:** Bulk operations, Audit log, Role-based permissions

Which of these are priorities for this section?
```

### Record Feature Selections

Track which features the user selects for use in the spec:

```
SECTION_FEATURES:
  core: [list of selected core features]
  standard: [list of selected standard features]
  advanced: [list of selected advanced features]
```

This ensures the spec in Step 6/7 reflects the user's actual selections.

## Step 4: Ask Clarifying Questions

Use the AskUserQuestion tool to ask 4-6 targeted questions to define:

- **Main user actions/tasks** - What can users do in this section?
- **Information to display** - What data and content needs to be shown?
- **Key user flows** - What are the step-by-step interactions?
- **UI patterns** - Any specific interactions, layouts, or components needed?
- **Scope boundaries** - What should be explicitly excluded?

Example questions (adapt based on their input and the section):

- "What are the main actions a user can take in this section?"
- "What information needs to be displayed on the primary view?"
- "Walk me through the main user flow - what happens step by step?"
- "Are there any specific UI patterns you want to use (e.g., tables, cards, modals)?"
- "What's intentionally out of scope for this section?"
- "Are there multiple views needed (e.g., list view and detail view)?"

Ask questions one or two at a time, conversationally. Focus on user experience and interface requirements - no backend or database details.

### Step 4.5: Layout Pattern Preferences

After understanding the content requirements, explicitly ask about layout patterns for different screen sizes. Use AskUserQuestion with predefined options:

**Question 1: Desktop Layout Pattern**

"What layout pattern should the **desktop** version use?"

Options (present as predefined choices):

- **Table + Drawer** — Data table with columns; clicking a row opens a drawer with details. Best for: data-heavy lists, admin panels, records management.
- **Card Grid** — Visual cards arranged in a grid; each card shows key info with quick actions. Best for: visual content, portfolios, product catalogs.
- **Split View** — Master list on the left, detail panel on the right (always visible). Best for: email clients, messaging, content management.
- **Full-Page Detail** — List view navigates to a separate full-page detail view. Best for: complex details, document editing, workflows.

**Question 2: Mobile/Tablet Layout Pattern**

"What layout pattern should the **mobile and tablet** version use?"

Options (present as predefined choices):

- **Card Stack** — Vertical scrolling cards; tap a card to expand details or navigate. Best for: touch-friendly browsing, visual content.
- **Compact List** — Minimal list items showing essential info; tap for bottom sheet or page. Best for: data lists, efficient navigation.
- **Bottom Sheet** — List items open a swipe-up sheet with full details. Best for: quick preview, moderate detail depth.
- **Accordion** — List items expand inline to show details. Best for: FAQ-style content, simple details.

**Question 3: Responsive Behavior**

"How should the layouts relate to each other?"

Options:

- **Same pattern, adapted** — Use the same layout type, just scaled for screen size. Simpler code, consistent experience.
- **Different patterns** — Use the optimal pattern for each screen size (e.g., table on desktop, cards on mobile). Better UX, more work.
- **Mobile-first progressive** — Start with mobile layout, progressively enhance for larger screens. Best for mobile-dominant user base.

> **Viewport Reference:** Design OS uses standardized viewport dimensions for testing: Desktop (1280×800), Tablet (768×1024), Mobile (375×667). See agents.md → "Viewport Dimensions (Standardized)" for breakpoint details.

### Record Layout Choices

Store the user's answers for use in Step 6 (Draft) and Step 7 (Spec):

```
LAYOUT_PREFERENCES:
  desktop: [user's choice]
  mobile_tablet: [user's choice]
  responsive_behavior: [user's choice]
```

These choices will be documented in the spec.md and used by `/design-screen` when creating components.

### Step 4.6: Define View Relationships (If Multiple Views)

If the section has multiple views (identified in Step 4) AND uses a layout pattern that implies secondary views (Table + Drawer, Split View, etc.), ask the user to define view relationships.

**What are View Relationships?**

View relationships define how views connect to each other in the UI:

- Which callback in the primary view opens which secondary view
- What type of UI element the secondary view uses (drawer, modal, inline expansion)
- What data is passed (entity ID, full entity, or none)

**Detect Potential Relationships:**

Based on layout pattern and view names, identify potential relationships:

| Layout Pattern    | Likely Primary       | Likely Secondary     | Inferred Relationship                        |
| ----------------- | -------------------- | -------------------- | -------------------------------------------- |
| Table + Drawer    | `*ListView`, `*List` | `*Drawer`, `*Detail` | `onView -> SecondaryView (drawer, entityId)` |
| Split View        | `*ListView`, `*List` | `*Panel`, `*Detail`  | `onView -> SecondaryView (inline, entityId)` |
| Card Grid + Modal | `*GridView`, `*Grid` | `*Modal`, `*Form`    | `onView -> SecondaryView (modal, entityId)`  |

**Ask User to Confirm Relationships:**

If potential relationships are detected:

```
Your layout pattern (**[Desktop Pattern]**) suggests these view connections:

**[PrimaryView].onView → [SecondaryView]**
- Type: [drawer/modal/inline] (slides in from right / centered overlay / expands in place)
- Data: entityId (receives the clicked item's ID)

Is this correct?
```

Use AskUserQuestion with options:

- "Yes, wire these together" — Confirm the relationship
- "Modify the relationship" — Ask for specific callback/type/data
- "Skip wiring" — Callbacks will console.log in preview (legacy behavior)

**Relationship Types:**

| Type     | Description               | UI Component       | Best For                            |
| -------- | ------------------------- | ------------------ | ----------------------------------- |
| `drawer` | Panel slides in from side | `<Sheet>`          | Details, editing, contextual info   |
| `modal`  | Centered overlay dialog   | `<Dialog>`         | Forms, confirmations, focused tasks |
| `inline` | Expands within the list   | Conditional render | Quick preview, accordion-style      |

**Data References:**

| Reference  | Description                                          | When to Use                              |
| ---------- | ---------------------------------------------------- | ---------------------------------------- |
| `entityId` | Callback receives ID, secondary view looks up entity | Most common - keeps components decoupled |
| `entity`   | Full entity object passed directly                   | When entity is already loaded            |
| `none`     | No data passed                                       | Create forms, new item modals            |

**Multiple Relationships:**

A primary view can have multiple relationships (e.g., onView opens drawer, onCreate opens modal):

```
I see **AgentListView** has multiple actions that could open secondary views:

1. **onView** (click row to see details) → opens **AgentDetailDrawer** (drawer)
2. **onCreate** (create new agent) → opens **CreateAgentModal** (modal)

Should I wire both of these?
```

**Record Relationships:**

Store for use in Step 7 (Spec file):

```
VIEW_RELATIONSHIPS:
  - primary: AgentListView
    callback: onView
    secondary: AgentDetailDrawer
    type: drawer
    data: entityId
  - primary: AgentListView
    callback: onCreate
    secondary: CreateAgentModal
    type: modal
    data: none
```

**Skip if Not Applicable:**

If the section:

- Has only one view → Skip this step
- Uses "Full-Page Detail" layout → Skip (navigation-based, not relationship-based)
- User chose "Skip wiring" → Record `VIEW_RELATIONSHIPS: []`

## Step 5: Ask About Shell Configuration

Check if a shell design has been created for this project by checking for all shell files:

**Check for existing shell (comprehensive check):**

A complete shell consists of three parts:

1. `product/shell/spec.md` — Shell specification (design decisions) — **AUTHORITATIVE SOURCE**
2. `src/shell/components/AppShell.tsx` — Main shell component
3. `src/shell/ShellPreview.tsx` — Preview wrapper

> **Note:** The spec.md file is the authoritative source for shell design decisions. Components may exist without a spec (manually created), but for proper Design OS integration, the spec should always be present.

**Determine shell status:**

```bash
# Check all three shell files
SPEC_EXISTS=$([ -f "product/shell/spec.md" ] && echo "yes" || echo "no")
SHELL_EXISTS=$([ -f "src/shell/components/AppShell.tsx" ] && echo "yes" || echo "no")
PREVIEW_EXISTS=$([ -f "src/shell/ShellPreview.tsx" ] && echo "yes" || echo "no")

# Determine state and message
if [ "$SPEC_EXISTS" = "yes" ] && [ "$SHELL_EXISTS" = "yes" ] && [ "$PREVIEW_EXISTS" = "yes" ]; then
  STATUS="Complete"
  MESSAGE="Your application shell is fully designed and ready to use."
elif [ "$SPEC_EXISTS" = "yes" ] && [ "$SHELL_EXISTS" = "yes" ] && [ "$PREVIEW_EXISTS" = "no" ]; then
  STATUS="Missing preview"
  MESSAGE="Shell spec and components exist but preview is missing. Run /design-shell to regenerate."
elif [ "$SPEC_EXISTS" = "yes" ] && [ "$SHELL_EXISTS" = "no" ] && [ "$PREVIEW_EXISTS" = "yes" ]; then
  STATUS="Orphaned preview"
  MESSAGE="Spec and preview exist but main component is missing. Run /design-shell to regenerate."
elif [ "$SPEC_EXISTS" = "yes" ] && [ "$SHELL_EXISTS" = "no" ] && [ "$PREVIEW_EXISTS" = "no" ]; then
  STATUS="Spec only"
  MESSAGE="A shell spec exists but components haven't been generated yet. Run /design-shell to complete."
elif [ "$SPEC_EXISTS" = "no" ] && [ "$SHELL_EXISTS" = "yes" ] && [ "$PREVIEW_EXISTS" = "yes" ]; then
  STATUS="Components only"
  MESSAGE="Shell components exist but no specification. Continue using existing components, or run /design-shell to add documentation."
elif [ "$SPEC_EXISTS" = "no" ] && [ "$SHELL_EXISTS" = "yes" ] && [ "$PREVIEW_EXISTS" = "no" ]; then
  STATUS="Partial components"
  MESSAGE="AppShell.tsx exists but preview and spec are missing. Run /design-shell to create a complete shell."
elif [ "$SPEC_EXISTS" = "no" ] && [ "$SHELL_EXISTS" = "no" ] && [ "$PREVIEW_EXISTS" = "yes" ]; then
  STATUS="Orphaned preview"
  MESSAGE="ShellPreview.tsx exists alone — an unusual state. Run /design-shell to create a proper shell."
else
  STATUS="No shell"
  MESSAGE="No shell has been designed yet. You can still choose 'Inside app shell' — design it later with /design-shell."
fi

echo "Shell status: $STATUS"
echo "$MESSAGE"
```

| Spec | Components | Preview | Status             | Message                                                                                                                                                                   |
| ---- | ---------- | ------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| yes  | yes        | yes     | Complete           | "Your application shell is fully designed and ready to use."                                                                                                              |
| yes  | yes        | no      | Missing preview    | "Shell spec and components exist but preview is missing. Run `/design-shell` to regenerate."                                                                              |
| yes  | no         | yes     | Orphaned preview   | "Spec and preview exist but main component is missing. Run `/design-shell` to regenerate."                                                                                |
| yes  | no         | no      | Spec only          | "A shell spec exists but components haven't been generated yet. Run `/design-shell` to complete."                                                                         |
| no   | yes        | yes     | Components only    | "Shell components exist but no specification. You can: (1) Continue using existing components, or (2) Run `/design-shell` to regenerate with a documented specification." |
| no   | yes        | no      | Partial components | "AppShell.tsx exists but preview and spec are missing. Run `/design-shell` to create a complete shell."                                                                   |
| no   | no         | yes     | Orphaned preview   | "ShellPreview.tsx exists alone — an unusual state. Run `/design-shell` to create a proper shell."                                                                         |
| no   | no         | no      | No shell           | "No shell has been designed yet. You can still choose 'Inside app shell' — design it later with `/design-shell`."                                                         |

**Forward Path for "Components only" state:**

When shell components exist without a spec, the user has two valid options:

1. **Continue as-is** — The shell will work without a spec. However, design decisions aren't documented.
2. **Run `/design-shell`** — This will:
   - Create `product/shell/spec.md` documenting the shell design
   - Optionally regenerate components if the user wants changes
   - Create `src/shell/ShellPreview.tsx` for viewing the shell

If the user is satisfied with the existing components, they can proceed without running `/design-shell`. The spec is optional for functionality but recommended for documentation.

**Report shell status to user:**

Based on the detection table above, report the appropriate message for ALL 8 possible states:

| State                              | Message to User                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Complete** (yes/yes/yes)         | "Your application shell is fully designed and ready to use."                                                                                           |
| **Missing preview** (yes/yes/no)   | "Shell spec and components exist, but ShellPreview.tsx is missing. Run `/design-shell` to regenerate the preview wrapper."                             |
| **Orphaned preview** (yes/no/yes)  | "Spec and preview exist but AppShell.tsx is missing. Run `/design-shell` to regenerate the components."                                                |
| **Spec only** (yes/no/no)          | "A shell spec exists but components haven't been generated. Run `/design-shell` to complete the shell design."                                         |
| **Components only** (no/yes/yes)   | "Shell components exist but the specification is missing. The shell will work, but consider running `/design-shell` to document the design decisions." |
| **Partial components** (no/yes/no) | "AppShell.tsx exists but ShellPreview.tsx and spec are missing. Run `/design-shell` to create a complete shell."                                       |
| **Orphaned preview** (no/no/yes)   | "Only ShellPreview.tsx exists — this is an unusual state. Run `/design-shell` to create a proper shell with spec and components."                      |
| **No shell** (no/no/no)            | "No shell has been designed yet. You can still choose 'Inside app shell' — the shell can be designed later with `/design-shell`."                      |

**Use the appropriate message based on the detected state.** Most common states are Complete and No shell.

**Always ask the user about shell usage** to ensure they can override the default if needed:

"Should this section's screen designs be displayed **inside the app shell** (with navigation header), or should they be **standalone pages** (without the shell)?

**What is the app shell?** The app shell is the persistent navigation and layout that wraps your application — typically a sidebar or top navigation bar, user menu, and consistent header. You can design it later with `/design-shell`.

Most sections use the app shell, but some pages like public-facing views, landing pages, or embedded widgets should be standalone."

Use AskUserQuestion with options:

- "Inside app shell (Recommended)" - The default for most in-app sections
- "Standalone (no shell)" - For public pages, landing pages, or embeds

**Note:** Even if no shell design exists yet, the user should still make this choice:

- If they choose "Inside app shell", set `shell: true` — it will use the shell once it's designed later
- If they choose "Standalone", set `shell: false` — this is a deliberate design decision for public or embedded pages

This ensures the user explicitly chooses the display mode rather than inheriting a default they may not want.

## Step 6: Present Draft and Refine

Once you have enough information, present a draft specification:

"Based on our discussion, here's the specification for **[Section Title]**:

**Overview:**
[2-3 sentence summary of what this section does]

**User Flows:**

- [Flow 1]
- [Flow 2]
- [Flow 3]

**UI Requirements:**

- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

**Views:**
[If multiple views were discussed, list them explicitly:]

- [View 1] — [Brief description, e.g., "List view showing all items"]
- [View 2] — [Brief description, e.g., "Detail view for single item"]
- [View 3] — [Brief description, e.g., "Create/edit form modal"]

[If only one view, omit this section]

**Layout Patterns:**

- Desktop: [Table + Drawer / Card Grid / Split View / Full-Page Detail]
- Mobile/Tablet: [Card Stack / Compact List / Bottom Sheet / Accordion]
- Responsive: [Same pattern, adapted / Different patterns / Mobile-first progressive]

**Display:** [Inside app shell / Standalone]

Does this capture everything? Would you like to adjust anything?"

**Note:** When writing the final spec file (Step 7), transform the Display choice:

- "Inside app shell" → `shell: true`
- "Standalone" → `shell: false`

### Handling Multiple Views

If the section requires multiple views (e.g., list + detail, or dashboard + settings):

1. **List each view explicitly** in the draft and final spec
2. **Describe the purpose** of each view briefly
3. **Note transitions** between views (e.g., "Clicking an item opens the detail view")

This ensures `/design-screen` and `/sample-data` commands know to create components and data for each view.

### View Name Validation

**REQUIRED:** All view names MUST follow PascalCase naming convention. View names become React component filenames, so they must be valid identifiers.

**Valid view names:**

- `InvoiceListView` ✓
- `AgentDetailDrawer` ✓
- `CreateUserModal` ✓
- `DashboardOverview` ✓

**Invalid view names (BLOCK and require correction):**

- `invoice-list-view` ✗ (kebab-case not allowed)
- `invoiceListView` ✗ (camelCase not allowed — must start uppercase)
- `InvoiceList View` ✗ (spaces not allowed)
- `Invoice_List` ✗ (underscores not allowed)

**Validation Pattern:**

```bash
# View name must match: starts with uppercase, alphanumeric only
if [[ ! "$view_name" =~ ^[A-Z][a-zA-Z0-9]*$ ]]; then
  echo "Error: View name '$view_name' is invalid. Use PascalCase (e.g., InvoiceListView)."
  # STOP and ask user to provide corrected name
fi
```

If a view name is invalid, ask the user to provide a corrected PascalCase name before continuing.

### Multiple Views Workflow (Full Picture)

When a section has multiple views, here's how they flow through the Design OS commands:

**1. `/shape-section` (You are here)** — See: `.claude/commands/design-os/shape-section.md`

- Define all views in the Views section of the spec
- Specify which data each view needs
- Document transitions between views

**2. `/sample-data`** — See: `.claude/commands/design-os/sample-data.md` (Section "Multi-View Data Sharing")

- Creates a single `data.json` with data for ALL views
- Creates `types.ts` with Props interfaces for EACH view (e.g., `ListViewProps`, `DetailViewProps`)
- Props for each view receive only the data they need

**3. `/design-screen`** — See: `.claude/commands/design-os/design-screen.md` (Section "Multi-View Sections")

- Run once per view — the command will ask which view to create
- Each view becomes a separate component file
- All views share the same `types.ts` and can reference the same entities
- Preview wrappers are created for each view independently

**4. `/screenshot-design`** — See: `.claude/commands/design-os/screenshot-design.md` (Section "Step 3: Capture the Screenshot")

- Run once per view to capture screenshots
- Each screenshot is saved with the view name (e.g., `invoice-list.png`, `invoice-detail.png`)

**5. Shell navigation** — See: `.claude/commands/design-os/design-shell.md` (Section "Multi-View Navigation Routing")

- All views share the same shell (if `shell: true`)
- The shell shows the section name; view switching happens within the section
- Transitions use callbacks (e.g., `onView` opens detail view)

**6. Default View (Routing)**

- When navigating to `/sections/[section-id]`, the **first view listed in the spec** loads by default
- Other views can be accessed directly via `/sections/[section-id]/screen-designs/[view-name]`
- Order your views with the primary/list view first, followed by secondary views (detail, edit, etc.)

**Related Documentation:**

- [agents.md](../../agents.md) — Section "Command Quick Reference" shows file outputs per command
- [agents.md](../../agents.md) — Section "File Structure" shows where multi-view files are stored

Iterate until the user is satisfied. Don't add features that weren't discussed. Don't leave out features that were discussed.

## Step 7: Create the Spec File

Once the user approves:

### Create Directory

First, ensure the directory exists by creating it if needed:

```bash
mkdir -p product/sections/[section-id]
```

Then validate the directory was created:

```bash
if [ ! -d "product/sections/[section-id]" ]; then
  echo "Error: product/sections/[section-id]/ - Directory creation failed. Check write permissions."
  exit 1
fi
```

### Create the Specification File

Use the section-id validated in Step 2 to create the file at `product/sections/[section-id]/spec.md` with this exact format:

```markdown
# [Section Title] Specification

## Overview

[The finalized 2-3 sentence description]

## User Flows

- [Flow 1]
- [Flow 2]
- [Flow 3]
  [Add all flows discussed]

## UI Requirements

- [Requirement 1]
- [Requirement 2]
- [Requirement 3]
  [Add all requirements discussed]

## Views

[Only include this section if multiple views were discussed]

- [View 1] — [Brief description]
- [View 2] — [Brief description]

## Layout Patterns

[From Step 4.5 layout preferences]

- **Desktop:** [Table + Drawer / Card Grid / Split View / Full-Page Detail]
- **Mobile/Tablet:** [Card Stack / Compact List / Bottom Sheet / Accordion]
- **Responsive Behavior:** [Same pattern, adapted / Different patterns / Mobile-first progressive]

## View Relationships

[Only include this section if relationships were defined in Step 4.6]

- [PrimaryView].[callback] -> [SecondaryView] ([type], [dataRef])

Example:

- AgentListView.onView -> AgentDetailDrawer (drawer, entityId)
- AgentListView.onCreate -> CreateAgentModal (modal, none)

[If no relationships were defined, omit this section entirely]

## Configuration

- shell: [true/false]
```

### View Relationships Format

The `## View Relationships` section uses a specific format that `/design-screen` will parse:

```
- [PrimaryView].[callback] -> [SecondaryView] ([type], [dataRef])
```

**Components:**

- `PrimaryView` — The view that triggers the action (e.g., `AgentListView`)
- `callback` — The callback prop name (e.g., `onView`, `onCreate`, `onEdit`)
- `SecondaryView` — The view that opens (e.g., `AgentDetailDrawer`)
- `type` — UI type: `drawer`, `modal`, or `inline`
- `dataRef` — Data passing: `entityId`, `entity`, or `none`

**Note on dataRef:**
When `dataRef = entityId`, the primary view's callback receives just the ID (e.g., `onView(id: string)`). The **preview wrapper** created by `/design-screen` then looks up the full entity from sample data and passes it to the secondary view. The secondary view always receives the full entity object, not just the ID.

**Parsing Example:**

```
Input:  "- AgentListView.onView -> AgentDetailDrawer (drawer, entityId)"
Output: {
  primary: "AgentListView",
  callback: "onView",
  secondary: "AgentDetailDrawer",
  type: "drawer",
  dataRef: "entityId"
}
```

> **Note:** View Relationships are distinct from Shell Relationships:
>
> | Concept             | Scope            | Defined In       |
> | ------------------- | ---------------- | ---------------- |
> | View Relationships  | Within a section | `/shape-section` |
> | Shell Relationships | Global shell UI  | `/design-shell`  |
>
> View Relationships wire views within a section (e.g., list → detail drawer). Shell Relationships wire global shell elements (e.g., header action → notifications drawer).

**Important:**

- Set `shell: true` if the section should display inside the app shell (this is the default)
- Set `shell: false` if the section should display as a standalone page without the shell
- The section-id was already validated against the roadmap in Step 2

## Step 8: Confirm and Next Steps

Let the user know:

"I've created the specification at `product/sections/[section-id]/spec.md`.

You can review the spec on the section page. When you're ready, run `/sample-data` to create sample data for this section."

### Multi-View Section Reminder

If the spec includes multiple views, remind the user of the workflow:

**For single-view sections:**
No additional guidance needed.

**For multi-view sections (2+ views):**

```
This section has [N] views defined:
1. [View 1 Name] — [Description]
2. [View 2 Name] — [Description]
...

After running /sample-data, you'll need to run /design-screen [N] times — once for each view.
Each run will create a separate component file for that view.
```

This reminder helps users understand that multi-view sections require multiple `/design-screen` runs.

### View Count Tracking

The spec's `## Views` section defines how many screen design files will be created. Track this count:

| Views in Spec   | Screen Design Files Expected                        |
| --------------- | --------------------------------------------------- |
| 0 (single view) | 1 file: `[SectionId]View.tsx`                       |
| 2+ views        | N files: `[View1Name].tsx`, `[View2Name].tsx`, etc. |

When the user later runs `/design-screen`, the command will:

1. Read the spec to identify available views
2. Ask which view to design (if multiple)
3. Create the corresponding component file

After all views are designed, use `/screenshot-design` to capture each one.

## Important Notes

- Be conversational and helpful, not robotic
- Ask follow-up questions when answers are vague
- Focus on UX and UI - don't discuss backend, database, or API details
- Keep the spec concise - only include what was discussed, no bloat
- The format must match exactly for the app to parse it correctly
