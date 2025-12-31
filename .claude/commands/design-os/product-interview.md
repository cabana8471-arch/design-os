<!-- v1.3.1 -->

# Product Interview

You are conducting a comprehensive product interview to gather detailed context for Design OS. This command creates `product/product-context.md` which is **required** by all other Design OS commands.

**Language:** Conduct the conversation in the user's preferred language (this template uses Romanian prompts as examples). **All output files MUST be in English** for portability.

> **Note on Romanian text:** User-facing conversation messages in this command (questions, options, feedback) are written in Romanian as the default example. This is intentional — these are conversation messages, not file output. When implementing for other languages, replace these with appropriate translations.

> **Code Block Conventions:** Code blocks in this command serve two purposes:
>
> - **Executable bash** — Marked with `bash` language tag, contains valid shell commands
> - **Pseudocode/guidance** — Describes logic the agent should implement (not literal code)
>
> When pseudocode appears (e.g., `HIGH_COUNT=$(count issues with 🔴)`), implement equivalent logic rather than running literally.

> **⚠️ No Auto-Save:** Progress is saved only at the end of the interview (Step 14). If you need to stop mid-interview:
>
> - Consider using `--minimal` (~20 min) or `--stage=X` (~10-15 min) for shorter sessions
> - Ask the agent to "pause and summarize" — it will provide a summary of answers so far that you can save externally
> - Re-run `/product-interview` later to continue where you left off (if partial context exists)

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

| Combination                 | Behavior                                                                      |
| --------------------------- | ----------------------------------------------------------------------------- |
| `--minimal --stage=X`       | Error: "Cannot combine --minimal with --stage. Choose one mode."              |
| `--audit --stage=X`         | `--audit` takes precedence. Reports completeness for stage categories only.   |
| `--audit --minimal`         | `--audit` takes precedence. Reports completeness for minimal categories only. |
| `--skip-validation --audit` | Error: "--skip-validation only applies to interview modes, not audit."        |

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

> **Note:** Numbers in the "Categories" column refer to Category numbers (1-12), not Step numbers (0-14). See the Step-to-Category Mapping table in Step 2 for the correspondence.

| Mode                | Categories (1-12) | Output                                   |
| ------------------- | ----------------- | ---------------------------------------- |
| Default             | All 12            | Full product-context.md                  |
| `--minimal`         | 1, 3, 5, 6, 7, 11 | Quick start context (6 categories = 50%) |
| `--stage=vision`    | 1, 2              | Foundation + User Research               |
| `--stage=section`   | 5, 6, 7, 8, 11    | Section design context                   |
| `--stage=shell`     | 3, 6, 7           | Shell design context                     |
| `--stage=data`      | 4, 10             | Data architecture context                |
| `--stage=scale`     | 8, 9              | Performance + Integration context        |
| `--stage=quality`   | 12                | Testing & Quality context                |
| `--audit`           | N/A               | Report on completeness                   |
| `--skip-validation` | All 12            | Skip Step 1 (existing context check)     |

> **Stage vs Cross-Reference Categories:** The `--stage` categories define what to ASK during the interview. The Cross-Reference section (Step 14.2) shows what each command READS from the context file. These differ intentionally — stages gather focused context, while commands may read from multiple categories. For example, `--stage=shell` asks Categories 3, 6, 7, but `/design-shell` reads Categories 2, 3, 7, 9 (some optional).

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
    CAT_LINE=$(grep "| $cat_num\." product/product-context.md 2>/dev/null | head -1)
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

**Category Skip Logic (used in Steps 2-13):**

Before asking questions for any category, check both stage mode AND complete_missing mode:

> **⚠️ Variable Order:** This function references `$INTERVIEW_MODE` which is set in Step 1 (not here). The function is defined here for reference but only called during Steps 2-13. Variable initialization order:
>
> 1. `$STAGE` — Set here in Step 0 from `--stage=X` argument
> 2. `$INTERVIEW_MODE` — Set in Step 1: "full", "complete_missing", or "audit" (defaults to "full")

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
    CATEGORY_LINE=$(grep "| $CATEGORY_NUM\." product/product-context.md 2>/dev/null | head -1)
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
  cp product/product-context.md "$BACKUP_FILE"
  echo "Backup creat: $BACKUP_FILE"
fi
```

> **Backup Policy:** Create backup when existing completeness ≥25%. For very incomplete contexts (<25%), backup is unnecessary since little would be lost.
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
CATEGORY_LINE=$(grep "| $CATEGORY_NUM\." product/product-context.md | head -1)

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

## Step 2: Product Foundation

> **Note:** Steps 2-13 correspond to Categories 1-12 in the output file. Step 2 creates Category 1, Step 3 creates Category 2, etc.

**Step-to-Category Mapping:**

| Step | Category | Name                     |
| ---- | -------- | ------------------------ |
| 2    | 1        | Product Foundation       |
| 3    | 2        | User Research & Personas |
| 4    | 3        | Design Direction         |
| 5    | 4        | Data Architecture        |
| 6    | 5        | Section-Specific Depth   |
| 7    | 6        | UI Patterns & Components |
| 8    | 7        | Mobile & Responsive      |
| 9    | 8        | Performance & Scale      |
| 10   | 9        | Integration Points       |
| 11   | 10       | Security & Compliance    |
| 12   | 11       | Error Handling           |
| 13   | 12       | Testing & Quality        |

**Progress Indicator:**

Before each category, show progress to help users understand where they are in the interview:

```
📊 Categoria [N] din 12: [Category Name]
   Întrebările [X]-[Y] din ~52

   [Brief description of what this category covers]
