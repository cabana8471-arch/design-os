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
│   └── tdd-workflow.md              # TDD implementation approach (used in one-shot prompts)
│
├── one-shot/                        # One-shot prompt templates
│   ├── preamble.md                 # Title and introduction
│   └── prompt-template.md           # Instructions and file references
│
└── section/                         # Section-specific prompt templates
    ├── preamble.md                 # Title, variables, and introduction
    ├── prompt-template.md           # Instructions and file references
    ├── clarifying-questions.md      # Section-specific clarifying questions
    └── tdd-workflow.md              # Section-specific TDD workflow
```

## How Prompts Are Assembled

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

**Note:** This prompt uses section-specific versions of TDD workflow and clarifying questions, which ask only about data relationships, integration points, and section-specific business logic (not full one-shot questions about auth, user modeling, and tech stack).

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

This allows tracking of template versions and documenting breaking changes.

## Customizing Templates

To modify prompt generation, edit the appropriate template file:

- **Quality improvements (rules, checklists):** Edit `common/top-rules.md`, `common/verification-checklist.md`
- **Process guidance (TDD, reporting):** Edit `common/tdd-workflow.md`, `common/reporting-protocol.md`
- **Prompt structure:** Edit `one-shot/prompt-template.md`, `section/prompt-template.md`

Changes apply to all future exports automatically.

## Adding New Templates

1. Create new file in appropriate directory (`common/`, `one-shot/`, or `section/`)
2. Add version comment: `<!-- v1.0.0 -->`
3. Update assembly order in `.claude/commands/design-os/export-product.md` Step 13
4. Document the change in the assembly order section above

## Template Usage in Exports

When `/export-product` runs Step 13 (Generate Prompt Files):

1. Reads all template files from this directory in the specified order
2. Strips version comments (`<!-- v1.0.0 -->`) from each template
3. Substitutes variables (`SECTION_NAME`, `SECTION_ID`, `NN` for section prompts)
4. Concatenates templates in the correct order
5. Validates that all templates were included and all variables were substituted
6. Writes final prompts to `product-plan/prompts/`

For detailed implementation instructions, see `.claude/commands/design-os/export-product.md` Step 13, section "Template Assembly Implementation".

Templates are applied consistently across all exports, ensuring uniform prompt quality and structure.
