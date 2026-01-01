<!-- v1.0.0 -->

# Phase 5: Design System and Prompts (Steps 13-14)

This phase generates design system files and assembles the implementation prompts.

---

## Step 13: Generate Design System Files

### tokens.css

```css
/* Design Tokens for [Product Name] */

:root {
  /* Colors */
  --color-primary: [Tailwind color];
  --color-secondary: [Tailwind color];
  --color-neutral: [Tailwind color];

  /* Typography */
  --font-heading: "[Heading Font]", sans-serif;
  --font-body: "[Body Font]", sans-serif;
  --font-mono: "[Mono Font]", monospace;
}
```

### tailwind-colors.md

```markdown
# Tailwind Color Configuration

## Color Choices

- **Primary:** `[color]` — Used for buttons, links, key accents
- **Secondary:** `[color]` — Used for tags, highlights, secondary elements
- **Neutral:** `[color]` — Used for backgrounds, text, borders

## Usage Examples

Primary button: `bg-[primary]-600 hover:bg-[primary]-700 text-white`
Secondary badge: `bg-[secondary]-100 text-[secondary]-800`
Neutral text: `text-[neutral]-600 dark:text-[neutral]-400`
```

### fonts.md

````markdown
# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>` or CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=[Heading+Font]&family=[Body+Font]&family=[Mono+Font]&display=swap"
  rel="stylesheet"
/>
```
````

## Font Usage

- **Headings:** [Heading Font]
- **Body text:** [Body Font]
- **Code/technical:** [Mono Font]

```

## Step 14: Generate Prompt Files

Create the `product-plan/prompts/` directory with two ready-to-use prompt files assembled from templates.

### Validate Required Files Exist

Before generating prompts, verify that key files from earlier steps were created successfully. The prompts reference these files, so they must exist:

**Required files:**
- `product-plan/product-overview.md` — Generated in Step 4
- `product-plan/instructions/one-shot-instructions.md` — Generated in Step 6
- `product-plan/instructions/incremental/01-foundation.md` — Generated in Step 5

If any required file is missing:
```

STOP: Missing required file: `product-plan/[path]`
Earlier export steps may have failed. Re-run `/export-product` from the beginning.

```

### Template System Overview

Prompts are assembled from modular templates stored in `.claude/templates/design-os/`:
- **Common templates** (`common/`) — Used in both one-shot and section prompts
- **Prompt-specific templates** (`one-shot/`, `section/`) — Structure specific to each prompt type

### Assembling Prompts

For each prompt, follow this assembly pattern:

1. Create the `product-plan/prompts/` directory
2. Read the appropriate templates from `.claude/templates/design-os/`
3. Assemble by concatenating in order
4. Substitute any variables (e.g., [Product Name])
5. Write the final assembled prompt to `product-plan/prompts/`

#### Template Assembly Algorithm

This algorithm describes the template assembly process. When implementing, follow these steps in order:

**Input:**
- `templateOrder` — Array of file paths to templates (in concatenation order)
- `variables` — Object mapping placeholder strings to their values
  - For one-shot: `{ "[Product Name]": "My Product" }`
  - For section: `{ "SECTION_NAME": "Invoices", "SECTION_ID": "invoices", "NN": "02" }`

**Process:**

```

1. Initialize empty result string

2. FOR each templatePath in templateOrder:
   a. Read file content from templatePath
   b. If file doesn't exist → STOP with error "Missing template file: [path]"
   c. Strip ALL leading HTML comments from top of content:
   - Match pattern: /^(<!--[\s\S]*?-->\s\*\n?)+/
   - This removes all consecutive HTML comments at the start (version, usage notes, etc.)
   - Handles: `<!-- v1.0.0 -->`, `<!-- Usage: ... -->`, `<!-- Note: ... -->`
   - Remove all matched comments and trailing whitespace
     d. If result is not empty, append "\n\n" (blank line separator)
     e. Append stripped content to result

3. FOR each (placeholder, value) in variables:
   a. Replace ALL occurrences of placeholder with value in result

4. Validate no unsubstituted variables remain:
   - Check for: "[Product Name]", "SECTION_NAME", "SECTION_ID", or standalone "NN"
   - Pattern: /\[Product Name\]|SECTION_NAME|SECTION_ID|\bNN\b/
   - If found → STOP with error listing unsubstituted variables

5. Validate no version comments remain:
   - Pattern: /<!--\s*v[\d.]+([-\w]*)\s*-->/
   - Handles versions with suffixes like v1.2.0-section
   - If found → STOP with error "Version comments not fully stripped"

6. Return assembled result

````

**Output:**
- Assembled prompt string ready to write to `product-plan/prompts/`

#### Template Assembly Implementation

When assembling templates, follow these specific steps:

**1. Read Template Files**
- Read each template file in the specified order from `.claude/templates/design-os/`
- Extract the content (without the HTML version comment `<!-- v1.0.0 -->` at the top)

**2. Variable Substitution**
For one-shot prompts, substitute:
- `[Product Name]` → The actual product name from `product-overview.md`

**Extracting Product Name:**
```bash
# Get the product name from the first level-1 heading in product-overview.md
PRODUCT_NAME=$(head -1 product/product-overview.md | sed 's/^# //')
````

