<!-- v1.1.6 -->

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

# Save previous report values for comparison (used in Step 10)
PREV_HIGH=0
PREV_MEDIUM=0
PREV_LOW=0
PREV_REPORT_EXISTS=false

if [ -f "$REPORT_FILE" ]; then
  PREV_REPORT_EXISTS=true
  PREV_HIGH=$(grep "🔴 HIGH" "$REPORT_FILE" | grep -oE '[0-9]+' | head -1 || echo 0)
  PREV_MEDIUM=$(grep "🟠 MEDIUM" "$REPORT_FILE" | grep -oE '[0-9]+' | head -1 || echo 0)
  PREV_LOW=$(grep "🟡 LOW" "$REPORT_FILE" | grep -oE '[0-9]+' | head -1 || echo 0)
fi

# Verify essential file structure
STRUCTURE_VALID=true
STRUCTURE_WARNINGS=""

if ! grep -q "^## Quick Reference" "$CONTEXT_FILE"; then
  STRUCTURE_WARNINGS="${STRUCTURE_WARNINGS}\n  - Missing Quick Reference section"
  STRUCTURE_VALID=false
fi

if ! grep -q "^Completeness:" "$CONTEXT_FILE"; then
  STRUCTURE_WARNINGS="${STRUCTURE_WARNINGS}\n  - Missing Completeness line"
  STRUCTURE_VALID=false
fi

SECTION_COUNT=$(grep -c "^## [0-9]\+\." "$CONTEXT_FILE" 2>/dev/null || echo 0)
if [ "$SECTION_COUNT" -lt 6 ]; then
  STRUCTURE_WARNINGS="${STRUCTURE_WARNINGS}\n  - Only $SECTION_COUNT/12 category sections found"
  STRUCTURE_VALID=false
fi

if ! grep -q "^## Cross-Reference" "$CONTEXT_FILE"; then
  STRUCTURE_WARNINGS="${STRUCTURE_WARNINGS}\n  - Missing Cross-Reference section"
  STRUCTURE_VALID=false
fi

if [ "$STRUCTURE_VALID" = false ]; then
  echo "⚠️ Structure warnings detected:$STRUCTURE_WARNINGS"
  echo ""
  echo "The context file may be corrupted or incomplete."
  echo "Consider running /product-interview to regenerate."
  echo ""
  # Continue with audit but note issues in report
fi
```

**Parse basic info:**

```bash
# Extract product name
PRODUCT_NAME=$(grep "^# Product Context:" "$CONTEXT_FILE" | sed 's/^# Product Context: //')
if [ -z "$PRODUCT_NAME" ]; then
  PRODUCT_NAME="Unknown Product"
fi

# Extract completeness percentage from header
COMPLETENESS=$(grep "^Completeness:" "$CONTEXT_FILE" | grep -oE '[0-9]+' | head -1)
if [ -z "$COMPLETENESS" ]; then
  COMPLETENESS=0
fi

# Verify completeness by counting Quick Reference table statuses
COMPLETE_COUNT=$(grep -E "^\| *[0-9]+\." "$CONTEXT_FILE" | grep -cE "(✅|Complete)")
CALCULATED_COMPLETENESS=$((COMPLETE_COUNT * 100 / 12))

# Check for mismatch between extracted and calculated
if [ "$COMPLETENESS" -ne "$CALCULATED_COMPLETENESS" ]; then
  echo "⚠️ Completeness mismatch detected:"
  echo "   Header shows: ${COMPLETENESS}%"
  echo "   Calculated:   ${CALCULATED_COMPLETENESS}% (${COMPLETE_COUNT}/12 categories ✅)"
  echo "   Using calculated value."
  COMPLETENESS=$CALCULATED_COMPLETENESS
fi

echo "🔍 Critical Analysis: $PRODUCT_NAME"
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

**Empty subsection threshold (Q-005):**

| Content Length            | Status      | Action                      |
| ------------------------- | ----------- | --------------------------- |
| 0 chars (heading only)    | 🔴 Empty    | Must add content            |
| 1-25 non-whitespace chars | 🔴 Empty    | Content too short, expand   |
| 26-100 chars              | 🟠 Minimal  | Consider adding more detail |
| 100+ chars                | ✅ Complete | Sufficient content          |

> **Measurement:** Count non-whitespace characters between `### Heading` and next `###` or `##`, excluding markdown formatting (bullets, bold markers, etc.).

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

> **Relationship to /product-interview:** `/product-interview` includes a subset of consistency checks (quick checks during the interview). This command provides the **comprehensive check set** (C-001 through C-021) for thorough validation. Both commands complement each other: interview catches obvious conflicts early, audit provides deep analysis after context is complete.

