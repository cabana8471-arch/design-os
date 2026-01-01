<!-- v1.0.0 -->

# Phase 4: Synthesis & Output

This phase covers Step 14: calculating completeness, generating the output file, validation, and summary.

---

## Step 14: Synthesis & Output

> **Language Reminder:** Generate all output in English, regardless of conversation language. The conversation may be in Romanian (or any language), but `product-context.md` MUST be in English for portability.

After completing all questions (or selected categories for partial modes):

### 14.1: Calculate Completeness

For each of the 12 categories, determine its status:

| Status   | Criteria                       | Symbol |
| -------- | ------------------------------ | ------ |
| Complete | All questions answered         | ✅     |
| Partial  | 1+ questions answered, not all | ⚠️     |
| Empty    | No questions answered          | ❌     |

**Completeness calculation:**

```
COMPLETENESS = (Complete categories × 100) / 12
```

Example: 9 complete categories = 75% completeness

### 14.1b: Preserve Existing Answers (complete_missing mode only)

> **When to apply:** This step only applies when `INTERVIEW_MODE="complete_missing"`. Skip to 14.2 for other modes.

If the user selected "Completăm ce lipsește" in Step 1, existing answers must be preserved and merged with new answers.

> **Temporal Note:** Despite being numbered "14.1b", this logic describes how to MERGE existing answers with new ones when GENERATING OUTPUT. The actual question-asking happens in Steps 2-13 (which already skip complete categories). This step describes the OUTPUT GENERATION phase — how to combine existing content with newly gathered answers into the final `product-context.md` file.

**When generating output for each category:**

1. **For ✅ Complete categories:**
   - Do NOT ask any questions (already skipped in Steps 2-13)
   - Copy existing content VERBATIM to output

2. **For ⚠️ Partial categories:**
   - Read existing content from that category section
   - Present to user: "I see you already answered: [existing content]. Let's complete the missing parts."
   - Only ask questions whose answers are missing/empty
   - When generating output: MERGE existing + new answers

3. **For ❌ Empty categories:**
   - Ask all questions normally (if not skipped by --stage)
   - Use new answers only

**Merge Strategy:**

> **Note:** This is guidance for the agent performing the merge, not a bash script to execute.

**Step-by-step merge process for each partial category:**

1. **Read existing category content:**

   ```bash
   # Extract category N content from existing file
   SECTION_START=$(grep -n "^## $CATEGORY_NUM\." product/product-context.md | head -1 | cut -d: -f1)
   SECTION_END=$(grep -n "^## " product/product-context.md | awk -F: -v start="$SECTION_START" '$1 > start {print $1; exit}')
   EXISTING_CONTENT=$(sed -n "${SECTION_START},${SECTION_END}p" product/product-context.md)
   ```

