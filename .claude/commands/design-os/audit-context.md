<!-- v1.0.0 -->

# Audit Context

Critical analysis of `product/product-context.md` to identify issues before implementation.

**Purpose:** Identify gaps, errors, inconsistencies, ambiguities, and workflow problems in the product context file. Generate a comprehensive report with actionable recommendations.

**Output:**

- Terminal display of findings
- `product/audit-report.md` — Detailed report for reference

**Language:** Report is generated in English. Conversation can be in user's preferred language.

> **Code Block Conventions:** Code blocks in this command serve two purposes:
>
> - **Executable bash** — Marked with `bash` language tag, contains valid shell commands
> - **Pseudocode/guidance** — Describes logic the agent should implement (e.g., `HIGH_COUNT=$(count issues with 🔴)`)
>
> When pseudocode appears, implement equivalent logic rather than running literally.

---

## Step 1: Validate Context File

Check that the context file exists and has minimum required content.

```bash
CONTEXT_FILE="product/product-context.md"
REPORT_FILE="product/audit-report.md"

if [ ! -f "$CONTEXT_FILE" ]; then
  echo "Error: product-context.md - File not found. Run /product-interview first to create the product context."
  exit 1
fi

# Check minimum content (file should have > 500 chars excluding whitespace)
CONTENT_LENGTH=$(tr -d '[:space:]' < "$CONTEXT_FILE" | wc -c)
if [ "$CONTENT_LENGTH" -lt 500 ]; then
  echo "Error: product-context.md - File is empty or incomplete. Run /product-interview to complete the interview."
  exit 1
fi
```

**Parse basic info:**

```bash
# Extract product name
PRODUCT_NAME=$(grep "^# Product Context:" "$CONTEXT_FILE" | sed 's/^# Product Context: //')
if [ -z "$PRODUCT_NAME" ]; then
  PRODUCT_NAME="Unknown Product"
fi

# Extract completeness percentage
COMPLETENESS=$(grep "^Completeness:" "$CONTEXT_FILE" | grep -oE '[0-9]+' | head -1)
if [ -z "$COMPLETENESS" ]; then
  COMPLETENESS=0
fi

echo "�� Critical Analysis: $PRODUCT_NAME"
echo "📊 Context Completeness: ${COMPLETENESS}%"
echo ""
```

---

## Step 2: Quality Checks

Analyze answer quality for each category.

| Check ID | Pattern                                                    | Severity  | Description                                  |
| -------- | ---------------------------------------------------------- | --------- | -------------------------------------------- |
| Q-001    | Answers < 10 words for open questions                      | 🟠 MEDIUM | Short answers may lack necessary detail      |
| Q-002    | Generic placeholders: "TBD", "N/A", "later", "TBA", "TODO" | 🔴 HIGH   | Placeholder instead of concrete answer       |
| Q-003    | Answer echoes the question                                 | 🟠 MEDIUM | Answer repeats question without adding value |
| Q-004    | Missing specifics: no numbers, examples                    | 🟡 LOW    | Vague answer lacking concrete details        |
| Q-005    | Empty subsections (heading with no content)                | 🔴 HIGH   | Required section has no content              |

**Check implementation:**

For each of the 12 categories, extract the section content and run quality checks:

1. **Q-002 (Placeholders):** Search for patterns like `TBD`, `TODO`, `TBA`, `N/A`, `later`, `to be determined`, `not yet decided`
2. **Q-005 (Empty sections):** Look for `### ` headings followed immediately by another `### ` or `## ` without content between
3. **Q-001 (Short answers):** For subsections, count words between heading and next heading
4. **Q-004 (No specifics):** Check if section contains any numbers or specific examples

Report format for each finding:

```
🔴 Q-002: Category [N] contains placeholder "TBD" at line [X]
   Location: ### [Subsection Name]
   Current: "TBD - will decide later"
   Recommendation: Provide concrete answer or run /product-interview --stage=X to complete
```

---

## Step 3: Consistency Checks

Verify that answers across categories are logically consistent.

> **Relationship to /product-interview:** `/product-interview` includes a subset of consistency checks (quick checks during the interview). This command provides the **comprehensive check set** (C-001 through C-020) for thorough validation. Both commands complement each other: interview catches obvious conflicts early, audit provides deep analysis after context is complete.