| Check ID | Condition                                   | Severity  | Message                                                                   |
| -------- | ------------------------------------------- | --------- | ------------------------------------------------------------------------- |
| C-001    | GDPR compliance + No audit log              | 🔴 HIGH   | "GDPR requires audit logging. Add full audit in Category 4."              |
| C-002    | No auth + Compliance-grade audit            | 🔴 HIGH   | "Audit logging without authentication is contradictory."                  |
| C-003    | Real-time + 10k+ users + No scale plan      | 🔴 HIGH   | "High-scale real-time needs explicit architecture."                       |
| C-004    | Full offline + No sync strategy             | 🔴 HIGH   | "Offline mode requires data synchronization strategy."                    |
| C-005    | SSO/Enterprise + Free/OSS model             | 🟠 MEDIUM | "Enterprise features conflict with free model."                           |
| C-006    | Multi-tenant + No data isolation            | 🔴 HIGH   | "Multi-tenant requires explicit data isolation."                          |
| C-007    | File uploads + No size limits               | 🟠 MEDIUM | "File uploads need size/type restrictions."                               |
| C-008    | Search feature + No indexing strategy       | 🟡 LOW    | "Advanced search benefits from indexing strategy."                        |
| C-009    | Mobile-first + No touch interactions        | 🟠 MEDIUM | "Mobile-first should include touch gestures."                             |
| C-010    | Desktop-only + Mobile navigation            | 🟡 LOW    | "Desktop-only conflicts with mobile navigation choice."                   |
| C-011    | Strict auth + No MFA                        | 🟠 MEDIUM | "Strict authentication should include MFA option."                        |
| C-012    | PWA + Desktop-only responsive               | 🟠 MEDIUM | "PWA implies mobile support, conflicts with desktop-only."                |
| C-013    | Collaborative real-time + Full offline      | 🟠 MEDIUM | "Real-time collaboration and full offline are hard to combine."           |
| C-014    | Large file uploads + Full offline           | 🟡 LOW    | "Large files offline is technically challenging."                         |
| C-015    | Versioning + Hard delete                    | 🟠 MEDIUM | "Versioning usually implies soft delete, not hard delete."                |
| C-016    | PII data + No encryption mention            | 🟠 MEDIUM | "Personal data should mention encryption requirements."                   |
| C-017    | HIPAA + No audit logging                    | 🔴 HIGH   | "HIPAA requires comprehensive audit logging."                             |
| C-018    | Payment integration + No PCI-DSS            | 🔴 HIGH   | "Payment processing requires PCI-DSS compliance."                         |
| C-019    | E2E full regression + Minimal test coverage | 🟠 MEDIUM | "Full E2E regression conflicts with minimal test target."                 |
| C-020    | WCAG AAA + No accessibility persona         | 🟡 LOW    | "AAA compliance should specify accessibility needs."                      |
| C-021    | GDPR compliance + No PII data mentioned     | 🟡 LOW    | "GDPR selected but no personal data described. Verify if PII is handled." |

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

# C-002: No auth + Compliance-grade audit
check_c002() {
  local NO_AUTH=$(grep -ciE "no auth|without auth|public access|no login" "$CONTEXT_FILE")
  local COMPLIANCE_AUDIT=$(grep -ciE "compliance|SOC|ISO|audit trail|audit log" "$CONTEXT_FILE")

  if [ "$NO_AUTH" -gt 0 ] && [ "$COMPLIANCE_AUDIT" -gt 0 ]; then
    return 0  # Issue found: audit requires identity tracking
  fi
  return 1
}

# C-003: Real-time + 10k+ users + No scale plan
check_c003() {
  local REALTIME=$(grep -ciE "real-?time|live update|websocket|push notification" "$CONTEXT_FILE")
  local HIGH_USERS=$(grep -oE "[0-9]+[kK]?\+? users" "$CONTEXT_FILE" | grep -E "[0-9]{4,}|[0-9]+[kK]" | wc -l)
  local SCALE_PLAN=$(grep -ciE "scale|horizontal|vertical|load balanc|sharding|caching strategy" "$CONTEXT_FILE")

  if [ "$REALTIME" -gt 0 ] && [ "$HIGH_USERS" -gt 0 ] && [ "$SCALE_PLAN" -eq 0 ]; then
    return 0  # Issue found
  fi
  return 1
}

# C-004: Full offline + No sync strategy
check_c004() {
  local OFFLINE=$(grep -ciE "full offline|offline first|offline mode|work offline" "$CONTEXT_FILE")
  local SYNC=$(grep -ciE "sync|synchroniz|conflict resolution|merge strategy" "$CONTEXT_FILE")

  if [ "$OFFLINE" -gt 0 ] && [ "$SYNC" -eq 0 ]; then
    return 0  # Issue found
  fi
  return 1
}

# C-006: Multi-tenant + No data isolation
check_c006() {
  local MULTITENANT=$(grep -ciE "multi-?tenant|tenant|organization|workspace" "$CONTEXT_FILE")
  local ISOLATION=$(grep -ciE "data isolation|tenant isolation|row-level|schema per tenant|database per tenant" "$CONTEXT_FILE")

  if [ "$MULTITENANT" -gt 0 ] && [ "$ISOLATION" -eq 0 ]; then
    return 0  # Issue found
  fi
  return 1
}

# C-017: HIPAA + No audit logging
check_c017() {
  local HIPAA=$(grep -ci "HIPAA" "$CONTEXT_FILE")
  local AUDIT=$(grep -ciE "audit log|audit trail|access log|comprehensive audit" "$CONTEXT_FILE")

  if [ "$HIPAA" -gt 0 ] && [ "$AUDIT" -eq 0 ]; then
    return 0  # Issue found
  fi
  return 1
}