```

**Question counts per category (for progress calculation):**

| Category | Questions | Cumulative |
| -------- | --------- | ---------- |
| 1        | 6         | 1-6        |
| 2        | 4         | 7-10       |
| 3        | 5         | 11-15      |
| 4        | 5         | 16-20      |
| 5        | 5         | 21-25      |
| 6        | 5         | 26-30      |
| 7        | 4         | 31-34      |
| 8        | 4         | 35-38      |
| 9        | 3         | 39-41      |
| 10       | 3         | 42-44      |
| 11       | 4         | 45-48      |
| 12       | 4         | 49-52      |

> **For --minimal mode:** Adjust progress to show only 6 categories and ~29 questions total.

> **For --stage mode:** Adjust progress to show only the categories in that stage:
>
> | Stage     | Categories | Questions |
> | --------- | ---------- | --------- |
> | `vision`  | 2          | ~10       |
> | `section` | 5          | ~22       |
> | `shell`   | 3          | ~14       |
> | `data`    | 2          | ~8        |
> | `scale`   | 2          | ~7        |
> | `quality` | 1          | ~4        |
>
> Format: `📊 Categoria [N] din [STAGE_TOTAL]: [Category Name]`

> **Category Skip:** Before asking questions, check `should_ask_category(1)`. Skip to Step 3 if:
>
> - `--stage` mode is active and Category 1 is NOT in the stage's category list, OR
> - `INTERVIEW_MODE="complete_missing"` and this category is ✅ Complete
>
> See "Category Skip Logic" function in Step 0 for implementation.

**Ro:** "Să începem cu fundația produsului tău."

> **Handling Skipped Questions:** If user says "skip", "none", "not applicable", or provides no answer:
>
> - Record as "N/A — Not specified" in the output
> - Mark category as ⚠️ Partial unless ALL required questions have valid answers
> - Optional questions (marked with "(optional)") can be skipped without affecting category status

> **Question Numbering Convention:** Questions are numbered as `[Step].[N]` where N starts at 1 for each category. Example: Question 2.1 is the first question in Step 2 (Category 1).
>
> **Note:** Question 2.0 below is an exception — it's the foundational "Product Name" question that must be answered first. All other categories start at `.1`.

> **Multi-Part Question Flow:** For questions with >4 options (marked with ⚠️ Option Limit), follow this flow:
>
> 1. **Always ask Part A first** — The initial categorization question
> 2. **Part B is conditional:**
>    - If Part A answer requires specificity (e.g., "Yes, with options"), ask Part B
>    - If Part A answer is definitive (e.g., "None", "No"), skip Part B
> 3. **Recording answers:**
>    - Combine Part A + Part B into a single answer line
>    - Format: `[Part A choice]: [Part B specifics]`
>    - Example: `OAuth / Social: Google, GitHub`
> 4. **Handling skip/N/A:**
>    - If user skips Part A, record as "N/A — Not specified"
>    - If user answers Part A but skips Part B, record Part A only (question is partially answered)
>    - Mark category as complete only if required questions have valid answers

### Question 2.0: Product Name (Required)

"Cum se numește produsul tău?"

Prompt for:

- **Product name** — Official name or working title (required)
- **Tagline** — One-liner description, 5-10 words (optional)

Store as `PRODUCT_NAME` for use in the output file header.

### Question 2.1: Target Audience

"Cine este utilizatorul principal al produsului? Descrie-l cât mai specific:"

Prompt for:

- Age range
- Job role / profession
- Technical proficiency (Non-technical / Basic / Intermediate / Advanced / Expert)
- Primary device (Desktop / Mobile / Both equally)

### Question 2.2: Problem Space

"Ce problemă rezolvă produsul tău? De ce soluțiile existente nu sunt suficiente?"

Record:

- Primary problem (1 sentence)
- Why existing solutions fail
- What makes your approach different

### Question 2.3: Competitor Analysis

"Există produse similare pe piață? Cum te diferențiezi?"

Use AskUserQuestion:

Options:

- **Nu există competitori direcți** — Piață nouă sau nișă
- **Sunt câțiva competitori** — Voi enumera 2-3 (follow-up questions below)
- **Piață aglomerată** — Mulți competitori, diferențiez prin X

### Follow-up 2.3b: Competitor Details (if "Sunt câțiva competitori" selected)

For each competitor mentioned (up to 3), prompt for:

```markdown
**Competitor [N]: [Name]**

- What they do well:
- Where they fall short:
- How your product is different:
```

Record these details in the output under "### Competitors" section.

### Question 2.4: Success Metrics

"Cum vei măsura succesul produsului?"

Prompt for 2-3 KPIs:

- Primary metric (e.g., user signups, revenue, engagement)
- Secondary metrics
- Timeline for measuring success

### Question 2.5: Business Model

"Care e modelul de business?"

> **⚠️ Option Limit:** This question has 6 options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "E un produs gratuit sau plătit?" → Free/Open Source | Paid (one-time or recurring) | Enterprise (sales-led)
> - **Part B (if Paid):** "Ce model de plată?" → Freemium | Subscription SaaS | One-time purchase | Usage-based

Use AskUserQuestion (Part A first, then Part B if needed):

**Part A options:**

- **Free / Open Source** — No monetization planned
- **Paid (one-time or recurring)** — Users pay for the product
- **B2B Enterprise** — Sales-led, custom pricing

**Part B options (if "Paid" selected):**

- **Freemium** — Basic free, premium paid
- **Subscription SaaS** — Monthly/annual recurring
- **One-time purchase** — Pay once, use forever
- **Usage-based** — Pay per use/transaction

---

## Step 3: User Research & Personas

> **Category Skip:** Before asking questions, check `should_ask_category(2)`. Skip to Step 4 if this category should be skipped. See "Category Skip Logic" in Step 0.

**Ro:** "Acum să definim utilizatorii mai în detaliu."

### Question 3.1: Primary Persona

"Descrie utilizatorul tău principal ca și cum ar fi o persoană reală. Dă-i un nume și o poveste."

Template to fill:

```markdown
### Primary Persona: [Name]

