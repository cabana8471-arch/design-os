# Design OS Prompt Template System

This directory contains modular templates for generating implementation prompts during the `/export-product` command.

## Directory Structure

```
design-os/
├── common/                          # Shared templates (used in both prompt types)
│   ├── top-rules.md                # TOP 3 RULES FOR IMPLEMENTATION
│   ├── reporting-protocol.md        # Implementation Reporting Protocol
│   ├── model-guidance.md            # Suggested Model Usage
│   ├── verification-checklist.md    # Final Verification Checklist
│   ├── clarifying-questions.md      # One-shot clarifying questions
│   └── tdd-workflow.md              # Full implementation TDD (foundation, milestones, integration)
│
├── one-shot/                        # One-shot prompt templates
│   ├── preamble.md                 # Title and introduction
│   └── prompt-template.md           # Instructions and file references
│
└── section/                         # Section-specific prompt templates
    ├── preamble.md                 # Title, variables, and introduction
    ├── prompt-template.md           # Instructions and file references
    ├── clarifying-questions.md      # Section-specific clarifying questions
    └── tdd-workflow.md              # Section TDD (component isolation, props testing, edge cases)
```

## Template Dependencies

Templates have dependencies that must be satisfied for correct prompt assembly:

### Dependency Graph

```
common/top-rules.md
├── (no dependencies)

common/reporting-protocol.md
├── (no dependencies)

common/model-guidance.md
├── (no dependencies)

common/verification-checklist.md
├── (no dependencies)

common/clarifying-questions.md
├── Requires: Product overview context
└── Used by: one-shot prompts only

common/tdd-workflow.md
├── Requires: Foundation milestone instructions
└── Used by: one-shot prompts only

section/preamble.md
├── Requires: SECTION_NAME, SECTION_ID, NN variables
└── Must be filled in by user before use

section/prompt-template.md
├── Requires: SECTION_ID for file paths
└── Depends on: section/preamble.md (for variable definitions)

section/clarifying-questions.md
├── Assumes: Auth and tech stack already decided
└── Used by: section prompts only (NOT one-shot)

section/tdd-workflow.md
├── Assumes: Foundation milestone complete
└── Used by: section prompts only
```

### Cross-Template References

| Template | References |
|----------|-----------|
| `one-shot/prompt-template.md` | References files in `product-plan/` structure |
| `section/prompt-template.md` | References section-specific files only |
| `common/tdd-workflow.md` | References `01-foundation.md` instructions |
| `section/tdd-workflow.md` | References section `tests.md` and `sample-data.json` |

### Variable Substitution

Section templates use placeholder variables that users must replace:

| Variable | Description | Example |
|----------|-------------|---------|
| `SECTION_NAME` | Human-readable section title | "Invoice Management" |
| `SECTION_ID` | URL-safe section identifier | "invoice-management" |
| `NN` | Two-digit milestone number | "02", "03", etc. |

---

## How Prompts Are Assembled

> **Source of Truth:** The authoritative template assembly order is defined in `/export-product` Step 14. This section provides a summary for quick reference. If there's any discrepancy, export-product.md takes precedence.

### One-Shot Prompt Assembly Order

1. `one-shot/preamble.md` — Title and introduction
2. `common/model-guidance.md` — Model selection guidance
3. `one-shot/prompt-template.md` — Instructions and file references
4. `common/top-rules.md` — TOP 3 RULES
5. `common/reporting-protocol.md` — Implementation reporting
6. `common/tdd-workflow.md` — TDD implementation approach
7. `common/clarifying-questions.md` — Clarifying questions
8. `common/verification-checklist.md` — Final verification checklist

**Output:** `product-plan/prompts/one-shot-prompt.md`

### Section Prompt Assembly Order

1. `section/preamble.md` — Title, section variables, and introduction
2. `common/model-guidance.md` — Model selection guidance
3. `section/prompt-template.md` — Instructions and file references
4. `common/top-rules.md` — TOP 3 RULES
5. `common/reporting-protocol.md` — Implementation reporting
6. `section/tdd-workflow.md` — TDD implementation approach (section-specific)
7. `section/clarifying-questions.md` — Clarifying questions (section-specific)
8. `common/verification-checklist.md` — Final verification checklist

**Output:** `product-plan/prompts/section-prompt.md`

**What "Section-Specific" Means:**

The section prompt uses specialized templates that differ from the one-shot versions:

| Template | Section Version Differences |
|----------|----------------------------|
| `section/preamble.md` | Includes SECTION_NAME, SECTION_ID, NN variables for user substitution |
| `section/prompt-template.md` | References section-specific files only, not full product |
| `section/tdd-workflow.md` | Focuses on component testing, props validation, section integration |
| `section/clarifying-questions.md` | Asks about data relationships, integration points, section permissions — NOT full auth, user modeling, or tech stack questions |

This distinction matters because section prompts are used after Foundation is complete, so they assume auth and core infrastructure already exist. They focus on integrating new functionality rather than building from scratch.

