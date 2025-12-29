# Data Model

You are helping the user define the core data model for their product. This establishes the "nouns" of the system — the entities and their relationships.

> **Scope:** The data model defines global entities shared across sections. Individual sections may have additional local entities. When running `/sample-data` for a section, entity names should match those defined here for consistency.

> **See also:** `agents.md` → "The Four Pillars" → "Data Model" for the broader context of data modeling in Design OS.

## Step 1: Check Prerequisites

First, verify that the product overview and roadmap exist:

1. Read `/product/product-overview.md` to understand what the product does
2. Read `/product/product-roadmap.md` to understand the planned sections

If either file is missing, let the user know with a specific message:

**If `/product/product-overview.md` is missing:**

```
Error: product/product-overview.md - File not found. Run /product-vision to create it.
```

**If `/product/product-roadmap.md` is missing:**

```
Error: product/product-roadmap.md - File not found. Run /product-roadmap to create it.
```

Stop here if any prerequisite is missing.

## Step 2: Gather Initial Input

Review the product overview and roadmap, then present your initial analysis:

"Based on your product vision and roadmap, I can see you're building **[Product Name]** with sections for [list sections].

Let me help you define the core data model — the main "things" your app will work with.

Looking at your product, here are some entities I'm seeing:

- **[Entity 1]** — [Brief description based on product overview]
- **[Entity 2]** — [Brief description based on sections]
- **[Entity 3]** — [Brief description]

Does this capture the main things your app works with? What would you add, remove, or change?"

Wait for their response before proceeding.

## Step 3: Refine Entities

Use the AskUserQuestion tool to clarify:

- "Are there any other core entities in your system that users will create, view, or manage?"
- "For [Entity], what are the most important pieces of information it contains? (Don't need every field, just the key ones)"
- "How do these entities relate to each other?"

Keep the conversation focused on:

- **Entity names** — What are the main nouns?
- **Plain-language descriptions** — What does each entity represent?
- **Relationships** — How do entities connect to each other?

**Important:** Do NOT define every field or database schema details. Keep it minimal and conceptual.

## Step 4: Present Draft and Refine

Once you have enough information, present a draft:

"Here's your data model:

**Entities:**

- **[Entity1]** — [Description]
- **[Entity2]** — [Description]

**Relationships:**

- [Entity1] has many [Entity2]
- [Entity2] belongs to [Entity1]
- [Entity3] links [Entity1] and [Entity4]

Does this look right? Any adjustments?"

Iterate until the user is satisfied.

## Step 5: Create the File

Once approved:

### Create Directory

First, ensure the data-model directory exists:

```bash
mkdir -p product/data-model
```

Then validate the directory was created:

```bash
if [ ! -d "product/data-model" ]; then
  echo "Error: product/data-model/ - Directory creation failed. Check write permissions."
  exit 1
fi
```

### Create the Data Model File

Then create the file at `/product/data-model/data-model.md` with this format:

```markdown
# Data Model

## Entities

### [EntityName]

[Plain-language description of what this entity represents and its purpose in the system.]

### [AnotherEntity]

[Plain-language description.]

[Add more entities as needed]

## Relationships

- [Entity1] has many [Entity2]
- [Entity2] belongs to [Entity1]
- [Entity3] belongs to both [Entity1] and [Entity2]
  [Add more relationships as needed]
```

**Important:** Keep descriptions minimal — focus on what each entity represents, not every field it contains. Leave room for the implementation agent to extend the model.

### Validate Required Sections

After creating the file, verify all required markdown sections exist:

**Required sections:**

- `# Data Model` — Main heading
- `## Entities` — At least one `### EntityName` subsection
- `## Relationships` — Relationship list

**Validation Script:**

> **Note:** This script uses `grep -E` for extended regex. On systems where this isn't available, use `egrep` as an alternative (they are functionally equivalent).