| Check ID | Condition                                   | Severity  | Message                                                         |
| -------- | ------------------------------------------- | --------- | --------------------------------------------------------------- |
| C-001    | GDPR compliance + No audit log              | 🔴 HIGH   | "GDPR requires audit logging. Add full audit in Category 4."    |
| C-002    | No auth + Compliance-grade audit            | 🔴 HIGH   | "Audit logging without authentication is contradictory."        |
| C-003    | Real-time + 10k+ users + No scale plan      | 🔴 HIGH   | "High-scale real-time needs explicit architecture."             |
| C-004    | Full offline + No sync strategy             | 🔴 HIGH   | "Offline mode requires data synchronization strategy."          |
| C-005    | SSO/Enterprise + Free/OSS model             | 🟠 MEDIUM | "Enterprise features conflict with free model."                 |
| C-006    | Multi-tenant + No data isolation            | 🔴 HIGH   | "Multi-tenant requires explicit data isolation."                |
| C-007    | File uploads + No size limits               | 🟠 MEDIUM | "File uploads need size/type restrictions."                     |
| C-008    | Search feature + No indexing strategy       | 🟡 LOW    | "Advanced search benefits from indexing strategy."              |
| C-009    | Mobile-first + No touch interactions        | 🟠 MEDIUM | "Mobile-first should include touch gestures."                   |
| C-010    | Desktop-only + Mobile navigation            | 🟡 LOW    | "Desktop-only conflicts with mobile navigation choice."         |
| C-011    | Strict auth + No MFA                        | 🟠 MEDIUM | "Strict authentication should include MFA option."              |
| C-012    | PWA + Desktop-only responsive               | 🟠 MEDIUM | "PWA implies mobile support, conflicts with desktop-only."      |
| C-013    | Collaborative real-time + Full offline      | 🟠 MEDIUM | "Real-time collaboration and full offline are hard to combine." |
| C-014    | Large file uploads + Full offline           | 🟡 LOW    | "Large files offline is technically challenging."               |
| C-015    | Versioning + Hard delete                    | 🟠 MEDIUM | "Versioning usually implies soft delete, not hard delete."      |
| C-016    | PII data + No encryption mention            | 🟠 MEDIUM | "Personal data should mention encryption requirements."         |
| C-017    | HIPAA + No audit logging                    | 🔴 HIGH   | "HIPAA requires comprehensive audit logging."                   |
| C-018    | Payment integration + No PCI-DSS            | 🔴 HIGH   | "Payment processing requires PCI-DSS compliance."               |
| C-019    | E2E full regression + Minimal test coverage | 🟠 MEDIUM | "Full E2E regression conflicts with minimal test target."       |
| C-020    | WCAG AAA + No accessibility persona         | 🟡 LOW    | "AAA compliance should specify accessibility needs."            |

**Check implementation example:**

```bash
# C-001: GDPR without audit log
check_c001() {
  local GDPR_MENTIONED=$(grep -ci "GDPR" "$CONTEXT_FILE")
  local AUDIT_FULL=$(grep -A5 -i "audit" "$CONTEXT_FILE" | grep -ci "full\|comprehensive\|complete")

  if [ "$GDPR_MENTIONED" -gt 0 ] && [ "$AUDIT_FULL" -eq 0 ]; then
    return 0  # Issue found
  fi
  return 1  # No issue
}
```

For each failed check, report:

```
🔴 C-001: GDPR compliance without audit logging
   Found: Category 10 mentions GDPR compliance
   Missing: Category 4 Audit level is not "Full" or "Comprehensive"
   Impact: Cannot claim GDPR compliance without proper audit trail
   Fix: Update Category 4 to specify full audit logging
```

---

## Step 4: Logic Checks

Detect contradictory decisions within the same context.

| Check ID | Detection                                                 | Severity  | Message                                                              |
| -------- | --------------------------------------------------------- | --------- | -------------------------------------------------------------------- |
| L-001    | "beginners" in audience + "advanced" features only        | 🟠 MEDIUM | "Target audience (beginners) conflicts with advanced-only features." |
| L-002    | "Free/Open Source" model + "Enterprise SLA" mention       | 🔴 HIGH   | "Free model cannot include enterprise SLA commitments."              |
| L-003    | "MVP" scope + All 12 categories at 100% detail            | 🟡 LOW    | "MVP scope usually means fewer features, not comprehensive."         |
| L-004    | Primary persona conflicts with secondary persona          | 🟡 LOW    | "Check if personas have conflicting needs."                          |
| L-005    | "Simple" data model + Complex audit/versioning            | 🟠 MEDIUM | "Simple data model conflicts with complex audit requirements."       |
| L-006    | "No auth" + Role-based access control                     | 🔴 HIGH   | "Cannot have RBAC without authentication."                           |
| L-007    | "Internal tool" + Public API exposure                     | 🟠 MEDIUM | "Internal tools rarely need public API."                             |
| L-008    | "Minimal" test coverage + "Compliance-grade" requirements | 🟠 MEDIUM | "Compliance usually requires higher test coverage."                  |