2. **Identify subsections with content:**
   - Parse `### Subsection Name` headings within the category
   - For each subsection, check if content exists below the heading (non-empty lines before next ### or ##)
   - Build a list: `ANSWERED_SUBSECTIONS` and `MISSING_SUBSECTIONS`

3. **Present status to user before asking questions:**

   ```
   Categoria [N] are unele răspunsuri:
   ✅ [Subsection A]: [first line of existing answer]
   ✅ [Subsection B]: [first line of existing answer]
   ❓ [Subsection C]: Nu a fost răspuns

   Să completăm părțile lipsă.
   ```

4. **Only ask questions for missing subsections**

5. **When generating output:**
   - Keep answered subsections verbatim
   - Insert new answers for previously empty subsections
   - Maintain category structure (headings, formatting)

### 14.2: Generate product-context.md

Create or update `product/product-context.md` with this structure:

```markdown
# Product Context: [PRODUCT_NAME]

> Comprehensive context gathered through `/product-interview` command.
> This file is required by all Design OS commands.

**Completeness:** [X]% ([N]/12 categories complete)

---

## Quick Reference

| Category                    | Status   | Key Points         |
| --------------------------- | -------- | ------------------ |
| 1. Product Foundation       | ✅/⚠️/❌ | [2-3 word summary] |
| 2. User Research & Personas | ✅/⚠️/❌ | [2-3 word summary] |
| 3. Design Direction         | ✅/⚠️/❌ | [2-3 word summary] |
| 4. Data Architecture        | ✅/⚠️/❌ | [2-3 word summary] |
| 5. Section-Specific Depth   | ✅/⚠️/❌ | [2-3 word summary] |
| 6. UI Patterns & Components | ✅/⚠️/❌ | [2-3 word summary] |
| 7. Mobile & Responsive      | ✅/⚠️/❌ | [2-3 word summary] |
| 8. Performance & Scale      | ✅/⚠️/❌ | [2-3 word summary] |
| 9. Integration Points       | ✅/⚠️/❌ | [2-3 word summary] |
| 10. Security & Compliance   | ✅/⚠️/❌ | [2-3 word summary] |
| 11. Error Handling          | ✅/⚠️/❌ | [2-3 word summary] |
| 12. Testing & Quality       | ✅/⚠️/❌ | [2-3 word summary] |

---

## 1. Product Foundation

### Product Name

[Name]

### Tagline

[Tagline]

### Target Audience

[Answers]

### Problem Space

[Answers]

### Competitors

[Answers or "No direct competitors"]

### Success Metrics

[Answers]

### Business Model

**Selected:** [Option]

---

## 2. User Research & Personas

### Primary Persona

[Template filled in]

### Secondary Personas

[If answered, or "None specified"]

### Accessibility Requirements

**Selected:** [Option(s)]

### Geographic & Language

[Answers]

---

## 3. Design Direction

### Aesthetic Tone

**Selected:** [Option]

### Animation Style

**Selected:** [Option]

### Information Density

**Selected:** [Option]

### Brand Constraints

[Answers or "None"]

### Visual Inspiration

[References]

---

## 4. Data Architecture

### Data Sensitivity

**Levels:** [List selected]

### Compliance Requirements

**Frameworks:** [List selected]

### Data Relationships

**Complexity:** [Option]

### Audit & History

**Level:** [Option]

### Deletion Strategy

**Approach:** [Option]

---

## 5. Section-Specific Depth

### Critical User Flows

#### Flow 1: [Name]

[Steps]

#### Flow 2: [Name]

[Steps]

### Edge Cases

[Documented edge cases per flow]

### Empty States

**Approach:** [Option]

### Loading States

**Style:** [Option]

### Error Recovery

[Strategy]

---

## 6. UI Patterns & Components

### Data Display

**Preference:** [Option]

### Form Validation

**Timing:** [Option]

### Notifications

**Style:** [Option]

### Confirmations

**Pattern:** [Option]

### Modal vs Drawer

**Preference:** [Option]

---

## 7. Mobile & Responsive

### Responsive Priority

**Approach:** [Option]

### Touch Interactions

**Enabled:** [List]

### Mobile Navigation

**Pattern:** [Option]

### Offline Support

**Level:** [Option]

---

## 8. Performance & Scale

### Expected Users

- Initial: [X]
- 6 months: [X]
- Peak concurrent: [X]

### Data Volume

- Items per user: [X]
- File uploads: [X]
- Historical data: [X]

### Real-time

**Level:** [Option]

### Search & Filter

**Capability:** [Option]

---

## 9. Integration Points

### Authentication

**Provider:** [Option]

### External Services

**Integrated:** [List]

### API Exposure

**Level:** [Option]

---

## 10. Security & Compliance

### Auth Security

**Level:** [Option]

### Authorization

**Model:** [Option]

### Audit Logging

**Level:** [Option]

---

## 11. Error Handling

### Message Style

**Tone:** [Option]

### Retry Behavior

**Strategy:** [Option]

### Undo/Redo

**Support:** [Option]

### Data Loss Prevention

**Mechanism:** [Option]

---

## 12. Testing & Quality

### Test Coverage

**Target:** [Option]

### E2E Scope

**Level:** [Option]

### Accessibility Testing

**Standard:** [Option]

### Browser Support

**Matrix:** [List]

---

## Cross-Reference: Design OS Commands

> **Note:** Only include references for categories that were completed (✅ or ⚠️). Omit references to categories marked ❌ (empty). This keeps the cross-reference relevant to what was actually gathered.

**Implementation:** Before generating each `### For /[command]` section below:

1. Check the status of ALL referenced categories for that command
2. If ALL referenced categories are ❌ (empty), omit that command's cross-reference section entirely
3. If at least one referenced category is ✅ or ⚠️, include the section but only list the completed categories

> **Template Note:** The structure below shows the MAXIMUM cross-reference (when all categories are complete). During generation, apply the filtering rules above to exclude entries for categories marked ❌ Empty in the Quick Reference table. Each command section and each category line should only appear if the category is ✅ or ⚠️.

### For /product-vision

<!-- Include only if Category 1 or 2 is ✅/⚠️ -->

- **Category 1** (Product Foundation): Product name, target audience, problem space
- **Category 2** (User Research & Personas): Personas for user descriptions

### For /product-roadmap

<!-- Include only if Category 1 or 8 is ✅/⚠️ -->

- **Category 1** (Product Foundation): Business model determines scope
- **Category 8** (Performance & Scale): User volume for complexity estimation

### For /data-model

<!-- Include only if Category 4 or 10 is ✅/⚠️ -->

- **Category 4** (Data Architecture): Sensitivity, relationships, compliance
- **Category 10** (Security & Compliance): Auth model, audit requirements

### For /design-tokens

<!-- Include only if Category 3 is ✅/⚠️ -->

- **Category 3** (Design Direction): Aesthetic tone, brand constraints for palette

### For /design-shell

<!-- Include only if Category 2, 3, 7, or 9 is ✅/⚠️ -->

- **Category 2** (User Research & Personas): Accessibility requirements for shell
- **Category 3** (Design Direction): Aesthetic tone, animation style
- **Category 7** (Mobile & Responsive): Mobile navigation pattern
- **Category 9** (Integration Points): Auth provider for user menu

### For /shape-section

<!-- Include only if Category 5, 6, 8, or 11 is ✅/⚠️ -->

- **Category 5** (Section-Specific Depth): User flows, edge cases
- **Category 6** (UI Patterns & Components): Data display, validation preferences
- **Category 8** (Performance & Scale): Data volume, real-time needs
- **Category 11** (Error Handling): Error recovery patterns

### For /sample-data

<!-- Include only if Category 4 or 5 is ✅/⚠️ -->

- **Category 4** (Data Architecture): Data sensitivity for realistic samples
- **Category 5** (Section-Specific Depth): Edge case data requirements

### For /design-screen

<!-- Include only if Category 3, 5, 6, 7, or 11 is ✅/⚠️ -->

- **Category 3** (Design Direction): Animation style, information density
- **Category 5** (Section-Specific Depth): Empty/loading/error states
- **Category 6** (UI Patterns & Components): Component preferences
- **Category 7** (Mobile & Responsive): Touch interactions, responsive priority
- **Category 11** (Error Handling): Error message display

### For /export-product

<!-- Include only if Category 9, 10, or 12 is ✅/⚠️ -->

- **Category 9** (Integration Points): Auth provider for implementation docs
- **Category 10** (Security & Compliance): Security requirements for deployment
- **Category 12** (Testing & Quality): Test coverage, browser support matrix
- All other sections inform implementation prompts
```

### 14.3: Validate Output

```bash
CONTEXT_FILE="product/product-context.md"
VALIDATION_ERRORS=0

# 1. Verify file was created
if [ ! -f "$CONTEXT_FILE" ]; then
  echo "Error: $CONTEXT_FILE - Failed to create file. Check write permissions: ls -la product/"
  exit 1
fi

# 1b. Verify file has minimum content (not empty or partial write)
WRITTEN_SIZE=$(wc -c < "$CONTEXT_FILE" | tr -d ' ')
if [ "$WRITTEN_SIZE" -lt 500 ]; then
  echo "Error: $CONTEXT_FILE - File appears incomplete ($WRITTEN_SIZE bytes). Check disk space."
  exit 1
fi

# 2. Verify completeness line exists
if ! grep -q "^Completeness:" "$CONTEXT_FILE"; then
  echo "Warning: Completeness line missing"
  VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

# 3. Verify Quick Reference section exists
if ! grep -q "^## Quick Reference" "$CONTEXT_FILE"; then
  echo "Warning: Quick Reference section missing"
  VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

# 4. Verify all 12 category sections exist
for i in $(seq 1 12); do
  if ! grep -q "^## $i\." "$CONTEXT_FILE"; then
    echo "Warning: Section $i missing from product-context.md"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
  fi
done

# 5. Verify Cross-Reference section exists
if ! grep -q "^## Cross-Reference" "$CONTEXT_FILE"; then
  echo "Warning: Cross-Reference section missing"
  VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

# 6. Verify sections have actual content (not just headings)
for i in $(seq 1 12); do
  # Get line number of section start
  SECTION_LINE=$(grep -n "^## $i\." "$CONTEXT_FILE" | head -1 | cut -d: -f1)
  if [ -n "$SECTION_LINE" ]; then
    # Get line number of next section (or end of file)
    NEXT_LINE=$(grep -n "^## " "$CONTEXT_FILE" | awk -F: -v start="$SECTION_LINE" '$1 > start {print $1; exit}')
    if [ -z "$NEXT_LINE" ]; then
      NEXT_LINE=$(wc -l < "$CONTEXT_FILE")
    fi
    # Count actual content lines (excluding formatting elements)
    # Excludes: empty lines, headings (##/###), separators (---),
    #           table formatters (|---|), block quotes (>)
    CONTENT_LINES=$(sed -n "${SECTION_LINE},${NEXT_LINE}p" "$CONTEXT_FILE" | \
      grep -v "^$" | \
      grep -v "^##" | \
      grep -v "^###" | \
      grep -v "^---" | \
      grep -v "^|---" | \
      grep -v "^>" | \
      wc -l | tr -d ' ')
    if [ "$CONTENT_LINES" -lt 3 ]; then
      echo "Warning: Section $i appears to have minimal content ($CONTENT_LINES lines)"
    fi
  fi
done

# 7. Warn if multiple matches for a category (potential parsing issue)
for i in $(seq 1 12); do
  MATCH_COUNT=$(grep -c "| $i\." "$CONTEXT_FILE" 2>/dev/null || echo 0)
  if [ "$MATCH_COUNT" -gt 1 ]; then
    echo "Warning: Multiple table rows match category $i. Parser will use first match."
  fi
done

# 7b. Verify completeness percentage matches actual category counts
COMPLETE_CATS=$(grep -E "^\| *[0-9]+\." "$CONTEXT_FILE" | grep -cE "(✅|Complete)" 2>/dev/null || echo 0)
EXPECTED_COMPLETENESS=$((COMPLETE_CATS * 100 / 12))
HEADER_COMPLETENESS=$(grep "^Completeness:" "$CONTEXT_FILE" | grep -oE '[0-9]+' | head -1)
if [ -n "$HEADER_COMPLETENESS" ] && [ "$EXPECTED_COMPLETENESS" -ne "$HEADER_COMPLETENESS" ]; then
  echo "Warning: Completeness mismatch - header shows ${HEADER_COMPLETENESS}% but ${COMPLETE_CATS}/12 categories are ✅ (${EXPECTED_COMPLETENESS}%)"
  VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

# 8. Verify cross-reference consistency
# Check that commands referenced have at least one completed category
# Note: Using POSIX-compatible approach (case statements) instead of bash 4+ associative arrays

# Helper function to get categories for a command
get_cmd_categories() {
  case "$1" in
    product-vision)  echo "1 2" ;;
    product-roadmap) echo "1 8" ;;
    data-model)      echo "4 10" ;;
    design-tokens)   echo "3" ;;
    design-shell)    echo "2 3 7 9" ;;
    shape-section)   echo "5 6 8 11" ;;
    sample-data)     echo "4 5" ;;
    design-screen)   echo "3 5 6 7 11" ;;
    export-product)  echo "9 10 12" ;;
    *)               echo "" ;;
  esac
}

