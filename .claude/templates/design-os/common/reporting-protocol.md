<!-- v1.0.0 -->

## Implementation Reporting Protocol

As you implement each milestone/feature, write brief progress updates to reduce context usage:

**Format:**
```
[DONE] [Milestone/Feature] complete
Files: [key files created/modified]
Tests: [number passing]
```

**Example:**
```
[DONE] Milestone 1 (Foundation) complete
Files: src/app/layout.tsx, src/lib/theme.tsx, src/app/page.tsx
Tests: 12 passing

[DONE] Authentication system complete
Files: src/lib/auth.ts, src/app/login/page.tsx
Tests: 8 passing
```

**DO NOT:**
- (INCORRECT) Echo entire file contents back to conversation
- (INCORRECT) Quote large blocks of code unless specifically needed for discussion
- (INCORRECT) Repeat implementation details already documented

**DO:**
- (CORRECT) Confirm completion with file paths
- (CORRECT) Report test results
- (CORRECT) Highlight any issues or decisions that need user input
