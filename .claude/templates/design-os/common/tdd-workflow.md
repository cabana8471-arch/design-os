<!-- v1.1.0 -->
<!-- Usage: Include in one-shot prompts for full product implementation -->

## Implementation Approach

Use test-driven development for the complete implementation:

1. Read each section's `tests.md` file and write failing tests first
2. Implement features milestone-by-milestone to make tests pass
3. Refactor while keeping tests green

### Full Implementation Testing Notes

- Start with foundation tests (routing, authentication, data layer)
- Progress through sections in roadmap order
- Run the full test suite after each milestone to catch regressions
- Integration tests should verify sections work together (shared data model, navigation)
- Final tests should cover end-to-end user journeys across multiple sections

When all section tests pass and integration tests are green, the implementation is complete.

### Test Categories for Full Implementation

| Category | Scope | When to Write |
|----------|-------|---------------|
| Unit tests | Individual components, utilities | Per-section as you build |
| Integration tests | Cross-section interactions | After foundation + first section |
| E2E tests | Complete user journeys | After all sections complete |

**Note:** This workflow template is for one-shot/full implementation. For section-specific prompts, use `section/tdd-workflow.md` which focuses on isolated section testing.