Report format:

```
🔴 L-006: Authentication contradiction
   Found in Category 9: "No authentication - public access"
   Conflicts with Category 10: "Role-based access control for admin features"
   Problem: RBAC requires user identity, which requires authentication
   Fix: Either add authentication or remove RBAC requirement
```

---

## Step 5: Ambiguity Checks

Identify vague or unclear requirements that may cause implementation issues.

| Check ID | Pattern                                                                       | Severity  | Message                                         |
| -------- | ----------------------------------------------------------------------------- | --------- | ----------------------------------------------- |
| A-001    | Vague quantity terms: "fast", "good", "many", "some", "various", "several"    | 🟡 LOW    | "Vague term found. Specify concrete value."     |
| A-002    | Unclear references: "the system", "it", "they" without clear antecedent       | 🟡 LOW    | "Unclear reference. Specify what exactly."      |
| A-003    | Open-ended lists: "or similar", "etc.", "and more", "and so on"               | 🟡 LOW    | "Open-ended list. Enumerate specific items."    |
| A-004    | Conditional without specifics: "if needed", "when appropriate", "as required" | 🟠 MEDIUM | "Condition undefined. Specify when exactly."    |
| A-005    | Ranges without target: "10-1000 users" without specifying expected/target     | 🟡 LOW    | "Range without target. Specify expected value." |
| A-006    | Multiple options without decision: "A or B or C" with no preference           | 🟠 MEDIUM | "Multiple options listed. Make a decision."     |

**Pattern detection:**

```bash
# A-001: Vague quantity terms
VAGUE_PATTERNS="\\bfast\\b|\\bgood\\b|\\bmany\\b|\\bsome\\b|\\bvarious\\b|\\bseveral\\b|\\bfew\\b|\\bquick\\b|\\beasy\\b"
VAGUE_MATCHES=$(grep -ciE "$VAGUE_PATTERNS" "$CONTEXT_FILE")

# A-003: Open-ended lists
OPENENDED_PATTERNS="or similar|etc\\.|and more|and so on|among others"
OPENENDED_MATCHES=$(grep -ciE "$OPENENDED_PATTERNS" "$CONTEXT_FILE")
```

Report excessive vagueness (threshold: >5 instances per pattern):

```
🟡 A-001: Multiple vague terms found (12 occurrences)
   Examples found at:
   - Line 45: "fast loading times" → Specify: "< 2 second load time"
   - Line 78: "many users" → Specify: "up to 1000 concurrent users"
   - Line 123: "good UX" → Specify: "WCAG AA compliant, < 3 clicks to any feature"
   Recommendation: Replace vague terms with specific, measurable criteria
```

---

## Step 6: Duplication Checks

Identify redundant or contradictory information.

| Check ID | Detection                                               | Severity  | Message                                                         |
| -------- | ------------------------------------------------------- | --------- | --------------------------------------------------------------- |
| D-001    | Same answer appears in 2+ categories                    | 🟡 LOW    | "Duplicate content between categories. Consider consolidating." |
| D-002    | Contradictory info about same topic in different places | 🔴 HIGH   | "Contradictory information about [topic]."                      |
| D-003    | Quick Reference table status mismatches category detail | 🟠 MEDIUM | "Quick Reference shows ✅ but category has incomplete content." |
| D-004    | Cross-Reference lists category that is ❌ Empty         | 🟡 LOW    | "Cross-Reference mentions category [N] but it's empty."         |

**D-003 Check implementation:**

1. Parse Quick Reference table for category statuses (✅/⚠️/❌)
2. For each category marked ✅:
   - Check if category section exists
   - Check if section has substantive content (not just placeholders)
   - Flag mismatch if ✅ but content is incomplete

Report format:

```
🟠 D-003: Quick Reference mismatch
   Quick Reference shows: Category 4 ✅ Complete
   Actual content: Category 4 has 2 subsections with "TBD"
   Impact: May proceed thinking category is ready when it's not
   Fix: Update Quick Reference to ⚠️ Partial, or complete Category 4
```

**D-004 Check implementation:**