The product name is the text from the first `# ` heading in `product/product-overview.md`.

- Example: `# InvoiceApp` → Product Name = "InvoiceApp"
- If no level-1 heading exists, STOP and warn: "Cannot extract product name. product-overview.md must start with a `# Product Name` heading."

For section prompts, substitute:

- `SECTION_NAME` → Human-readable section name (e.g., "Invoices", "Project Dashboard")
- `SECTION_ID` → Folder name from `product/sections/` (e.g., "invoices", "project-dashboard")
- `NN` → Milestone number (e.g., "02" for the first section, "03" for the second)

**3. Template Concatenation Order**
The templates are designed to be concatenated in a specific order. Do NOT reorder or skip templates:

**For one-shot-prompt.md:**

1. `one-shot/preamble.md` — Title and introduction
2. `common/model-guidance.md` — Model selection guidance
3. `one-shot/prompt-template.md` — Instructions and file references
4. `common/top-rules.md` — TOP 4 RULES
5. `common/reporting-protocol.md` — Implementation reporting
6. `common/tdd-workflow.md` — TDD implementation approach
7. `common/clarifying-questions.md` — Clarifying questions
8. `common/verification-checklist.md` — Final verification checklist

**For section-prompt.md:**

1. `section/preamble.md` — Title, section variables, and introduction
2. `common/model-guidance.md` — Model selection guidance
3. `section/prompt-template.md` — Instructions and file references
4. `common/top-rules.md` — TOP 4 RULES
5. `common/reporting-protocol.md` — Implementation reporting
6. `section/tdd-workflow.md` — TDD implementation approach (section-specific)
7. `section/clarifying-questions.md` — Clarifying questions (section-specific)
8. `common/verification-checklist.md` — Final verification checklist

**Variable Substitution for section-prompt.md:**

Unlike one-shot-prompt.md, section-prompt.md is a **template** that users fill in for each section. The substitution rules are:

| Variable         | Substitute During Export?         | Reason                           |
| ---------------- | --------------------------------- | -------------------------------- |
| `[Product Name]` | ✅ YES — from product-overview.md | Same for all sections            |
| `SECTION_NAME`   | ❌ NO — leave as placeholder      | User fills in (e.g., "Invoices") |
| `SECTION_ID`     | ❌ NO — leave as placeholder      | User fills in (e.g., "invoices") |
| `NN`             | ❌ NO — leave as placeholder      | User fills in (e.g., "02", "03") |

This means when assembling section-prompt.md:

1. Read the product name from `product/product-overview.md`
2. Replace all `[Product Name]` occurrences with the actual product name
3. Leave `SECTION_NAME`, `SECTION_ID`, and `NN` unchanged for user substitution

**4. Version Comment Handling**

- Strip all version comments from the top of each template before concatenating
- Version formats: `<!-- v1.0.0 -->`, `<!-- v1.2.0-section -->`, etc.
- These comments are used for template version tracking only and should NOT appear in the final assembled prompt
- Do not add version comments to the final prompt — the prompt should be clean and ready to use

**5. Whitespace and Formatting**

- Preserve formatting within each template
- Add a single blank line between concatenated templates to separate sections
- Ensure the final document has proper spacing for readability

**6. Error Handling**
If a template file is missing:

- **STOP the export process**
- Report to the user: "Missing template file: `.claude/templates/design-os/[path]`. Cannot generate prompts."
- Do not create partial or incomplete prompts

**7. Validation**
After assembling each prompt:

- Verify all variables have been substituted (no unsubstituted `SECTION_NAME`, `SECTION_ID`, `NN`, or `[Product Name]` remain)
- Verify all template files were included (no skipped sections)
- Check that the final prompt is readable and properly formatted

**8. Prompt Assembly Validation Checklist**

Before saving each assembled prompt, perform these validation checks:

