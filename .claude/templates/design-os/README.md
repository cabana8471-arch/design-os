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
│   ├── clarifying-questions.md      # Before You Begin questions
│   └── tdd-workflow.md              # TDD implementation approach
│
├── one-shot/                        # One-shot prompt templates
│   ├── preamble.md                 # Title and introduction
│   └── prompt-template.md           # Instructions and file references
│
└── section/                         # Section prompt templates
    ├── preamble.md                 # Title, variables, and introduction
    └── prompt-template.md           # Instructions and file references
```

## How Prompts Are Assembled

### One-Shot Prompt Assembly Order

1. `one-shot/preamble.md` — Title and introduction
2. `common/model-guidance.md` — Model selection guidance
3. `one-shot/prompt-template.md` — Instructions and file references
4. `common/top-rules.md` — TOP 3 RULES
5. `common/reporting-protocol.md` — Implementation reporting
6. `common/clarifying-questions.md` — Clarifying questions
7. `common/verification-checklist.md` — Final verification checklist

**Output:** `product-plan/prompts/one-shot-prompt.md`

### Section Prompt Assembly Order

1. `section/preamble.md` — Title, section variables, and introduction
2. `common/model-guidance.md` — Model selection guidance
3. `section/prompt-template.md` — Instructions and file references
4. `common/top-rules.md` — TOP 3 RULES
5. `common/reporting-protocol.md` — Implementation reporting
6. `common/tdd-workflow.md` — TDD implementation approach
7. `common/clarifying-questions.md` — Clarifying questions
8. `common/verification-checklist.md` — Final verification checklist

**Output:** `product-plan/prompts/section-prompt.md`

## Template Versioning

Each template includes a version comment at the top (e.g., `<!-- v1.0.0 -->`):

```markdown
<!-- v1.0.0 -->

## Template Content...
```

This allows tracking of template versions across exports and documenting breaking changes.

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

When `/export-product` runs:

1. Reads all template files from this directory
2. Assembles them in the specified order
3. Writes final prompts to `product-plan/prompts/`
4. Includes template version information in generated prompts

Templates are applied consistently across all exports, ensuring uniform prompt quality and structure.