# List of commands to check
COMMANDS="product-vision product-roadmap data-model design-tokens design-shell shape-section sample-data design-screen export-product"

for cmd in $COMMANDS; do
  if grep -q "### For /$cmd" "$CONTEXT_FILE"; then
    # Verify at least one referenced category is not ❌
    HAS_CONTENT=false
    CMD_CATS=$(get_cmd_categories "$cmd")
    for cat_num in $CMD_CATS; do
      CAT_LINE=$(grep "| $cat_num\." "$CONTEXT_FILE" | head -1)
      if echo "$CAT_LINE" | grep -qE "(✅|⚠️|Complete|Partial)"; then
        HAS_CONTENT=true
        break
      fi
    done
    if [ "$HAS_CONTENT" = false ]; then
      echo "Warning: Cross-reference for /$cmd exists but all its categories are empty"
      VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi
  fi
done

# 9. Report validation results
if [ $VALIDATION_ERRORS -gt 0 ]; then
  echo "Warning: $VALIDATION_ERRORS validation issues found. File may be incomplete."
else
  echo "Validation passed: product-context.md is well-formed"
fi
```

### 14.4: Summary Message

Present summary to user:

```
Am creat contextul produsului tău!

📄 **Fișier:** product/product-context.md
📊 **Completeness:** [X]% ([N]/12 categorii complete)

