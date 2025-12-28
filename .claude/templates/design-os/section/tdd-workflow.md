<!-- v1.2.0-section -->
<!-- Usage: Include in section-specific prompts for incremental implementation -->

## Implementation Approach

Use test-driven development for this section:

1. Read the section's `tests.md` file and write failing tests first
2. Implement the section's components and features to make tests pass
3. Refactor while keeping tests green

### Section-Specific Testing Notes

- Focus tests on this section's user flows and UI requirements
- Test components in isolation using the Props interfaces from `types.ts`
- Verify callbacks are invoked correctly for user actions
- Test edge cases mentioned in the section spec (empty states, loading, errors)
- Ensure components work with the sample data from `sample-data.json`

When the section's tests pass, the section is ready for integration.

### Test Scope for This Section

| Test Type              | What to Test                     | Example                                |
| ---------------------- | -------------------------------- | -------------------------------------- |
| Component unit tests   | Props rendering, callbacks       | "renders invoice list with data"       |
| User interaction tests | Click handlers, form submissions | "calls onDelete when delete clicked"   |
| Edge case tests        | Empty states, error states       | "shows empty message when no invoices" |

**Note:** This workflow template is for section-specific implementation. Cross-section integration tests and E2E tests are covered in the one-shot workflow (`common/tdd-workflow.md`).