- **Role:** [Job title or role]
- **Age range:** [e.g., 25-35]
- **Tech proficiency:** [Non-technical to Expert]
- **Primary device:** [Desktop / Mobile / Both]
- **Goals:** [What they want to achieve]
- **Frustrations:** [What annoys them with current solutions]
- **Quote:** "[A typical thing they might say]"
```

### Question 3.2: Secondary Personas (optional)

"Există și alți utilizatori secundari? (ex: admin, manager, vizitator)"

If yes, gather similar details for 1-2 more personas.

### Question 3.3: Accessibility Requirements

Use AskUserQuestion:

"Utilizatorii tăi au nevoi speciale de accesibilitate?"

> **⚠️ Option Limit:** This question has 6 multiselect options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Ai utilizatori cu nevoi de accesibilitate?" → Yes (specific needs) | Standard accessibility | Unsure
> - **Part B (if Yes):** Present specific needs as free-text prompt with options as guidance

**Part A options:**

- **Yes, specific needs** — I know my users have specific accessibility requirements
- **Standard accessibility** — Follow WCAG guidelines, no special requirements
- **Unsure** — Need to research user accessibility needs

**Part B guidance (if "Yes" selected):**

Present this list and ask user to specify which apply:

- Screen reader users — Will need ARIA labels, semantic HTML
- Keyboard-only navigation — No mouse required
- Color blindness — Don't rely on color alone
- Motor impairments — Large click targets, reduced precision
- Cognitive considerations — Simple language, clear navigation

### Question 3.4: Geographic & Language

"Unde sunt localizați utilizatorii tăi? Ce limbi vor folosi?"

Prompt for:

- Primary region(s)
- Primary language
- Multi-language support needed? (Yes/No)

---

## Step 4: Design Direction

> **Category Skip:** Before asking questions, check `should_ask_category(3)`. Skip to Step 5 if this category should be skipped. See "Category Skip Logic" in Step 0.

**Ro:** "Acum definim direcția vizuală."

### Question 4.1: Aesthetic Tone

Use AskUserQuestion:

"Ce ton estetic vrei pentru produs?"

> **⚠️ Option Limit:** This question has 5 options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Ce direcție estetică generală?" → Professional/Business | Consumer/Friendly | Technical/Data-focused
> - **Part B (if Professional/Business):** "Corporate sau Modern?" → Professional / Corporate | Modern / Minimal
> - **Part B (if Consumer/Friendly):** "Bold sau Playful?" → Bold / Expressive | Playful / Friendly

**Part A options:**

- **Professional / Business** — Clean, trustworthy, sophisticated. Good for: B2B, SaaS, enterprise.
- **Consumer / Friendly** — Approachable, engaging, memorable. Good for: Consumer apps, social, education.
- **Technical / Data-focused** — Information-rich, efficient, compact. Good for: Developer tools, analytics, dashboards.

**Part B options (if "Professional / Business" selected):**

- **Professional / Corporate** — Conservative, trustworthy. Good for: Finance, healthcare, legal.
- **Modern / Minimal** — Sleek, spacious. Good for: SaaS, tech products.

**Part B options (if "Consumer / Friendly" selected):**

- **Bold / Expressive** — Vibrant, energetic. Good for: Creative tools, lifestyle apps.
- **Playful / Friendly** — Warm, fun. Good for: Education, social, casual apps.

### Question 4.2: Animation Style

Use AskUserQuestion:

"Cât de mult motion/animații vrei?"

Options:

- **None** — Static UI, fastest performance
- **Subtle** — Hover states, page transitions only
- **Standard** — Smooth transitions, micro-interactions
- **Rich** — Elaborate animations, scroll effects, engaging

### Question 4.3: Information Density

Use AskUserQuestion:

"Cât de densă să fie informația pe ecran?"

Options:

- **Compact** — More data visible, smaller spacing. Good for: Power users, dashboards.
- **Comfortable** — Balanced spacing and content. Good for: Most applications.
- **Spacious** — Generous whitespace, focused. Good for: Marketing, consumer apps.

### Question 4.4: Brand Constraints

"Ai ghiduri de brand existente (culori, fonturi, logo)?"

If yes, prompt for:

- Primary brand color (hex or name)
- Secondary color(s)
- Font preference (or "open to suggestions")
- Logo available? (Yes/No)

### Question 4.5: Visual Inspiration

"Există produse sau site-uri ale căror design îl admiri?"

Prompt for 2-3 references with what specifically they like about each.

---

## Step 5: Data Architecture

> **Category Skip:** Before asking questions, check `should_ask_category(4)`. Skip to Step 6 if this category should be skipped. See "Category Skip Logic" in Step 0.

**Ro:** "Să discutăm despre structura datelor."

### Question 5.1: Data Sensitivity

Use AskUserQuestion:

"Ce fel de date va gestiona produsul?"

> **⚠️ Option Limit:** This question has 6 multiselect options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Care e nivelul maxim de sensibilitate a datelor?" → Public only | Business/Internal | Personal (PII) | Highly sensitive
> - **Part B (if Personal or Highly sensitive):** Specify which types apply

**Part A options:**

- **Public only** — No sensitivity, freely shareable
- **Business/Internal** — Business data, not for public
- **Personal (PII)** — Names, emails, addresses
- **Highly sensitive** — Financial, health, biometric, or credentials

**Part B guidance (if "Personal" or "Highly sensitive" selected):**

Ask user to specify which apply:

- Personal data (PII) — Names, emails, addresses
- Sensitive personal data — Health, financial, biometric
- Financial transactions — Payments, account balances
- Authentication credentials — Passwords, tokens

### Question 5.2: Compliance Requirements

Use AskUserQuestion:

"Ce cerințe de compliance trebuie să respecti?"

> **⚠️ Option Limit:** This question has 6 multiselect options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Ai cerințe specifice de compliance?" → None | Data protection (GDPR) | Industry-specific | Multiple/Enterprise
> - **Part B (if Industry-specific or Multiple):** Specify which frameworks

**Part A options:**

- **None specific** — Basic security practices
- **Data protection (GDPR)** — European data protection only
- **Industry-specific** — Healthcare (HIPAA), payments (PCI-DSS), etc.
- **Multiple/Enterprise** — Multiple frameworks required

**Part B guidance (if "Industry-specific" or "Multiple" selected):**

Ask user to specify which apply:

- GDPR — European data protection
- HIPAA — US healthcare data
- SOC 2 — Security/availability certification
- PCI-DSS — Payment card data
- Other — Describe specific requirements

### Question 5.3: Data Relationships

"Cât de complexe sunt relațiile între entități?"

Use AskUserQuestion:

Options:

- **Simple** — Mostly independent entities, few relationships
- **Moderate** — Some parent-child, one-to-many relationships
- **Complex** — Many-to-many, nested hierarchies, cross-references

### Question 5.4: Audit & History

Use AskUserQuestion:

"Trebuie să păstrezi istoric al modificărilor?"

Options:

- **No** — Current state is enough
- **Basic** — Created/updated timestamps
- **Full audit** — Who changed what, when, with old values
- **Versioning** — Full version history with rollback

### Question 5.5: Deletion Strategy

Use AskUserQuestion:

"Cum tratezi ștergerea datelor?"

Options:

- **Hard delete** — Remove permanently
- **Soft delete** — Mark as deleted, keep data
- **Archive** — Move to separate storage
- **Retention policy** — Delete after X days

---

## Step 6: Section-Specific Depth

> **Category Skip:** Before asking questions, check `should_ask_category(5)`. Skip to Step 7 if this category should be skipped. See "Category Skip Logic" in Step 0.

**Ro:** "Acum intrăm în detalii despre secțiunile principale."

### Question 6.1: User Flows

"Descrie pas cu pas cel mai important user flow din produs."

Template:

```markdown
### Flow: [Name, e.g., "Create Invoice"]

