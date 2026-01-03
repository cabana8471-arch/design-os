<!-- v1.3.6 -->

# Product Interview

You are conducting a comprehensive product interview to gather detailed context for Design OS. This command creates `product/product-context.md` which is **required** by all other Design OS commands.

**Language:** Conduct the conversation in the user's preferred language (this template uses Romanian prompts as examples). **All output files MUST be in English** for portability.

> **Note on Romanian text:** User-facing conversation messages in this command (questions, options, feedback) are written in Romanian as the default example. This is intentional — these are conversation messages, not file output. When implementing for other languages, replace these with appropriate translations.

> **Code Block Conventions:** Code blocks in this command serve two purposes:
>
> - **Executable bash** — Marked with `bash` language tag, contains valid shell commands
> - **Pseudocode/guidance** — Describes logic the agent should implement (not literal code)
>
> When pseudocode appears (e.g., `HIGH_COUNT=$(count issues with 🔴)`), implement equivalent logic rather than running literally.

> **⚠️ No Auto-Save:** Progress is saved only at the end of the interview (Step 14). If you need to stop mid-interview:
>
> - Consider using `--minimal` (~20 min) or `--stage=X` (~10-15 min) for shorter sessions
> - Ask the agent to "pause and summarize" — it will provide a summary of answers so far that you can save externally
> - Re-run `/product-interview` later to continue where you left off (if partial context exists)

---

## Documentation Structure

This command is split into modular phase files for maintainability:

| Phase                                     | Steps | Contents                                                 |
| ----------------------------------------- | ----- | -------------------------------------------------------- |
| `product-interview/phase-1-setup.md`      | 0-1   | Mode detection, argument parsing, existing context check |
| `product-interview/phase-2-foundation.md` | 2-7   | Categories 1-6: Foundation through UI Patterns           |
| `product-interview/phase-3-depth.md`      | 8-13  | Categories 7-12: Mobile through Testing & Quality        |
| `product-interview/phase-4-synthesis.md`  | 14    | Completeness calculation, output generation, validation  |

---

## Step Index

| Step | Purpose                          | Phase |
| ---- | -------------------------------- | ----- |
| 0    | Mode Detection                   | 1     |
| 1    | Check Existing Context           | 1     |
| 2    | Product Foundation (Cat 1)       | 2     |
| 3    | User Research & Personas (Cat 2) | 2     |
| 4    | Design Direction (Cat 3)         | 2     |
| 5    | Data Architecture (Cat 4)        | 2     |
| 6    | Section-Specific Depth (Cat 5)   | 2     |
| 7    | UI Patterns & Components (Cat 6) | 2     |
| 8    | Mobile & Responsive (Cat 7)      | 3     |
| 9    | Performance & Scale (Cat 8)      | 3     |
| 10   | Integration Points (Cat 9)       | 3     |
| 11   | Security & Compliance (Cat 10)   | 3     |
| 12   | Error Handling (Cat 11)          | 3     |
| 13   | Testing & Quality (Cat 12)       | 3     |
| 14   | Synthesis & Output               | 4     |

---

## Workflow Overview

### Phase 1: Setup & Mode Detection (Steps 0-1)

**Read:** `product-interview/phase-1-setup.md`

- Parse command arguments (--minimal, --stage, --audit, --skip-validation)
- Validate argument combinations
- Check for early exit conditions (all requested categories complete)
- Check for existing context file and offer merge options
- Determine interview mode (full, complete_missing, audit)

### Phase 2: Foundation Categories 1-6 (Steps 2-7)

**Read:** `product-interview/phase-2-foundation.md`

- Step 2: Product Foundation (name, audience, problem, competitors, metrics, business model)
- Step 3: User Research & Personas (personas, accessibility, geography)
- Step 4: Design Direction (aesthetic tone, animation, density, brand, inspiration)
- Step 5: Data Architecture (sensitivity, compliance, relationships, audit, deletion)
- Step 6: Section-Specific Depth (user flows, edge cases, empty/loading/error states)
- Step 7: UI Patterns & Components (data display, validation, notifications, confirmations, modals)

### Phase 3: Depth Categories 7-12 (Steps 8-13)

**Read:** `product-interview/phase-3-depth.md`

- Step 8: Mobile & Responsive (priority, touch, navigation, offline)
- Step 9: Performance & Scale (users, data volume, real-time, search)
- Step 10: Integration Points (auth, external services, API)
- Step 11: Security & Compliance (auth security, authorization, audit logging)
- Step 12: Error Handling (message style, retry, undo/redo, data loss prevention)
- Step 13: Testing & Quality (coverage, E2E scope, accessibility, browser support)

### Phase 4: Synthesis & Output (Step 14)

**Read:** `product-interview/phase-4-synthesis.md`

- Calculate completeness percentage
- Preserve existing answers (if complete_missing mode)
- Generate product-context.md with all categories
- Validate output file structure
- Present summary to user with next steps

---

## Quick Reference

### Mode Options

| Mode                | Categories (1-12) | Output                                   |
| ------------------- | ----------------- | ---------------------------------------- |
| Default             | All 12            | Full product-context.md                  |
| `--minimal`         | 1, 3, 5, 6, 7, 11 | Quick start context (6 categories = 50%) |
| `--stage=vision`    | 1, 2              | Foundation + User Research               |
| `--stage=section`   | 5, 6, 7, 8, 11    | Section design context                   |
| `--stage=shell`     | 3, 6, 7           | Shell design context                     |
| `--stage=data`      | 4, 10             | Data architecture context                |
| `--stage=scale`     | 8, 9              | Performance + Integration context        |
| `--stage=quality`   | 12                | Testing & Quality context                |
| `--audit`           | N/A               | Report on completeness                   |
| `--skip-validation` | All 12            | Skip Step 1 (existing context check)     |

### Files Generated

| File                 | Location   | Purpose                                          |
| -------------------- | ---------- | ------------------------------------------------ |
| `product-context.md` | `product/` | Comprehensive context for all Design OS commands |

### Prerequisites

| Prerequisite | Required | Notes                                     |
| ------------ | -------- | ----------------------------------------- |
| None         | —        | This is the first command in the workflow |

### Question Counts

| Category | Questions | Cumulative |
| -------- | --------- | ---------- |
| 1        | 6         | 1-6        |
| 2        | 4         | 7-10       |
| 3        | 5         | 11-15      |
| 4        | 5         | 16-20      |
| 5        | 5         | 21-25      |
| 6        | 5         | 26-30      |
| 7        | 4         | 31-34      |
| 8        | 4         | 35-38      |
| 9        | 3         | 39-41      |
| 10       | 3         | 42-44      |
| 11       | 4         | 45-48      |
| 12       | 4         | 49-52      |

**Total:** ~52 questions for full interview, ~29 questions for minimal mode (full: 45-60 min, minimal: 20-30 min)

---

## See Also

- `agents/export-handoff.md` → Product Context System, Completeness Requirements
- `agents/validation-patterns.md` → Prerequisite checks, Error handling
- `/audit-context` → Deep analysis of product-context.md
- `/product-vision` → Next command after interview
