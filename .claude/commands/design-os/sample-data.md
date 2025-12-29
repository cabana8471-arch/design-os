# Sample Data

You are helping the user create realistic sample data for a section of their product. This data will be used to populate screen designs. You will also generate TypeScript types based on the data structure.

## Step 1: Check Prerequisites

First, identify the target section and verify that `spec.md` exists for it.

Read `/product/product-roadmap.md` to get the list of available sections.

If there's only one section, auto-select it. If there are multiple sections, use the AskUserQuestion tool to ask which section the user wants to generate data for.

Then check if `product/sections/[section-id]/spec.md` exists:

**Check both directory and spec file:**

```bash
# Check if directory exists but spec.md is missing
if [ -d "product/sections/[section-id]" ] && [ ! -f "product/sections/[section-id]/spec.md" ]; then
  echo "Directory exists but spec.md is missing"
fi
```

**Handle the following cases:**

| Condition                         | Action                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Directory doesn't exist           | Show error: "Error: product/sections/[section-id]/ - Directory not found. Run /shape-section to create it."   |
| Directory exists, spec.md missing | Show error: "Error: product/sections/[section-id]/spec.md - File not found. Run /shape-section to create it." |
| Directory exists, spec.md exists  | Continue to Step 2                                                                                            |

**If the spec doesn't exist:**

```
Error: product/sections/[section-id]/spec.md - File not found. Run /shape-section to create it.
```

**If directory exists but spec.md was deleted (edge case):**

```
Error: product/sections/[section-id]/spec.md - File not found (directory exists). Run /shape-section to recreate it.
```

Stop here if the spec doesn't exist.

## Step 2: Check for Global Data Model

Check if `/product/data-model/data-model.md` exists.

**If it exists:**

- Read the file to understand the global entity definitions
- Entity names in your sample data should match the global data model
- Use the descriptions and relationships as a guide

**If it doesn't exist:**
Show a warning but continue:

"Note: A global data model hasn't been defined yet. I'll create entity structures based on the section spec, but for consistency across sections, consider running `/data-model` first."

## Step 3: Analyze the Specification

Read and analyze `product/sections/[section-id]/spec.md` to understand:

- What data entities are implied by the user flows?
- What fields/properties would each entity need?
- What sample values would be realistic and helpful for design?
- What actions can be taken on each entity? (These become callback props)

**If a global data model exists:** Cross-reference the spec with the data model. Use the same entity names and ensure consistency.

## Step 3.5: Sample Data Preferences

Before generating data, explicitly ask about sample data requirements. Use AskUserQuestion with predefined options:

### Question 1: Sample Data Volume

**"How much sample data should I generate?"**

Options:

- **Minimal (5-10 records)** — Quick testing, basic layout verification. Enough to see how lists look, not enough for pagination testing.
- **Standard (20-50 records)** — Realistic scenarios, good for most use cases. Shows pagination, filtering behavior.
- **Comprehensive (100+ records)** — Performance testing, pagination, search optimization. Good for stress-testing UI with large datasets.

### Question 2: Edge Cases to Include

**"Which edge cases should I include in the sample data?"**

Options (allow multiple selection):

