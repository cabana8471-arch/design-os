# Validation Patterns

This document covers standardized prerequisite checks, error handling patterns, retry logic, viewport dimensions, and hookify guardrails.

---

## Standardized Prerequisite Checks

All commands must follow this consistent pattern for checking prerequisites:

### Pattern: Required vs. Optional Prerequisites

**Required Prerequisites** → STOP with clear error message if missing

- **Product context** (all commands except `/product-interview`)
- Product overview (almost all commands)
- Product roadmap (planning commands)
- Section spec (for data/design commands)

**Optional Enhancements** → WARN and continue if missing

- Design tokens (design commands proceed with defaults)
- Data model (sample-data proceeds with local definitions)
- Application shell (design-shell question may be skipped)

> **See also:** For the complete list of Required and Optional prerequisites per command, refer to the **Command Prerequisites** table in `command-reference.md`.

### Product Scope Persistence

Product scope (MVP/Standard/Enterprise) is determined by `/product-vision` and persisted in `product/product-overview.md`:

- `/product-vision` writes the scope using the format: `**Scope Level:** [MVP|Standard|Enterprise]`
- Commands that read scope should look for this exact pattern
- If not found, default to "Standard"

> **Canonical Format:** Always use `**Scope Level:**` (not `**Scope:**`). This ensures consistent parsing across all commands.

| Scope          | Section Complexity | Feature Suggestions                              |
| -------------- | ------------------ | ------------------------------------------------ |
| **MVP**        | Core features only | Minimal views (1-2), essential actions           |
| **Standard**   | Full feature set   | Multiple views (2-4), common patterns            |
| **Enterprise** | Comprehensive      | All views, advanced features, admin capabilities |

**Commands that read scope:** `/shape-section`

> **Note:** `/sample-data` uses data volume preferences (Step 3.5) rather than product scope. The scope primarily affects section complexity during `/shape-section`.

### Standard Error Messages

**Required file missing:**

```
I don't see [file description] at [path]. Please run [prerequisite command] first.
```

**Optional feature missing:**

```
Note: [Feature] hasn't been defined yet. I'll proceed with [default approach], but for [reason], consider running [command] first.
```

### Error Message Format Standard

All commands must use consistent error message formatting:

**Pattern:** `Error: [Component] - [Issue]. [Action to fix].`

**Examples:**

| Component           | Issue                  | Action                       | Full Message                                                                                          |
| ------------------- | ---------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| product-overview.md | File not found         | Run /product-vision          | `Error: product-overview.md - File not found. Run /product-vision to create it.`                      |
| data.json           | Invalid JSON syntax    | Check file for syntax errors | `Error: data.json - Invalid JSON syntax. Check the file for missing commas or brackets.`              |
| AppShell.tsx        | Missing default export | Add export default statement | `Error: AppShell.tsx - Missing default export. Add 'export default AppShell' at the end of the file.` |
| SKILL.md            | Insufficient content   | Add design guidance          | `Error: SKILL.md - Insufficient content (< 100 chars). Add meaningful design guidance.`               |

**Severity Levels:**

| Level   | Prefix     | Behavior                            |
| ------- | ---------- | ----------------------------------- |
| Error   | `Error:`   | STOP command, require user action   |
| Warning | `Warning:` | Continue with fallback, inform user |
| Note    | `Note:`    | Informational, no action required   |

**Format Consistency:**

- Always start with the level prefix (`Error:`, `Warning:`, `Note:`)
- Include the component/file name after the prefix
- Use a hyphen to separate the component from the issue
- End with a clear action the user can take
- Use periods to terminate sentences

This ensures users can quickly understand what went wrong and how to fix it.

---

## Directory Creation Pattern

All commands that create files must include explicit directory creation:

```bash
# Before creating /product/sections/[section-id]/spec.md:
mkdir -p product/sections/[section-id]

# Before creating /product/design-system/colors.json:
mkdir -p product/design-system

# Before creating src/shell/components/AppShell.tsx:
mkdir -p src/shell/components
```

**Commands and Required Directories:**

