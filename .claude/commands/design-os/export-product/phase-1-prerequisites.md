<!-- v1.0.0 -->

# Phase 1: Prerequisites (Steps 0-2)

This phase validates that all required files exist and gathers information needed for the export.

---

## Step 0: Validate Product Context

**MANDATORY:** Check for `product/product-context.md` before proceeding.

```bash
CONTEXT_FILE="product/product-context.md"

if [ ! -f "$CONTEXT_FILE" ]; then
  echo "Error: product-context.md - File not found. Run /product-interview first."
  exit 1
fi

COMPLETENESS=$(grep "^Completeness:" "$CONTEXT_FILE" | grep -oE '[0-9]+' | head -1)
echo "Product context completeness: ${COMPLETENESS}%"
```

| Completeness | Action                                                                            |
| ------------ | --------------------------------------------------------------------------------- |
| 0% (missing) | ERROR: "Run /product-interview first" — **END COMMAND**                           |
| 1-49%        | WARNING: "Context incomplete (X%). Exports may miss important details. Continue?" |
| 50%+         | PROCEED: Load context and continue to Step 1                                      |

From `product-context.md`, extract and use:

- Section 3 (Design Direction): Informs design system documentation
- Section 9 (Integration Points): Informs authentication setup in prompts
- Section 10 (Security & Compliance): Informs deployment documentation
- Section 12 (Testing & Quality): Informs test instructions

---

## Step 1: Check Prerequisites

Verify the minimum requirements exist:

**Required:**

- `/product/product-context.md` — Product context (validated in Step 0)
- `/product/product-overview.md` — Product overview
- `/product/product-roadmap.md` — Sections defined
- At least one section with screen designs in `src/sections/[section-id]/`

**Recommended (show warning if missing):**

- `/product/data-model/data-model.md` — Global data model
- `/product/design-system/colors.json` — Color tokens
- `/product/design-system/typography.json` — Typography tokens

**Shell Components (optional but recommended):**

Primary Components:

- `src/shell/components/AppShell.tsx` — Application shell wrapper
- `src/shell/components/MainNav.tsx` — Navigation component
- `src/shell/components/UserMenu.tsx` — User menu component
- `src/shell/components/index.ts` — Component exports

Secondary Components (optional - based on /design-shell Step 3.6 selections):

- `src/shell/components/NotificationsDrawer.tsx`
- `src/shell/components/SearchModal.tsx`
- `src/shell/components/ThemeToggle.tsx`
- `src/shell/components/SettingsModal.tsx`
- `src/shell/components/ProfileModal.tsx`
- `src/shell/components/HelpPanel.tsx`
- `src/shell/components/FeedbackModal.tsx`
- `src/shell/components/MobileMenuDrawer.tsx`

**Shell Prerequisite Check:**

Check if shell components exist before proceeding:

```bash
# Check for primary shell component
if [ ! -f "src/shell/components/AppShell.tsx" ]; then
  echo "Shell components not found"
  SHELL_EXISTS=false
else
  SHELL_EXISTS=true
  # Count all shell components (.tsx files only, excluding index files)
  SHELL_COMPONENT_COUNT=$(ls -1 src/shell/components/*.tsx 2>/dev/null | wc -l)
  echo "Found $SHELL_COMPONENT_COUNT shell component(s)"

  # List secondary components if any
  SECONDARY_COMPONENTS=$(ls -1 src/shell/components/*.tsx 2>/dev/null | grep -v -E "(AppShell|MainNav|UserMenu|index)" | xargs -I {} basename {} .tsx)
  if [ -n "$SECONDARY_COMPONENTS" ]; then
    echo "Secondary components: $SECONDARY_COMPONENTS"
  fi
fi
```

| Shell Status             | Action                                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| Shell components exist   | Include shell in export (Step 8-9 will validate and copy all components) |
| Shell components missing | Show warning, offer to proceed without shell                             |

**If shell is missing:**

```
Note: Shell components haven't been created yet at src/shell/components/.

You can:
1. Proceed without shell — The export will not include shell components
2. Stop and create shell first — Run /design-shell to create the application shell

Most products benefit from a shell for consistent navigation. However, if your product doesn't need a shell (e.g., single-page app, embedded widget), you can proceed without it.
```

Use AskUserQuestion with options:

- "Proceed without shell (Recommended if shell not needed)" — Continue export, skip shell steps
- "Stop — I'll create the shell first" — END COMMAND