1. User accesses [screen/page]
2. User clicks [action]
3. System shows [response]
4. User fills [form/data]
5. User confirms [action]
6. System [result]
```

Repeat for 2-3 critical flows.

### Question 6.2: Edge Cases

"Ce se întâmplă când lucrurile nu merg bine?"

For each major flow, ask:

- What if the user has no data yet? (empty state)
- What if loading takes too long? (loading state)
- What if the action fails? (error state)
- What if user loses connection? (offline state)

### Question 6.3: Empty States

"Când utilizatorul e nou și nu are date, ce vede?"

Use AskUserQuestion:

Options:

- **Simple message** — "No items yet. Create your first one."
- **Guided onboarding** — Step-by-step first-use wizard
- **Sample data** — Pre-populated examples to explore
- **Contextual help** — Tips and suggestions in empty areas

### Question 6.4: Loading States

Use AskUserQuestion:

"Ce afișezi când datele se încarcă?"

Options:

- **Spinner** — Simple loading indicator
- **Skeleton** — Content placeholders that match layout
- **Progressive** — Show partial data as it loads
- **Optimistic** — Show expected result immediately, sync later

### Question 6.5: Error Recovery

"Cum se recuperează utilizatorul din erori?"

Prompt for:

- Error message style (technical vs friendly)
- Retry mechanism (automatic, manual, none)
- Fallback behavior (cached data, offline mode)

---

## Step 7: UI Patterns & Components

> **Category Skip:** Before asking questions, check `should_ask_category(6)`. Skip to Step 8 if this category should be skipped. See "Category Skip Logic" in Step 0.

**Ro:** "Să stabilim pattern-urile de UI."

### Question 7.1: Data Display Preference

Use AskUserQuestion:

"Cum preferi să afișezi liste de date?"

> **⚠️ Option Limit:** This question has 5 options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Care e stilul principal pentru liste?" → Cards/Visual | Table/Dense | List/Grid
> - **Part B (if List/Grid):** "Preferi List sau Grid?" → List | Grid

**Part A options:**

- **Cards / Visual** — Visual, scannable, good for mixed content
- **Table / Dense** — Dense, sortable, good for data-heavy views
- **List / Grid** — Compact layouts for simple or visual content
- **Depends on context** — Mix based on data type

**Part B options (if "List / Grid" selected):**

- **List** — Compact, linear, good for simple items
- **Grid** — Thumbnail-based, good for visual content

### Question 7.2: Form Validation

Use AskUserQuestion:

"Când afișezi erorile de validare?"

Options:

- **On blur** — When user leaves field
- **On submit** — All at once when form submitted
- **Real-time** — As user types
- **Mixed** — Real-time for format, on submit for logic

### Question 7.3: Notification Style

Use AskUserQuestion:

"Cum vrei să afișezi notificările și feedback-ul?"

> **⚠️ Option Limit:** This question has 5 options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Ce stil de notificări preferi?" → Toast (popup) | Banner/Inline | Mixed
> - **Part B (if Toast):** "Unde să apară toast-urile?" → Bottom-right | Top-center

**Part A options:**

- **Toast (popup)** — Non-intrusive popups, auto-dismiss
- **Banner / Inline** — Full-width banner or inline next to content
- **Mixed** — Based on importance (errors = banner, success = toast)

**Part B options (if "Toast" selected):**

- **Bottom-right** — Non-intrusive, auto-dismiss
- **Top-center** — More visible, auto-dismiss

**Part B options (if "Banner / Inline" selected):**

- **Banner** — Full-width, requires dismissal
- **Inline** — Next to related content

### Question 7.4: Confirmation Patterns

Use AskUserQuestion:

"Pentru acțiuni distructive (ștergere, etc.), ce confirmare vrei?"

Options:

- **None** — One click does it (with undo)
- **Confirm dialog** — Modal asking "Are you sure?"
- **Type to confirm** — Must type item name to delete
- **Multi-step** — Multiple confirmations for critical actions

### Question 7.5: Modal vs Drawer

Use AskUserQuestion:

"Pentru formulare și detalii, preferi:"

> **⚠️ Option Limit:** This question has 5 options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Ce abordare generală preferi?" → Overlay (modal/drawer) | Page-based | Context-dependent
> - **Part B (if Overlay):** "Ce tip de overlay?" → Modal | Drawer

**Part A options:**

- **Overlay (modal/drawer)** — Stay on page, show content in overlay
- **Page-based** — Navigate to new page or expand inline
- **Context-dependent** — Mix based on content size and complexity

**Part B options (if "Overlay" selected):**

- **Modals** — Centered overlay, focused attention
- **Drawers** — Side panel, context preserved

**Part B options (if "Page-based" selected):**

- **Full page** — Navigate to new page
- **Inline expand** — Expand in place

---

## Step 8: Mobile & Responsive

> **Category Skip:** Before asking questions, check `should_ask_category(7)`. Skip to Step 9 if this category should be skipped. See "Category Skip Logic" in Step 0.

**Ro:** "Să vorbim despre experiența mobilă."

### Question 8.1: Responsive Priority

Use AskUserQuestion:

"Care e prioritatea pentru responsive?"

> **⚠️ Option Limit:** This question has 5 options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Suportul mobil e necesar?" → Yes (both platforms) | Desktop only | Mobile only
> - **Part B (if Yes):** "Care platformă e primară?" → Desktop-first | Mobile-first | Equal priority

**Part A options:**

- **Yes (both platforms)** — Support both desktop and mobile
- **Desktop only** — Mobile not needed (internal tool)
- **Mobile only** — Mobile app or mobile-first product

**Part B options (if "Yes" selected):**

- **Desktop-first** — Optimize for desktop, adapt for mobile
- **Mobile-first** — Optimize for mobile, enhance for desktop
- **Equal priority** — Both equally important

### Question 8.2: Touch Interactions

Use AskUserQuestion:

"Ce interacțiuni touch vrei pe mobil?"

> **⚠️ Option Limit:** This question has 5 multiselect options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Ce nivel de gesturi touch?" → Standard only | Common gestures | Advanced gestures
> - **Part B (if Common/Advanced):** Free-text prompt for specific gestures needed

**Part A options:**

- **Standard only** — Just tapping, no special gestures
- **Common gestures** — Swipe actions, pull to refresh (most mobile apps)
- **Advanced gestures** — Long press, pinch to zoom, custom gestures

**Part B guidance (if "Common" or "Advanced" selected):**

Ask user to specify which apply from this list:

- Swipe actions — Swipe to delete, archive, etc.
- Pull to refresh — Pull down to reload
- Long press — Context menu on hold
- Pinch to zoom — For images, maps, charts

### Question 8.3: Mobile Navigation

Use AskUserQuestion:

"Ce tip de navigare pe mobil?"

> **⚠️ Option Limit:** This question has 5 options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Ce abordare pentru navigare mobilă?" → Hidden (hamburger) | Visible (tabs/bottom) | Hybrid | Depends on complexity
> - **Part B (if Visible/Hybrid):** Specific pattern preference

**Part A options:**

- **Hidden (hamburger)** — Hidden menu, more content space
- **Visible (tabs/bottom)** — Always visible tabs, thumb-friendly
- **Hybrid** — Combination of visible tabs and hidden overflow
- **Depends on complexity** — Simple = tabs, complex = hamburger

**Part B options (if "Visible" selected):**

- **Bottom navigation** — Tabs at bottom, thumb-friendly
- **Full-screen menu** — Takeover navigation when opened

**Part B options (if "Hybrid" selected):**

- **Tab bar + hamburger** — Main tabs + overflow menu for secondary items

### Question 8.4: Offline Requirements

Use AskUserQuestion:

"Trebuie să funcționeze offline?"

Options:

- **No** — Always requires internet
- **View-only** — Can view cached data offline
- **Full offline** — Can create/edit offline, sync later
- **PWA** — Full progressive web app with offline support

---

## Step 9: Performance & Scale

> **Category Skip:** Before asking questions, check `should_ask_category(8)`. Skip to Step 10 if this category should be skipped. See "Category Skip Logic" in Step 0.

**Ro:** "Să discutăm despre performanță."

### Question 9.1: Expected Users

"Câți utilizatori estimezi?"

Prompt for:

- Initial launch: X users
- After 6 months: X users
- Peak concurrent users: X

### Question 9.2: Data Volume

"Cât de multe date va avea un utilizator tipic?"

Prompt for estimates:

- Items in main list: 10s / 100s / 1000s / 10000s+
- File uploads: None / Small (< 10MB) / Large (> 100MB)
- Historical data: Days / Months / Years

### Question 9.3: Real-time Requirements

Use AskUserQuestion:

"Ai nevoie de actualizări în timp real?"

Options:

- **No** — Manual refresh is fine
- **Notifications only** — Real-time alerts, not data
- **Live updates** — Data updates automatically (WebSocket)
- **Collaborative** — Multiple users editing same data

### Question 9.4: Search & Filter

Use AskUserQuestion:

"Ce capabilități de căutare ai nevoie?"

Options:

- **Basic** — Simple text search on main field
- **Filters** — Multiple filter criteria
- **Advanced search** — Full-text, fuzzy matching
- **Instant search** — Search-as-you-type with suggestions

---

## Step 10: Integration Points

> **Category Skip:** Before asking questions, check `should_ask_category(9)`. Skip to Step 11 if this category should be skipped. See "Category Skip Logic" in Step 0.

**Ro:** "Ce integrări externe ai nevoie?"

### Question 10.1: Authentication Provider

Use AskUserQuestion:

"Cum se autentifică utilizatorii?"

> **⚠️ Option Limit:** This question has 6 options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Ai nevoie de autentificare?" → Yes (with accounts) | No auth (public access)
> - **Part B (if Yes):** "Ce metodă de autentificare?" → Email-based | OAuth/Social | Enterprise SSO

**Part A options:**

- **Yes (with accounts)** — Users need to sign in
- **No auth** — Public access only, no user accounts

**Part B options (if "Yes" selected):**

- **Email-based** — Email/password or magic link
- **OAuth / Social** — Sign in with Google, GitHub, etc.
- **Enterprise SSO** — SAML, SSO for enterprise customers

**Part B follow-up (if "Email-based" selected):**

- **Email/password** — Classic username/password
- **Magic link** — Email link, no password to remember

**Part B follow-up (if "OAuth / Social" selected):**

- **OAuth (Google only)** — Just Google sign-in
- **OAuth (multiple)** — Google, GitHub, Microsoft, etc.

### Question 10.2: External Services

Use AskUserQuestion:

"Ce servicii externe vei integra?"

> **⚠️ Option Limit:** This question has 7 multiselect options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Ai nevoie de integrări externe?" → None for now | Just a few | Multiple integrations
> - **Part B (if not None):** List specific categories needed

**Part A options:**

- **None for now** — Will add integrations later
- **Just a few** — 1-2 specific integrations needed
- **Multiple integrations** — Several external services required

**Part B guidance (if "Just a few" or "Multiple" selected):**

Ask user to specify which categories apply:

- Payments — Stripe, PayPal, etc.
- Maps — Google Maps, Mapbox
- File storage — S3, Cloudinary, etc.
- Email — SendGrid, Mailgun, etc.
- Analytics — Google Analytics, Mixpanel
- Chat/Support — Intercom, Zendesk

### Question 10.3: API Requirements

Use AskUserQuestion:

"Vei expune un API pentru terți?"

> **⚠️ Option Limit:** This question has 5 options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Expui un API extern?" → No (internal only) | Yes (external API) | API is the product
> - **Part B (if Yes):** "Ce tip de acces API?" → Read-only | Full (read/write) | Webhooks

**Part A options:**

- **No (internal only)** — Internal use only, no external API
- **Yes (external API)** — Will expose API for third parties
- **API is the product** — Public API product, API is the core offering

**Part B options (if "Yes" selected):**

- **Read-only API** — Others can read data
- **Full API** — Read and write access
- **Webhook events** — Push notifications to other systems

---

## Step 11: Security & Compliance

> **Category Skip:** Before asking questions, check `should_ask_category(10)`. Skip to Step 12 if this category should be skipped. See "Category Skip Logic" in Step 0.

**Ro:** "Să asigurăm securitatea."

### Question 11.1: Authentication Security

Use AskUserQuestion:

"Ce nivel de securitate pentru autentificare?"

Options:

- **Basic** — Just email/password, session cookies
- **Standard** — Password requirements, remember me, logout
- **Enhanced** — MFA optional, session timeouts
- **Strict** — MFA required, short sessions, security logs

### Question 11.2: Authorization Model

Use AskUserQuestion:

"Cum controlezi accesul la date?"

> **⚠️ Option Limit:** This question has 5 options but AskUserQuestion supports 2-4. Present as two-part question:
>
> - **Part A:** "Ai nevoie de control al accesului?" → No access control | Simple roles | Advanced permissions
> - **Part B (if Advanced):** "Ce model de permisiuni?" → RBAC | Team-based | Fine-grained

**Part A options:**

- **No access control** — All users have same access
- **Simple roles** — Basic Admin vs User distinction
- **Advanced permissions** — Complex permission model needed

**Part B options (if "Simple roles" selected):**

- **Basic roles** — Admin vs User, no further granularity

**Part B options (if "Advanced permissions" selected):**

- **RBAC** — Multiple roles with defined permissions
- **Team-based** — Access by team/organization membership
- **Fine-grained** — Per-resource permissions

### Question 11.3: Audit Requirements

Use AskUserQuestion:

"Ce trebuie să loghezi?"

Options:

- **Minimal** — Errors only
- **Standard** — Auth events, errors, key actions
- **Full audit** — All data changes with who/when
- **Compliance-grade** — Immutable logs, retention policies

---

## Step 12: Error Handling

> **Category Skip:** Before asking questions, check `should_ask_category(11)`. Skip to Step 13 if this category should be skipped. See "Category Skip Logic" in Step 0.

**Ro:** "Cum gestionăm erorile?"

### Question 12.1: Error Message Style

Use AskUserQuestion:

"Cum vrei să arate mesajele de eroare?"

Options:

- **Technical** — Show error codes, stack traces (dev tools)
- **Friendly** — Human-readable, no jargon
- **Helpful** — Explain what to do next
- **Branded** — Match product personality

### Question 12.2: Retry Behavior

Use AskUserQuestion:

"Când o operație eșuează, ce faci?"

Options:

- **Manual only** — User must retry
- **Auto-retry (3x)** — Retry automatically, then show error
- **Smart retry** — Retry with exponential backoff
- **Queue for later** — Save action, retry when online

### Question 12.3: Undo/Redo

Use AskUserQuestion:

"Ai nevoie de undo/redo?"

Options:

- **No** — Actions are final
- **Undo only** — Single undo for last action
- **Full undo/redo** — Multiple levels, keyboard shortcuts
- **Time-based** — Undo available for X minutes

### Question 12.4: Data Loss Prevention

Use AskUserQuestion:

"Cum previi pierderea datelor?"

Options:

- **None** — User responsibility
- **Dirty form warning** — Warn before leaving unsaved form
- **Auto-save drafts** — Periodic auto-save
- **Full auto-save** — Save on every change

---

## Step 13: Testing & Quality

> **Category Skip:** Before asking questions, check `should_ask_category(12)`. Skip to Step 14 if this category should be skipped. See "Category Skip Logic" in Step 0.

**Ro:** "Ultimele întrebări despre calitate."

### Question 13.1: Test Coverage

Use AskUserQuestion:

"Ce acoperire de teste vrei?"

Options:

- **Minimal** — Happy path only
- **Standard (60-80%)** — Main flows, edge cases
- **High (80%+)** — Comprehensive coverage
- **Full (90%+)** — Critical system, near-complete coverage

### Question 13.2: E2E Test Scope

Use AskUserQuestion:

"Ce testezi end-to-end?"

Options:

- **Critical flows only** — Login, main action, checkout
- **All main flows** — Everything a typical user does
- **Including edge cases** — Errors, empty states, permissions
- **Full regression** — Everything, including rare scenarios

### Question 13.3: Accessibility Testing

Use AskUserQuestion:

"Ce nivel de testare a accesibilității?"

Options:

- **Automated only** — Axe, Lighthouse scans
- **Manual audit** — Screen reader testing
- **WCAG AA compliance** — Full audit against standards
- **WCAG AAA** — Highest accessibility standard

### Question 13.4: Browser Support

Use AskUserQuestion:

"Ce browsere trebuie să suporți?"

Options (multiselect):

- **Modern only** — Chrome, Firefox, Safari, Edge (latest)
- **Include Safari iOS** — Mobile Safari support
- **Include older browsers** — IE11, older Edge
- **Progressive enhancement** — Basic works everywhere, best in modern

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

**Before asking questions for each category:**

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
   ❌ [Subsection C]: (lipsește)
   ❌ [Subsection D]: (lipsește)

   Voi întreba doar despre subsecțiunile lipsă.
   ```