### Clarifying Questions: Common vs Section

**`common/clarifying-questions.md` (v1.0.0)**
- Used in **one-shot prompts** for full product implementation
- Asks about: Authentication, user modeling, tech stack, backend logic
- Purpose: Establish foundational decisions before building anything

**`section/clarifying-questions.md` (v1.1.0)**
- Used in **section-specific prompts** for incremental implementation
- Asks about: Data relationships, integration points, section permissions, navigation
- Purpose: Integrate a new section into an already-running codebase
- Assumes: Auth, tech stack, and user modeling already decided (from Foundation milestone)

**When to use which:**
- Building from scratch → Use common/ templates (one-shot prompt)
- Adding features to existing app → Use section/ templates (section prompt)

## Template Versioning

Each template includes a version comment at the top (e.g., `<!-- v1.0.0 -->`):

```markdown
<!-- v1.0.0 -->

## Template Content...
```

**Version Comment Handling:**

When assembling prompts during `/export-product`:

1. **Strip version comments:** Remove all `<!-- v1.0.0 -->` lines from the top of each template before concatenation
2. **Final prompt cleanup:** The assembled prompts should not contain any version comments
3. **Preserve template versions:** Keep version comments in the source template files for maintenance tracking

**Procedure for stripping:**
```
1. Read template file content
2. If first line matches pattern `<!-- v[0-9]+\.[0-9]+\.[0-9]+ -->`, remove it
3. Trim leading whitespace from remaining content
4. Concatenate with other templates
```

**Version numbering convention:**
- **Major (v2.0.0):** Breaking changes to prompt structure or required variables
- **Minor (v1.1.0):** New content additions that don't break existing integrations
- **Patch (v1.0.1):** Fixes, clarifications, or minor wording improvements

**Version suffix convention:**
- **`-section`:** Section-specific variant of a common template (e.g., `v1.2.0-section`)
  - Used when section templates diverge from common templates
  - Example: `section/tdd-workflow.md` may use `v1.2.0-section` while `common/tdd-workflow.md` uses `v1.2.0`
- **No suffix:** Standard template version

This allows tracking of template versions and documenting breaking changes.

## Version Update Policy

When modifying templates, follow these guidelines for version updates:

### When to Update Versions

| Change Type | Version Bump | Examples |
|-------------|--------------|----------|
| **Major** | v1.0.0 → v2.0.0 | Removing required variables, restructuring prompt format, changing template assembly order |
| **Minor** | v1.0.0 → v1.1.0 | Adding new sections, new variables, expanding guidance content |
| **Patch** | v1.0.0 → v1.0.1 | Fixing typos, clarifying wording, improving formatting |

### Update Process

1. **Before modifying:** Check current version in template's first line (`<!-- v1.0.0 -->`)
2. **Determine bump type:** Use the table above to decide major/minor/patch
3. **Update version comment:** Change `<!-- v1.0.0 -->` to new version
4. **Document changes:** Add entry to this README or CHANGELOG if significant
5. **Test exports:** Run `/export-product` to verify templates assemble correctly

### Breaking Change Checklist

Before making a major version bump, verify:
- [ ] All commands using this template are updated
- [ ] Variable substitutions still work
- [ ] Export output is validated
- [ ] Documentation reflects the changes

### Version Synchronization

When updating shared templates in `common/`:
- All commands using that template automatically get the update
- Consider whether section-specific overrides need updates too
- Document any divergence between common and section variants

## Customizing Templates

To modify prompt generation, edit the appropriate template file:

- **Quality improvements (rules, checklists):** Edit `common/top-rules.md`, `common/verification-checklist.md`
- **Process guidance (TDD, reporting):** Edit `common/tdd-workflow.md`, `common/reporting-protocol.md`
- **Prompt structure:** Edit `one-shot/prompt-template.md`, `section/prompt-template.md`

Changes apply to all future exports automatically.

## Adding New Templates

1. Create new file in appropriate directory (`common/`, `one-shot/`, or `section/`)
2. Add version comment: `<!-- v1.0.0 -->`
3. Update assembly order in `.claude/commands/design-os/export-product.md` Step 14
4. Document the change in the assembly order section above

## Template Usage in Exports

When `/export-product` runs Step 14 (Generate Prompt Files):

1. Reads all template files from this directory in the specified order
2. Strips version comments (`<!-- v1.0.0 -->`) from each template
3. Substitutes variables (`SECTION_NAME`, `SECTION_ID`, `NN` for section prompts)
4. Concatenates templates in the correct order
5. Validates that all templates were included and all variables were substituted
6. Writes final prompts to `product-plan/prompts/`

For detailed implementation instructions, see `.claude/commands/design-os/export-product.md` Step 14, section "Template Assembly Implementation".

Templates are applied consistently across all exports, ensuring uniform prompt quality and structure.

## Whitespace Handling

When assembling templates, follow these whitespace rules:

### Between Templates