1. Parse Cross-Reference section for command-to-category mappings
2. For each category mentioned in Cross-Reference:
   - Check if Quick Reference shows ❌ Empty for that category
   - Flag if a command references an empty category

Report format:

```
🟡 D-004: Cross-Reference references empty category
   Cross-Reference: /shape-section uses Category 8
   Quick Reference: Category 8 ❌ Empty
   Impact: Command may not have required context
   Fix: Run /product-interview --stage=scale to complete Category 8
```

---

## Step 7: Command Readiness

Verify context completeness for each downstream Design OS command.

| Command            | Required Categories | Optional Categories | Ready When           |
| ------------------ | ------------------- | ------------------- | -------------------- |
| `/product-vision`  | 1, 2                | —                   | Both ✅              |
| `/product-roadmap` | 1                   | 2, 8                | 1 is ✅              |
| `/data-model`      | 4, 10               | 1                   | Both 4, 10 are ✅    |
| `/design-tokens`   | 3                   | 1                   | 3 is ✅              |
| `/design-shell`    | 2, 3                | 7, 9                | 2 and 3 are ✅       |
| `/shape-section`   | 5, 6                | 8, 11               | Both 5, 6 are ✅     |
| `/sample-data`     | 4, 5                | —                   | Both 4, 5 are ✅     |
| `/design-screen`   | 5, 6                | 3, 7, 11            | 5 and 6 are ✅       |
| `/export-product`  | 9, 10, 12           | all others          | All 9, 10, 12 are ✅ |

> **Note:** Categories are aligned with the Cross-Reference section in `/product-interview` output. Required categories BLOCK the command; Optional categories provide enhanced context but won't prevent execution.

**Check implementation:**

```bash
check_command_readiness() {
  local CMD=$1
  local REQUIRED_CATS=$2
  local ALL_READY=true
  local BLOCKING=""

  for cat in $REQUIRED_CATS; do
    # Look for category in Quick Reference table
    CAT_LINE=$(grep -E "^\| *$cat\." "$CONTEXT_FILE" | head -1)
    if ! echo "$CAT_LINE" | grep -qE "(✅|Complete)"; then
      ALL_READY=false
      BLOCKING="$BLOCKING $cat"
    fi
  done

  if [ "$ALL_READY" = true ]; then
    echo "✅"
  else
    echo "❌ (missing:$BLOCKING)"
  fi
}
```

Output table:

```
## Command Readiness

| Command | Status | Blocking Categories | Blocking Issues |
|---------|--------|--------------------|-----------------|
| /product-vision | ✅ Ready | — | — |
| /product-roadmap | ✅ Ready | — | — |
| /data-model | ⚠️ Partial | 10 | C-001 |
| /design-tokens | ✅ Ready | — | — |
| /design-shell | ✅ Ready | — | C-009 (warning) |
| /shape-section | ✅ Ready | — | — |
| /sample-data | ⚠️ Partial | 4 | Q-002 |
| /design-screen | ✅ Ready | — | — |
| /export-product | ❌ Blocked | 9, 10, 12 | C-001, L-002 |
```

---

## Step 8: Generate Report

After running all checks, generate the comprehensive report.

### 8.1: Calculate Summary

```bash
# Count issues by severity
HIGH_COUNT=$(count issues with 🔴)
MEDIUM_COUNT=$(count issues with 🟠)
LOW_COUNT=$(count issues with 🟡)
TOTAL_ISSUES=$((HIGH_COUNT + MEDIUM_COUNT + LOW_COUNT))

# Determine recommendation
if [ "$HIGH_COUNT" -eq 0 ] && [ "$MEDIUM_COUNT" -eq 0 ]; then
  RECOMMENDATION="✅ PROCEED"
  REC_MESSAGE="Context is solid. Ready for implementation."
elif [ "$HIGH_COUNT" -eq 0 ]; then
  RECOMMENDATION="⚠️ FIX RECOMMENDED"
  REC_MESSAGE="Consider addressing MEDIUM issues before proceeding."
elif [ "$HIGH_COUNT" -le 2 ]; then
  RECOMMENDATION="⚠️ FIX REQUIRED"
  REC_MESSAGE="Fix HIGH priority issues before proceeding."
else
  RECOMMENDATION="🔴 MAJOR REVISION NEEDED"
  REC_MESSAGE="Significant issues found. Thorough revision required."
fi
```

### 8.2: Report Structure

Write to `product/audit-report.md`:

```markdown
# Critical Analysis Report: [Product Name]

**Generated:** [ISO date]
**Context File:** product/product-context.md
**Context Completeness:** [X]%
**Issues Found:** [N] total (🔴 [X] HIGH, 🟠 [Y] MEDIUM, 🟡 [Z] LOW)
**Recommendation:** [RECOMMENDATION]

> [REC_MESSAGE]

---

## Executive Summary

| Severity  | Count | Affected Categories    |
| --------- | ----- | ---------------------- |
| 🔴 HIGH   | [N]   | [comma-separated list] |
| 🟠 MEDIUM | [N]   | [comma-separated list] |
| 🟡 LOW    | [N]   | [comma-separated list] |

**Quick Assessment:**

- [x] critical issues blocking implementation
- [Y] medium issues worth addressing
- [Z] low priority suggestions

---

## Issues Found

### 🔴 HIGH Priority Issues

[For each HIGH issue:]

#### [ISSUE-001] [Descriptive Title]

**Category:** [N]. [Category Name]
**Type:** Quality / Consistency / Logic / Ambiguity / Duplication
**Check ID:** [Q-XXX / C-XXX / L-XXX / A-XXX / D-XXX]

**Problem:**
[Clear description of the issue]

**Current Value:**

> [Quoted text from product-context.md]

**Recommended Fix:**
[Specific, actionable suggestion]

**Impact if Not Fixed:**
[What downstream command will fail or produce poor results]

---

### 🟠 MEDIUM Priority Issues

[Same format as HIGH]

---

### 🟡 LOW Priority Issues

[Same format, or condensed list for brevity if many]

---

## Consistency Matrix

| Check | Status  | Details                                  |
| ----- | ------- | ---------------------------------------- |
| C-001 | ✅ PASS | —                                        |
| C-002 | ✅ PASS | —                                        |
| C-003 | ❌ FAIL | Real-time + 10k users without scale plan |
| ...   | ...     | ...                                      |

---

## Command Readiness

| Command          | Status     | Blocking Issues |
| ---------------- | ---------- | --------------- |
| /product-vision  | ✅ Ready   | —               |
| /product-roadmap | ✅ Ready   | —               |
| /data-model      | ⚠️ Partial | C-001           |
| /design-shell    | ✅ Ready   | —               |
| /shape-section   | ✅ Ready   | —               |
| /sample-data     | ⚠️ Partial | Q-002           |
| /design-screen   | ✅ Ready   | —               |
| /export-product  | ❌ Blocked | C-001, L-002    |

---

## Recommended Actions

### Critical (Must Fix)

1. **[ISSUE-001]** [Action] — [Brief why]
2. **[ISSUE-002]** [Action] — [Brief why]

### Important (Should Fix)

1. **[ISSUE-003]** [Action]
2. **[ISSUE-004]** [Action]

### Suggested (Nice to Have)

1. [Suggestion]
2. [Suggestion]
```

### 8.3: Write Report File

```bash
# Create directory with error handling (standard pattern from agents.md)
mkdir -p product || {
  echo "Error: product directory - Failed to create. Check write permissions: ls -la ."
  exit 1
}

cat > "$REPORT_FILE" << 'EOF'
[Generated report content]
EOF

# Verify file was created
if [ ! -f "$REPORT_FILE" ]; then
  echo "Error: $REPORT_FILE - Failed to create report file."
  exit 1
fi

echo "📄 Report saved to: $REPORT_FILE"
```

### 8.4: Validate Report Structure

Verify the generated report has all required sections.

```bash
VALIDATION_ERRORS=0

# 1. Check Executive Summary exists
if ! grep -q "^## Executive Summary" "$REPORT_FILE"; then
  echo "Warning: Executive Summary section missing from report"
  VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

# 2. Check Issues Found section exists
if ! grep -q "^## Issues Found" "$REPORT_FILE"; then
  echo "Warning: Issues Found section missing from report"
  VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

# 3. Check Command Readiness section exists
if ! grep -q "^## Command Readiness" "$REPORT_FILE"; then
  echo "Warning: Command Readiness section missing from report"
  VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

# 4. Verify issue counts match summary
REPORTED_HIGH=$(grep "🔴 HIGH" "$REPORT_FILE" | head -1 | grep -oE '[0-9]+' | head -1)
ACTUAL_HIGH=$(grep -c "^#### \[ISSUE-" "$REPORT_FILE" 2>/dev/null || echo 0)
# Note: Simplified check - full validation would verify each severity level

# 5. Report validation results
if [ $VALIDATION_ERRORS -gt 0 ]; then
  echo "Warning: $VALIDATION_ERRORS validation issues in generated report"
else
  echo "Report structure validated successfully"
fi
```

