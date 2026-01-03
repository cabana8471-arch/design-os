<!-- v1.0.1 -->

# Phase 1: Setup & Mode Detection

This phase covers Steps 0-1: parsing arguments, detecting interview mode, and checking for existing context.

---

## Step 0: Mode Detection

Parse any arguments to determine interview mode:

```bash
# Variable initialization
MINIMAL_MODE=false
AUDIT_MODE=false
SKIP_VALIDATION=false
STAGE=""
INTERVIEW_MODE="full"  # Set properly in Step 1

# Parse arguments
for arg in "$@"; do
  case "$arg" in
    --minimal) MINIMAL_MODE=true ;;
    --stage=*) STAGE="${arg#--stage=}" ;;
    --audit) AUDIT_MODE=true ;;
    --skip-validation) SKIP_VALIDATION=true ;;
  esac
done
```

**Conflicting Arguments:**

Before proceeding, check for invalid argument combinations:

| Combination                   | Behavior                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `--minimal --stage=X`         | Error: "Cannot combine --minimal with --stage. Choose one mode."                    |
| `--audit --stage=X`           | `--audit` takes precedence. Reports completeness for stage categories only.         |
| `--audit --minimal`           | `--audit` takes precedence. Reports completeness for minimal categories only.       |
| `--skip-validation --audit`   | Error: "--skip-validation only applies to interview modes, not audit."              |
| `--skip-validation --minimal` | ⚠️ DATA LOSS RISK: Only 6 categories asked; existing categories 2,4,8,9,10,12 lost. |

> **Warning Behavior for `--skip-validation --minimal`:** When this combination is detected AND `product-context.md` exists, the agent MUST:
>
> 1. **First check if context exists:** `[ -f "product/product-context.md" ]`
> 2. **If NO existing context:** Proceed without warning (nothing to lose)
> 3. **If existing context found:**
>    - Display warning: "⚠️ Folosești --minimal cu --skip-validation. Categoriile existente 2, 4, 8, 9, 10, 12 vor fi pierdute permanent."
>    - Use AskUserQuestion to confirm: "Continui?" with options "Da, continuă" / "Nu, anulează"
>    - If "Nu, anulează": exit with message "Comandă anulată. Folosește /product-interview --minimal (fără --skip-validation) pentru a păstra categoriile existente."
>    - If "Da, continuă": proceed with interview (user accepted data loss risk)

```bash
# Validate argument combinations
if [ "$MINIMAL_MODE" = true ] && [ -n "$STAGE" ]; then
  echo "Error: Cannot combine --minimal with --stage. Choose one mode."
  echo "  --minimal covers categories: 1, 3, 5, 6, 7, 11"
  echo "  --stage=$STAGE covers different categories"
  exit 1
fi

if [ "$SKIP_VALIDATION" = true ] && [ "$AUDIT_MODE" = true ]; then
  echo "Error: --skip-validation only applies to interview modes, not audit."
  echo "  --audit always checks existing context (that's its purpose)"
  exit 1
fi

# Audit mode takes precedence over minimal/stage (applies category filter to audit)
if [ "$AUDIT_MODE" = true ]; then
  if [ "$MINIMAL_MODE" = true ]; then
    echo "Note: --audit mode with --minimal filter. Will audit minimal categories only."
  elif [ -n "$STAGE" ]; then
    echo "Note: --audit mode with --stage=$STAGE filter. Will audit stage categories only."
  fi
fi
```

**Mode behaviors:**

> **Note:** See the **Mode Options** table in the main `product-interview.md` file for the complete reference. Numbers in the "Categories" column refer to Category numbers (1-12), not Step numbers (0-14). See the Step-to-Category Mapping table in Step 2 for the correspondence.

> **Stage vs Cross-Reference Categories:** The `--stage` categories define what to ASK during the interview. The Cross-Reference section (Step 14.2) shows what each command READS from the context file. These differ intentionally — stages gather focused context, while commands may read from multiple categories. For example, `--stage=shell` asks Categories 3, 6, 7, but `/design-shell` reads Categories 2, 3, 7, 9 (some optional).

> **Step Execution Order:** Step 0 early-exit checks (stage/minimal category completion) run BEFORE Step 1 (existing context validation). This means:
>
> 1. **Step 0:** Parse arguments, validate combinations, check if requested categories already complete
> 2. **Step 1:** Check for existing context file, offer merge/overwrite options
>
> If Step 0 determines all requested categories are ✅ Complete, the command exits early without reaching Step 1.