```bash
# Check for required sections
# Note: Uses grep -E (extended regex). On older systems, use egrep instead.
CONTENT=$(cat product/data-model/data-model.md)

# Check for # Data Model
if ! echo "$CONTENT" | grep -q "^# Data Model"; then
  echo "Warning: Missing '# Data Model' heading"
fi

# Check for ## Entities
if ! echo "$CONTENT" | grep -q "^## Entities"; then
  echo "Warning: Missing '## Entities' section"
fi

# Check for at least one ### EntityName subsection (PascalCase, no spaces, alphanumeric only)
if ! echo "$CONTENT" | grep -E -q "^### [A-Z][a-zA-Z0-9]*$"; then
  echo "Warning: Missing entity subsections (expected '### EntityName' in PascalCase format)"
fi

# Validate all entity names follow naming rules
echo "$CONTENT" | grep -E "^### " | while read -r line; do
  entity_name=$(echo "$line" | sed 's/^### //')
  # Check for valid PascalCase: starts with uppercase, alphanumeric only
  if [[ ! "$entity_name" =~ ^[A-Z][a-zA-Z0-9]*$ ]]; then
    echo "Warning: Entity '$entity_name' doesn't follow PascalCase naming (expected format: EntityName)"
  fi
  # Check for obvious plural forms only (conservative to avoid false positives)
  # Only warn about clear plurals: -ies (Companies→Company), -ves (Shelves→Shelf)
  # Skip: singular nouns ending in s (Canvas, Atlas, Nexus, Alias, Status, Address, etc.)
  if [[ "$entity_name" =~ ies$ ]]; then
    PLURAL_ENTITIES="$PLURAL_ENTITIES $entity_name:${entity_name%ies}y"
  elif [[ "$entity_name" =~ ves$ ]]; then
    # Common ves→f mappings
    singular="${entity_name%ves}f"
    PLURAL_ENTITIES="$PLURAL_ENTITIES $entity_name:$singular"
  fi
done

# Handle plural entities with user confirmation
if [ -n "$PLURAL_ENTITIES" ]; then
  echo "Found plural entity names that should be singular:"
  for pair in $PLURAL_ENTITIES; do
    plural=$(echo "$pair" | cut -d: -f1)
    singular=$(echo "$pair" | cut -d: -f2)
    echo "  - '$plural' → '$singular'"
  done
fi
```

**If plural entities are detected, use AskUserQuestion:**

```
I found entity name(s) that appear to be plural:
- [Entity] → suggested singular: [Singular]

Entity names should be singular for consistency with TypeScript interfaces and automatic pluralization in data.json.

Would you like me to rename them to singular form?
```

Options:

- "Yes, rename to singular" — Update entity headings to singular form
- "No, keep as-is" — The names are intentional (e.g., "Supplies" is correct)

**If user chooses "Yes, rename to singular":**

Update the entity headings in data-model.md:

```bash
for pair in $PLURAL_ENTITIES; do
  plural=$(echo "$pair" | cut -d: -f1)
  singular=$(echo "$pair" | cut -d: -f2)
  sed -i '' "s/^### $plural$/### $singular/" product/data-model/data-model.md
done
```

### Validate Relationships Section

```bash
# Check for ## Relationships
if ! echo "$CONTENT" | grep -q "^## Relationships"; then
  echo "Warning: Missing '## Relationships' section"
fi
```

**If any section is missing:**

```
Warning: data-model.md is missing required section(s):
- [list missing sections]

The file may not be parsed correctly by /sample-data. Would you like me to fix the formatting?
```

Use AskUserQuestion with options:

- "Yes, fix the formatting" — Regenerate with correct sections
- "No, continue as is" — Proceed (user will fix manually)

## Step 6: Confirm Completion

Let the user know:

"I've created your data model at `/product/data-model/data-model.md`.

**Entities defined:**

- [List entities]

**Relationships:**

- [List key relationships]

This provides a shared vocabulary that will be used when generating sample data for your sections. When you run `/sample-data`, it will reference this model to ensure consistency.

Next step: Run `/design-tokens` to choose your color palette and typography."

## Important Notes

- Keep the data model **minimal** — entity names, descriptions, and relationships
- Do NOT define detailed schemas, field types, or validation rules
- Use plain language that a non-technical person could understand
- Relationships should describe how entities connect conceptually
- The implementation agent will extend this with additional fields as needed
- Entity names should be singular (User, Invoice, Project — not Users, Invoices)

### Plural Entity Names (Why Singular is Required)

The data model uses **singular** entity names because they're transformed during downstream operations:

**Why Singular?**

- **TypeScript interfaces are singular** — `interface Invoice { }` matches TypeScript conventions
- **Data model describes the concept** — "An Invoice represents..." not "Invoices represent..."
- **Automatic pluralization** — `/sample-data` converts `Invoice` → `invoices` for JSON keys

**What Happens with Plural Names?**