> **Recovery:** If validation fails, check the issue detection logic in Steps 2-6. The report generation may have incomplete data.

---

## Step 9: Display Summary & Next Steps

### 9.1: Terminal Summary

Display concise summary in terminal:

```
═══════════════════════════════════════════════════════════
🔍 CRITICAL ANALYSIS COMPLETE: [Product Name]
═══════════════════════════════════════════════════════════

📊 Context Completeness: [X]%

📋 Issues Found: [N] total
   🔴 HIGH:   [X]
   🟠 MEDIUM: [Y]
   🟡 LOW:    [Z]

📝 Full report: product/audit-report.md

**Recommendation:** [RECOMMENDATION]
[REC_MESSAGE]

═══════════════════════════════════════════════════════════
```

### 9.2: Next Steps Options

Present options to user:

"Ce vrei să faci în continuare?"

**Options:**

- **Revizuiesc raportul** — Open product/audit-report.md for detailed review
- **Corectez problemele** — Edit product-context.md and re-run /audit-context
- **Continui oricum** — Accept risks and proceed with Design OS commands
- **Ies** — Stop here for now

### 9.3: Guidance Based on Selection

**If "Revizuiesc raportul":**

```
Full report at: product/audit-report.md

Each issue includes:
- Clear problem description
- Current text from product-context.md
- Specific fix recommendation
- Impact if not fixed

After review:
1. Edit product/product-context.md with fixes
2. Re-run: /audit-context
3. When 0 HIGH issues: safe to proceed
```

**If "Corectez problemele":**

```
Recommended workflow:

1. Open product/product-context.md
2. Search for each ISSUE-XXX from report
3. Apply recommended fixes
4. Run: /audit-context
5. Repeat until HIGH = 0

Tip: Start with HIGH priority, leave LOW for later.
```

**If "Continui oricum":**

```
⚠️ Warning: [X] HIGH issues unresolved.

Affected commands:
- /data-model: may generate incomplete model
- /export-product: instructions may be incomplete

Proceed anyway? [Yes / No]
```

**If "Ies":**

```
Report saved at: product/audit-report.md

To resume later:
1. Review the report
2. Fix issues in product-context.md
3. Run: /audit-context
```

---

## Step 10: Re-run Detection (Optional)

If a previous report exists, compare with current run:

```bash
if [ -f "$REPORT_FILE" ]; then
  # Parse previous counts from existing report
  PREV_HIGH=$(grep "🔴 HIGH" "$REPORT_FILE" | grep -oE '[0-9]+' | head -1)
  PREV_MEDIUM=$(grep "🟠 MEDIUM" "$REPORT_FILE" | grep -oE '[0-9]+' | head -1)
  PREV_LOW=$(grep "🟡 LOW" "$REPORT_FILE" | grep -oE '[0-9]+' | head -1)

  # Show comparison
  echo "📊 Comparison with previous analysis:"
  echo ""
  echo "Before: $PREV_HIGH HIGH, $PREV_MEDIUM MEDIUM, $PREV_LOW LOW"
  echo "Now:    $HIGH_COUNT HIGH, $MEDIUM_COUNT MEDIUM, $LOW_COUNT LOW"
  echo ""

  # Calculate delta
  RESOLVED=$((PREV_HIGH + PREV_MEDIUM + PREV_LOW - TOTAL_ISSUES))
  if [ "$RESOLVED" -gt 0 ]; then
    echo "✅ Resolved: $RESOLVED issues fixed"
  fi
fi
```

---

## Appendix: Issue ID Reference

All issue IDs follow the pattern `[Type]-[NNN]`:

| Prefix | Type        | Check Range    |
| ------ | ----------- | -------------- |
| Q      | Quality     | Q-001 to Q-005 |
| C      | Consistency | C-001 to C-020 |
| L      | Logic       | L-001 to L-008 |
| A      | Ambiguity   | A-001 to A-006 |
| D      | Duplication | D-001 to D-004 |

When reporting specific findings, use format `ISSUE-[NNN]` as unique identifier for each occurrence in the report.

---

## Notes

**Template System:** Unlike `/export-product`, this command does not use the template system in `.claude/templates/`. The report is generated directly from issue detection logic.

**Recovery if Interrupted:** This command is read-only and can simply be re-run if interrupted. No data is modified during execution — only the report file is created at the end (Step 8.3).