4. **Ask only missing questions:**
   - Skip questions for subsections that have content
   - Ask questions only for `MISSING_SUBSECTIONS`

5. **Generate merged output:**
   - For each subsection in the category:
     - If in `ANSWERED_SUBSECTIONS`: copy existing content verbatim
     - If in `MISSING_SUBSECTIONS` and user provided new answer: use new answer
     - If in `MISSING_SUBSECTIONS` and no new answer: leave empty with note

**Subsection-to-Question Mapping (for detection):**

| Category | Subsection Heading          | Question ID |
| -------- | --------------------------- | ----------- |
| 1        | ### Product Name            | 2.0         |
| 1        | ### Target Audience         | 2.1         |
| 1        | ### Problem Space           | 2.2         |
| 1        | ### Competitors             | 2.3         |
| 1        | ### Success Metrics         | 2.4         |
| 1        | ### Business Model          | 2.5         |
| 2        | ### Primary Persona         | 3.1         |
| 2        | ### Secondary Personas      | 3.2         |
| 2        | ### Accessibility           | 3.3         |
| 2        | ### Geographic & Language   | 3.4         |
| 3        | ### Aesthetic Tone          | 4.1         |
| 3        | ### Animation Style         | 4.2         |
| 3        | ### Information Density     | 4.3         |
| 3        | ### Brand Constraints       | 4.4         |
| 3        | ### Visual Inspiration      | 4.5         |
| 4        | ### Data Sensitivity        | 5.1         |
| 4        | ### Compliance Requirements | 5.2         |
| 4        | ### Data Relationships      | 5.3         |
| 4        | ### Audit & History         | 5.4         |
| 4        | ### Deletion Strategy       | 5.5         |
| 5        | ### Critical User Flows     | 6.1         |
| 5        | ### Edge Cases              | 6.2         |
| 5        | ### Empty States            | 6.3         |
| 5        | ### Loading States          | 6.4         |
| 5        | ### Error Recovery          | 6.5         |
| 6        | ### Data Display            | 7.1         |
| 6        | ### Form Validation         | 7.2         |
| 6        | ### Notifications           | 7.3         |
| 6        | ### Confirmations           | 7.4         |
| 6        | ### Modal vs Drawer         | 7.5         |
| 7        | ### Responsive Priority     | 8.1         |
| 7        | ### Touch Interactions      | 8.2         |
| 7        | ### Mobile Navigation       | 8.3         |
| 7        | ### Offline Support         | 8.4         |
| 8        | ### Expected Users          | 9.1         |
| 8        | ### Data Volume             | 9.2         |
| 8        | ### Real-time               | 9.3         |
| 8        | ### Search & Filter         | 9.4         |
| 9        | ### Authentication          | 10.1        |
| 9        | ### External Services       | 10.2        |
| 9        | ### API Exposure            | 10.3        |
| 10       | ### Auth Security           | 11.1        |
| 10       | ### Authorization           | 11.2        |
| 10       | ### Audit Logging           | 11.3        |
| 11       | ### Message Style           | 12.1        |
| 11       | ### Retry Behavior          | 12.2        |
| 11       | ### Undo/Redo               | 12.3        |
| 11       | ### Data Loss Prevention    | 12.4        |
| 12       | ### Test Coverage           | 13.1        |
| 12       | ### E2E Scope               | 13.2        |
| 12       | ### Accessibility Testing   | 13.3        |
| 12       | ### Browser Support         | 13.4        |

