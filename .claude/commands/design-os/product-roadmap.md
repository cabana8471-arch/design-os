<!-- v1.0.0 -->

# Product Roadmap

You are helping the user create or update their product roadmap for Design OS. This command serves two purposes:

1. **Create** an initial roadmap if one doesn't exist
2. **Sync** changes if the user has manually edited the markdown files

## Step 0: Validate Product Context

**MANDATORY:** Check for `product/product-context.md` before proceeding.

```bash
CONTEXT_FILE="product/product-context.md"

if [ ! -f "$CONTEXT_FILE" ]; then
  echo "Error: product-context.md - File not found. Run /product-interview first."
  exit 1
fi

# Parse completeness
COMPLETENESS=$(grep "^Completeness:" "$CONTEXT_FILE" | grep -oE '[0-9]+' | head -1)
if [ -z "$COMPLETENESS" ]; then
  COMPLETENESS=0
fi

echo "Product context found: ${COMPLETENESS}% complete"
```

**Behavior based on completeness:**

| Completeness | Action                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------- |
| 0% (missing) | ERROR: Stop and ask user to run `/product-interview`                                         |
| 1-49%        | WARNING: "Context is ${COMPLETENESS}% complete. Continue or run `/product-interview` first?" |
| 50%+         | PROCEED: Load context and continue to Step 1                                                 |

> **Tip:** Use `/product-interview --minimal` for quick start (6 categories, ~20 min), `/product-interview --audit` to check progress, or `/product-interview --stage=vision` to complete specific categories.

**If proceeding, load relevant context:**

From `product-context.md`, extract and use:

- Section 1 (Foundation): Business model, success metrics
- Section 8 (Performance): Data scale expectations

---

## Step 1: Check Current State

First, check if `/product/product-roadmap.md` exists and read `/product/product-overview.md` if it exists.

---

## Step 1.5: Read Product Scope

Before generating section suggestions, read the product scope from `product-overview.md`:

```bash
SCOPE=$(grep -oP '(?<=\*\*Scope:\*\* )\w+' product/product-overview.md 2>/dev/null || echo "Standard")
echo "Product scope: $SCOPE"
```

**Adjust section suggestions based on scope:**

| Scope      | Section Count | Complexity Guidance                                                    |
| ---------- | ------------- | ---------------------------------------------------------------------- |
| MVP        | 2-3 sections  | Core features only. Focus on the primary user flow.                    |
| Standard   | 3-5 sections  | Full feature set for primary use cases. Cover main user flows.         |
| Enterprise | 5-7 sections  | Comprehensive features including admin panels, analytics, integrations |

**How scope affects suggestions:**

- **MVP:** Prioritize ruthlessly. Suggest only the essential 2-3 sections that deliver core value. Avoid "nice to have" sections.
- **Standard:** Suggest a balanced set of 3-5 sections covering primary features and common secondary features.
- **Enterprise:** Include additional sections for admin dashboards, advanced analytics, user management, integrations, and audit logs.

**Report to user:**

```
Product scope: [SCOPE]

Based on this scope, I'll suggest [N] sections focused on [scope description].
```

---

## If No Roadmap Exists (Creating New)

### Analyze the Product Overview

Read the product overview and analyze:

- The core description
- The problems being solved
- The key features listed

### Propose Sections

Based on your analysis, propose 3-5 sections that represent:

- **Navigation items** - main areas of the product UI
- **Roadmap phases** - logical order for building
- **Self-contained feature areas** - each can be designed and built independently

Present your proposal:

"Based on your product overview, I'd suggest breaking this into these sections:

1. **[Section Title]** - [One sentence description]
2. **[Section Title]** - [One sentence description]
3. **[Section Title]** - [One sentence description]

These are ordered by importance and logical development sequence. The first section would be the core functionality, with each subsequent section building on it."

Then use the AskUserQuestion tool to ask the user: "Does this breakdown make sense? Would you like to adjust any sections or their order?"

### Refine with User

Iterate on the sections based on user feedback. Ask clarifying questions:

- "Should [feature X] be its own section or part of [Section Y]?"
- "What would you consider the most critical section to build first?"
- "Are there any major areas I'm missing?"

### Create the File

First, ensure the directory exists:

```bash
mkdir -p product
```

Then validate the directory was created:

```bash
if [ ! -d "product" ]; then
  echo "Error: product/ - Directory creation failed. Check write permissions."
  exit 1
fi
```

Then create `/product/product-roadmap.md` with this exact format:

```markdown
# Product Roadmap

## Sections

### 1. [Section Title]

[One sentence description]

### 2. [Section Title]

[One sentence description]

### 3. [Section Title]

[One sentence description]
```

### Confirm

"I've created your product roadmap at `/product/product-roadmap.md`. The homepage now shows your [N] sections:

1. **[Section 1]** — [Description]
2. **[Section 2]** — [Description]
3. **[Section 3]** — [Description]