| Command              | Directory to Create                                            |
| -------------------- | -------------------------------------------------------------- |
| `/product-interview` | `mkdir -p product/`                                            |
| `/product-vision`    | `mkdir -p product/`                                            |
| `/product-roadmap`   | `mkdir -p product/`                                            |
| `/data-model`        | `mkdir -p product/data-model/`                                 |
| `/design-tokens`     | `mkdir -p product/design-system/`                              |
| `/shape-section`     | `mkdir -p product/sections/[section-id]/`                      |
| `/sample-data`       | (Directory already exists from /shape-section)                 |
| `/design-shell`      | `mkdir -p product/shell/` and `mkdir -p src/shell/components/` |
| `/design-screen`     | `mkdir -p src/sections/[section-id]/components/`               |
| `/export-product`    | `mkdir -p product-plan/` and subdirectories                    |

> **Note on .gitkeep files:** Empty directories in the boilerplate contain `.gitkeep` placeholder files to ensure Git tracks them. When commands create files in these directories, the `.gitkeep` can remain (harmless) or be removed. Never reference `.gitkeep` in code — treat directories as empty until populated by commands.

---

## File Validation Pattern

After creating critical files, verify structure:

1. **Check existence:** File was actually written
2. **Validate structure:** Required fields/sections exist
3. **Verify content:** Data is consistent and complete

For `data.json` files specifically:

- Verify `_meta` object exists at top level
- Verify `_meta.models` is an object with descriptions
- Verify `_meta.relationships` is an array
- Ensure all model names match actual data keys

---

## Recovery Pattern (If Steps Fail)

Commands should provide recovery guidance when critical steps fail:

**Quick Recovery Notes (for inline use):**

```markdown
> **Recovery:** If this step fails, [specific action]. Check [what to check].
```

**Standard Recovery Actions:**

| Failure Type        | Recovery Action                                      |
| ------------------- | ---------------------------------------------------- |
| File creation fails | Check write permissions: `ls -la [parent-dir]/`      |
| Directory missing   | Create directory: `mkdir -p [path]`                  |
| Validation fails    | Review error message, fix issues, re-run step        |
| JSON parse error    | Validate syntax: paste content into a JSON validator |
| Import error        | Check file exists and path is correct                |

**Command Recovery Quick Reference:**

| Command           | Common Failure         | Recovery Action                                     |
| ----------------- | ---------------------- | --------------------------------------------------- |
| `/product-vision` | File write fails       | Check permissions: `ls -la product/`                |
| `/design-shell`   | Component import error | Verify UI components exist: `ls src/components/ui/` |
| `/design-screen`  | Skill file missing     | Proceed with fallback or add SKILL.md               |
| `/sample-data`    | JSON validation fails  | Fix syntax errors in data.json and retry            |
| `/export-product` | Template missing       | Re-clone boilerplate from source repository         |

**Full Recovery Section (for complex commands):**

For commands with multiple steps that can fail (like `/export-product`), include a dedicated "Rollback / Recovery" section at the end covering:

1. Pre-command backups (if applicable)
2. Partial failure cleanup
3. Resume instructions
4. Git-based recovery options

**Commands with dedicated recovery sections:**

- `/export-product` — Full rollback/recovery section (Step 15)
- `/sample-data` — Recovery Pattern section at end of file

**Commands with inline recovery notes:**

All commands that create or modify files should include brief `> **Recovery:**` notes for critical file operations. Priority commands:

| Command              | Critical Operations                    | Recovery Note Location         |
| -------------------- | -------------------------------------- | ------------------------------ |
| `/screenshot-design` | Dev server startup, screenshot capture | Steps 3, 4, 5 (already added)  |
| `/design-shell`      | Component creation, spec generation    | After Step 7 (component write) |
| `/design-screen`     | Component creation, preview generation | After Step 5 (component write) |
| `/shape-section`     | Spec file creation                     | After Step 7 (spec write)      |
| `/design-tokens`     | JSON file creation                     | After token file write         |
| `/product-vision`    | Overview file creation                 | After overview write           |
| `/product-roadmap`   | Roadmap file creation                  | After roadmap write            |
| `/data-model`        | Data model file creation               | After data-model write         |

> **Note:** Commands like `/product-interview` and `/audit-context` are primarily read/analyze operations and don't require recovery notes unless they write files.

---

## Section ID Generation Rules

> **Single Source of Truth:** These rules are the authoritative definition. Other commands (`/shape-section`, `/product-roadmap`) should reference this section rather than duplicating the rules.

When creating section IDs from section titles, follow these standardized rules:

1. **Convert to lowercase** — "Invoice Management" → "invoice management"
2. **Replace spaces with hyphens** — "invoice management" → "invoice-management"
3. **Replace "&" with "-and-"** — "Reports & Analytics" → "reports-and-analytics"
4. **Remove special characters except hyphens** — Strip punctuation, quotes, etc.
5. **Remove diacritics** — "Café Management" → "cafe-management", "Señor" → "senor"
6. **Collapse consecutive hyphens** — "reports--and" → "reports-and" (multiple spaces or special chars become single hyphen)
7. **Cannot start or end with hyphen** — Trim leading/trailing hyphens
8. **Maximum 50 characters** — Truncate if necessary

**Examples:**

- "Invoice Management" → `invoice-management`
- "Reports & Analytics" → `reports-and-analytics`
- "User Settings" → `user-settings`
- "Q&A Forum" → `q-and-a-forum`

This ensures consistent path naming across all commands that reference sections.

---

## Variable Naming Conventions

Commands use two distinct variable notation styles for different contexts:

| Notation          | Context                            | Example                                 |
| ----------------- | ---------------------------------- | --------------------------------------- |
| `[variable-name]` | Placeholder in documentation/paths | `product/sections/[section-id]/spec.md` |
| `VARIABLE_NAME`   | Bash variable in scripts           | `SECTION_ID=$(echo "$path" \| sed ...)` |

**When to use each:**

- **Brackets `[...]`** — Use in documentation, file paths, and templates where the value will be substituted by the reader/user
- **Uppercase** — Use in bash scripts where the value is assigned and referenced programmatically

**Example transformation:**

```markdown
# Documentation (placeholder)

The spec is at: product/sections/[section-id]/spec.md

# Bash script (variable)

SECTION_ID="invoices"
SPEC_PATH="product/sections/${SECTION_ID}/spec.md"
```

**Common variables:**

| Placeholder      | Bash Variable  | Description                              |
| ---------------- | -------------- | ---------------------------------------- |
| `[section-id]`   | `SECTION_ID`   | Section folder name (e.g., `invoices`)   |
| `[view-name]`    | `VIEW_NAME`    | Screen design name (e.g., `InvoiceList`) |
| `[product-name]` | `PRODUCT_NAME` | Product name from overview               |

**Bash Variable Syntax (`$VAR` vs `${VAR}`):**

Both notations are valid bash syntax. Use `${VAR}` (braces) when:

- Variable is followed by characters that could be part of the name: `${SECTION_ID}_backup`
- Inside strings for clarity: `"path/${SECTION_ID}/file.md"`
- Recommended for consistency in new code

Use `$VAR` (no braces) when:

- Variable stands alone: `echo $SECTION_ID`
- In simple assignments: `NEW_VAR=$OLD_VAR`

> **Note:** Existing code may use either notation. Both work correctly — this is a style preference, not a requirement.

---

## Question Asking Patterns

Commands should ask users questions in a consistent, predictable way:

**Question Format:**

```markdown
**[Category]:**

1. [Specific question]?
2. [Another specific question]?
```

**Categories by Command Type:**

| Command Type    | Typical Questions                                      |
| --------------- | ------------------------------------------------------ |
| Vision/Planning | Product goals, target audience, key differentiators    |
| Data Model      | Entity relationships, required vs. optional fields     |
| Design          | Color preferences, layout style, responsive priorities |
| Section         | Feature scope, edge cases, integration points          |
| Export          | Target framework, authentication approach, deployment  |

**Question Timing:**

| When                  | Question Pattern                     |
| --------------------- | ------------------------------------ |
| Before starting       | Clarify ambiguous requirements       |
| At decision points    | Offer options with recommendations   |
| On validation failure | Explain issue and ask how to proceed |
| Before overwriting    | Confirm destructive operations       |

**Answer Handling:**

1. Accept short answers (yes/no, option letters, brief phrases)
2. Provide sensible defaults when possible
3. Don't re-ask questions already answered in conversation context
4. Document decisions made for future reference

---

## Relationship Format Validation

### Valid Format

```
- [SourceView].[callbackName] -> [TargetView] (type, dataRef)
```

### Validation Rules

| Rule           | Valid                         | Invalid                |
| -------------- | ----------------------------- | ---------------------- |
| View names     | PascalCase                    | kebab-case, snake_case |
| Callback names | camelCase                     | PascalCase, kebab-case |
| Type           | `navigate`, `modal`, `drawer` | custom types           |
| DataRef        | matches types.ts              | undefined references   |