> **Pattern:** Category N maps to Step (N+1). Question ID format is `Step.SubQuestion` where SubQuestion starts at 1 (except Category 1 which has a 2.0 for Product Name).

> **Tip:** To detect if a subsection has content, check for non-empty lines between `### Heading` and the next `###` or `##`. If only whitespace exists, the subsection is empty.

**Content Preservation Rules:**

| Existing Status | New Session Has Answers | Action                            |
| --------------- | ----------------------- | --------------------------------- |
| Has content     | No new answers          | Keep existing verbatim            |
| Has content     | Has new answers ¹       | Ask: "Replace existing with new?" |
| Empty/missing   | Has new answers         | Use new answers                   |
| Empty/missing   | No new answers          | Mark as incomplete                |

> **¹ Note:** This scenario only occurs with `--skip-validation` + "Revizuim totul" (review all). In normal mode (`complete_missing`), questions with existing answers are skipped, so there can't be new answers for them.

**Example Merge Dialog:**

When a partial category already has some answers:

```
Văd că ai răspuns deja la câteva întrebări din "Design Direction":
- Aesthetic Tone: Modern / Minimal
- Animation Style: Subtle

Întrebările incomplete:
- Information Density (4.3)
- Brand Constraints (4.4)
- Visual Inspiration (4.5)

Vrei să completăm doar ce lipsește, sau să revizuim tot?
```