**Next step:** Run `/data-model` to define the core entities and relationships in your product. After that, run `/design-tokens` to choose your color palette and typography. This establishes a shared vocabulary and consistent styling that keeps your sections aligned."

---

## If Roadmap Already Exists (Syncing)

### Read Current Files

Read both:

- `/product/product-overview.md`
- `/product/product-roadmap.md`

### Report Current State

"I see you already have a product roadmap defined with [N] sections:

1. [Section 1 Title]
2. [Section 2 Title]
   ...

What would you like to do?

- **Update sections** - Add, remove, or reorder sections
- **Sync from files** - I'll re-read the markdown files and confirm everything is in sync
- **Start fresh** - Regenerate the roadmap based on the current product overview"

### Handle User Choice

**If updating sections:**
Ask what changes they want to make, then update the file accordingly.

**If syncing:**
Confirm the current state matches what's in the files. If the user has manually edited the `.md` files, let them know the app will pick up those changes on next build/refresh.

**If starting fresh:**

⚠️ **Warning: This will overwrite manual edits**

Before proceeding, warn the user:

"Starting fresh will **replace your existing roadmap file**. If you've made manual edits to `/product/product-roadmap.md`, those changes will be lost.

Are you sure you want to regenerate the roadmap from scratch?"

Use AskUserQuestion with options:

- "Yes, replace it" - Proceed with regeneration
- "No, keep my edits" - Cancel and return to the sync options

If they confirm, follow the "Creating New" flow above but explicitly note you're replacing the existing file.

---

## Important Notes

### Manual Edit Protection

When users manually edit `/product/product-roadmap.md`:

- The "Update sections" and "Sync from files" options preserve their changes
- The "Start fresh" option will overwrite all manual edits — always confirm before proceeding
- If a user has associated section specs, sample data, or screen designs that depend on current section names, changing the roadmap may orphan those files

**How manual edits are detected:**

| Method         | When to Use                                   | Command                                                                 |
| -------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| Git diff       | File is tracked in git                        | `git diff product/product-roadmap.md`                                   |
| File timestamp | Compare against last command run              | `stat -f %m product/product-roadmap.md` (macOS) or `stat -c %Y` (Linux) |
| Content hash   | Store hash after command, compare on next run | `md5 -q product/product-roadmap.md` (macOS) or `md5sum` (Linux)         |

> **Note:** Design OS commands use git diff when available (most common case). If the file shows uncommitted changes that weren't made by the current command, those are manual edits.

### Handling Orphaned Files

When sections are renamed or removed from the roadmap, previously created files may become "orphaned" — they exist on disk but are no longer referenced by the roadmap.

**Agent Responsibilities (Mandatory vs. Requires Consent):**

| Action                                  | Mandatory?           | Notes                                        |
| --------------------------------------- | -------------------- | -------------------------------------------- |
| Check for orphans after roadmap change  | **MANDATORY**        | Always run detection script automatically    |
| Report orphans to user                  | **MANDATORY**        | Present findings with AskUserQuestion        |
| Execute cleanup (delete/rename/archive) | **REQUIRES CONSENT** | Never execute without explicit user approval |

**Who is responsible:** The agent executing this command MUST check for orphans after any roadmap modification and present options to the user. Detection is automatic and NOT optional; cleanup execution requires explicit user consent.

**1. After any roadmap change, automatically identify orphaned files:**

```bash
# First, check if section directories exist (fresh project may not have them yet)
if [ ! -d "product/sections" ] && [ ! -d "src/sections" ]; then
  echo "No section directories exist yet. Skipping orphan detection."
  # This is expected for fresh projects - no orphans possible
  exit 0
fi

# Extract section titles from roadmap and convert to section-id format
# Pipeline explanation:
#   1. grep: Find lines like "### 1. Section Title"
#   2. sed: Remove the "### N. " prefix, leaving just "Section Title"
#   3. tr: Convert to lowercase -> "section title"
#   4. sed: Replace spaces with hyphens -> "section-title"
#   5. sed: Replace "&" with "-and-" -> "reports-and-analytics"
ROADMAP_SECTIONS=$(grep -E "^### [0-9]+\." product/product-roadmap.md | sed 's/### [0-9]*\. //' | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/&/-and-/g')

# List actual section directories (just the folder names, not full paths)
# Using 2>/dev/null to handle case where directory exists but is empty
PRODUCT_SECTIONS=$(ls -d product/sections/*/ 2>/dev/null | xargs -n1 basename)
SRC_SECTIONS=$(ls -d src/sections/*/ 2>/dev/null | xargs -n1 basename)

# Find orphans (directories that exist but aren't in roadmap)
# An orphan is a section directory that has no matching entry in ROADMAP_SECTIONS
echo "Checking for orphaned sections..."

ORPHANS=""

# Check product/sections/
for section in $PRODUCT_SECTIONS; do
  if ! echo "$ROADMAP_SECTIONS" | grep -qx "$section"; then
    ORPHANS="$ORPHANS product/sections/$section"
  fi
done

# Check src/sections/ (may have components without product spec)
for section in $SRC_SECTIONS; do
  if ! echo "$ROADMAP_SECTIONS" | grep -qx "$section"; then
    # Only add if not already in list
    if ! echo "$ORPHANS" | grep -q "src/sections/$section"; then
      ORPHANS="$ORPHANS src/sections/$section"
    fi
  fi
done

if [ -z "$ORPHANS" ]; then
  echo "No orphaned sections found."
else
  echo "Orphaned sections:$ORPHANS"
fi
```