```
[x] No version comments remain (<!-- v1.0.0 -->, <!-- v1.2.0-section -->, etc.)
[x] No unsubstituted variables remain ([Product Name], SECTION_NAME, etc.)
[x] All expected sections are present (TOP 4 RULES, Verification Checklist, etc.)
[x] No duplicate sections (same template included twice)
[x] Proper markdown formatting (headings, code blocks, lists)
[x] No broken markdown (unclosed code blocks, missing list items)
[x] File size is reasonable (not empty, not excessively large)
```

**If validation fails:**

```
STOP: Prompt assembly validation failed for [prompt-file]:
- [Specific issue found]

Review the template files and assembly process before continuing.
```

**Common Assembly Issues:**

- Version comments appearing in output → Template reading not stripping comments
- Duplicate content → Same template included multiple times in order
- Missing sections → Template file not found or skipped
- Broken markdown → Improper whitespace handling between templates

**Post-Assembly Validation Commands:**

After writing each prompt file, run these validation commands to catch issues:

```bash
# ============================================================
# ONE-SHOT-PROMPT.MD VALIDATION
# All variables should be substituted - no placeholders remain
# ============================================================

# Check for remaining version comments (should return no matches)
# Pattern handles version suffixes like v1.2.0-section
if grep -E '<!--\s*v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?\s*-->' product-plan/prompts/one-shot-prompt.md; then
  echo "ERROR: Version comments remain in one-shot-prompt.md"
  exit 1
fi

# Check for unsubstituted variables (should return no matches)
if grep -E '\[Product Name\]|SECTION_NAME|SECTION_ID|\bNN\b' product-plan/prompts/one-shot-prompt.md; then
  echo "ERROR: Unsubstituted variables remain in one-shot-prompt.md"
  exit 1
fi

# ============================================================
# SECTION-PROMPT.MD VALIDATION
# This is a TEMPLATE file with different rules:
# - [Product Name] MUST be substituted (user shouldn't have to fill this in)
# - SECTION_NAME, SECTION_ID, NN SHOULD remain (user fills these per-section)
# ============================================================

# Check for remaining version comments (should return no matches)
# Pattern handles version suffixes like v1.2.0-section
if grep -E '<!--\s*v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?\s*-->' product-plan/prompts/section-prompt.md; then
  echo "ERROR: Version comments remain in section-prompt.md"
  exit 1
fi

# Check that [Product Name] was substituted (should return no matches)
if grep -E '\[Product Name\]' product-plan/prompts/section-prompt.md; then
  echo "ERROR: [Product Name] was not substituted in section-prompt.md"
  exit 1
fi

# Verify SECTION_NAME, SECTION_ID, NN ARE present (they should remain as user placeholders)
if ! grep -q 'SECTION_NAME' product-plan/prompts/section-prompt.md; then
  echo "WARNING: SECTION_NAME placeholder missing in section-prompt.md (expected)"
fi
if ! grep -q 'SECTION_ID' product-plan/prompts/section-prompt.md; then
  echo "WARNING: SECTION_ID placeholder missing in section-prompt.md (expected)"
fi
```

**Validation differences explained:**

| Variable         | one-shot-prompt.md     | section-prompt.md           |
| ---------------- | ---------------------- | --------------------------- |
| `[Product Name]` | ❌ Must be substituted | ❌ Must be substituted      |
| `SECTION_NAME`   | ❌ Must be substituted | ✅ Must remain (user fills) |
| `SECTION_ID`     | ❌ Must be substituted | ✅ Must remain (user fills) |
| `NN`             | ❌ Must be substituted | ✅ Must remain (user fills) |

These commands provide concrete verification that the assembly process worked correctly for each prompt type.

### one-shot-prompt.md

Assemble from the templates listed above (see "Template Concatenation Order" section). Follow the template assembly process to create `product-plan/prompts/one-shot-prompt.md`.

> **Note:** The templates contain the authoritative content. See `.claude/templates/design-os/` for the actual template files.

### section-prompt.md (Template File — Requires Variable Substitution)

**Note:** This is a **prompt template** that requires variable substitution before use. Unlike `one-shot-prompt.md`, users must fill in `SECTION_NAME`, `SECTION_ID`, and `NN` values for each section they implement. The variables at the top serve as placeholders that the user replaces with actual values.

Assemble from the templates listed above (see "Template Concatenation Order" section). Follow the template assembly process to create `product-plan/prompts/section-prompt.md`.

> **Note:** The templates contain the authoritative content. See `.claude/templates/design-os/` for the actual template files.

---

**Next Phase:** Continue to `phase-6-finalize.md` for Steps 15-18 (README, screenshots, zip, and completion).