**Categorii complete:**
- ✅ Foundation
- ✅ Design Direction
- ✅ ...

**Categorii incomplete:**
- ⚠️ User Research (50%) - lipsesc personas
- ⚠️ ...

**Next steps:**
- Rulează `/product-vision` pentru a crea product overview
- Sau rulează `/product-interview --stage=X` pentru a completa categoriile lipsă
```

---

## Important Notes

> **Language Note:** Example prompts in this template are shown in Romanian. Adapt to the user's conversation language. The **questions** can be in any language, but **all generated files** (product-context.md) MUST be in English for portability.
>
> **Language Handling During Generation:** If user provides answers in a non-English language (e.g., Romanian), the agent MUST translate those answers to English when generating `product-context.md`. The conversation remains in the user's preferred language, but all file content must be English. This ensures portability across teams and downstream commands.

> **AskUserQuestion Option Limits:** The AskUserQuestion tool supports 2-4 options per question. Questions in this template with more than 4 options should be adapted:
>
> - **Split into multiple questions** — e.g., "Which category fits best?" then "Within that, which specific option?"
> - **Use free-text prompts** — Present options as guidance, accept user's written answer
> - **Group related options** — Combine similar options (e.g., "OAuth (Google/GitHub/etc.)" instead of separate entries)
>
> The agent should use judgment to present information clearly while staying within tool constraints.

- Folosește AskUserQuestion cu opțiuni predefinite când e posibil
- Păstrează întrebările concise - nu repeta ce-ai aflat deja
- Dacă utilizatorul dă răspunsuri vagi, cere clarificări
- Validează consistența între răspunsuri (ex: Free/OSS + SSO/SAML = warning)
- See "Recovery if Interrupted" section below for handling interrupted interview sessions

### Consistency Validation

> **Relationship to /audit-context:** This section provides **quick consistency checks** run during the interview to catch obvious conflicts early. For comprehensive validation with more checks (C-001 through C-021), run `/audit-context` after completing the interview. The two commands complement each other: interview catches issues while gathering context, audit catches issues in a dedicated analysis pass.
>
> **Note on Severity Differences:** Some checks appear in both commands with different severities. Interview checks use lighter warnings (designed for real-time guidance), while audit checks are stricter (designed for thorough pre-implementation validation). For example: "Real-time vs Scale" is MED here but HIGH in audit (C-003) because the comprehensive audit considers the full technical implications.

After completing the interview, check for inconsistencies:

| Check                             | Inconsistency                                       | Severity | Action                                                                        |
| --------------------------------- | --------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| GDPR vs No data audit             | GDPR compliance but no audit/history                | 🔴 HIGH  | Warn: "GDPR fără audit log. Consider adding full audit for compliance."       |
| No auth vs Audit logging          | No auth selected but compliance-grade audit         | 🔴 HIGH  | Warn: "Fără autentificare dar cu audit complet. E consistent?"                |
| Business Model vs Features        | Free/OSS chosen but SSO/SAML or compliance-grade    | 🟠 MED   | Warn: "Ai ales Free/OSS dar cu features enterprise. Vrei să ajustăm modelul?" |
| Free model vs Enterprise features | Free/OSS but SSO/SAML, compliance-grade audit, RBAC | 🟠 MED   | Warn: "Model gratuit dar cu features enterprise. Verifică business model."    |
| Real-time vs Scale                | Live updates but 10k+ concurrent users              | 🟠 MED   | Warn: "Real-time cu mulți utilizatori e complex. Sigur ai nevoie?"            |
| High security vs No MFA           | Strict auth level but MFA not mentioned             | 🟠 MED   | Warn: "Securitate strictă dar fără MFA. Vrei să adaugi?"                      |
| Offline + Real-time collab        | Full offline but collaborative real-time selected   | 🟠 MED   | Warn: "Full offline și collaborative real-time sunt dificil de combinat."     |
| PWA vs Desktop-only               | PWA offline support but desktop-only responsive     | 🟠 MED   | Warn: "PWA dar fără mobile support? Vrei să ajustăm?"                         |
| Mobile priority vs Touch          | Mobile-first but no touch interactions              | 🟡 LOW   | Warn: "Ai ales mobile-first dar fără interacțiuni touch. E intenționat?"      |
| Offline vs Data                   | Full offline but large file uploads                 | 🟡 LOW   | Warn: "Offline cu fișiere mari e dificil. Ce prioritizezi?"                   |
| Desktop-only vs Mobile UX         | Desktop-only priority but mobile navigation chosen  | 🟡 LOW   | Warn: "Ai ales desktop-only dar cu mobile navigation. Vrei să ajustăm?"       |
| GDPR vs No PII data               | GDPR selected but no personal data sensitivity      | 🟡 LOW   | Warn: "Ai selectat GDPR dar fără date personale. E corect?"                   |

**Severity Legend:**

- 🔴 **HIGH** — Likely a fundamental conflict that needs resolution before proceeding
- 🟠 **MED** — Worth addressing but may be intentional for specific use cases
- 🟡 **LOW** — Consider reviewing but acceptable to proceed as-is

### Mid-Interview Answer Correction

If user requests to change a previously answered question in the CURRENT session (e.g., "I want to change my answer to Q2.1"):

1. **Acknowledge:** "Desigur, hai să revizuim [Question X.Y]"
2. **Re-ask:** Present the question again with original options
3. **Record:** Replace the previous answer with the new one
4. **Continue:** Resume from where you left off (not from the changed question)

> **Note:** This is different from `complete_missing` mode which handles corrections across sessions. Mid-interview correction allows fixing mistakes within the same interview session.

**Example flow:**

```
User: "Așteptă, vreau să schimb răspunsul la 2.3 (Competitors)"
Agent: "Desigur, hai să revizuim întrebarea despre competitori."
       [Re-ask Question 2.3]