**Stage Validation:**

If `--stage=X` is provided, validate the stage value before proceeding:

```bash
# If --stage parameter is provided
if [ -n "$STAGE" ]; then
  case "$STAGE" in
    vision|section|shell|data|scale|quality)
      echo "Stage mode: $STAGE"
      ;;
    *)
      echo "Error: Invalid stage '$STAGE'. Valid stages: vision, section, shell, data, scale, quality"
      exit 1
      ;;
  esac
fi
```

**Stage Category Mapping (for skip logic):**

When `--stage` is active, only ask questions for the categories in that stage. Skip all other categories.

| Stage     | Categories to Ask | Categories to Skip |
| --------- | ----------------- | ------------------ |
| `vision`  | 1, 2              | 3-12               |
| `section` | 5, 6, 7, 8, 11    | 1-4, 9-10, 12      |
| `shell`   | 3, 6, 7           | 1-2, 4-5, 8-12     |
| `data`    | 4, 10             | 1-3, 5-9, 11-12    |
| `scale`   | 8, 9              | 1-7, 10-12         |
| `quality` | 12                | 1-11               |

**Early Exit: Stage Mode with All Categories Complete:**

If using `--stage=X` and ALL categories in that stage are already ✅ Complete in the existing context file:

```bash
# Check if all stage categories are already complete
check_stage_completion() {
  local STAGE=$1
  local ALL_COMPLETE=true
  local STAGE_CATS=""

  case "$STAGE" in
    vision)  STAGE_CATS="1 2" ;;
    section) STAGE_CATS="5 6 7 8 11" ;;
    shell)   STAGE_CATS="3 6 7" ;;
    data)    STAGE_CATS="4 10" ;;
    scale)   STAGE_CATS="8 9" ;;
    quality) STAGE_CATS="12" ;;
  esac

  for cat_num in $STAGE_CATS; do
    # Use trailing space after dot to prevent false matches (e.g., "| 1. " won't match "| 10.")
    CAT_LINE=$(grep "| $cat_num\. " product/product-context.md 2>/dev/null | head -1)
    if ! echo "$CAT_LINE" | grep -qE "(✅|Complete)"; then
      ALL_COMPLETE=false
      break
    fi
  done

  echo "$ALL_COMPLETE"
}
```

**If all categories in stage are complete:**

1. Report to user:

   ```
   Toate categoriile din stage-ul "$STAGE" sunt deja complete:
   - Categoria X: ✅ Complete
   - Categoria Y: ✅ Complete

   Nu există întrebări noi de pus.
   ```

2. Offer options via AskUserQuestion:
   - **Revizuim oricum** — Re-ask all questions for this stage (use `--skip-validation`)
   - **Vedem altă zonă** — Suggest incomplete stages
   - **Ieșim** — Exit without changes

3. If user selects "Vedem altă zonă", analyze context and suggest:

   ```
   Ai categorii incomplete în:
   - --stage=section (Categories 5, 6 incomplete)
   - --stage=quality (Category 12 incomplete)

   Vrei să continuăm cu una dintre acestea?
   ```

4. **Edge case — All stages complete:** If ALL categories (1-12) are ✅ Complete:

   ```
   🎉 Felicitări! Toate cele 12 categorii sunt complete.

   Contextul produsului tău este complet (100%). Poți continua cu:
   - /audit-context — Verifică consistența răspunsurilor
   - /product-vision — Creează viziunea produsului

   Nu mai sunt întrebări de pus.
   ```

   Exit the command gracefully — do not offer to re-ask questions unless user explicitly requests `--skip-validation`.

**Early Exit: Minimal Mode with All Categories Complete:**

If using `--minimal` and ALL minimal categories are already ✅ Complete in the existing context file:

```bash
# Check if all minimal categories are already complete
check_minimal_completion() {
  local ALL_COMPLETE=true
  local MINIMAL_CATS="1 3 5 6 7 11"

  for cat_num in $MINIMAL_CATS; do
    # Use trailing space after dot to prevent false matches (e.g., "| 1. " won't match "| 10.")
    CAT_LINE=$(grep "| $cat_num\. " product/product-context.md 2>/dev/null | head -1)
    if ! echo "$CAT_LINE" | grep -qE "(✅|Complete)"; then
      ALL_COMPLETE=false
      break
    fi
  done

  echo "$ALL_COMPLETE"
}
```

**If all minimal categories are complete:**