**Set the INCLUDE_SHELL flag based on outcome:**

```bash
# If shell exists and user didn't choose to stop
if [ "$SHELL_EXISTS" = true ]; then
  INCLUDE_SHELL=true
else
  # User chose to proceed without shell
  INCLUDE_SHELL=false
fi
echo "INCLUDE_SHELL=$INCLUDE_SHELL"
```

This flag controls Steps 5, 6, 8, 9, 10.5, and 13 behavior regarding shell components.

### Check Optional Design Direction

Check if design direction exists (created by /design-shell Step 6.5):

```bash
if [ ! -f "product/design-system/design-direction.md" ]; then
  echo "Note: Design direction not found at product/design-system/design-direction.md"
  echo "Exports will use default design guidance. For consistent branding, run /design-shell first."
  DESIGN_DIRECTION_EXISTS=false
else
  DESIGN_DIRECTION_EXISTS=true
  echo "Design direction found"
fi
```

| Design Direction Status | Action                                                           |
| ----------------------- | ---------------------------------------------------------------- |
| File exists             | Include in export (copy to product-plan/design-system/)          |
| File missing            | Show note (informational only), proceed without design direction |

> **Note:** This is informational only. Unlike shell components, missing design direction does not require user confirmation to proceed.

**If any required file is missing:**

Output error message:

```
Error: Prerequisites - Missing required files for export.

Required:
- product/product-overview.md (run /product-vision)
- product/product-roadmap.md (run /product-roadmap)
- At least one section with screen designs in src/sections/

Complete these prerequisites before running /export-product.
```

**END COMMAND** — Do not proceed to Step 2. The export cannot continue without these files.

### Validate Template Files Exist (Boilerplate Integrity Check)

Before proceeding, verify all 12 required template files exist. If any are missing, STOP and report.

> **What this validates:** These are boilerplate files that ship with Design OS, NOT user-created files. This check ensures the installation is complete and uncorrupted.
>
> **If validation fails:**
>
> - **Likely cause:** Incomplete clone, accidental deletion, or corrupted installation
> - **Resolution:** Re-clone the Design OS boilerplate from the source repository
> - **Not a user error:** Users don't create these files — they come with the template

> **Severity Levels:**
>
> - **File existence** → STOP if missing (cannot proceed without templates)
> - **Version comments** → WARNING if missing (proceed but warn for maintenance)

**Required templates:**

- `.claude/templates/design-os/common/top-rules.md`
- `.claude/templates/design-os/common/reporting-protocol.md`
- `.claude/templates/design-os/common/model-guidance.md`
- `.claude/templates/design-os/common/verification-checklist.md`
- `.claude/templates/design-os/common/clarifying-questions.md`
- `.claude/templates/design-os/common/tdd-workflow.md`
- `.claude/templates/design-os/one-shot/preamble.md`
- `.claude/templates/design-os/one-shot/prompt-template.md`
- `.claude/templates/design-os/section/preamble.md`
- `.claude/templates/design-os/section/prompt-template.md`
- `.claude/templates/design-os/section/clarifying-questions.md`
- `.claude/templates/design-os/section/tdd-workflow.md`

> **See also:** `.claude/templates/design-os/README.md` for complete documentation on the template system, including assembly order and variable substitution.

**Required skill file:**

- `.claude/skills/frontend-design/SKILL.md` — Design guidance (copied to export in Step 7)

**If any template is missing:**

Check all templates and report WHICH specific file(s) are missing:

```bash
MISSING_TEMPLATES=""
TEMPLATES=(
  ".claude/templates/design-os/common/top-rules.md"
  ".claude/templates/design-os/common/reporting-protocol.md"
  ".claude/templates/design-os/common/model-guidance.md"
  ".claude/templates/design-os/common/verification-checklist.md"
  ".claude/templates/design-os/common/clarifying-questions.md"
  ".claude/templates/design-os/common/tdd-workflow.md"
  ".claude/templates/design-os/one-shot/preamble.md"
  ".claude/templates/design-os/one-shot/prompt-template.md"
  ".claude/templates/design-os/section/preamble.md"
  ".claude/templates/design-os/section/prompt-template.md"
  ".claude/templates/design-os/section/clarifying-questions.md"
  ".claude/templates/design-os/section/tdd-workflow.md"
)

for template in "${TEMPLATES[@]}"; do
  if [ ! -f "$template" ]; then
    MISSING_TEMPLATES="$MISSING_TEMPLATES\n  - $template"
  fi
done

if [ -n "$MISSING_TEMPLATES" ]; then
  echo "Error: Missing template files:$MISSING_TEMPLATES"
  echo ""
  echo "Cannot generate prompts without all templates. Please restore the missing files."
  exit 1
fi
```