### 14.2: Generate product-context.md

Create directory and file:

```bash
mkdir -p product || {
  echo "Error: product directory - Failed to create. Check write permissions: ls -la ."
  exit 1
}
```

**Handling Unanswered Categories (--stage/--minimal modes):**

When using `--stage` or `--minimal` mode, some categories won't be asked. Handle them consistently:

1. **Always create all 12 section headers** — for consistent structure and parsing
2. **Mark unanswered sections explicitly** with a placeholder note:

```markdown
## 4. Data Architecture

> ❌ Not yet gathered. Run `/product-interview --stage=data` to complete this category.
```

3. **Set status to ❌ Empty** in Quick Reference table for unanswered categories
4. **Include mode information** in header to explain partial state

**Mode Header Examples:**

| Mode    | Header Line                                                   |
| ------- | ------------------------------------------------------------- |
| Full    | `Mode: Full (all 12 categories)`                              |
| Minimal | `Mode: Minimal (categories 1, 3, 5, 6, 7, 11)`                |
| Stage   | `Mode: Stage-specific (vision: categories 1, 2)`              |
| Mixed   | `Mode: Incremental (previous: minimal + current: stage=data)` |

**Mode Detection Logic:**

When generating the output file, determine the mode string using this logic:

```bash
# 1. Check if existing file has a previous mode
PREV_MODE=""
if [ -f "product/product-context.md" ]; then
  PREV_MODE=$(grep "^Mode:" product/product-context.md 2>/dev/null | head -1 | sed 's/^Mode: //')
fi

# 2. Determine current session mode from arguments
if [ "$MINIMAL_MODE" = true ]; then
  CURRENT_MODE="Minimal (categories 1, 3, 5, 6, 7, 11)"
elif [ -n "$STAGE" ]; then
  CURRENT_MODE="Stage-specific ($STAGE: categories $(get_stage_categories $STAGE))"
else
  CURRENT_MODE="Full (all 12 categories)"
fi

# 3. Generate final mode header
if [ -n "$PREV_MODE" ] && [ "$INTERVIEW_MODE" = "complete_missing" ]; then
  # Incremental mode: merging with previous
  MODE_HEADER="Incremental (previous: $PREV_MODE + current: $CURRENT_MODE)"
else
  # Fresh run
  MODE_HEADER="$CURRENT_MODE"
fi
```