1. Report to user:

   ```
   Toate categoriile din modul minimal sunt deja complete:
   - Categoria 1: ✅ Complete
   - Categoria 3: ✅ Complete
   - Categoria 5: ✅ Complete
   - Categoria 6: ✅ Complete
   - Categoria 7: ✅ Complete
   - Categoria 11: ✅ Complete

   Nu există întrebări noi de pus în modul minimal.
   ```

2. Offer options via AskUserQuestion:
   - **Completăm restul** — Ask remaining categories (2, 4, 8, 9, 10, 12)
   - **Revizuim oricum** — Re-ask all minimal questions (use `--skip-validation`)
   - **Ieșim** — Exit without changes

3. If user selects "Completăm restul":
   - Set `MINIMAL_MODE=false` to enable all categories
   - Continue with `INTERVIEW_MODE="complete_missing"` to ask only incomplete categories
   - This effectively asks categories 2, 4, 8, 9, 10, 12

---

**Category Skip Logic (used in Steps 2-13):**

Before asking questions for any category, check both stage mode AND complete_missing mode:

> **⚠️ Variable Order & Function Scope:** This function is DEFINED in Step 0 but only CALLED during Steps 2-13. It safely references variables that are set at different times:
>
> | Variable          | Set When      | Default Value          | Used By                     |
> | ----------------- | ------------- | ---------------------- | --------------------------- |
> | `$STAGE`          | Step 0 (args) | Empty (full interview) | Stage mode check            |
> | `$MINIMAL_MODE`   | Step 0 (args) | `false`                | Minimal mode check          |
> | `$INTERVIEW_MODE` | Step 1 (user) | `"full"`               | complete_missing mode check |
>
> **Safe to define here** because bash functions are evaluated at call time, not definition time. All variables will be set before any call to `should_ask_category()` in Steps 2-13.

```bash
# Function to check if category should be asked
# Variables used:
#   $STAGE - Set in Step 0 from --stage=X argument (optional)
#   $MINIMAL_MODE - Set in Step 0 from --minimal argument (true/false)
#   $INTERVIEW_MODE - Set in Step 1: "full", "complete_missing", or "audit"
should_ask_category() {
  local CATEGORY_NUM=$1

  # Check stage mode first
  if [ -n "$STAGE" ]; then
    case "$STAGE" in
      vision)   [[ "$CATEGORY_NUM" =~ ^(1|2)$ ]] || return 1 ;;
      section)  [[ "$CATEGORY_NUM" =~ ^(5|6|7|8|11)$ ]] || return 1 ;;
      shell)    [[ "$CATEGORY_NUM" =~ ^(3|6|7)$ ]] || return 1 ;;
      data)     [[ "$CATEGORY_NUM" =~ ^(4|10)$ ]] || return 1 ;;
      scale)    [[ "$CATEGORY_NUM" =~ ^(8|9)$ ]] || return 1 ;;
      quality)  [[ "$CATEGORY_NUM" == "12" ]] || return 1 ;;
    esac
  fi

  # Check minimal mode (categories 1, 3, 5, 6, 7, 11)
  if [ "$MINIMAL_MODE" = true ]; then
    [[ "$CATEGORY_NUM" =~ ^(1|3|5|6|7|11)$ ]] || return 1
  fi

  # Check complete_missing mode
  if [ "$INTERVIEW_MODE" = "complete_missing" ]; then
    # Use trailing space after dot to prevent false matches (e.g., "| 1. " won't match "| 10.")
    CATEGORY_LINE=$(grep "| $CATEGORY_NUM\. " product/product-context.md 2>/dev/null | head -1)
    if echo "$CATEGORY_LINE" | grep -qE "(✅|Complete)"; then
      return 1  # Skip complete categories
    fi
  fi

  return 0  # Ask this category
}

# Usage in each category step:
# if should_ask_category 1; then
#   # Ask Category 1 questions
# else
#   echo "Skipping Category 1"
# fi
```

---

## Step 1: Check Existing Context

**Skip this step entirely if `--skip-validation` flag was passed in Step 0.** Proceed directly to Step 2.

---

**If NOT `--skip-validation`:**

First, check if `product/product-context.md` already exists:

```bash
CONTEXT_FILE="product/product-context.md"

if [ -f "$CONTEXT_FILE" ]; then
  echo "Existing context found"
  # Parse completeness from file
  COMPLETENESS=$(grep "^Completeness:" "$CONTEXT_FILE" | grep -oE '[0-9]+' | head -1)
  if [ -z "$COMPLETENESS" ]; then
    COMPLETENESS=0
  fi
  echo "Current completeness: ${COMPLETENESS}%"
fi
```