**END COMMAND** — Do not proceed to Step 2 if any template is missing.

### Validate Template Version Comments

Before assembling prompts, verify all templates have valid version comments at line 1:

**Version Comment Pattern:** `<!-- v#.#.# -->` or `<!-- v#.#.#-suffix -->`

**Standardized Regex Patterns:**

All version regex patterns should follow this standardized format:

| Context                | Pattern                                                | Description                                      |
| ---------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| **Bash validation**    | `^<!-- v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)? -->$`   | Match version at line start with optional suffix |
| **Template stripping** | `^<!-- v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)? -->\n?` | Strip version and optional newline               |
| **Validation check**   | `<!-- v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)? -->`     | Find any remaining version comments              |

Valid examples:

- `<!-- v1.0.0 -->`
- `<!-- v1.2.0-section -->`
- `<!-- v2.0.0-beta -->`

**Validation Script:**

```bash
# Check each template has a version comment on line 1
VERSION_PATTERN='^<!-- v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)? -->$'

for template in .claude/templates/design-os/common/*.md .claude/templates/design-os/one-shot/*.md .claude/templates/design-os/section/*.md; do
  if [ -f "$template" ]; then
    first_line=$(head -1 "$template")
    if [[ ! "$first_line" =~ $VERSION_PATTERN ]]; then
      echo "Warning: Template missing valid version comment: $template"
      echo "  First line: $first_line"
      echo "  Expected format: <!-- v1.0.0 --> or <!-- v1.0.0-suffix -->"
    fi
  fi
done
```

**If a template is missing a version comment:**

Show warning but continue:

```
Warning: Some templates are missing version comments:
- [template-path]: Missing or invalid version comment

Templates should have a version comment on line 1 (e.g., <!-- v1.0.0 -->).
This helps track template changes across exports.

Proceeding with export, but consider adding version comments for future maintenance.
```

Version comments are stripped during template assembly (Step 14), so missing version comments don't break the export — but they make template maintenance harder.

### Validate File Content (Not Just Existence)

For critical files, verify they contain meaningful content, not just that they exist:

**Content validation rules:**

| File                      | Minimum Requirements                                        |
| ------------------------- | ----------------------------------------------------------- |
| `product-overview.md`     | Contains `# ` heading and at least 50 characters of content |
| `product-roadmap.md`      | Contains at least one `## ` section heading                 |
| `spec.md` (per section)   | Contains `## Overview` or `## User Flows` section           |
| `data.json` (per section) | Valid JSON with at least one key besides `_meta`            |
| `types.ts` (per section)  | Contains at least one `export interface` declaration        |

**Validation script (conceptual):**

```bash
# Check product-overview.md has meaningful content
if [ -f "product/product-overview.md" ]; then
  CONTENT_LENGTH=$(wc -c < "product/product-overview.md")
  if [ "$CONTENT_LENGTH" -lt 50 ]; then
    echo "Warning: product-overview.md appears to be empty or incomplete ($CONTENT_LENGTH bytes)"
  fi
fi
```

**If a required file exists but is empty or invalid:**

Show warning: "File [path] exists but appears to be empty or incomplete. Please verify content before exporting."

Continue with export but note the warning in the README.

If recommended files are missing, show warnings but continue:

"Note: Some recommended items are missing:

- [ ] Data model — Run `/data-model` for consistent entity definitions
- [ ] Design tokens — Run `/design-tokens` for consistent styling
- [ ] Application shell — Run `/design-shell` for navigation structure

You can proceed without these, but they help ensure a complete handoff."

## Step 2: Gather Export Information

Read all relevant files:

1. `/product/product-overview.md` — Product name, description, features
2. `/product/product-roadmap.md` — List of sections in order
3. `/product/data-model/data-model.md` (if exists)
4. `/product/design-system/colors.json` (if exists)
5. `/product/design-system/typography.json` (if exists)
6. `/product/shell/spec.md` (if exists)
7. For each section: `spec.md`, `data.json`, `types.ts`
8. List screen design components in `src/sections/` and `src/shell/`

---

**Next Phase:** Continue to `phase-2-structure.md` for Steps 3-7 (creating directory structure and generating documentation).