- **Single blank line** between concatenated templates
- Remove extra blank lines from template start/end before joining

### Within Templates

- Preserve internal whitespace exactly as written
- Markdown formatting depends on correct spacing (lists, code blocks)
- Don't normalize or reformat template content

### Version Comment Removal

When stripping version comments (`<!-- v1.0.0 -->`):

```
1. Check if first line matches: <!-- v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)? -->
2. If match, remove the entire first line (including newline)
3. Do NOT remove blank lines that follow — they may be intentional
4. The second line becomes the new first line
```

**Example:**
```markdown
<!-- v1.0.0 -->

## Template Content
```

After stripping:
```markdown

## Template Content
```

The blank line is preserved because it provides visual separation in the assembled prompt.

### Usage Comments (Optional)

Templates may include an optional usage comment after the version comment to explain where the template is used:

```markdown
<!-- v1.0.0 -->
<!-- Usage: Include in one-shot prompts for full product implementation -->

## Template Content
```

**Usage comment guidelines:**

- **Format:** `<!-- Usage: [context description] -->`
- **Location:** Must be on line 2 (immediately after version comment)
- **Purpose:** Helps maintainers understand the template's intended context
- **Stripping:** Usage comments are stripped during template assembly (same as version comments)

**Currently used in:**

| Template | Usage Context |
|----------|---------------|
| `common/tdd-workflow.md` | One-shot prompts for full product implementation |
| `section/tdd-workflow.md` | Section-specific prompts for incremental implementation |

Usage comments are optional but recommended for templates that have context-specific variations.

### Trailing Newlines

- Each template should end with exactly one newline (`\n`)
- The final assembled prompt should end with one newline
- Avoid multiple trailing blank lines

## Export File Creation Order

During `/export-product` Step 14, files are created in this specific order:

### 1. Directory Structure (created first)

```
product-plan/
├── prompts/
├── instructions/
│   └── incremental/
├── design-system/
├── data-model/
├── shell/
│   └── components/
├── sections/
│   └── [section-id]/
│       └── components/
└── design-guidance/
```

### 2. Prompt Files (assembly order matters)

| Order | File | Assembled From |
|-------|------|----------------|
| 1 | `prompts/one-shot-prompt.md` | See "One-Shot Prompt Assembly Order" above |
| 2 | `prompts/section-prompt.md` | See "Section Prompt Assembly Order" above |

### 3. Instruction Files

| Order | File | Source |
|-------|------|--------|
| 1 | `instructions/one-shot-instructions.md` | All milestones combined |
| 2 | `instructions/incremental/01-foundation.md` | Foundation milestone |
| 3+ | `instructions/incremental/[NN]-[section-id].md` | Section milestones (02, 03, etc.) |

### 4. Design Guidance

| Order | File | Source |
|-------|------|--------|
| 1 | `design-guidance/frontend-design.md` | `.claude/skills/frontend-design/SKILL.md` |

### 5. Supporting Files

Copied in any order (no dependencies):
- `product-overview.md`
- `design-system/colors.json`
- `design-system/typography.json`
- `data-model/types.ts`
- `data-model/sample-data.json`
- `shell/components/*.tsx`
- `sections/[id]/components/*.tsx`
- `sections/[id]/sample-data.json`
- `sections/[id]/types.ts`

### Why Order Matters

1. **Directories first** — Files can't be written to non-existent directories
2. **Prompts before instructions** — Prompts reference instruction files by path
3. **Foundation before sections** — Section milestones reference foundation
4. **Design guidance early** — Referenced in prompts

## Skill Validation Script (Standardized)

Commands that use the frontend-design skill should validate it consistently:

```bash
#!/bin/bash
# Validate frontend-design skill file

SKILL_FILE=".claude/skills/frontend-design/SKILL.md"
MIN_CONTENT_LENGTH=100

# Check file exists
if [ ! -f "$SKILL_FILE" ]; then
  echo "Error: SKILL.md - File not found at $SKILL_FILE"
  exit 1
fi

# Check file has content (excluding frontmatter)
CONTENT_LENGTH=$(sed '1{/^---$/!q;};1,/^---$/d' "$SKILL_FILE" | wc -c | tr -d ' ')

if [ "$CONTENT_LENGTH" -lt "$MIN_CONTENT_LENGTH" ]; then
  echo "Warning: SKILL.md - Insufficient content ($CONTENT_LENGTH chars < $MIN_CONTENT_LENGTH required)"
  echo "Proceeding with basic design principles..."
  exit 0  # Warn but continue
fi

echo "Skill file valid ($CONTENT_LENGTH chars)"
exit 0
```

### Validation Behavior

| Condition | Result | Message |
|-----------|--------|---------|
| File missing | STOP or WARN | "Error: SKILL.md - File not found..." |
| File empty or < 100 chars | WARN | "Warning: SKILL.md - Insufficient content..." |
| File valid | Continue | "Skill file valid..." |

Commands may offer to continue with fallback guidance when skill file is missing.