**If existing context found:**

First, show a quick summary before asking (so user can decide with context):

```
Am găsit context existent pentru produsul tău!

📊 **Completeness:** ${COMPLETENESS}% ([N]/12 categorii)
✅ Complete: [list complete category names, e.g., "Foundation, Design Direction"]
⚠️ Partial: [list partial category names]
❌ Empty: [list empty category names]
```

Then use AskUserQuestion to ask:

"Ce vrei să facem?"

Options:

- **Completăm ce lipsește** — Doar categoriile incomplete (Recomandat)
- **Revizuim totul** — Pornim de la zero cu întrebări noi
- **Detalii complete** — Vezi rezumatul detaliat pe categorii
- **E suficient** — Contextul e ok, continuăm cu /product-vision

> **UX Note:** By showing a brief summary before the question, most users can decide immediately. The "Detalii complete" option replaces the old "Vedem ce avem" flow but is now optional rather than a decision point.

**If user selected "E suficient":**

Exit the command with:

```
Contextul produsului pare complet. Poți continua cu /product-vision sau altă comandă.
```

**If user selected "Detalii complete":**

Display the full summary table (same as old "Vedem ce avem" behavior), then return to the same question above. This is informational only.

**If user selected "Revizuim totul":**

Before proceeding with a full review, create a backup of the existing context:

```bash
# Backup existing context before overwrite
if [ "$COMPLETENESS" -ge 25 ]; then
  BACKUP_FILE="product/product-context.backup.$(date +%Y%m%d_%H%M%S).md"
  # Handle rare collision if file exists (same second)
  # Use $RANDOM for cross-platform compatibility (macOS doesn't support date +%N)
  if [ -f "$BACKUP_FILE" ]; then
    BACKUP_FILE="product/product-context.backup.$(date +%Y%m%d_%H%M%S)_${RANDOM}.md"
  fi
  cp product/product-context.md "$BACKUP_FILE"
  echo "Backup creat: $BACKUP_FILE"
fi
```