If a user defines a plural entity name (e.g., `### Invoices`), these issues occur:

| Location        | Expected            | Actual (with plural) | Problem                        |
| --------------- | ------------------- | -------------------- | ------------------------------ |
| types.ts        | `Invoice` interface | `Invoices` interface | Non-standard TypeScript naming |
| data.json       | `invoices` key      | `invoicess` key      | Double-s suffix                |
| Component props | `invoice: Invoice`  | `invoice: Invoices`  | Confusing singular/plural mix  |

**Guidance for `/sample-data`:**

If entity names in the data model appear to be plural:

1. **Warn the user** — "Entity 'Invoices' appears to be plural. Consider changing to 'Invoice' for consistency."
2. **Auto-singularize for types.ts** — Transform `Invoices` → `Invoice` when generating TypeScript interfaces
3. **Continue with transformation** — Apply the singular form to maintain TypeScript naming conventions

**Auto-singularization Rules (applied by `/sample-data`):**

| Plural Form  | Singular Form | Rule Applied             |
| ------------ | ------------- | ------------------------ |
| `Invoices`   | `Invoice`     | Remove trailing 's'      |
| `Categories` | `Category`    | 'ies' → 'y'              |
| `Statuses`   | `Status`      | 'es' → ''                |
| `People`     | `Person`      | Irregular (special case) |
| `Children`   | `Child`       | Irregular (special case) |

This ensures TypeScript interfaces follow standard naming conventions while allowing flexibility in the data model.

**Cross-Reference:** For detailed implementation of auto-singularization, see `/sample-data` command which applies these rules when generating `types.ts` from the data model.

### Entity Naming Validation

Entity names must follow a consistent format for proper parsing by `/sample-data` and other commands:

**Required Format:** `### EntityName`

**Entity Naming Rules:**

1. **PascalCase** — First letter of each word capitalized (e.g., `User`, `Invoice`, `ProjectMember`)
2. **Singular form** — Use `Invoice` not `Invoices`
3. **No spaces** — Use `ProjectMember` not `Project Member`
4. **No special characters** — Only alphanumeric characters
5. **Descriptive but concise** — `Invoice` is better than `Inv` or `CustomerInvoiceDocument`

**Valid Examples:**

```markdown
### User

### Invoice

### ProjectMember

### PaymentTransaction
```

**Invalid Examples (avoid these):**

```markdown
### users # lowercase, plural

### Project Member # contains space

### invoice-item # contains hyphen

### Inv # too abbreviated
```

**Why this matters:**

- `/sample-data` extracts entity names from `### EntityName` headings
- Consistent naming ensures types.ts interfaces are generated correctly
- PascalCase matches TypeScript interface naming conventions

### Entity Relationship Format

Relationships should follow a consistent format that clearly communicates cardinality and direction:

**Standard Relationship Patterns:**

| Pattern                              | Meaning                   | Example                                                  |
| ------------------------------------ | ------------------------- | -------------------------------------------------------- |
| `[A] has many [B]`                   | One-to-many, A is parent  | "User has many Projects"                                 |
| `[A] has one [B]`                    | One-to-one, A owns B      | "User has one Profile"                                   |
| `[A] belongs to [B]`                 | Many-to-one, A is child   | "Project belongs to User"                                |
| `[A] and [B] are linked through [C]` | Many-to-many via junction | "Users and Roles are linked through UserRoles"           |
| `[A] optionally belongs to [B]`      | Optional many-to-one      | "Task optionally belongs to Project (can be standalone)" |
| `[A] optionally has one [B]`         | Optional one-to-one       | "User optionally has one Avatar"                         |

**Valid Relationship Descriptions:**

```
- User has many Projects
- Project belongs to User
- Project has many Tasks
- Task belongs to Project
- Users and Projects are linked through Memberships (many-to-many)
```

**Invalid or Unclear Formats (avoid these):**

```
- User → Project (direction unclear)
- User/Project (relationship type unclear)
- Project references User (technical, not plain language)
- User can have Projects (ambiguous cardinality)
```

**Bidirectional Relationships:**
When documenting bidirectional relationships, include both directions for clarity:

```
- User has many Projects
- Project belongs to User
```

This redundancy ensures the relationship is clear from both entity perspectives.

**Optional Relationships:**
If a relationship is optional (entity B can exist without entity A), note it:

```
- Task optionally belongs to Project (can be standalone)
```
