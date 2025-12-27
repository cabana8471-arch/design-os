# Shape Section

You are helping the user define the specification for a section of their product. This is a conversational process to establish the scope of functionality, user flows, and UI requirements.

## Step 1: Check Prerequisites

First, verify that `/product/product-roadmap.md` exists. If it doesn't:

```
Missing: product/product-roadmap.md. Run /product-roadmap to create it.
```

Stop here if the roadmap doesn't exist.

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
5. Cannot start or end with hyphen
6. Maximum 50 characters

**Examples:**
- "Invoice Management" → `invoice-management`
- "Reports & Analytics" → `reports-and-analytics`
- "User Settings" → `user-settings`

**Edge Case Examples:**
- "ABC" → `abc` (all-caps abbreviations become lowercase)
- "  Spaces  Around  " → `spaces-around` (multiple spaces collapse to single hyphens, trimmed)
- "&Invoices & Reports" → `invoices-and-reports` (leading `&` removed, internal `&` becomes `-and-`)
- "Q&A Forum" → `q-and-a-forum` (single letters preserved around `&`)
- "Reports..." → `reports` (trailing punctuation removed)
- "100% Complete" → `100-complete` (special chars removed, numbers preserved)

**Validate against roadmap:**

```bash
# Extract section titles from roadmap
section_titles=$(grep -E '^### [0-9]+\.' product/product-roadmap.md | sed 's/### [0-9]*\. //')

# Generate expected IDs and compare with selected section
```

**If section title doesn't match any roadmap section:**

```
Error: The section "[selected-title]" doesn't match any section in product-roadmap.md.

Existing roadmap sections:
- [section-1-title]
- [section-2-title]

Did you mean one of these?
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
- "Update existing spec" — Preserve existing content, modify specific sections
- "Start fresh" — Replace the existing spec entirely
- "View current spec" — Read and display the current specification first

**If user chooses "Update existing spec":**
- Read the current spec.md
- Ask which parts they want to modify
- Update only those sections, preserving the rest

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

## Step 5: Ask About Shell Configuration

Check if a shell design has been created for this project by checking for all shell files:

**Check for existing shell (comprehensive check):**

A complete shell consists of three parts:
1. `product/shell/spec.md` — Shell specification (design decisions)
2. `src/shell/components/AppShell.tsx` — Main shell component
3. `src/shell/ShellPreview.tsx` — Preview wrapper

**Determine shell status:**

```bash
# Check all three shell files
SPEC_EXISTS=$([ -f "product/shell/spec.md" ] && echo "yes" || echo "no")
SHELL_EXISTS=$([ -f "src/shell/components/AppShell.tsx" ] && echo "yes" || echo "no")
PREVIEW_EXISTS=$([ -f "src/shell/ShellPreview.tsx" ] && echo "yes" || echo "no")
```

| Spec | Components | Preview | Status | Message |
|------|------------|---------|--------|---------|
| yes | yes | yes | Complete | "Your application shell is fully designed and ready to use." |
| yes | yes | no | Missing preview | "Shell spec and components exist but preview is missing. Run `/design-shell` to regenerate." |
| yes | no | yes | Orphaned preview | "Spec and preview exist but main component is missing. Run `/design-shell` to regenerate." |
| yes | no | no | Spec only | "A shell spec exists but components haven't been generated yet. Run `/design-shell` to complete." |
| no | yes | yes | Components only | "Shell components exist but no specification. You can: (1) Continue using existing components, or (2) Run `/design-shell` to regenerate with a documented specification." |
| no | yes | no | Partial components | "AppShell.tsx exists but preview and spec are missing. Run `/design-shell` to create a complete shell." |
| no | no | yes | Orphaned preview | "ShellPreview.tsx exists alone — an unusual state. Run `/design-shell` to create a proper shell." |
| no | no | no | No shell | "No shell has been designed yet. You can still choose 'Inside app shell' — design it later with `/design-shell`." |

**Forward Path for "Components only" state:**

When shell components exist without a spec, the user has two valid options:
1. **Continue as-is** — The shell will work without a spec. However, design decisions aren't documented.
2. **Run `/design-shell`** — This will:
   - Create `product/shell/spec.md` documenting the shell design
   - Optionally regenerate components if the user wants changes
   - Create `src/shell/ShellPreview.tsx` for viewing the shell

If the user is satisfied with the existing components, they can proceed without running `/design-shell`. The spec is optional for functionality but recommended for documentation.

**Report shell status to user:**

Based on the table above, report the appropriate message. The most common states are:
- **Complete** (yes/yes/yes) — Ideal state, shell is ready
- **No shell** (no/no/no) — Normal for new projects, shell can be designed later
- **Spec only** (yes/no/no) — Spec was written but `/design-shell` wasn't completed
- **Components only** (no/yes/yes) — Components were created manually or spec was deleted

If shell components exist but spec.md doesn't exist, inform the user:
```
Note: Shell components exist but the specification is missing. The shell will still work, but consider running /design-shell to document the design decisions.
```

If no shell files exist at all, inform the user before asking:
```
Note: No shell has been designed yet. You can still choose 'Inside app shell' — the shell can be designed later with /design-shell.
```

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

**Display:** [Inside app shell / Standalone]

Does this capture everything? Would you like to adjust anything?"

### Handling Multiple Views

If the section requires multiple views (e.g., list + detail, or dashboard + settings):

1. **List each view explicitly** in the draft and final spec
2. **Describe the purpose** of each view briefly
3. **Note transitions** between views (e.g., "Clicking an item opens the detail view")

This ensures `/design-screen` and `/sample-data` commands know to create components and data for each view.

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

**4. `/screenshot-design`** — See: `.claude/commands/design-os/screenshot-design.md`
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
  echo "Error: Failed to create directory product/sections/[section-id]."
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

## Configuration
- shell: [true/false]
```

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

| Views in Spec | Screen Design Files Expected |
|---------------|------------------------------|
| 0 (single view) | 1 file: `[SectionId]View.tsx` |
| 2+ views | N files: `[View1Name].tsx`, `[View2Name].tsx`, etc. |

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