> **Backup Policy:** Create backup when existing completeness ≥25%. For very incomplete contexts (<25%), backup is unnecessary since little would be lost.
>
> **Collision Handling:** The backup filename uses timestamp with 1-second granularity. In the rare case of running twice within the same second, `$RANDOM` (0-32767) is appended for uniqueness. This approach is cross-platform compatible (macOS doesn't support `date +%N` for nanoseconds).
>
> **Cleanup:** Backup files accumulate over time. To keep only the 3 most recent:
>
> ```bash
> ls -t product/product-context.backup.*.md 2>/dev/null | tail -n +4 | xargs rm -f
> ```

Inform the user:

```
Am salvat contextul existent în $BACKUP_FILE. Acum pornim de la zero.
```

Then proceed with full interview (all Steps 2-13).

**Full Summary Table (for "Detalii complete" option):**

When user selects "Detalii complete", display this detailed summary:

```markdown
## Current Context Summary

**Product:** [Name from header]
**Completeness:** ${COMPLETENESS}% ([N]/12 categories)

| Category                    | Status   | Key Points              |
| --------------------------- | -------- | ----------------------- |
| 1. Product Foundation       | ✅/⚠️/❌ | [First line of content] |
| 2. User Research & Personas | ✅/⚠️/❌ | [First line of content] |
| 3. Design Direction         | ✅/⚠️/❌ | [First line of content] |
| 4. Data Architecture        | ✅/⚠️/❌ | [First line of content] |
| 5. Section-Specific Depth   | ✅/⚠️/❌ | [First line of content] |
| 6. UI Patterns & Components | ✅/⚠️/❌ | [First line of content] |
| 7. Mobile & Responsive      | ✅/⚠️/❌ | [First line of content] |
| 8. Performance & Scale      | ✅/⚠️/❌ | [First line of content] |
| 9. Integration Points       | ✅/⚠️/❌ | [First line of content] |
| 10. Security & Compliance   | ✅/⚠️/❌ | [First line of content] |
| 11. Error Handling          | ✅/⚠️/❌ | [First line of content] |
| 12. Testing & Quality       | ✅/⚠️/❌ | [First line of content] |
```

After displaying, return to the main question (user can now make an informed choice).

**If `--audit` mode:**

Skip interview, just analyze and report:

```markdown
## Context Audit Report

| Category         | Status      | Completeness | Key Gaps         |
| ---------------- | ----------- | ------------ | ---------------- |
| 1. Foundation    | ✅ Complete | 100%         | None             |
| 2. User Research | ⚠️ Partial  | 50%          | Missing personas |
| ...              | ...         | ...          | ...              |

**Overall Completeness: X%**

**Recommendation (based on completeness):**

- 0-25%: "Run `/product-interview` for full interview"
- 26-49%: "Run `/product-interview --stage=X` for targeted completion"
- 50-74%: "Context meets minimum threshold. Consider `/product-interview --stage=X` to strengthen weak areas"
- 75%+: "Context is comprehensive. Proceed with `/product-vision`"
```

**Filtered Audit Report (`--audit --stage=X` or `--audit --minimal`):**

When audit is combined with `--stage` or `--minimal`, the report shows ONLY the categories in that filter:

```markdown
## Context Audit Report (Stage: shell)

> Showing only categories for --stage=shell: 3, 6, 7

| Category          | Status      | Completeness | Key Gaps                   |
| ----------------- | ----------- | ------------ | -------------------------- |
| 3. Design Dir.    | ✅ Complete | 100%         | None                       |
| 6. UI Patterns    | ⚠️ Partial  | 60%          | Missing notification style |
| 7. Mobile & Resp. | ❌ Empty    | 0%           | Not started                |

**Stage Completeness: 53%** (based on 3 categories)

**Recommendation:**

- "2 of 3 shell categories need work. Run `/product-interview --stage=shell` to complete."
```

> **Note:** The "Overall Completeness" changes to "Stage Completeness" and is calculated only from the filtered categories, not all 12.

**After displaying audit report:** EXIT the command immediately. Do NOT proceed to interview questions. The `--audit` flag is for checking status only. If the user wants to answer questions, they should run `/product-interview` (without `--audit`).

---

### Category Skip Logic (for "complete_missing" mode)

> **Note:** This mode corresponds to user selection "Completăm ce lipsește" in Romanian UI.

If user selected "Completăm ce lipsește" above, track this mode and apply skip logic to Steps 2-13:

```bash
# Set after user selection
INTERVIEW_MODE="complete_missing"  # or "full" for other options
```

**Before each category step (Steps 2-13), check if it should be skipped:**

```bash
# Example for Step 2 (Category 1)
CATEGORY_NUM=1

# Robust emoji parsing - handles UTF-8 variations
# Match emoji OR text status (Complete/Partial/Empty)
# Use trailing space after dot to prevent false matches (e.g., "| 1. " won't match "| 10.")
CATEGORY_LINE=$(grep "| $CATEGORY_NUM\. " product/product-context.md | head -1)

# Check for Complete status (✅ or "Complete")
if echo "$CATEGORY_LINE" | grep -qE "(✅|Complete)"; then
  CATEGORY_STATUS="complete"
# Check for Partial status (⚠️ or "Partial")
elif echo "$CATEGORY_LINE" | grep -qE "(⚠️|Partial)"; then
  CATEGORY_STATUS="partial"
# Check for Empty status (❌ or "Empty")
elif echo "$CATEGORY_LINE" | grep -qE "(❌|Empty)"; then
  CATEGORY_STATUS="empty"
else
  CATEGORY_STATUS="unknown"
fi

if [ "$INTERVIEW_MODE" = "complete_missing" ] && [ "$CATEGORY_STATUS" = "complete" ]; then
  echo "Category $CATEGORY_NUM already complete, skipping..."
  # Skip to next category
else
  # Proceed with category questions
fi
```

> **Note:** The status parser handles both emoji characters (✅⚠️❌) and text alternatives (Complete/Partial/Empty) for cross-platform compatibility. The generated output (Step 14.2) uses emoji-only format in the Quick Reference table, but the parser accepts text fallback for manually edited files.

**Skip logic rules:**

| Category Status | "complete_missing" Mode | Other Modes |
| --------------- | ----------------------- | ----------- |
| ✅ Complete     | SKIP                    | Ask anyway  |
| ⚠️ Partial      | ASK (to complete)       | Ask anyway  |
| ❌ Empty        | ASK (new)               | Ask anyway  |

This ensures users only answer questions for categories that need completion.

---

**Next:** Continue to Phase 2 (Steps 2-7) for foundation categories.
