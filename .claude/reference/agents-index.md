# agents.md Index

Quick navigation to sections in the Design OS agent documentation.

> **Note:** The documentation has been modularized into separate files for maintainability. This index maps topics to their locations.

---

## Documentation Structure

| File                            | Contents                                                             |
| ------------------------------- | -------------------------------------------------------------------- |
| `agents.md`                     | Core concepts, planning flow, four pillars                           |
| `agents/command-reference.md`   | Command tables, prerequisites, step numbering, template system       |
| `agents/design-system.md`       | Design requirements, Tailwind directives, design direction           |
| `agents/section-system.md`      | File structure, view relationships, skills & design guidance         |
| `agents/shell-system.md`        | Shell relationships, shell props passthrough, utility components     |
| `agents/validation-patterns.md` | Prerequisite checks, error handling, retry logic, hookify guardrails |
| `agents/export-handoff.md`      | Export process, product context system, template state               |

---

## Core Concepts (agents.md)

| Section                             | Description                                   |
| ----------------------------------- | --------------------------------------------- |
| Understanding Design OS Context     | Two contexts: Design OS app vs Product design |
| Language Requirement                | All files must be in English                  |
| Getting Started — The Planning Flow | Complete workflow sequence                    |
| Workflow Decision Tree              | When to skip commands                         |
| Error Recovery                      | Common mistakes and fixes                     |
| The Four Pillars                    | Overview, Data Model, Design System, Shell    |
| Quick Reference: Key Documentation  | Links to other documentation files            |

---

## Commands Reference (agents/command-reference.md)

| Section                     | Description                        |
| --------------------------- | ---------------------------------- |
| Files Generated Per Command | What each command creates          |
| Command Prerequisites       | Required vs optional prerequisites |
| Step Numbering Convention   | Decimal notation explained         |
| Template System             | Prompt templates and versions      |

---

## File Structure (agents/section-system.md)

| Section                        | Description                  |
| ------------------------------ | ---------------------------- |
| Complete File Structure        | Full directory tree          |
| Shell Component Categories     | Navigation, layout, chrome   |
| Components vs Preview Wrappers | Exportable vs Design OS only |
| View Relationships             | Section view wiring          |
| Skills & Design Guidance       | SKILL.md usage               |

---

## Design Guidelines (agents/design-system.md)

| Section                    | Description                        |
| -------------------------- | ---------------------------------- |
| Design Requirements        | Responsive, dark mode, props-based |
| Content Container Standard | Padding and density guidelines     |
| Tailwind CSS v4 Directives | v4 patterns, built-in classes      |
| Import Path Aliases        | @/ alias usage                     |
| Design Direction Document  | Aesthetic decisions                |

---

## Shell System (agents/shell-system.md)

| Section                  | Description                          |
| ------------------------ | ------------------------------------ |
| Shell Relationships      | Shell component wiring               |
| Shell Props Passthrough  | ScreenDesignPage wiring              |
| Shell Utility Components | Pre-existing utilities (hooks, etc.) |

---

## Standards & Patterns (agents/validation-patterns.md)

| Section                          | Description                         |
| -------------------------------- | ----------------------------------- |
| Standardized Prerequisite Checks | Validation patterns                 |
| Error Message Format             | Error formatting standard           |
| Directory Creation               | mkdir -p patterns                   |
| Recovery Pattern                 | Failure recovery guidance           |
| Section ID Generation            | ID rules for sections               |
| Variable Naming Conventions      | Placeholder vs bash variables       |
| Retry Pattern                    | Standardized retry logic            |
| Viewport Dimensions              | Standard viewport sizes             |
| Hookify Guardrails               | Real-time feedback rules (41 rules) |

---

## Export & Handoff (agents/export-handoff.md)

| Section                   | Description              |
| ------------------------- | ------------------------ |
| Export & Handoff          | Export package structure |
| Product Context System    | Interview output         |
| Completeness Requirements | What must be complete    |
| Template State            | Empty directories        |

---

## How to Use This Index

1. Find the topic you need in the tables above
2. Open the corresponding file from the Documentation Structure table
3. Search for the section name within that file

**Tip:** In VS Code, use `Ctrl+F` (or `Cmd+F`) to search within a file.