**When to use Incremental mode:**

- Previous context exists AND
- User selected "Completăm ce lipsește" (complete_missing mode) AND
- Current session is partial (--minimal or --stage)

This ensures the mode header accurately reflects the accumulated interview history.

**Output Structure Consistency:**

Even for partial interviews, the file MUST have:

- All 12 numbered sections (## 1. through ## 12.)
- Quick Reference table with all 12 rows
- Cross-Reference section (only for completed categories)
- Completeness percentage reflecting actual completion

This ensures:

- Downstream commands can always parse the file
- Users can see what's missing at a glance
- Incremental completion works correctly

Write the file with this structure:

> **Critical Format Requirement:** The `Completeness:` line MUST start at the beginning of the line (no markdown formatting like `**Completeness:**`). Downstream commands use `grep "^Completeness:"` to parse this value. The display to users (Step 1 summary) can use styling, but the FILE must use plain format.

```markdown
# Product Context: [Product Name]

Generated: [ISO date]
Last Updated: [ISO date]
Completeness: [X]% ([N]/12 categories completed)
Mode: [Full / Minimal / Stage-specific]

## Quick Reference

| Category                    | Status     | Key Decisions |
| --------------------------- | ---------- | ------------- |
| 1. Product Foundation       | [✅/⚠️/❌] | [Summary]     |
| 2. User Research & Personas | [✅/⚠️/❌] | [Summary]     |
| 3. Design Direction         | [✅/⚠️/❌] | [Summary]     |
| 4. Data Architecture        | [✅/⚠️/❌] | [Summary]     |
| 5. Section-Specific Depth   | [✅/⚠️/❌] | [Summary]     |
| 6. UI Patterns & Components | [✅/⚠️/❌] | [Summary]     |
| 7. Mobile & Responsive      | [✅/⚠️/❌] | [Summary]     |
| 8. Performance & Scale      | [✅/⚠️/❌] | [Summary]     |
| 9. Integration Points       | [✅/⚠️/❌] | [Summary]     |
| 10. Security & Compliance   | [✅/⚠️/❌] | [Summary]     |
| 11. Error Handling          | [✅/⚠️/❌] | [Summary]     |
| 12. Testing & Quality       | [✅/⚠️/❌] | [Summary]     |

---

## 1. Product Foundation

### Product Name

**Name:** [Product Name]
**Tagline:** [Optional tagline]

### Target Audience

[Structured answers]

### Problem Space

[Structured answers]

### Competitors

[Structured answers]

### Success Metrics

[Structured answers]

### Business Model

[Structured answers]

---

## 2. User Research & Personas

### Primary Persona: [Name]

- **Role:** [X]
- **Age range:** [X]
- **Tech proficiency:** [X]
- **Primary device:** [X]
- **Goals:** [X]
- **Frustrations:** [X]

### Secondary Personas

[If any]

### Accessibility Requirements

[List selected options]

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
  echo "Error: $CONTEXT_FILE - Failed to create file"
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
