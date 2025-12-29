<!-- v1.1.0 -->
<!-- Usage: Include in both one-shot and section prompts for model selection guidance -->

## Suggested Model Usage

For optimal cost-quality balance, consider this approach:

- **Claude Opus 4.5** → Initial planning, architecture, complex business logic, final polish
- **Claude Sonnet 4** → Repetitive components, writing tests, routine CRUD operations
- **Claude Haiku** → Simple lookups, file operations, basic scaffolding (optional, for cost savings)

This is optional - use whichever model you prefer, but this can help optimize costs for large implementations.

### When to Use Each Model

| Task Type                | Recommended Model | Rationale                   |
| ------------------------ | ----------------- | --------------------------- |
| Reading design specs     | Sonnet / Haiku    | Low complexity              |
| Planning architecture    | Opus              | Requires system thinking    |
| Writing TypeScript types | Sonnet            | Straightforward translation |
| Implementing auth flow   | Opus              | Security-critical logic     |
| Creating CRUD components | Sonnet            | Repetitive patterns         |
| Writing unit tests       | Sonnet            | Pattern-based               |
| Simple file scaffolding  | Haiku             | Basic operations            |
| Debugging complex issues | Opus              | Requires reasoning          |
| Final review & polish    | Opus              | Quality assurance           |

### Context Preservation Note

When switching models mid-implementation:

- Provide a brief status summary at the start
- Reference specific file paths for context
- Include test results to show current state