### Example Validations

```
✓ UserList.onViewUser -> UserDetail (navigate, userId)
✓ Dashboard.onOpenSettings -> SettingsModal (modal, null)
✗ user-list.on_view -> UserDetail (navigate, userId)  # wrong case
✗ UserList.onViewUser -> UserDetail (popup, userId)   # invalid type
```

---

## Category Completeness by Command

### Which Categories Each Command Needs

| Command            | Required Categories                        | Minimum % |
| ------------------ | ------------------------------------------ | --------- |
| `/product-vision`  | 1 (Foundation)                             | 8%        |
| `/product-roadmap` | 1, 8 (Foundation, Scale)                   | 17%       |
| `/design-tokens`   | 3 (Design Direction)                       | 8%        |
| `/design-shell`    | 2, 3, 7 (Personas, Design, Mobile)         | 25%       |
| `/shape-section`   | 5, 6, 11 (Section, UI, Error)              | 25%       |
| `/sample-data`     | 4, 5 (Data, Section)                       | 17%       |
| `/design-screen`   | 3, 5, 6, 7, 11                             | 42%       |
| `/export-product`  | 9, 10, 12 (Integration, Security, Testing) | 25%       |

### Validation at Command Start

```
IF category_completeness < required_minimum:
  WARN: "Category X incomplete. Continue with defaults? [y/N]"
  IF user_confirms:
    PROCEED with fallback values
  ELSE:
    SUGGEST: "Run /product-interview --stage=X"
```

---

## Retry Pattern (Standardized)

Commands that involve validation loops should follow this consistent retry pattern:

**Retry Tracking Format:**

```
[Attempt 1/3] Validating [component]...
[Attempt 2/3] Validating [component]...
[Attempt 3/3 - FINAL] Validating [component]...
```

**Retry Behavior:**

| Attempt     | Action                                                         |
| ----------- | -------------------------------------------------------------- |
| 1/3         | Run validation, report errors, offer fix guidance              |
| 2/3         | Re-validate after user fixes, report remaining errors          |
| 3/3 - FINAL | Last attempt, fail with complete error summary if unsuccessful |

**Commands and Retry Pattern Status:**

| Command           | Validation Type                      | Implements Retry?              |
| ----------------- | ------------------------------------ | ------------------------------ |
| `/sample-data`    | JSON structure, \_meta validation    | YES (3 attempts)               |
| `/design-tokens`  | Font availability, weight validation | SHOULD add                     |
| `/design-screen`  | Component import, props validation   | SHOULD add                     |
| `/export-product` | Template, component validation       | Complex — uses manual recovery |

> **Note:** Commands marked "SHOULD add" would benefit from retry logic for consistency. Currently they fail on first validation error.

**Why different approaches?**

| Approach           | Reason                                                 | Commands                           |
| ------------------ | ------------------------------------------------------ | ---------------------------------- |
| Retry (3 attempts) | Iterative fixes needed for structured data validation  | `/sample-data`                     |
| Fail fast          | Visual output makes issues immediately obvious         | `/design-screen`, `/design-tokens` |
| Manual recovery    | Multi-step process where issues can occur at any point | `/export-product`                  |

Commands without retry patterns are lower priority because their errors are either immediately visible (visual components) or rare (font validation).

**After 3 failed attempts:**

```
Error: Validation failed after 3 attempts.
Please review the errors above and fix manually before retrying.
```

### Retry Timeline by Operation Type

| Operation  | Wait Before Retry | Max Attempts | Escalation           |
| ---------- | ----------------- | ------------ | -------------------- |
| File read  | 0ms               | 2            | Fail immediately     |
| File write | 100ms             | 3            | Check permissions    |
| Screenshot | 2000ms            | 3            | Increase viewport    |
| Dev server | 5000ms            | 5            | Check port conflicts |
| Build      | 3000ms            | 2            | Show error details   |

