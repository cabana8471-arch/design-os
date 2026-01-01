<!-- v1.1.0 -->

# Export Product

You are helping the user export their complete product design as a handoff package for implementation. This generates all files needed to build the product in a real codebase.

> **Design Note on Step Count:** This command has 19 primary steps (0-18), plus 2 conditional/sub-steps (Step 8A branches from Step 8, Step 10.5 is within Step 10). This may seem verbose, but it is intentional:
>
> - Each step performs a discrete, verifiable operation
> - Steps can be referenced individually in error messages
> - The granularity aids debugging when exports fail
> - Users can track progress through the export process
>
> Do not attempt to consolidate steps — the verbosity ensures reliability.

## Command Structure

This command is organized into 6 phases for maintainability. Execute each phase in order:

| Phase | Steps | File                                      | Purpose                                  |
| ----- | ----- | ----------------------------------------- | ---------------------------------------- |
| 1     | 0-2   | `export-product/phase-1-prerequisites.md` | Validate context, check prerequisites    |
| 2     | 3-7   | `export-product/phase-2-structure.md`     | Create directories, generate docs        |
| 3     | 8-9   | `export-product/phase-3-validation.md`    | Validate and copy components             |
| 4     | 10-12 | `export-product/phase-4-documentation.md` | Generate READMEs, consolidate data model |
| 5     | 13-14 | `export-product/phase-5-prompts.md`       | Generate design system and prompts       |
| 6     | 15-18 | `export-product/phase-6-finalize.md`      | README, screenshots, zip, completion     |

## Step Index

| Step | Purpose                                                    | Phase |
| ---- | ---------------------------------------------------------- | ----- |
| 0    | Validate product context                                   | 1     |
| 1    | Check prerequisites (product files, templates, skill file) | 1     |
| 2    | Gather export information                                  | 1     |
| 3    | Create export directory structure                          | 2     |
| 4    | Generate product-overview.md                               | 2     |
| 5    | Generate milestone instructions (incremental)              | 2     |
| 6    | Generate one-shot-instructions.md                          | 2     |
| 7    | Copy design guidance (SKILL.md → frontend-design.md)       | 2     |
| 8    | Validate all components                                    | 3     |
| 8A   | Validate design coherence (conditional)                    | 3     |
| 8B   | Validate props-based pattern                               | 3     |
| 9    | Copy and transform components                              | 3     |
| 10   | Generate section READMEs                                   | 4     |
| 10.5 | Generate shell README                                      | 4     |
| 11   | Consolidate data model types                               | 4     |
| 12   | Generate section test instructions                         | 4     |
| 13   | Generate design system files                               | 5     |
| 14   | Generate prompt files (assemble templates)                 | 5     |
| 15   | Generate README.md                                         | 6     |
| 16   | Copy screenshots                                           | 6     |
| 17   | Create zip file                                            | 6     |
| 18   | Confirm completion                                         | 6     |

## Execution Instructions

**To execute this command:**

1. Read `export-product/phase-1-prerequisites.md` and execute Steps 0-2
2. Read `export-product/phase-2-structure.md` and execute Steps 3-7
3. Read `export-product/phase-3-validation.md` and execute Steps 8-9
4. Read `export-product/phase-4-documentation.md` and execute Steps 10-12
5. Read `export-product/phase-5-prompts.md` and execute Steps 13-14
6. Read `export-product/phase-6-finalize.md` and execute Steps 15-18

**Important:**

- Execute phases in order — each phase depends on outputs from previous phases
- If a step fails, follow the recovery guidance in that phase file
- The `INCLUDE_SHELL` flag set in Phase 1 affects multiple subsequent phases
- Progress reporting should happen after each major step (see Phase 6)

## Key Variables

These variables are set early and used throughout the export:

| Variable                  | Set In  | Used In      | Purpose                               |
| ------------------------- | ------- | ------------ | ------------------------------------- |
| `INCLUDE_SHELL`           | Step 1  | 5,6,8,9,10.5 | Whether to include shell components   |
| `DESIGN_DIRECTION_EXISTS` | Step 1  | 8A           | Whether design direction exists       |
| `PRODUCT_NAME`            | Step 2  | 4,6,14,15    | Product name from overview            |
| `SHOULD_RUN_8A`           | Step 8A | 8A           | Whether to run design coherence check |

## Output Structure

When complete, the export creates:

```
product-plan/
├── README.md
├── product-overview.md
├── design-guidance/
│   └── frontend-design.md
├── prompts/
│   ├── one-shot-prompt.md
│   └── section-prompt.md
├── instructions/
│   ├── one-shot-instructions.md
│   └── incremental/
│       ├── 01-foundation.md
│       └── [NN]-[section-id].md
├── design-system/
├── data-model/
├── shell/
└── sections/
    └── [section-id]/

product-plan.zip (archive of above)
```

## See Also

- `agents/export-handoff.md` → "Export & Handoff" section for context
- `agents/command-reference.md` → "Template System" section for template details
- `.claude/templates/design-os/README.md` for template documentation