# C-018: Payment integration + No PCI-DSS
check_c018() {
  local PAYMENT=$(grep -ciE "payment|stripe|paypal|credit card|billing|checkout" "$CONTEXT_FILE")
  local PCI=$(grep -ciE "PCI|PCI-DSS|payment compliance|tokeniz" "$CONTEXT_FILE")

  if [ "$PAYMENT" -gt 0 ] && [ "$PCI" -eq 0 ]; then
    return 0  # Issue found
  fi
  return 1
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

**Detection guidance:**

```bash
# L-001: Beginners audience + Advanced-only features
check_l001() {
  local BEGINNERS=$(grep -ciE "beginner|novice|new user|first-time|non-technical" "$CONTEXT_FILE")
  local ADVANCED_ONLY=$(grep -ciE "advanced only|expert|power user|technical users only" "$CONTEXT_FILE")
  [ "$BEGINNERS" -gt 0 ] && [ "$ADVANCED_ONLY" -gt 0 ]
}

# L-002: Free/OSS model + Enterprise SLA
check_l002() {
  local FREE_MODEL=$(grep -ciE "free|open source|OSS|freemium|no cost" "$CONTEXT_FILE")
  local ENTERPRISE_SLA=$(grep -ciE "enterprise SLA|99\.[0-9]+%|uptime guarantee|24/7 support" "$CONTEXT_FILE")
  [ "$FREE_MODEL" -gt 0 ] && [ "$ENTERPRISE_SLA" -gt 0 ]
}

# L-006: No auth + RBAC (HIGH severity)
check_l006() {
  local NO_AUTH=$(grep -ciE "no auth|without auth|public access|anonymous" "$CONTEXT_FILE")
  local RBAC=$(grep -ciE "RBAC|role-based|admin role|user role|permission" "$CONTEXT_FILE")
  [ "$NO_AUTH" -gt 0 ] && [ "$RBAC" -gt 0 ]
}
```

> **Implementation note:** For L-003, L-004, L-005, L-007, L-008 — these require semantic analysis rather than simple pattern matching. The agent should look for:
>
> - **L-003:** Check if product-overview.md mentions "MVP" AND completeness is 100%
> - **L-004:** Compare primary vs secondary persona descriptions for conflicting needs (e.g., "simple interface" vs "power features")
> - **L-005:** Search Category 4 for "simple" AND Category 4/10 for "audit trail|versioning|history"
> - **L-007:** Search Category 1 for "internal" AND Category 9 for "public API|external API"
> - **L-008:** Search Category 12 for "minimal" AND Category 10 for "compliance|SOC|ISO|HIPAA"

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

> **Note:** All pattern matching uses case-insensitive search (`-i` flag) to catch variations like "Fast", "FAST", "fast".

```bash
# A-001: Vague quantity terms (case-insensitive)
VAGUE_PATTERNS="\\bfast\\b|\\bgood\\b|\\bmany\\b|\\bsome\\b|\\bvarious\\b|\\bseveral\\b|\\bfew\\b|\\bquick\\b|\\beasy\\b"

# A-003: Open-ended lists
OPENENDED_PATTERNS="or similar|etc\\.|and more|and so on|among others"

# A-002: Unclear references (pronouns without clear antecedent)
# Look for "the system", "it", "they" at sentence start or after comma
UNCLEAR_REF_PATTERNS="\\bthe system\\b|\\bit will\\b|\\bit should\\b|\\bthey will\\b|\\bthis will\\b"

# A-004: Conditional without specifics
CONDITIONAL_PATTERNS="if needed|when appropriate|as required|if necessary|when needed|as needed|where applicable"

# A-005: Ranges without target
# Match patterns like "10-100", "100-1000 users", "5-10%" without "target" or "expected" nearby
check_a005() {
  # Find numeric ranges
  local RANGES=$(grep -oE "[0-9]+[-–][0-9]+" "$CONTEXT_FILE" | wc -l)
  # Check if any have "target" or "expected" within 20 chars
  local WITH_TARGET=$(grep -cE "[0-9]+[-–][0-9]+.{0,20}(target|expected|typical)" "$CONTEXT_FILE")
  [ "$RANGES" -gt "$WITH_TARGET" ]  # Issue if ranges without targets exist
}

# A-006: Multiple options without decision
# Match "A or B or C" patterns, "option 1, option 2, option 3" patterns
MULTIOPT_PATTERNS="\\bor\\b.*\\bor\\b|option [0-9].*option [0-9]|either.*or.*or|choice of:"
```

**Category-Specific Ambiguity Counting:**

The threshold rules require per-category analysis. Use this implementation:

```bash
# Count ambiguity occurrences per category with threshold logic
count_ambiguity_by_category() {
  local PATTERN=$1
  local CHECK_ID=$2
  local CRITICAL_CATS="4 9 10"  # Always report ANY occurrence
  local OTHER_CATS="1 2 3 5 6 7 8 11 12"
  local CRITICAL_TOTAL=0
  local OTHER_TOTAL=0
  local ISSUES=""

  # Check critical categories (4, 9, 10) - report ANY occurrence
  for cat in $CRITICAL_CATS; do
    CAT_CONTENT=$(sed -n "/^## $cat\./,/^## /p" "$CONTEXT_FILE")
    # Guard: skip if category section not found in file
    if [ -z "$CAT_CONTENT" ]; then
      continue
    fi
    CAT_COUNT=$(echo "$CAT_CONTENT" | grep -ciE "$PATTERN" 2>/dev/null || echo 0)
    if [ "$CAT_COUNT" -gt 0 ]; then
      CRITICAL_TOTAL=$((CRITICAL_TOTAL + CAT_COUNT))
      ISSUES="${ISSUES}Category $cat: $CAT_COUNT occurrences (CRITICAL category)\n"
    fi
  done

  # Check other categories - only report if cumulative >= 6
  for cat in $OTHER_CATS; do
    CAT_CONTENT=$(sed -n "/^## $cat\./,/^## /p" "$CONTEXT_FILE")
    # Guard: skip if category section not found in file
    if [ -z "$CAT_CONTENT" ]; then
      continue
    fi
    CAT_COUNT=$(echo "$CAT_CONTENT" | grep -ciE "$PATTERN" 2>/dev/null || echo 0)
    OTHER_TOTAL=$((OTHER_TOTAL + CAT_COUNT))
  done

  # Determine severity and reporting
  if [ "$CRITICAL_TOTAL" -gt 0 ]; then
    # Critical categories: 1-5 = MEDIUM, 6+ = HIGH
    if [ "$CRITICAL_TOTAL" -ge 6 ]; then
      echo "HIGH:$CHECK_ID in critical categories: $CRITICAL_TOTAL occurrences"
    else
      echo "MEDIUM:$CHECK_ID in critical categories: $CRITICAL_TOTAL occurrences"
    fi
    echo -e "$ISSUES"
  fi

  if [ "$OTHER_TOTAL" -ge 6 ]; then
    # Non-critical categories: 6+ = MEDIUM
    echo "MEDIUM:$CHECK_ID in non-critical categories: $OTHER_TOTAL occurrences"
  fi
}

# Apply to each ambiguity pattern and capture output
# Usage pattern: capture function output and increment counters
process_ambiguity_results() {
  local PATTERN=$1
  local CHECK_ID=$2
  local RESULT=$(count_ambiguity_by_category "$PATTERN" "$CHECK_ID")

  # Parse output lines and update global counters
  echo "$RESULT" | while IFS=: read -r SEVERITY REST; do
    case "$SEVERITY" in
      HIGH)
        AMBIGUITY_HIGH=$((AMBIGUITY_HIGH + 1))
        echo "🔴 $CHECK_ID: $REST"
        ;;
      MEDIUM)
        AMBIGUITY_MEDIUM=$((AMBIGUITY_MEDIUM + 1))
        echo "🟠 $CHECK_ID: $REST"
        ;;
    esac
  done
}

# Initialize counters for ambiguity issues
AMBIGUITY_HIGH=0
AMBIGUITY_MEDIUM=0

# Apply to each ambiguity pattern
process_ambiguity_results "$VAGUE_PATTERNS" "A-001"
process_ambiguity_results "$OPENENDED_PATTERNS" "A-003"
process_ambiguity_results "$UNCLEAR_REF_PATTERNS" "A-002"
process_ambiguity_results "$CONDITIONAL_PATTERNS" "A-004"
process_ambiguity_results "$MULTIOPT_PATTERNS" "A-006"
```

**Reporting Threshold:**

> **Severity by occurrence count and category:**
>
> | Location             | 1-5 occurrences | 6+ occurrences |
> | -------------------- | --------------- | -------------- |
> | Categories 4, 9, 10  | 🟠 MEDIUM       | 🔴 HIGH        |
> | All other categories | 🟡 LOW          | 🟠 MEDIUM      |
>
> **Rules:**
>
> 1. **Critical categories (4, 9, 10):** Always report ANY instance — these are security/compliance/data-critical
> 2. **Other categories:** Only report if 6+ total occurrences (cumulative across all non-critical categories)
> 3. **Severity escalation:** 6+ occurrences bumps severity one level (LOW→MEDIUM, MEDIUM→HIGH)

Report excessive vagueness:

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
| D-005    | Cross-Reference has duplicate category entries          | 🟡 LOW    | "Cross-Reference lists category [N] multiple times."            |

**D-001 Check implementation (Duplicate content):**

```bash
# D-001: Find duplicate sentences/paragraphs across categories
check_d001() {
  # Extract all sentences (lines with >15 words) from each category
  # Compare across categories for exact or near-exact matches

  for i in $(seq 1 12); do
    # Extract category content
    CONTENT_I=$(sed -n "/^## $i\./,/^## /p" "$CONTEXT_FILE" | grep -v "^##" | grep -v "^###")

    for j in $(seq $((i+1)) 12); do
      CONTENT_J=$(sed -n "/^## $j\./,/^## /p" "$CONTEXT_FILE" | grep -v "^##" | grep -v "^###")

      # Find lines appearing in both (excluding short lines and formatting)
      DUPLICATES=$(echo "$CONTENT_I" | while read line; do
        [ ${#line} -gt 50 ] && echo "$CONTENT_J" | grep -F "$line" 2>/dev/null
      done)

      if [ -n "$DUPLICATES" ]; then
        echo "Duplicate found between Category $i and $j"
        return 0
      fi
    done
  done
  return 1
}
```

**D-002 Check implementation (Contradictory info):**

```bash
# D-002: Detect contradictory information about same topic
# Common contradiction patterns to check:
check_d002() {
  # Pattern 1: Auth contradiction (no auth somewhere, auth required elsewhere)
  local NO_AUTH=$(grep -cinE "no auth|public access|anonymous" "$CONTEXT_FILE")
  local REQUIRES_AUTH=$(grep -cinE "requires auth|must login|authenticated users" "$CONTEXT_FILE")
  if [ "$NO_AUTH" -gt 0 ] && [ "$REQUIRES_AUTH" -gt 0 ]; then
    echo "D-002: Contradictory auth requirements"
    return 0
  fi

  # Pattern 2: Scale contradiction (small scale + enterprise scale)
  local SMALL_SCALE=$(grep -cinE "small team|few users|internal only|<100 users" "$CONTEXT_FILE")
  local ENTERPRISE=$(grep -cinE "enterprise|10k\+ users|high scale|massive" "$CONTEXT_FILE")
  if [ "$SMALL_SCALE" -gt 0 ] && [ "$ENTERPRISE" -gt 0 ]; then
    echo "D-002: Contradictory scale expectations"
    return 0
  fi

  # Pattern 3: Complexity contradiction (simple + complex in same domain)
  local SIMPLE_DATA=$(grep -cinE "simple data|basic model|minimal schema" "$CONTEXT_FILE")
  local COMPLEX_DATA=$(grep -cinE "complex relations|advanced model|comprehensive schema" "$CONTEXT_FILE")
  if [ "$SIMPLE_DATA" -gt 0 ] && [ "$COMPLEX_DATA" -gt 0 ]; then
    echo "D-002: Contradictory data model descriptions"
    return 0
  fi

  return 1  # No contradictions found
}
```

> **Implementation note:** D-002 detection is inherently imperfect — some "contradictions" may be intentional trade-offs. The agent should flag potential contradictions for human review, not automatically mark them as errors.

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

> **Note:** Under normal conditions, D-004 rarely triggers because `/product-interview` Step 14.2 filters Cross-Reference to omit empty categories. This check catches:
>
> 1. Manually edited files where Cross-Reference was added without updating Quick Reference
> 2. Corrupted files where sections were partially deleted
> 3. Legacy files created before the filtering logic was implemented

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

**D-005 Check implementation:**

1. Parse Cross-Reference section for category mentions
2. Check for duplicate category entries (same category listed more than once)
3. Flag if any category appears multiple times

```bash
# D-005: Check for duplicate category references in Cross-Reference
check_d005() {
  local DUPLICATES=$(sed -n '/^## Cross-Reference/,/^## /p' "$CONTEXT_FILE" | \
    grep -oE "Category [0-9]+" | sort | uniq -d)

  if [ -n "$DUPLICATES" ]; then
    echo "D-005: Duplicate category entries found in Cross-Reference:"
    echo "$DUPLICATES" | while read dup; do
      echo "  - $dup appears multiple times"
    done
    return 0  # Issue found
  fi
  return 1  # No issue
}

# Usage:
if check_d005; then
  # Add to issues list with LOW severity
  echo "🟡 D-005: Cross-Reference has duplicate entries"
fi
```

Report format:

```
🟡 D-005: Cross-Reference has duplicate entries
   Category 5 appears multiple times in Cross-Reference section
   Impact: May cause confusion; file may be malformed
   Fix: Remove duplicate entries from Cross-Reference section
```

---

## Step 7: Command Readiness

Verify context completeness for each downstream Design OS command.

| Command            | Required (Blocking)                          | Optional (Enhancement)                       | Ready When           |
| ------------------ | -------------------------------------------- | -------------------------------------------- | -------------------- |
| `/product-vision`  | 1 (Product Foundation)                       | 2 (User Research)                            | 1 is ✅              |
| `/product-roadmap` | 1 (Product Foundation)                       | 2 (User Research), 8 (Performance)           | 1 is ✅              |
| `/data-model`      | 4 (Data Architecture), 10 (Security)         | 1 (Product Foundation)                       | Both 4, 10 are ✅    |
| `/design-tokens`   | 3 (Design Direction)                         | 1 (Product Foundation)                       | 3 is ✅              |
| `/design-shell`    | 2 (User Research), 3 (Design Direction)      | 7 (Mobile), 9 (Integration)                  | 2 and 3 are ✅       |
| `/shape-section`   | 5 (Section-Specific), 6 (UI Patterns)        | 8 (Performance), 11 (Error Handling)         | Both 5, 6 are ✅     |
| `/sample-data`     | 4 (Data Architecture), 5 (Section-Specific)  | —                                            | Both 4, 5 are ✅     |
| `/design-screen`   | 5 (Section-Specific), 6 (UI Patterns)        | 3 (Design Direction), 7 (Mobile), 11 (Error) | 5 and 6 are ✅       |
| `/export-product`  | 9 (Integration), 10 (Security), 12 (Testing) | all others                                   | All 9, 10, 12 are ✅ |

> **Understanding this table:**
>
> - **Required (Blocking):** Categories that MUST be ✅ Complete for the command to run. If any are ❌ Empty or ⚠️ Partial, the command will show warnings or may produce incomplete results.
> - **Optional (Enhancement):** Categories that improve output quality but won't block the command. The command uses defaults or infers values when these are incomplete.
> - **Relationship to Cross-Reference:** The Cross-Reference section in `/product-interview` output shows categories each command directly references. This table's Optional column may include additional categories (like Category 1 - Product Foundation) that provide helpful context even if not directly referenced. General product context enhances decision-making for any command.
>
> **Example:** `/design-shell` uses Categories 2, 3, 7, 9 per Cross-Reference. Of these, Categories 2 and 3 are Required (shell design fundamentals), while 7 and 9 are Optional (mobile patterns and auth integration enhance the design but aren't strictly necessary).
>
> **Important — Category vs File Prerequisites:** This table checks **category completeness** only (whether context answers exist). Commands also have **file prerequisites** (whether required files like `product-overview.md` exist). A command showing "Ready" here may still fail if prerequisite files are missing. See `agents.md` → "Command Prerequisites" table for file requirements.

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

> **Variable Scope:** The `HIGH_COUNT`, `MEDIUM_COUNT`, `LOW_COUNT`, and `TOTAL_ISSUES` variables calculated here are used again in Step 10 (Re-run Detection) for comparison with previous run. Ensure these variables remain in scope throughout report generation.

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

**Issue Ordering Rules:**

1. Group by severity: 🔴 HIGH first, then 🟠 MEDIUM, then 🟡 LOW
2. Within each severity group, order by category number (1-12)
3. Within same category, order by check type: Q → C → L → A → D
4. Number issues sequentially: ISSUE-001, ISSUE-002, etc. (across all severities)

**Issue ID vs Check ID:**

| ID Type      | Format      | Purpose                                            | Example                            |
| ------------ | ----------- | -------------------------------------------------- | ---------------------------------- |
| **Check ID** | `X-NNN`     | Identifies the **rule** being violated             | `C-001` = GDPR without audit check |
| **Issue ID** | `ISSUE-NNN` | Identifies a **specific occurrence** in the report | `ISSUE-003` = third issue found    |

> **Relationship:** One Check ID can generate multiple Issue IDs if the same rule is violated in multiple places. For example, if `Q-002` (placeholder text) is found in Category 4 AND Category 10, these become `ISSUE-005` and `ISSUE-008` (assuming sequential numbering places them there).

Write to `product/audit-report.md`:

````markdown
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

> **Note:** This table MUST include all 21 consistency checks (C-001 through C-021). Only failed checks require detailed explanation; passing checks use "—" for Details.

| Check | Status  | Details                                  |
| ----- | ------- | ---------------------------------------- |
| C-001 | ✅ PASS | —                                        |
| C-002 | ✅ PASS | —                                        |
| C-003 | ❌ FAIL | Real-time + 10k users without scale plan |
| ...   | ...     | (C-004 through C-021)                    |

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

---

## AI Implementation Guidelines

> **For AI Agents:** When fixing issues in `product-context.md`, follow these strict rules to preserve file integrity.

### File Structure Rules

**CRITICAL — DO NOT MODIFY:**

- Line 1: `# Product Context: [Product Name]` — header format
- Lines 2-5: Metadata block (`Generated:`, `Last Updated:`, `Completeness:`, `Mode:`)
- `## Quick Reference` table structure and column format
- `## N. Category Name` section headers (1-12)
- `## Cross-Reference: Design OS Commands` section structure

**SAFE TO MODIFY:**

- Content under `### Subsection` headings within categories
- Values after field labels (e.g., `**Provider:** [value here]`)
- List items under subsections
- Text within existing markdown structures

### Edit Location Rules

| Issue Type            | Where to Edit                                  | How to Locate                                          |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| Q-002 (Placeholder)   | Replace placeholder text in-place              | Search for exact placeholder string                    |
| Q-005 (Empty section) | Add content under existing `### Heading`       | Find the `### Heading`, add below it                   |
| C-XXX (Consistency)   | Update conflicting value in specified category | Go to `## N. Category`, find relevant `### Subsection` |
| L-XXX (Logic)         | Fix the value causing contradiction            | Locate by category + subsection from issue             |
| A-XXX (Ambiguity)     | Replace vague term with specific value         | Search for quoted vague term                           |

### Edit Pattern

**ALWAYS use this pattern:**

1. **Read** the current content of the target subsection
2. **Identify** the exact line(s) to change
3. **Replace** only the problematic content, preserving:
   - The `### Subsection` heading
   - The field label format (e.g., `**Field:**`)
   - Surrounding content that is correct
4. **Verify** the edit didn't change structure

### Example Fixes

**Q-002 Fix (Placeholder → Concrete Value):**
\`\`\`
LOCATE: ## 9. Integration Points → ### Authentication
FIND: **Provider:** TBD - will decide later
REPLACE WITH: **Provider:** OAuth 2.0 (Google, GitHub)
PRESERVE: Everything else in the section
\`\`\`

**Q-005 Fix (Empty Section → Add Content):**
\`\`\`
LOCATE: ## 3. Design Direction → ### Visual Inspiration
CURRENT: ### Visual Inspiration
[empty]
ADD AFTER HEADING: - **Linear** — Clean, minimal interface with subtle animations - **Notion** — Flexible blocks, keyboard-first navigation
PRESERVE: The ### heading itself, next ### or ## section
\`\`\`

**C-001 Fix (GDPR without audit):**
\`\`\`
LOCATE: ## 4. Data Architecture → ### Audit & History
FIND: **Level:** Basic
REPLACE WITH: **Level:** Full audit — Who changed what, when, with old values (required for GDPR)
PRESERVE: All other subsections in Category 4
\`\`\`

### Subsection Definition

A **subsection** is any `### ` heading (level-3 markdown header) within a category section (`## [0-9]+.`). Each category typically has 4-6 subsections corresponding to the interview questions for that category.

**Example structure:**

```markdown
## 4. Data Architecture ← Category section

### Data Sensitivity ← Subsection (first)

Public only...

### Compliance Requirements ← Subsection (second)

GDPR...

### Data Relationships ← Subsection (third)

Many-to-many...
```
````

**Expected subsection counts per category:**

| Category | Expected Subsections | Notes                  |
| -------- | -------------------- | ---------------------- |
| 1        | 6                    | Product Foundation     |
| 2        | 4                    | User Research          |
| 3        | 5                    | Design Direction       |
| 4        | 5                    | Data Architecture      |
| 5        | 5                    | Section-Specific Depth |
| 6        | 5                    | UI Patterns            |
| 7        | 4                    | Mobile & Responsive    |
| 8        | 4                    | Performance & Scale    |
| 9        | 3                    | Integration Points     |
| 10       | 3                    | Security & Compliance  |
| 11       | 4                    | Error Handling         |
| 12       | 4                    | Testing & Quality      |

### Automatic Validation Protocol

> **MANDATORY:** AI agents MUST run validation before AND after editing `product-context.md`.

#### Pre-Edit Validation

\`\`\`bash
CONTEXT_FILE="product/product-context.md"

# 1. Count sections (must be 12)

SECTION_COUNT=$(grep -c "^## [0-9]\+\." "$CONTEXT_FILE")
echo "Sections: $SECTION_COUNT/12"

# 2. Verify Quick Reference exists

grep -q "^## Quick Reference" "$CONTEXT_FILE" && echo "Quick Reference: ✓" || echo "Quick Reference: MISSING"

# 3. Verify Completeness line format

grep -q "^Completeness:" "$CONTEXT_FILE" && echo "Completeness line: ✓" || echo "Completeness line: MISSING"

# 4. Count subsections per category (for comparison)

for i in $(seq 1 12); do
  SUBSECTION_COUNT=$(sed -n "/^## $i\./,/^## /p" "$CONTEXT_FILE" | grep -c "^### ")
echo "Category $i subsections: $SUBSECTION_COUNT"
done

# 5. Calculate file hash for rollback reference

FILE_HASH=$(md5 -q "$CONTEXT_FILE" 2>/dev/null || md5sum "$CONTEXT_FILE" | cut -d' ' -f1)
echo "Pre-edit hash: $FILE_HASH"
\`\`\`

#### Post-Edit Validation

\`\`\`bash
VALIDATION_PASSED=true

# 1. Section count must still be 12

NEW_SECTION_COUNT=$(grep -c "^## [0-9]\+\." "$CONTEXT_FILE")
if [ "$NEW_SECTION_COUNT" -ne 12 ]; then
echo "❌ FAIL: Section count changed"
VALIDATION_PASSED=false
fi

# 2. Quick Reference must exist

if ! grep -q "^## Quick Reference" "$CONTEXT_FILE"; then
echo "❌ FAIL: Quick Reference section deleted"
VALIDATION_PASSED=false
fi

# 3. Completeness line must exist

if ! grep -q "^Completeness: [0-9]\+%" "$CONTEXT_FILE"; then
echo "❌ FAIL: Completeness line missing or malformed"
VALIDATION_PASSED=false
fi

# 4. Cross-Reference section must exist

if ! grep -q "^## Cross-Reference" "$CONTEXT_FILE"; then
echo "❌ FAIL: Cross-Reference section deleted"
VALIDATION_PASSED=false
fi

# 5. Report result

if [ "$VALIDATION_PASSED" = true ]; then
echo "✅ Validation PASSED: File structure intact"
else
echo "🔴 Validation FAILED: Revert changes immediately"
fi
\`\`\`

#### Rollback Protocol

If post-edit validation fails:

1. **DO NOT make additional edits** — Stop immediately
2. **Report the failure** to the user with specific error message
3. **Recovery options:**

   **Option A: Git rollback (if committed)**

   ```bash
   git checkout -- product/product-context.md
   ```

   **Option B: Re-run interview (if no commit)**

   ```bash
   /product-interview --skip-validation  # Re-generate from scratch
   ```

   **Option C: Partial recovery (if only some edits broke validation)**

   ```bash
   # Manually revert the problematic edit
   # Re-run post-edit validation to confirm fix
   ```

4. **After recovery:** Re-run `/audit-context` to regenerate the report from a clean state

### Anti-Patterns (NEVER DO)

| Anti-Pattern                       | Why It's Wrong                                 |
| ---------------------------------- | ---------------------------------------------- |
| Append fixes to end of file        | Content must be in correct category/subsection |
| Delete section to rewrite it       | May lose content that wasn't flagged           |
| Change section numbering           | Numbers 1-12 are fixed structure               |
| Add new ## sections                | Only 12 categories exist                       |
| Modify Quick Reference table       | User updates this manually                     |
| Remove content that wasn't flagged | Only fix flagged issues                        |

````

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
````

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

# 4. Verify issue counts match summary (complete verification)
# Extract reported counts from summary line
SUMMARY_LINE=$(grep "Issues Found:" "$REPORT_FILE" | head -1)
REPORTED_HIGH=$(echo "$SUMMARY_LINE" | grep -oE '🔴 [0-9]+' | grep -oE '[0-9]+' || echo 0)
REPORTED_MEDIUM=$(echo "$SUMMARY_LINE" | grep -oE '🟠 [0-9]+' | grep -oE '[0-9]+' || echo 0)
REPORTED_LOW=$(echo "$SUMMARY_LINE" | grep -oE '🟡 [0-9]+' | grep -oE '[0-9]+' || echo 0)

# Count actual issues by severity in report body
# Note: Using awk instead of sed for portability (sed '\|' requires extended regex which varies by platform)
# HIGH issues are under "### 🔴 HIGH Priority Issues" section
ACTUAL_HIGH=$(awk '/^### 🔴 HIGH/,/^### 🟠|^---/' "$REPORT_FILE" | grep -c "^#### \[ISSUE-" 2>/dev/null || echo 0)
# MEDIUM issues are under "### 🟠 MEDIUM Priority Issues" section
ACTUAL_MEDIUM=$(awk '/^### 🟠 MEDIUM/,/^### 🟡|^---/' "$REPORT_FILE" | grep -c "^#### \[ISSUE-" 2>/dev/null || echo 0)
# LOW issues are under "### 🟡 LOW Priority Issues" section
ACTUAL_LOW=$(awk '/^### 🟡 LOW/,/^---/' "$REPORT_FILE" | grep -c "^#### \[ISSUE-" 2>/dev/null || echo 0)

# Compare and warn on mismatches
if [ "$REPORTED_HIGH" != "$ACTUAL_HIGH" ]; then
  echo "Warning: Summary shows $REPORTED_HIGH HIGH issues but $ACTUAL_HIGH found in report"
  VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi
if [ "$REPORTED_MEDIUM" != "$ACTUAL_MEDIUM" ]; then
  echo "Warning: Summary shows $REPORTED_MEDIUM MEDIUM issues but $ACTUAL_MEDIUM found in report"
  VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi
if [ "$REPORTED_LOW" != "$ACTUAL_LOW" ]; then
  echo "Warning: Summary shows $REPORTED_LOW LOW issues but $ACTUAL_LOW found in report"
  VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

# 5. Verify Recommended Actions section has entries for all HIGH issues
if [ "$ACTUAL_HIGH" -gt 0 ]; then
  CRITICAL_ACTIONS=$(sed -n '/^### Critical (Must Fix)/,/^###/p' "$REPORT_FILE" | grep -c "^\[ISSUE-" 2>/dev/null || echo 0)
  if [ "$CRITICAL_ACTIONS" -lt "$ACTUAL_HIGH" ]; then
    echo "Warning: Not all HIGH issues are listed in Recommended Actions"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
  fi
fi

# 6. Report validation results
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
2. For each ISSUE-XXX from report:
   - Locate the exact section (## Category → ### Subsection)
   - Apply the fix IN-PLACE (don't append to end)
   - Preserve surrounding content
3. Run: /audit-context
4. Repeat until HIGH = 0

Tip: Start with HIGH priority, leave LOW for later.
```

> **For AI agents:** See "AI Implementation Guidelines" section in the report for detailed editing rules including:
>
> - File structure rules (what to modify, what to preserve)
> - Edit location rules per issue type
> - Pre/post-edit validation protocol
> - Rollback instructions if validation fails

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

If a previous report existed (detected in Step 1), compare with current run:

> **Note:** Previous values were saved in Step 1 BEFORE the new report overwrote the file. This ensures accurate comparison.

```bash
# Use pre-saved values from Step 1 (not reading from file, which was overwritten)
if [ "$PREV_REPORT_EXISTS" = true ]; then
  # Show comparison using pre-saved values
  echo "📊 Comparison with previous analysis:"
  echo ""
  echo "Before: $PREV_HIGH HIGH, $PREV_MEDIUM MEDIUM, $PREV_LOW LOW"
  echo "Now:    $HIGH_COUNT HIGH, $MEDIUM_COUNT MEDIUM, $LOW_COUNT LOW"
  echo ""

  # Calculate delta
  PREV_TOTAL=$((PREV_HIGH + PREV_MEDIUM + PREV_LOW))
  RESOLVED=$((PREV_TOTAL - TOTAL_ISSUES))
  if [ "$RESOLVED" -gt 0 ]; then
    echo "✅ Resolved: $RESOLVED issues fixed"
  elif [ "$RESOLVED" -lt 0 ]; then
    echo "⚠️ New issues: $((-RESOLVED)) additional issues found"
  else
    echo "➡️ No change in issue count"
  fi
fi
```

---

## Appendix: Issue ID Reference

All issue IDs follow the pattern `[Type]-[NNN]`:

| Prefix | Type        | Check Range    |
| ------ | ----------- | -------------- |
| Q      | Quality     | Q-001 to Q-005 |
| C      | Consistency | C-001 to C-021 |
| L      | Logic       | L-001 to L-008 |
| A      | Ambiguity   | A-001 to A-006 |
| D      | Duplication | D-001 to D-005 |

When reporting specific findings, use format `ISSUE-[NNN]` as unique identifier for each occurrence in the report.

---

## Notes

**Template System:** Unlike `/export-product`, this command does not use the template system in `.claude/templates/`. The report is generated directly from issue detection logic.

**Recovery if Interrupted:** This command is read-only and can simply be re-run if interrupted. No data is modified during execution — only the report file is created at the end (Step 8.3).
