# Sample Data

You are helping the user create realistic sample data for a section of their product. This data will be used to populate screen designs. You will also generate TypeScript types based on the data structure.

## Step 1: Check Prerequisites

First, identify the target section and verify that `spec.md` exists for it.

Read `/product/product-roadmap.md` to get the list of available sections.

If there's only one section, auto-select it. If there are multiple sections, use the AskUserQuestion tool to ask which section the user wants to generate data for.

Then check if `product/sections/[section-id]/spec.md` exists. If it doesn't:

```
Missing: product/sections/[section-id]/spec.md. Run /shape-section to create it.
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
  echo "Error: Failed to create directory product/sections/[section-id]."
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

Every data.json MUST include a `_meta` object at the top level with:

1. **`models`** - An object where each key is a model name and value is a plain-language description
2. **`relationships`** - An array of strings explaining how models connect to each other

Example structure:

```json
{
  "_meta": {
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
      "total": 1500.00,
      "status": "sent",
      "dueDate": "2024-02-15",
      "lineItems": [
        { "description": "Web Design", "quantity": 1, "rate": 1500.00 }
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

After creating data.json, verify that the file was created correctly:

1. **Check file exists:** Verify `product/sections/[section-id]/data.json` exists
2. **Validate `_meta` structure:**
   - [ ] `_meta` object exists at top level
   - [ ] `_meta.models` is an object with descriptions for each data collection
   - [ ] `_meta.relationships` is an array with plain-language relationship descriptions
   - [ ] All data model keys in `_meta.models` match the actual data keys below
3. **Check data consistency:**
   - [ ] All records have consistent field names
   - [ ] All required fields are present in all records
   - [ ] Data types match across records (no inconsistent typing)
4. **Verify content quality:**
   - [ ] Sample values are realistic and believable
   - [ ] Edge cases are included (empty arrays, long text, various statuses)

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

### Retry Loop State Management (Pseudo-Code)

```
STATE: retryCount = 0, maxRetries = 3

STEP 5: Generate data.json
    |
    v
STEP 6: Validate data.json
    |
    +--> PASS --> STEP 7: Generate types.ts
    |
    +--> FAIL:
         retryCount++
         IF retryCount >= maxRetries:
             STOP("Validation failed 3 times. Review data model.")
             **END COMMAND**
         ELSE:
             Report failure to user
             Return to STEP 5 (regenerate with corrections)
             Loop back to STEP 6 validation
```

**State Diagram:**
```
[Step 5: Generate] --> [Step 6: Validate]
                            |
                      +-----+-----+
                      |           |
                   PASS         FAIL
                      |           |
                      v           v
              [Step 7: Types]  [Retry?]
                                  |
                            +-----+-----+
                            |           |
                         < 3x        >= 3x
                            |           |
                            v           v
                      [Step 5]    [STOP/END]
```

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

| Location | Format | Example |
|----------|--------|---------|
| **Data Model** (`data-model.md`) | Singular PascalCase | `Invoice`, `User`, `LineItem` |
| **Data JSON** (`data.json` keys) | Plural camelCase | `invoices`, `users`, `lineItems` |
| **TypeScript Types** (`types.ts`) | Singular PascalCase | `Invoice`, `User`, `LineItem` |

**Transformation Rules:**
1. **Singular → Plural**: Add `s` (or `es` for words ending in `s`, `x`, `ch`, `sh`)
2. **PascalCase → camelCase**: Lowercase the first letter
3. **Special cases**: Handle irregular plurals manually (`Person` → `people`, `Child` → `children`)

**Examples:**

| Data Model Entity | data.json Key | TypeScript Type |
|-------------------|---------------|-----------------|
| `Invoice` | `invoices` | `Invoice` |
| `User` | `users` | `User` |
| `LineItem` | `lineItems` | `LineItem` |
| `Category` | `categories` | `Category` |
| `Status` | `statuses` | `Status` |

This ensures consistency: types match the data model, while JSON keys follow JavaScript object naming conventions.

4. **Report discrepancies:**
   - If entity names don't match ANY from the data model:
     ```
     Note: Your data uses [entity1, entity2], but the global data model defines [datamodel-entity1, datamodel-entity2].
     Consider aligning the names for consistency across sections, or let me know if these are section-specific entities.
     ```

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
|--------------------|------------------------|
| `Invoice` | `invoices` |
| `User` | `users` |
| `LineItem` | `lineItems` |

**Transformation Rule:** Convert PascalCase to camelCase + pluralize

**2. Validate data.json → types.ts consistency:**

For each key in data.json (excluding `_meta`), verify a corresponding interface exists in types.ts:

| data.json Key | Expected types.ts Interface |
|---------------|----------------------------|
| `invoices` | `Invoice` |
| `users` | `User` |
| `lineItems` | `LineItem` |

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
  description: string
  quantity: number
  rate: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  lineItems: LineItem[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface InvoiceListProps {
  /** The list of invoices to display */
  invoices: Invoice[]
  /** Called when user wants to view an invoice's details */
  onView?: (id: string) => void
  /** Called when user wants to edit an invoice */
  onEdit?: (id: string) => void
  /** Called when user wants to delete an invoice */
  onDelete?: (id: string) => void
  /** Called when user wants to archive an invoice */
  onArchive?: (id: string) => void
  /** Called when user wants to create a new invoice */
  onCreate?: () => void
}
```

### Naming Conventions

- Use PascalCase for interface names: `Invoice`, `LineItem`, `InvoiceListProps`

- Use camelCase for property names: `clientName`, `dueDate`, `lineItems`

- Props interface should be named `[SectionName]Props` (e.g., `InvoiceListProps`)

- Add JSDoc comments for callback props to explain when they're called

- **Match entity names from the global data model if one exists**

### Callback Prop Naming Convention

Use consistent action-based callback names:

| Callback | Purpose |
|----------|---------|
| `onView` | Called when user wants to view item details |
| `onEdit` | Called when user wants to edit an item |
| `onDelete` | Called when user wants to delete an item |
| `onCreate` | Called when user wants to create a new item |
| `onArchive` | Called when user wants to archive an item |
| `onSelect` | Called when user selects an item (for multi-select) |

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
  projects: Project[]
  // Basic callbacks
  onView?: (id: string) => void
  onCreate?: () => void
  // Bulk operations
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  onBulkDelete?: (ids: string[]) => void
  // Filtering
  filters?: FilterCriteria
  onFilterChange?: (filters: FilterCriteria) => void
  onSearch?: (query: string) => void
  // Pagination
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}
```

## Step 8: Confirm and Next Steps

Let the user know:

"I've created two files for **[Section Title]**:

1. `product/sections/[section-id]/data.json` - Sample data with [X] records

2. `product/sections/[section-id]/types.ts` - TypeScript interfaces for type safety

The types include:

- `[Entity]` - The main data type
- `[SectionName]Props` - Props interface for the component (includes callbacks for [list actions])

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