### Exponential Backoff Pattern

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  baseDelay: number,
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
}
```

---

## Viewport Dimensions (Standardized)

All commands referencing viewport sizes must use these consistent dimensions:

| Viewport          | Width  | Height | Use Case                                |
| ----------------- | ------ | ------ | --------------------------------------- |
| Desktop (default) | 1280px | 800px  | Standard documentation, screenshots     |
| Mobile            | 375px  | 667px  | Mobile-first testing, responsive checks |
| Tablet            | 768px  | 1024px | Tablet variants, medium breakpoints     |

**Responsive Breakpoints:**

| Breakpoint | Width Range | Tailwind Class |
| ---------- | ----------- | -------------- |
| Mobile     | < 640px     | (default)      |
| Tablet     | 640-1024px  | `sm:`, `md:`   |
| Desktop    | > 1024px    | `lg:`, `xl:`   |

**Command-Specific Usage:**

| Command              | Viewport Usage                                               |
| -------------------- | ------------------------------------------------------------ |
| `/screenshot-design` | Desktop 1280x800 default, capture all viewports as needed    |
| `/design-screen`     | Build mobile-first, test at all breakpoints                  |
| `/design-shell`      | Design for all breakpoints, desktop is primary layout        |
| `/export-product`    | Verification checklist includes 375px, 768px, 1024px, 1920px |

**Responsive Strategy Clarification:**

> **TL;DR:** Shell = desktop-first (start with sidebar, add hamburger for mobile). Sections = mobile-first (start with single column, add grid for desktop). Both work at all breakpoints.

| Component | Strategy      | Why                                | Start With    | Enhance For        |
| --------- | ------------- | ---------------------------------- | ------------- | ------------------ |
| Shell     | Desktop-first | Navigation optimized for desktop   | Full sidebar  | Hamburger (mobile) |
| Sections  | Mobile-first  | Content must work on small screens | Single column | Grid (desktop)     |

The shell and section components use different responsive approaches:

- **Shell components (`/design-shell`):** Desktop-first because navigation chrome is optimized for desktop use; mobile gets a simplified drawer/hamburger menu
- **Section components (`/design-screen`):** Mobile-first because content should work on small screens and enhance for larger ones

Both must work at all breakpoints. The difference is which layout is designed first and enhanced for other sizes.

**Reconciling Both Strategies:**

Both strategies coexist because they serve different purposes:

1. **Shell (Desktop-first):**
   - Start with full sidebar navigation layout
   - Add `md:hidden` to desktop nav, show hamburger menu on mobile
   - Main content area uses responsive `w-full` container

2. **Sections (Mobile-first):**
   - Start with single-column mobile layout (stack cards vertically)
   - Add `sm:grid-cols-2`, `lg:grid-cols-3` for larger screens
   - Shell already handles navigation; sections focus on content

**Breakpoint Ownership:**

| Element  | Owns Breakpoint Logic For                                     |
| -------- | ------------------------------------------------------------- |
| Shell    | Navigation visibility, sidebar collapse/expand, header layout |
| Sections | Content layout, card grids, data table columns, form layouts  |

**Breakpoint Ownership by Size:**

| Breakpoint  | Width Range | Shell Owns                            | Section Owns                           |
| ----------- | ----------- | ------------------------------------- | -------------------------------------- |
| **Mobile**  | < 640px     | Hamburger menu, hidden sidebar        | Single column, stacked cards           |
| **Tablet**  | 640-1024px  | Collapsible sidebar, condensed header | 2-column grids, responsive tables      |
| **Desktop** | > 1024px    | Full sidebar, expanded header actions | Multi-column layouts, full data tables |

**Conflict Resolution:**

At intermediate breakpoints (e.g., 768px):

- Shell's sidebar state takes precedence for layout width calculations
- Sections should use `flex-1` or `w-full` to fill available space
- Never hardcode section widths that assume sidebar visibility

This separation means changes to mobile navigation don't affect section layouts, and vice versa.

**Screenshot Naming Convention:**

```
[view-name].png           # Desktop (default)
[view-name]-mobile.png    # Mobile viewport
[view-name]-tablet.png    # Tablet viewport
[view-name]-dark.png      # Dark mode variant
```

---

## Hookify Guardrails

Design OS includes **hookify rules** that provide real-time feedback during development. These rules catch common mistakes before they cause problems.

### How It Works

Hookify rules are markdown files with YAML frontmatter that trigger on specific events:

- **file** events — When creating or editing files
- **prompt** events — When user submits a prompt
- **bash** events — When running bash commands

Each rule can either:

- **warn** — Show a warning and continue
- **block** — Prevent the action entirely

### Rule Categories

| Category       | Prefix           | Count | Purpose                                |
| -------------- | ---------------- | ----- | -------------------------------------- |
| Code Patterns  | `dos-code-`      | 11    | Prevent code that won't work correctly |
| Workflow       | `dos-workflow-`  | 6     | Guide command sequence                 |
| Data Integrity | `dos-data-`      | 7     | Ensure data.json correctness           |
| Design System  | `dos-design-`    | 8     | Enforce design consistency             |
| Accessibility  | `dos-a11y-`      | 3     | Catch accessibility issues             |
| File Structure | `dos-structure-` | 6     | Ensure correct file organization       |

**Total: 41 rules (7 BLOCK + 34 WARN)**

### Critical Rules (BLOCK)

These rules **prevent** actions that would break Design OS:

| Rule                                 | What It Blocks                                  |
| ------------------------------------ | ----------------------------------------------- |
| `dos-code-block-direct-data-import`  | Importing data.json in exportable components    |
| `dos-code-block-tailwind-config`     | Creating tailwind.config.js (v4 doesn't use it) |
| `dos-code-block-hardcoded-colors`    | Hardcoded hex/rgb colors instead of Tailwind    |
| `dos-code-block-inline-styles`       | Inline style attributes in React components     |
| `dos-code-block-missing-dark-mode`   | Components without dark mode support            |
| `dos-data-block-invalid-json`        | Invalid JSON syntax in data files               |
| `dos-structure-block-tsx-in-product` | Creating .tsx files in product/ directory       |

### Managing Rules

**List all rules:**

```bash
ls .claude/hookify.dos-*.local.md
```

**Disable a rule:**

1. Open the rule file
2. Change `enabled: true` to `enabled: false`
3. Save — takes effect immediately

**Enable a disabled rule:**

1. Open the rule file
2. Change `enabled: false` to `enabled: true`
3. Save — takes effect immediately

### Full Documentation

See `.claude/hookify/README.md` for the complete hookify system documentation, including:

- Complete list of all rules organized by category
- Rule file format and condition operators
- Creating custom rules
- Troubleshooting guide

See `.claude/hookify/categories.md` for the category taxonomy and rule organization patterns.

Individual rule files (`.claude/hookify.*.local.md`) contain:

- Rule purpose and trigger conditions
- Match patterns and file filters
- Action type (warn or block)
- Enabled/disabled status

---

## Cross-Command Error Propagation

### Error Cascade Rules

When a command fails, dependent commands should:

| Failing Command      | Affected Commands                     | Behavior                              |
| -------------------- | ------------------------------------- | ------------------------------------- |
| `/product-interview` | ALL                                   | Block: "Run /product-interview first" |
| `/product-vision`    | `/product-roadmap`, `/export-product` | Block with clear message              |
| `/design-tokens`     | `/design-shell`, `/design-screen`     | Warn + use defaults                   |
| `/design-shell`      | `/design-screen`                      | Warn + skip shell integration         |
| `/shape-section`     | `/sample-data`, `/design-screen`      | Block for that section                |

### Error Message Format

```
❌ Cannot proceed: [Command Name]

Required file missing: [file path]
└── Created by: /[prerequisite-command]

Action: Run `/[prerequisite-command]` first, then retry.
```

### Partial Failure Recovery

If command fails mid-execution:

1. Log which step failed
2. List files successfully created
3. Provide specific recovery command
4. Do NOT auto-rollback (user may want partial work)

---

## Data Type Validation (types.ts ↔ data.json)

### Validation Checklist

Before accepting data.json as valid:

1. [ ] JSON parses without errors
2. [ ] Has `_meta` structure with version
3. [ ] All required entity arrays present
4. [ ] Entity IDs unique within array
5. [ ] Foreign key references valid
6. [ ] Enum values match types.ts definitions

### Validation Example

```typescript
// types.ts
type UserRole = "admin" | "member" | "guest";

interface User {
  id: string;
  name: string;
  role: UserRole;
  teamId: string; // FK to Team
}

// Validation checks for data.json:
// 1. user.role IN ['admin', 'member', 'guest']
// 2. user.teamId EXISTS IN teams[].id
// 3. user.id UNIQUE across all users
```

### Auto-Validation in Commands

`/sample-data` should validate:

- All generated data matches types.ts
- No orphan foreign keys
- No duplicate IDs
- Enums use valid values only