- **Empty states** — Include scenarios with empty arrays, null values, missing optional fields. Tests "no data" UI.
- **Long content** — Include records with long names, descriptions (100+ chars), and text overflow scenarios. Tests truncation and layout.
- **Extreme values** — Include very large numbers, dates far in the past/future, boundary values. Tests formatting and edge calculations.
- **Unicode & special characters** — Include names with accents (Müller, José), emoji (🏠), special chars (&, ", <). Tests encoding and display.

### Record Preferences

Store the user's answers for use in Step 5:

```
DATA_PREFERENCES:
  volume: [Minimal / Standard / Comprehensive]
  edge_cases:
    empty_states: [true/false]
    long_content: [true/false]
    extreme_values: [true/false]
    unicode_special: [true/false]
```

### Apply Preferences in Step 5

When generating data.json, apply these preferences:

**Volume Guidelines:**

| Volume        | Main Entity Records | Nested Records | Status Distribution       |
| ------------- | ------------------- | -------------- | ------------------------- |
| Minimal       | 5-10                | 1-3 each       | 2-3 statuses              |
| Standard      | 20-50               | 3-5 each       | All statuses              |
| Comprehensive | 100+                | 5-10 each      | All statuses + edge cases |

**Edge Case Implementation:**

| Edge Case         | How to Implement                                                                 |
| ----------------- | -------------------------------------------------------------------------------- |
| Empty states      | Include 1-2 records with empty arrays, null optional fields                      |
| Long content      | Include 2-3 records with 100+ char descriptions, long names                      |
| Extreme values    | Include dates like 1990-01-01, 2099-12-31, amounts like 0.01 and 999999.99       |
| Unicode & special | Include names: "José García", "Müller GmbH", "测试公司", "Company <Test> & Demo" |

## Step 4: Present Data Structure

Present your proposed data structure to the user in human-friendly language. Non-technical users should understand how their data is being organized.

**If using global data model:**

"Based on the specification for **[Section Title]** and your global data model, here's how I'm organizing the data:

**Entities (from your data model):**

- **[Entity1]** — [Description from data model]
- **[Entity2]** — [Description from data model]

**Section-specific data:**

[Any additional data specific to this section's UI needs]

**What You Can Do:**

- View, edit, and delete [entities]
- [Other key actions from the spec]

**Sample Data:**

I'll create [X] realistic [Entity1] records with varied content to make your screen designs feel real.

Does this structure make sense? Any adjustments?"

**If no global data model:**

"Based on the specification for **[Section Title]**, here's how I'm proposing to organize your data:

**Data Models:**

- **[Entity1]** — [One sentence explaining what this represents]
- **[Entity2]** — [One sentence explanation]

**How They Connect:**

[Explain relationships in simple terms]

**What You Can Do:**

- View, edit, and delete [entities]
- [Other key actions from the spec]

**Sample Data:**

I'll create [X] realistic [Entity1] records with varied content to make your screen designs feel real.

Does this structure make sense for your product? Any adjustments?"

Use the AskUserQuestion tool if there are ambiguities about what data is needed.

## Step 5: Generate the Data File

Once the user approves the structure:

### Create Directory

First, verify the directory exists:

```bash
mkdir -p product/sections/[section-id]
```

Then validate the directory was created:

```bash
if [ ! -d "product/sections/[section-id]" ]; then
  echo "Error: product/sections/[section-id]/ - Directory creation failed. Check write permissions."
  exit 1
fi
```

### Create the Data File

Then create `product/sections/[section-id]/data.json` with:

- **A `_meta` section** - Human-readable descriptions of each data model and their relationships (displayed in the UI)
- **Realistic sample data** - Use believable names, dates, descriptions, etc.
- **Varied content** - Mix short and long text, different statuses, etc.
- **Edge cases** - Include at least one empty array, one long description, etc.
- **TypeScript-friendly structure** - Use consistent field names and types

### Required `_meta` Structure

> **See also:** agents.md → "File Validation Pattern" section for the standardized validation approach used across all commands.

Every data.json MUST include a `_meta` object at the top level with:

1. **`description`** - A brief description of what this sample data represents
2. **`generatedBy`** - The command that generated this file (always `/sample-data`)
3. **`models`** - An object where each key is a model name and value is a plain-language description
4. **`relationships`** - An array of strings explaining how models connect to each other

Example structure:

```json
{
  "_meta": {
    "description": "Sample data for Invoice Management section",
    "generatedBy": "/sample-data",
    "models": {
      "invoices": "Each invoice represents a bill you send to a client for work completed.",
      "lineItems": "Line items are the individual services or products listed on each invoice."
    },
    "relationships": [
      "Each Invoice contains one or more Line Items (the breakdown of charges)",
      "Invoices track which Client they belong to via the clientName field"
    ]
  },
  "invoices": [
    {
      "id": "inv-001",
      "invoiceNumber": "INV-2024-001",
      "clientName": "Acme Corp",
      "clientEmail": "billing@acme.com",
      "total": 1500.0,
      "status": "sent",
      "dueDate": "2024-02-15",
      "lineItems": [
        { "description": "Web Design", "quantity": 1, "rate": 1500.0 }
      ]
    }
  ]
}
```

The `_meta` descriptions should:

- Use plain, non-technical language
- Explain what each model represents in the context of the user's product
- Describe relationships in terms of "contains", "belongs to", "links to", etc.
- **Match the global data model descriptions if one exists**

The data should directly support the user flows and UI requirements in the spec.

**⚠️ MANDATORY: Proceed to Step 6 (Data Validation) before continuing. Validation is required and cannot be skipped.**

## Step 6: Perform Data Validation (MANDATORY)

After creating data.json, you MUST perform the following validations to ensure data integrity. These validations are mandatory and must complete before proceeding.

### Validate Data Structure

After creating data.json, verify that the file was created correctly using these **actionable validation steps**:

**1. Check file exists and is valid JSON:**

```bash
# Check file exists
if [ ! -f "product/sections/[section-id]/data.json" ]; then
  echo "Error: data.json - File not found."
  exit 1
fi

# Validate JSON syntax
if ! python3 -c "import json; json.load(open('product/sections/[section-id]/data.json'))" 2>/dev/null; then
  echo "Error: data.json - Invalid JSON syntax. Check for missing commas or brackets."
  exit 1
fi
```

**2. Validate `_meta` structure (MANDATORY):**

```bash
# Check _meta exists and has required fields
python3 << 'EOF'
import json
data = json.load(open('product/sections/[section-id]/data.json'))

errors = []

# Check _meta exists
if '_meta' not in data:
    errors.append("Missing '_meta' object at top level")
else:
    meta = data['_meta']

    # Check _meta.description
    if 'description' not in meta:
        errors.append("Missing '_meta.description' field")
    elif not isinstance(meta['description'], str) or len(meta['description'].strip()) == 0:
        errors.append("'_meta.description' must be a non-empty string")

    # Check _meta.generatedBy
    if 'generatedBy' not in meta:
        errors.append("Missing '_meta.generatedBy' field")
    elif meta['generatedBy'] != '/sample-data':
        errors.append("'_meta.generatedBy' should be '/sample-data'")

    # Check _meta.models
    if 'models' not in meta:
        errors.append("Missing '_meta.models' object")
    elif not isinstance(meta['models'], dict):
        errors.append("'_meta.models' must be an object, not " + type(meta['models']).__name__)
    elif len(meta['models']) == 0:
        errors.append("'_meta.models' is empty - add model descriptions")
    else:
        # Validate each model description is a non-empty string
        for model_name, description in meta['models'].items():
            if not isinstance(description, str):
                errors.append(f"'_meta.models.{model_name}' must be a string description, not {type(description).__name__}")
            elif len(description.strip()) == 0:
                errors.append(f"'_meta.models.{model_name}' has empty description")

    # Check _meta.relationships
    if 'relationships' not in meta:
        errors.append("Missing '_meta.relationships' array")
    elif not isinstance(meta['relationships'], list):
        errors.append("'_meta.relationships' must be an array")

    # Verify model keys match data keys (bidirectional)
    if 'models' in meta and isinstance(meta['models'], dict):
        model_keys = set(meta['models'].keys())
        data_keys = set(k for k in data.keys() if k != '_meta')

        # Check for data keys missing from _meta.models
        missing_in_meta = data_keys - model_keys
        if missing_in_meta:
            errors.append(f"'_meta.models' missing descriptions for: {', '.join(missing_in_meta)}")

        # Check for _meta.models keys without corresponding data
        extra_in_meta = model_keys - data_keys
        if extra_in_meta:
            errors.append(f"'_meta.models' has descriptions for non-existent data: {', '.join(extra_in_meta)}")

for error in errors:
    print(f"Validation Error: {error}")
exit(1 if errors else 0)
EOF
```

**3. Check data consistency:**

```bash
python3 << 'EOF'
import json
data = json.load(open('product/sections/[section-id]/data.json'))

for key, records in data.items():
    if key == '_meta' or not isinstance(records, list) or len(records) == 0:
        continue

    # Get field names from first record
    expected_fields = set(records[0].keys())

    for i, record in enumerate(records[1:], start=2):
        actual_fields = set(record.keys())
        missing = expected_fields - actual_fields
        extra = actual_fields - expected_fields
        if missing:
            print(f"Warning: {key}[{i}] missing fields: {missing}")
        if extra:
            print(f"Note: {key}[{i}] has extra fields: {extra}")
EOF
```

**4. Verify content quality (checklist):**

- [ ] At least 5 records exist for main entity (for realistic list display)
- [ ] At least one status/enum field shows multiple values (e.g., 'draft', 'sent', 'paid')
- [ ] At least one record has a long description (50+ chars) for text overflow testing
- [ ] No placeholder values like "Test 123", "Lorem ipsum", or "Sample X"

**5. Verify bidirectional entity naming consistency:**
If a data model exists at `product/data-model/data-model.md`, verify entity names match:

| Location            | Format              | Example                 |
| ------------------- | ------------------- | ----------------------- |
| data-model.md       | Singular PascalCase | `Invoice`, `Customer`   |
| data.json keys      | Plural camelCase    | `invoices`, `customers` |
| types.ts interfaces | Singular PascalCase | `Invoice`, `Customer`   |

```bash
# Prerequisite: SECTION_ID must be set (e.g., SECTION_ID="invoices")
# This is typically set earlier when the user selects which section to work on.

# Check if data model exists
if [ -f "product/data-model/data-model.md" ]; then
  # Extract entity names from data model
  DATA_MODEL_ENTITIES=$(grep -E '^## [A-Z]' product/data-model/data-model.md | sed 's/^## //')

  # Pluralization function with common English rules
  pluralize() {
    local word="$1"
    local lower=$(echo "$word" | tr '[:upper:]' '[:lower:]')

    # Common irregular plurals
    case "$lower" in
      person) echo "people" ;;
      child) echo "children" ;;
      man) echo "men" ;;
      woman) echo "women" ;;
      foot) echo "feet" ;;
      tooth) echo "teeth" ;;
      mouse) echo "mice" ;;
      # Greek/Latin words ending in -is -> -es
      analysis) echo "analyses" ;;
      crisis) echo "crises" ;;
      thesis) echo "theses" ;;
      basis) echo "bases" ;;
      diagnosis) echo "diagnoses" ;;
      # Words ending in -o (common exceptions)
      hero) echo "heroes" ;;
      potato) echo "potatoes" ;;
      tomato) echo "tomatoes" ;;
      echo) echo "echoes" ;;
      # Technical/computing terms (Latin plurals)
      index) echo "indices" ;;
      matrix) echo "matrices" ;;
      vertex) echo "vertices" ;;
      appendix) echo "appendices" ;;
      axis) echo "axes" ;;
      radius) echo "radii" ;;
      *)
        # Words ending in s, x, z, ch, sh -> add "es"
        if echo "$lower" | grep -qE '(s|x|z|ch|sh)$'; then
          echo "${lower}es"
        # Words ending in -is -> change to -es (general Greek/Latin pattern)
        elif echo "$lower" | grep -qE 'is$'; then
          echo "${lower%is}es"
        # Words ending in consonant + y -> change y to ies
        elif echo "$lower" | grep -qE '[^aeiou]y$'; then
          echo "${lower%y}ies"
        # Words ending in f or fe -> change to ves (common cases)
        elif echo "$lower" | grep -qE '(f|fe)$'; then
          echo "${lower%f}ves" | sed 's/eeves$/eves/'
        # Default: just add s
        else
          echo "${lower}s"
        fi
        ;;
    esac
  }

  # Verify each entity has corresponding data.json key (pluralized, camelCase)
  for entity in $DATA_MODEL_ENTITIES; do
    plural=$(pluralize "$entity")
    if ! grep -q "\"$plural\":" product/sections/${SECTION_ID}/data.json; then
      echo "Warning: Entity '$entity' not found as '$plural' in data.json"
    fi
  done
fi
```

> **Note:** The pluralization function covers common English patterns but may not handle all edge cases. If a warning appears for a correctly pluralized entity, verify manually that the data.json key matches expectations.

If mismatches are found, either update the entity names or document why they differ.

**If validation fails:**

1. **Identify the specific failing check** — Note which validation item(s) failed
2. **Explain to the user what needs to change** — Describe the issue in plain language (e.g., "The `_meta.models` object is missing the `invoices` key")
3. **Return to Step 5** — Regenerate `data.json` with the necessary corrections
4. **Re-run Step 6 validation** — Verify all checks pass before proceeding

Do not proceed to Step 7 until all validation checks pass.

**Retry limit:** If validation fails 3 times in a row, STOP and report:

```
Validation has failed 3 times. Please review the data model at product/data-model/data-model.md for consistency issues before continuing.
```

This prevents infinite regeneration loops when there's a fundamental misunderstanding about the data model structure.

### Retry State Tracking (Agent Instructions)

**Important:** This is guidance for AI agent behavior — the agent must explicitly track and report retry attempts.

**Implementation Note:** Maintain an internal `RETRY_COUNT` counter:

- Initialize `RETRY_COUNT=0` before first generation attempt
- Increment `RETRY_COUNT` after each failed validation
- Check `RETRY_COUNT >= 3` before attempting any regeneration
- This counter persists across steps until Step 7 is reached or command terminates

**Retry Reporting Format:**

When retrying, always include the attempt number in your response:

```
[Attempt 1/3] Generating data.json...
[Validation passed/failed]

[Attempt 2/3] Regenerating data.json to fix: [specific issue]...
[Validation passed/failed]

[Attempt 3/3 - FINAL] Regenerating data.json to fix: [specific issue]...
[Validation passed/failed]
```

**Retry Behavior:**

1. **First attempt (Attempt 1/3):** Generate data.json and run validation (Steps 5-6)
   - If validation passes → Proceed to Step 7
   - If validation fails → Report the specific issue and retry

2. **Second attempt (Attempt 2/3):** Regenerate data.json addressing the specific failure
   - Explicitly state what you're fixing
   - Re-run validation

3. **Third attempt (Attempt 3/3 - FINAL):** Last chance to fix the issue
   - If validation still fails → STOP with the error message below
   - Do NOT attempt a 4th time

**Flow Diagram:**

```
[Attempt 1/3: Generate] → [Validate] → Pass → [Step 7: Generate types.ts]
                              ↓
                            Fail
                              ↓
[Attempt 2/3: Fix issue] → [Validate] → Pass → [Step 7: Generate types.ts]
                              ↓
                            Fail
                              ↓
[Attempt 3/3: Final fix] → [Validate] → Pass → [Step 7: Generate types.ts]
                              ↓
                            Fail
                              ↓
                     [STOP with error message]
```

**Key Points:**

- Always report the current attempt number (e.g., "Attempt 2/3")
- Explain what specific issue you're fixing on each retry
- After 3 failed attempts, stop and ask user to review the data model manually
- The maximum of 3 attempts prevents infinite loops when there's a fundamental data model issue

**After 3 failed attempts, display this error and STOP:**

```
Error: Validation failed after 3 attempts.

Issues found:
- [List each validation error encountered]

The data structure cannot be auto-corrected. Please:
1. Review the errors above
2. Manually fix the data.json file at product/sections/[section-id]/data.json
3. Re-run /sample-data to validate the fixed file

If the issue persists, check that your section spec matches the global data model.
```

The command will END. User must fix issues manually before retrying.

### Validate Entity Name Consistency

If a global data model exists, verify that entity names in your sample data match the global data model:

1. **Read the global data model:**
   - Check if `/product/data-model/data-model.md` exists
   - If it exists, read the file

2. **Extract entity names from the data model:**
   - Entity names are defined in the markdown file using `### EntityName` headings
   - For example: `### User`, `### Invoice`, `### Project`
   - Create a list of all entity names found in the markdown headings

3. **Compare with section data:**
   - Check if the keys in `_meta.models` match entity names from the global data model
   - Compare the names you extracted from the markdown headings (from step 2) with the keys in your data.json `_meta.models`
   - **Acceptable variations:** Plural forms are expected in data.json (e.g., data model has `### Invoice` heading, data.json uses `invoices` key)

### Entity Naming Transformation Table

The naming convention differs between the data model and data.json files:

| Location                          | Format              | Example                          |
| --------------------------------- | ------------------- | -------------------------------- |
| **Data Model** (`data-model.md`)  | Singular PascalCase | `Invoice`, `User`, `LineItem`    |
| **Data JSON** (`data.json` keys)  | Plural camelCase    | `invoices`, `users`, `lineItems` |
| **TypeScript Types** (`types.ts`) | Singular PascalCase | `Invoice`, `User`, `LineItem`    |

**Transformation Rules:**

1. **Singular → Plural**: Add `s` (or `es` for words ending in `s`, `x`, `ch`, `sh`)
2. **PascalCase → camelCase**: Lowercase the first letter
3. **Special cases**: Handle irregular plurals manually (`Person` → `people`, `Child` → `children`)

**Examples:**

| Data Model Entity | data.json Key | TypeScript Type |
| ----------------- | ------------- | --------------- |
| `Invoice`         | `invoices`    | `Invoice`       |
| `User`            | `users`       | `User`          |
| `LineItem`        | `lineItems`   | `LineItem`      |
| `Category`        | `categories`  | `Category`      |
| `Status`          | `statuses`    | `Status`        |

This ensures consistency: types match the data model, while JSON keys follow JavaScript object naming conventions.

4. **Report discrepancies:**
   - If entity names don't match ANY from the data model:
     ```
     Note: Your data uses [entity1, entity2], but the global data model defines [datamodel-entity1, datamodel-entity2].
     Consider aligning the names for consistency across sections, or let me know if these are section-specific entities.
     ```

5. **Auto-singularize plural entity names:**
   - If an entity name appears to be plural (e.g., `Invoices`), apply singularization for types.ts
   - Warn the user about the transformation:
     ```
     Note: Entity 'Invoices' appears to be plural. I'll use 'Invoice' for the TypeScript interface to follow standard naming conventions.
     ```

### Auto-Singularization Rules

When generating types.ts, apply these transformations to plural entity names:

| Pattern                             | Transformation         | Example                                   |
| ----------------------------------- | ---------------------- | ----------------------------------------- |
| Ends with 'ies'                     | Replace 'ies' with 'y' | `Categories` → `Category`                 |
| Ends with 'es' (after s, x, ch, sh) | Remove 'es'            | `Statuses` → `Status`                     |
| Ends with 's'                       | Remove trailing 's'    | `Invoices` → `Invoice`                    |
| Irregular plurals                   | Use lookup table       | `People` → `Person`, `Children` → `Child` |

**Detection heuristic:** An entity name is likely plural if:

- It ends with 's' and the singular form is a valid English word
- It matches known plural patterns (ies, es, s)

**Important:** Only apply singularization to TypeScript interface names. The data.json keys should remain in their original (pluralized, camelCase) form.

This validation ensures consistency across all sections and prevents fragmented data models.

### Bidirectional Naming Validation

After generating `types.ts`, perform a reverse validation to ensure naming consistency between all three files:

**Validation Flow:**

```
data-model.md  ←→  data.json  ←→  types.ts
(PascalCase)      (camelCase)    (PascalCase)
```

**1. Validate types.ts → data.json consistency:**

For each interface in types.ts, verify a corresponding key exists in data.json:

| types.ts Interface | Expected data.json Key |
| ------------------ | ---------------------- |
| `Invoice`          | `invoices`             |
| `User`             | `users`                |
| `LineItem`         | `lineItems`            |

**Transformation Rule:** Convert PascalCase to camelCase + pluralize

**2. Validate data.json → types.ts consistency:**

For each key in data.json (excluding `_meta`), verify a corresponding interface exists in types.ts:

| data.json Key | Expected types.ts Interface |
| ------------- | --------------------------- |
| `invoices`    | `Invoice`                   |
| `users`       | `User`                      |
| `lineItems`   | `LineItem`                  |

**Transformation Rule:** Singularize + convert camelCase to PascalCase

**3. Report mismatches:**

If any validation fails, report the specific mismatch:

```
Naming inconsistency detected:
- data.json has 'invoices' but types.ts is missing 'Invoice' interface
- types.ts has 'Project' interface but data.json is missing 'projects' key

Please ensure all entity names are consistent across files.
```

**4. Props interface validation:**

Verify that Props interfaces in types.ts correctly reference entity types:

- `InvoiceListProps.invoices` should be typed as `Invoice[]`
- `UserDetailProps.user` should be typed as `User`

This bidirectional check prevents subtle bugs where types and data diverge.

## Step 7: Generate TypeScript Types

After creating data.json, generate `product/sections/[section-id]/types.ts` based on the data structure.

### Type Generation Rules

1. **Infer types from the sample data values:**
   - Strings → `string`
   - Numbers → `number`
   - Booleans → `boolean`
   - Arrays → `TypeName[]`
   - Objects → Create a named interface

2. **Use union types for status/enum fields:**
   - If a field like `status` has known values, use a union: `'draft' | 'sent' | 'paid' | 'overdue'`

   - Base this on the spec and the variety in sample data

3. **Create a Props interface for the main component:**
   - Include the data as a prop (e.g., `invoices: Invoice[]`)
   - Include optional callback props for each action (e.g., `onDelete?: (id: string) => void`)

4. **Use consistent entity names:**
   - If a global data model exists, use the same entity names
   - This ensures consistency across sections

Example types.ts:

```typescript
// =============================================================================
// Data Types
// =============================================================================

export interface LineItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  lineItems: LineItem[];
}

// =============================================================================
// Component Props
// =============================================================================

export interface InvoiceListProps {
  /** The list of invoices to display */
  invoices: Invoice[];
  /** Called when user wants to view an invoice's details */
  onView?: (id: string) => void;
  /** Called when user wants to edit an invoice */
  onEdit?: (id: string) => void;
  /** Called when user wants to delete an invoice */
  onDelete?: (id: string) => void;
  /** Called when user wants to archive an invoice */
  onArchive?: (id: string) => void;
  /** Called when user wants to create a new invoice */
  onCreate?: () => void;
}
```

### Naming Conventions

- Use PascalCase for interface names: `Invoice`, `LineItem`, `InvoiceListProps`

- Use camelCase for property names: `clientName`, `dueDate`, `lineItems`

- Props interface should be named `[ViewName]Props` (e.g., `InvoiceListProps` for the InvoiceList view)

- Add JSDoc comments for callback props to explain when they're called

- **Match entity names from the global data model if one exists**

### Callback Prop Naming Convention

Use consistent action-based callback names:

| Callback    | Purpose                                             |
| ----------- | --------------------------------------------------- |
| `onView`    | Called when user wants to view item details         |
| `onEdit`    | Called when user wants to edit an item              |
| `onDelete`  | Called when user wants to delete an item            |
| `onCreate`  | Called when user wants to create a new item         |
| `onArchive` | Called when user wants to archive an item           |
| `onSelect`  | Called when user selects an item (for multi-select) |

**Note:** `onClick` is a React DOM event handler used inside components. The callback props (`onView`, `onEdit`, etc.) describe the user intent and are passed from parent components.

### Complex Callback Scenarios

For advanced UI interactions, use these additional callback patterns:

**Bulk Operations:**

```typescript
/** Called when user selects/deselects multiple items */
onSelectionChange?: (selectedIds: string[]) => void
/** Called when user performs action on multiple items */
onBulkDelete?: (ids: string[]) => void
onBulkArchive?: (ids: string[]) => void
onBulkExport?: (ids: string[]) => void
```

**Filtering and Sorting:**

```typescript
/** Called when user changes filter criteria */
onFilterChange?: (filters: FilterCriteria) => void
/** Called when user changes sort order */
onSortChange?: (field: string, direction: 'asc' | 'desc') => void
/** Called when user searches */
onSearch?: (query: string) => void
```

**Pagination:**

```typescript
/** Called when user changes page */
onPageChange?: (page: number) => void
/** Called when user changes items per page */
onPageSizeChange?: (size: number) => void
```

**Inline Editing:**

```typescript
/** Called when user saves inline edit */
onInlineEdit?: (id: string, field: string, value: unknown) => void
/** Called when user cancels inline edit */
onInlineEditCancel?: (id: string) => void
```

**Drag and Drop:**

```typescript
/** Called when user reorders items */
onReorder?: (items: { id: string; order: number }[]) => void
/** Called when user moves item to different container */
onMove?: (id: string, targetContainerId: string) => void
```

**Modal/Dialog Actions:**

```typescript
/** Called when user opens a modal for an item */
onOpenModal?: (id: string, modalType: 'edit' | 'view' | 'delete') => void
/** Called when modal is closed */
onCloseModal?: () => void
```

**When to Use Complex Callbacks:**

- The spec mentions bulk operations or multi-select
- The spec includes filtering, sorting, or search
- The spec requires pagination for large datasets
- The spec mentions inline editing or drag-and-drop
- The UI includes modals or slide-over panels

**Example Complex Props Interface:**

```typescript
export interface ProjectListProps {
  projects: Project[];
  // Basic callbacks
  onView?: (id: string) => void;
  onCreate?: () => void;
  // Bulk operations
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onBulkDelete?: (ids: string[]) => void;
  // Filtering
  filters?: FilterCriteria;
  onFilterChange?: (filters: FilterCriteria) => void;
  onSearch?: (query: string) => void;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}
```

### Secondary View Props (Drawers, Modals, Inline Panels)

If the spec contains a `## View Relationships` section (created by `/shape-section` Step 4.6), also generate Props interfaces for secondary views. These Props will be used by `/design-screen` when creating the related view components.

**Parse View Relationships:**

```markdown
## View Relationships

- AgentListView.onView -> AgentDetailDrawer (drawer, entityId)
- AgentListView.onCreate -> CreateAgentModal (modal, none)
```

**Generate Props for each secondary view:**

| Secondary View      | Type   | Data Ref | Props Pattern                                 |
| ------------------- | ------ | -------- | --------------------------------------------- |
| `AgentDetailDrawer` | drawer | entityId | Receives full entity + close/action callbacks |
| `CreateAgentModal`  | modal  | none     | Receives only close/save callbacks            |

**Drawer/Detail View Props Pattern:**

When `dataRef = entityId` or `dataRef = entity`, the secondary view receives the full entity:

```typescript
// =============================================================================
// Secondary View Props
// =============================================================================

/** Props for AgentDetailDrawer - displays agent details in a side panel */
export interface AgentDetailDrawerProps {
  /** The agent to display */
  agent: Agent;
  /** Called when user closes the drawer */
  onClose?: () => void;
  /** Called when user wants to edit the agent */
  onEdit?: () => void;
  /** Called when user wants to delete the agent */
  onDelete?: () => void;
}
```

**Create/Edit Modal Props Pattern:**

When `dataRef = none`, the secondary view is a create form (no entity passed):

```typescript
/** Props for CreateAgentModal - form for creating a new agent */
export interface CreateAgentModalProps {
  /** Called when user closes the modal without saving */
  onClose?: () => void;
  /** Called when user saves the new agent */
  onSave?: (agent: Partial<Agent>) => void;
}

/** Props for EditAgentModal - form for editing an existing agent */
export interface EditAgentModalProps {
  /** The agent to edit */
  agent: Agent;
  /** Called when user closes the modal without saving */
  onClose?: () => void;
  /** Called when user saves changes */
  onSave?: (agent: Agent) => void;
}
```

**Inline Panel Props Pattern:**

For `type = inline`, the panel expands within the list:

```typescript
/** Props for AgentDetailInline - inline expandable panel */
export interface AgentDetailInlineProps {
  /** The agent to display */
  agent: Agent;
  /** Called when user collapses the panel */
  onClose?: () => void;
  /** Called when user wants to edit */
  onEdit?: () => void;
}
```

**Example Complete types.ts with Secondary Views:**

```typescript
// =============================================================================
// Entity Models
// =============================================================================

export interface Agent {
  id: string;
  name: string;
  status: "online" | "offline" | "error";
  lastSeen: string;
  version: string;
}

// =============================================================================
// Primary View Props
// =============================================================================

/** Props for AgentList - main list view */
export interface AgentListProps {
  /** List of agents to display */
  agents: Agent[];
  /** Called when user clicks to view agent details */
  onView?: (id: string) => void;
  /** Called when user clicks to edit an agent */
  onEdit?: (id: string) => void;
  /** Called when user clicks to delete an agent */
  onDelete?: (id: string) => void;
  /** Called when user clicks to create a new agent */
  onCreate?: () => void;
}

// =============================================================================
// Secondary View Props (from View Relationships)
// =============================================================================

/** Props for AgentDetailDrawer - side panel for agent details */
export interface AgentDetailDrawerProps {
  agent: Agent;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** Props for CreateAgentModal - modal for creating new agent */
export interface CreateAgentModalProps {
  onClose?: () => void;
  onSave?: (agent: Partial<Agent>) => void;
}
```

**Why Secondary Views Get Full Entities:**

Primary views receive callbacks with entity IDs (`onView?: (id: string) => void`) because:

- They already have the full entity in their data list
- Passing IDs keeps the interface simple
- The preview wrapper does the lookup

Secondary views receive full entities (`agent: Agent`) because:

- The preview wrapper does the lookup before rendering
- The secondary view doesn't need to know about the data source
- Components stay decoupled and portable

## Step 7.5: Validate Multi-View Props Interfaces

After generating types.ts, verify that Props interfaces were created for ALL views defined in the spec. This validation runs AFTER types.ts generation to ensure completeness.

**1. Extract views from spec.md:**

```bash
# Count views defined in spec
VIEW_COUNT=$(grep -E '^- [A-Z]' product/sections/[section-id]/spec.md | wc -l)
echo "Found $VIEW_COUNT views in spec.md"
```

**2. Verify Props interfaces exist for each view:**

For each view extracted from `## Views` section (e.g., `ListView`, `DetailView`, `CreateForm`), verify a corresponding Props interface exists in `types.ts`:

| View Name    | Expected Props Interface |
| ------------ | ------------------------ |
| `ListView`   | `ListViewProps`          |
| `DetailView` | `DetailViewProps`        |
| `CreateForm` | `CreateFormProps`        |

**3. Validation script:**

```bash
# Check each view has a Props interface
SPEC_FILE="product/sections/[section-id]/spec.md"
TYPES_FILE="product/sections/[section-id]/types.ts"

# Extract view names from spec (handles multi-word names like "Edit Form")
# View format in spec: "- ViewName — Description" or "- EditForm — Description"
# Note: View names should be PascalCase (e.g., "EditForm" not "Edit Form")

grep -E '^- [A-Z]' "$SPEC_FILE" | sed 's/^- //' | sed 's/ *[—-].*$//' | sed 's/ *$//' | while read -r VIEW; do
  # Remove any spaces in view name for Props interface (e.g., "Edit Form" → "EditFormProps")
  PROPS_NAME="$(echo "$VIEW" | tr -d ' ')Props"
  if ! grep -q "export interface $PROPS_NAME" "$TYPES_FILE"; then
    echo "Warning: Missing Props interface '$PROPS_NAME' for view '$VIEW'"
  fi
done
```

**4. If Props interfaces are missing:**

```
Warning: types.ts is missing Props interfaces for some views defined in spec.md:
- Missing: DetailViewProps (for DetailView)
- Missing: CreateFormProps (for CreateForm)

Adding missing interfaces now...
```

**5. Auto-fix missing Props:**

If any Props interfaces are missing, generate and add them to types.ts before proceeding. This ensures `/design-screen` won't fail due to missing type definitions.

## Step 8: Confirm and Next Steps

Let the user know:

"I've created two files for **[Section Title]**:

1. `product/sections/[section-id]/data.json` - Sample data with [X] records

2. `product/sections/[section-id]/types.ts` - TypeScript interfaces for type safety

The types include:

- `[Entity]` - The main data type
- `[ViewName]Props` - Props interface for each view (e.g., `InvoiceListProps`, `InvoiceDetailProps`)

When you're ready, run `/design-screen` to create the screen design for this section."

## Important Notes

- Generate realistic, believable sample data - not "Lorem ipsum" or "Test 123"
- Include 5-10 sample records for main entities (enough to show a realistic list)
- Include edge cases: empty arrays, long text, different statuses
- Keep field names clear and TypeScript-friendly (camelCase)
- The data structure should directly map to the spec's user flows
- Always generate types.ts alongside data.json
- Callback props should cover all actions mentioned in the spec
- **Use entity names from the global data model for consistency across sections**

---

## Recovery Pattern

If this command fails partway through, use these recovery steps to restore a consistent state.

### Partial Failure Scenarios

| Scenario                           | Files Created                  | State        | Recovery Action                      |
| ---------------------------------- | ------------------------------ | ------------ | ------------------------------------ |
| data.json created, types.ts failed | data.json only                 | Inconsistent | Delete data.json, re-run command     |
| data.json validation failed        | data.json (invalid)            | Broken       | Delete data.json, re-run command     |
| types.ts validation failed         | data.json + types.ts (invalid) | Broken       | Fix types.ts manually or delete both |
| Mismatch between files             | Both exist, inconsistent       | Broken       | Delete both, re-run command          |

### Recovery Steps

**If types.ts generation failed after data.json was created:**

```bash
# 1. Check current state
ls -la product/sections/[section-id]/

# 2. Option A: Start fresh (recommended)
rm product/sections/[section-id]/data.json
rm product/sections/[section-id]/types.ts 2>/dev/null
# Then re-run /sample-data

# 3. Option B: Keep data.json, regenerate types.ts
# Manually run Step 7 (Generate TypeScript Types) only
```

**If data.json exists but types.ts is missing:**

```
Warning: Inconsistent state detected.
- data.json exists at product/sections/[section-id]/data.json
- types.ts is missing at product/sections/[section-id]/types.ts

This can cause /design-screen to fail.

Options:
1. Re-run /sample-data to regenerate both files (recommended)
2. Manually create types.ts based on existing data.json
```

**If both files exist but are out of sync:**

Check for consistency issues:

```bash
# Compare entity names in data.json vs types.ts
# data.json should have plural camelCase keys (invoices, users)
# types.ts should have singular PascalCase interfaces (Invoice, User)

# Check data.json keys
grep -o '"[a-z]\+":' product/sections/[section-id]/data.json | grep -v '_meta' | sort | uniq

# Check types.ts interfaces
grep 'export interface' product/sections/[section-id]/types.ts
```

### Preventing Inconsistent State

The command generates files in this order:

1. **data.json** (Step 5) → validated in Step 6
2. **types.ts** (Step 7) → derived from validated data.json

**Critical:** If Step 5 succeeds but Step 6 validation fails, data.json is already written. The retry mechanism (3 attempts) handles this by regenerating data.json each time.

**If you need to manually fix data.json:**

1. Ensure `_meta` object exists with all required fields
2. Ensure all entity arrays are consistent (same fields in all records)
3. Run the validation script from Step 6 to verify
4. Then re-run /sample-data to regenerate types.ts

### Cleanup Command

To completely reset and start fresh:

```bash
# Remove both generated files
rm -f product/sections/[section-id]/data.json
rm -f product/sections/[section-id]/types.ts

# Verify cleanup
ls product/sections/[section-id]/
# Should only show: spec.md (and any screenshots)

# Re-run the command
# /sample-data
```

This ensures a clean state before regeneration.