User: [Provides new answer]
Agent: "Am înregistrat noul răspuns. Continuăm de unde am rămas."
       [Resume from current position, e.g., Question 4.2]
```

### Recovery if Interrupted

> **Important:** The context file is only written at the end of the interview (Step 14). If interrupted before completion, progress is NOT automatically saved.

**To minimize data loss:**

1. **Use shorter modes** — `--minimal` (6 categories, ~20 min) or `--stage=X` (2-4 categories)
2. **Complete in one session** — Plan 30-45 minutes for full interview
3. **Take notes** — Copy important answers externally as you go

**Workaround for Long Interviews:**

If you need to pause mid-interview:

1. Copy your conversation answers to a separate file as you go
2. When resuming, paste key answers at the start to provide context
3. Use `--stage=X` to focus on remaining categories
4. The agent will recognize previously discussed points and avoid redundant questions

**If you must resume:**

1. Re-run `/product-interview`
2. If existing (partial) context is found, you'll see four options:
   - **"Completăm ce lipsește"** — Only ask questions for incomplete categories
   - **"Revizuim totul"** — Start fresh with all questions
   - **"Detalii complete"** — View detailed summary, then decide
   - **"E suficient"** — Exit if context is adequate
3. If no context exists, you'll start the full interview from scratch

> **Note:** Step 1 detects existing `product-context.md` and offers to complete missing categories rather than starting over.

> **`--audit` vs `/audit-context`:**
>
> - **`--audit` flag** — Quick completeness check: shows category status (✅/⚠️/❌) and suggests which `--stage` to run. Use for quick status check.
> - **`/audit-context` command** — Deep analysis: detects quality issues, consistency conflicts, logic errors, ambiguities, and provides actionable fix recommendations. Use for thorough pre-implementation validation.
>
> **When to use each:**
>
> - Use `--audit` when you just want to see what's complete/incomplete
> - Use `/audit-context` before proceeding with `/product-vision` and subsequent commands to ensure the context is production-ready
