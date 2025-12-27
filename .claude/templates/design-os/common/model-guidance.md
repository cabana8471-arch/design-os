<!-- v1.1.0 -->
<!-- Usage: Include in both one-shot and section prompts for model selection guidance -->

## Suggested Model Usage

For optimal cost-quality balance, consider this approach:

- **Claude Opus** → Initial implementation planning, architectural decisions, complex business logic
- **Claude Sonnet** → Implementing repetitive components, writing tests, routine CRUD operations
- **Claude Opus** → Final integration, edge cases, polish, and deployment

This is optional - use whichever model you prefer, but this can help optimize costs for large implementations.

### When to Use Each Model

| Task Type | Recommended Model | Rationale |
|-----------|-------------------|-----------|
| Reading design specs | Either | Low complexity |
| Planning architecture | Opus | Requires system thinking |
| Writing TypeScript types | Sonnet | Straightforward translation |
| Implementing auth flow | Opus | Security-critical logic |
| Creating CRUD components | Sonnet | Repetitive patterns |
| Writing unit tests | Sonnet | Pattern-based |
| Debugging complex issues | Opus | Requires reasoning |
| Final review & polish | Opus | Quality assurance |

### Context Preservation Note

When switching models mid-implementation:
- Provide a brief status summary at the start
- Reference specific file paths for context
- Include test results to show current state
