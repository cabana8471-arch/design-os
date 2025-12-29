<!-- v1.0.0 -->
<!-- Usage: Include at the end of both one-shot and section prompts for final checks -->

## Final Verification Checklist

Before considering this implementation complete, verify:

**Authentication & Data Access:**

- [ ] Authentication method implemented as discussed
- [ ] User roles and permissions implemented correctly
- [ ] Protected routes/pages properly secured
- [ ] Data access properly scoped to authenticated users

**Component Integration:**

- [ ] All provided components integrated without modification
- [ ] Design tokens applied correctly (no hardcoded colors/fonts)
- [ ] Props passed correctly to all components
- [ ] Component imports use correct paths

**Design Consistency:**

- [ ] Aesthetic tone matches Design Direction document (if available)
- [ ] Color application follows documented patterns (primary/secondary/neutral usage)
- [ ] Typography treatment consistent with shell design
- [ ] Visual signatures present across all sections (rounded corners, shadows, etc.)
- [ ] Motion/interaction patterns consistent (hover states, transitions)
- [ ] Spacing patterns match established system (padding, margins, gaps)
- [ ] No jarring style differences between sections

**Testing:**

- [ ] All test scenarios from tests.md files implemented
- [ ] User flows work end-to-end
- [ ] Empty states handled correctly
- [ ] Error states handled correctly
- [ ] Loading states implemented

**Responsive & Accessibility:**

- [ ] Mobile responsive (test at 375px, 768px, 1024px, 1920px)
- [ ] Dark mode works correctly (all text readable, proper contrast)
- [ ] Keyboard navigation works (tab order, focus states)
- [ ] Screen reader friendly (semantic HTML, ARIA labels where needed)

**Deployment Readiness:**

- [ ] No console errors or warnings
- [ ] Build succeeds without errors
- [ ] Environment variables documented in .env.example
- [ ] README includes setup instructions

**Data Integrity:**

- [ ] Form validations work correctly
- [ ] Database constraints properly implemented
- [ ] Error messages are user-friendly
- [ ] Data relationships maintain referential integrity

### If Checks Fail

| Check Category        | Recovery Action                                                     |
| --------------------- | ------------------------------------------------------------------- |
| Authentication        | Review auth implementation against clarifying questions answers     |
| Component Integration | Check import paths; verify components weren't accidentally modified |
| Design Consistency    | Re-read design-direction.md and shell components for patterns       |
| Testing               | Re-read tests.md; ensure all scenarios are covered                  |
| Responsive/A11y       | Test at each breakpoint; use browser DevTools accessibility audit   |
| Deployment            | Run `npm run build`; check terminal output for specific errors      |
| Data Integrity        | Review form validation logic; check database schema constraints     |

> **Don't skip checks:** Each item exists because it's a common source of issues. Incomplete checks often lead to bugs discovered later.