**1b. If orphans are detected, ask the user how to handle them:**

Use the AskUserQuestion tool with the following options:

```
I found orphaned section(s) that are no longer in the roadmap:
- [orphan-section-1] (has spec.md, data.json, screen designs)
- [orphan-section-2] (has spec.md only)

How would you like to handle these?
```

Options:

- "Delete them" — Permanently remove orphaned directories
- "Archive them" — Move to `_archive/` folder for safekeeping
- "Keep them" — Leave as-is (they won't appear in navigation)
- "Rename to match" — I made a typo, let me specify the correct section name

**If user chooses "Rename to match":**
Ask for the mapping: "Which roadmap section should `[orphan-name]` be renamed to?"

> **Note:** The shell commands below are provided for **user reference**. If the user confirms they want to proceed with file operations (delete, rename, archive), execute the commands with their explicit approval. Never execute destructive commands (`rm -rf`, `mv`) without user confirmation.

> **Version Control:** Before deleting or renaming sections, ensure your changes are committed to git. Run `git status` to verify your current state. This allows you to recover deleted files using `git checkout -- <path>` if needed.

**User Choice to Command Mapping:**

| User Choice       | Operation          | Bash Commands                                                               |
| ----------------- | ------------------ | --------------------------------------------------------------------------- |
| "Delete them"     | Permanent removal  | `rm -rf product/sections/[section-id]` + `rm -rf src/sections/[section-id]` |
| "Archive them"    | Move to \_archive/ | `mkdir -p _archive && mv product/sections/[section-id] _archive/`           |
| "Keep them"       | No action          | None — directories remain but won't appear in navigation                    |
| "Rename to match" | Rename directories | `mv product/sections/[old-id] product/sections/[new-id]`                    |

**2. For renamed sections:**

- **Rename directories** to match the new section ID:
  ```bash
  mv product/sections/old-name product/sections/new-name
  mv src/sections/old-name src/sections/new-name
  ```
- **Update internal references** in `spec.md`, `types.ts`, and component imports

**3. For removed sections:**

- **Delete the directories** if the section is permanently removed:
  ```bash
  rm -rf product/sections/removed-section
  rm -rf src/sections/removed-section
  ```
- **Archive instead** if you might restore it later:
  ```bash
  mkdir -p _archive
  mv product/sections/removed-section _archive/
  mv src/sections/removed-section _archive/
  ```

**4. Validate section IDs conform to rules:**

After renaming or cleaning up sections, verify all section IDs follow the generation rules:

```bash
# For each remaining section directory, verify the ID conforms to rules
for dir in product/sections/*/; do
  section_id=$(basename "$dir")
  # Check: lowercase, no spaces, no special chars except hyphens, doesn't start/end with hyphen
  if [[ ! "$section_id" =~ ^[a-z][a-z0-9-]*[a-z0-9]$ ]] || [[ ${#section_id} -gt 50 ]]; then
    echo "Warning: Section ID '$section_id' may not conform to naming rules"
  fi
done
```

**Section ID Rules (Reference):**

1. Lowercase only
2. Hyphens instead of spaces
3. "&" replaced with "-and-"
4. No special characters except hyphens
5. Cannot start or end with hyphen
6. Maximum 50 characters

**5. Verify cleanup:**

- Run the dev server and check the homepage shows only current sections
- Ensure no broken navigation links exist

**Warning:** Always backup before bulk deletions. Use `git status` to review changes before committing.

### General Notes

- Sections should be ordered by development priority
- Each section should be self-contained enough to design and build independently
- Section titles become navigation items in the app
- The numbered format (`### 1. Title`) is required for parsing
- Keep descriptions to one sentence - concise and clear
- Don't create too many sections (3-5 is ideal)

---

## Completion Confirmation

After successfully creating or updating the roadmap, confirm completion with a summary:

```
Roadmap [created/updated] successfully!

Sections defined:
1. [Section 1 Title] — [Brief description]
2. [Section 2 Title] — [Brief description]
3. [Section 3 Title] — [Brief description]
...

File: /product/product-roadmap.md

Next steps:
- Run `/data-model` to define core entities and relationships
- Run `/design-tokens` to choose colors and typography
- Run `/design-shell` to design the application navigation
- Then for each section: `/shape-section` → `/sample-data` → `/design-screen`
```

This confirmation helps users understand what was created and guides them to the next step in the Design OS workflow.
