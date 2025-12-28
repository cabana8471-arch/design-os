# Product Vision

You are helping the user define their product vision for Design OS. This is a conversational, multi-step process.

## Step 1: Gather Initial Input

First, ask the user to share their raw notes, ideas, or thoughts about the product they want to build. Be warm and open-ended:

"I'd love to help you define your product vision. Tell me about the product you're building - share any notes, ideas, or rough thoughts you have. What problem are you trying to solve? Who is it for? Don't worry about structure yet, just share what's on your mind."

Wait for their response before proceeding.

## Step 2: Ask Clarifying Questions

After receiving their input, use the AskUserQuestion tool to ask 3-5 targeted questions to help shape:

- **The product name** - A clear, concise name for the product
- **The core product description** (1-3 sentences that capture the essence)
- **The key problems** the product solves (1-5 specific pain points)
- **How the product solves each problem** (concrete solutions)
- **The main features** that make this possible

**Important:** If the user hasn't already provided a product name, ask them:

- "What would you like to call this product? (A short, memorable name)"

Other example clarifying questions (adapt based on their input):

- "Who is the primary user of this product? Can you describe them?"
- "What's the single biggest pain point you're addressing?"
- "How do people currently solve this problem without your product?"
- "What makes your approach different or better?"
- "What are the 3-5 most essential features?"

Ask questions one or two at a time, and engage conversationally.

## Step 2.5: Product Scope and AI-Generated Suggestions

After understanding the user's basic product idea, explicitly ask about scope and provide dynamic suggestions.

### Question 1: Product Scope

Use AskUserQuestion with predefined options:

**"What scope are you targeting for this product?"**

Options:

- **MVP (Minimum Viable Product)** — Core features only. Focus on solving the main problem with minimal complexity. Best for: validating ideas quickly, limited resources.
- **Standard** — Full feature set for primary use cases. Covers main user flows and common scenarios. Best for: most production products.
- **Enterprise / Comprehensive** — All features plus advanced capabilities (analytics, admin panels, integrations). Best for: mature products, B2B SaaS, complex workflows.

Record the choice for use throughout the planning process:

```
PRODUCT_SCOPE: [MVP / Standard / Enterprise]
```

### AI-Generated Feature Suggestions

Based on the user's description, dynamically analyze the product type and generate relevant feature suggestions.

**Process:**

1. **Identify the product type** from the description (e.g., SaaS dashboard, e-commerce, CRM, portfolio, monitoring tool, etc.)

2. **Generate 6-10 relevant feature suggestions** organized by priority:

```
Based on your description, I identified this as a **[detected product type]** application.

Here are features commonly found in similar products:

**Core Features (most products include these):**
- [ ] [Dynamically generated based on product type]
- [ ] [Dynamically generated]
- [ ] [Dynamically generated]

**Standard Features (recommended for full products):**
- [ ] [Dynamically generated]
- [ ] [Dynamically generated]
- [ ] [Dynamically generated]

**Advanced Features (for enterprise/comprehensive scope):**
- [ ] [Dynamically generated]
- [ ] [Dynamically generated]

Which of these are relevant to your product? Select all that apply, or describe additional features.
```

3. **Tailor suggestions based on scope:**
   - **MVP scope:** Emphasize only Core Features
   - **Standard scope:** Include Core + Standard Features
   - **Enterprise scope:** Include all categories

**Example Suggestions by Product Type:**

| Product Type          | Core Features                                       | Standard Features                       | Advanced Features                               |
| --------------------- | --------------------------------------------------- | --------------------------------------- | ----------------------------------------------- |
| **Dashboard/SaaS**    | User authentication, Data visualization, Basic CRUD | Filters & search, Export, Notifications | Role-based access, Audit logs, API              |
| **E-commerce**        | Product catalog, Cart, Checkout                     | User accounts, Order history, Reviews   | Inventory management, Analytics, Multi-currency |
| **CRM**               | Contact management, Notes, Activities               | Pipeline stages, Tags/filters, Search   | Automation, Integrations, Reporting             |
| **Monitoring Tool**   | Status dashboard, Agent list, Alerts                | Filtering, History, Remote actions      | Multi-tenant, API, Advanced analytics           |
| **Portfolio/Content** | Project display, About page, Contact                | Categories, Search, Case studies        | Blog, CMS, Analytics                            |

**Note:** These are examples. Always generate suggestions dynamically based on the actual product description, not just the category.

### Record Feature Selections

Track which features the user selects for use in Step 3:

```
SELECTED_FEATURES:
  core: [list of selected core features]
  standard: [list of selected standard features]
  advanced: [list of selected advanced features]
```

This ensures the draft in Step 3 reflects the user's actual selections, not just their initial description.

## Step 3: Present Draft and Refine

Once you have enough information, present a draft summary:

"Based on our discussion, here's what I'm capturing for **[Product Name]**:

**Description:**
[Draft 1-3 sentence description]

**Problems & Solutions:**

1. [Problem] → [Solution]
2. [Problem] → [Solution]

**Key Features:**

- Feature 1
- Feature 2
- Feature 3

Does this capture your vision? Would you like to adjust anything?"

Iterate until the user is satisfied.

### Validate Product Name Before Proceeding

**Before creating the file, verify that a product name has been established:**

1. Check that you have captured a clear product name from the conversation
2. If the product name is missing, vague, or still a placeholder:
   - Ask explicitly: "Before I save this, what would you like to call this product? (A short, memorable name)"
   - Wait for their response
3. Do NOT proceed to file creation until you have a confirmed product name

**Product Name Validation Criteria:**

| Criterion        | Rule                                   | Example                                                   |
| ---------------- | -------------------------------------- | --------------------------------------------------------- |
| Length           | 2-50 characters                        | "OK" (2) to "Enterprise Resource Planning Dashboard" (40) |
| Not generic      | Reject placeholders                    | "My App", "Untitled", "New Project", "App", "Test"        |
| Meaningful       | Describes the product                  | "InvoiceFlow", "TaskMaster", "HealthSync"                 |
| No special chars | Letters, numbers, spaces, hyphens only | "Project 42" (OK), "App@v2" (reject)                      |

**Generic names to reject:**

- "My App", "My Project", "My Product"
- "Untitled", "Untitled App", "New App"
- "App", "Project", "Product" (single generic words)
- "Test", "Demo", "Sample"
- "[Placeholder]", "TBD", "TODO"

If the user provides a generic name:

```
"'[name]' seems like a placeholder. Your product name will appear throughout the design and export — what would you like to call it?"
```

The product name is critical because:

- It becomes the `# [Product Name]` heading in the markdown file
- It displays as the main title in Design OS
- It's referenced throughout the export process

## Step 4: Create the File

Once the user approves (product name was validated in Step 3):

### Cross-Validate with Existing Roadmap

Before creating the file, check if a product-roadmap.md already exists:

```bash
if [ -f "product/product-roadmap.md" ]; then
  echo "Existing roadmap found"
fi
```

**If product-roadmap.md exists:**

1. Extract the product name from the existing roadmap (look for `# ` heading)
2. Compare with the new product name being saved

**If names don't match:**

```
Warning: A product-roadmap.md already exists with a different product name.
- Existing roadmap references: "[Existing Name]"
- New product vision uses: "[New Name]"

This inconsistency may cause confusion. Would you like to:
1. Update the new product vision to match the existing name
2. Keep the new name (you'll need to update the roadmap manually)
3. Cancel and review both files first
```

Use AskUserQuestion with these options. This prevents silent inconsistencies between product files.

### Pre-Creation Validation

**Before writing the file, verify all required content exists:**

| Content      | Required | Validation                                   |
| ------------ | -------- | -------------------------------------------- |
| Product name | Yes      | Non-empty, non-generic (see Step 3 criteria) |
| Description  | Yes      | 1-3 sentences, non-empty                     |
| Problems     | Yes      | At least 1 problem with solution             |
| Features     | Yes      | At least 3 features                          |

If any required content is missing, return to Step 2/3 to gather it before proceeding.

### Create Directory

First, ensure the product directory exists:

```bash
mkdir -p product
```

Then validate the directory was created:

```bash
if [ ! -d "product" ]; then
  echo "Error: product - Directory creation failed. Check write permissions."
  exit 1
fi
```

### Create the Overview File

Then create the file at `/product/product-overview.md` with this exact format:

```markdown
# [Product Name]

## Description

[The finalized 1-3 sentence description]

## Problems & Solutions

### Problem 1: [Problem Title]

[How the product solves it in 1-2 sentences]

### Problem 2: [Problem Title]

[How the product solves it in 1-2 sentences]

[Add more as needed, up to 5]

## Key Features

- [Feature 1]
- [Feature 2]
- [Feature 3]
  [Add more as needed]
```

**Important:** The `# [Product Name]` heading at the top is required - this is what displays as the card title in the app.

### Validate File Creation

After creating the file, verify it was created correctly:

```bash
if [ ! -f "product/product-overview.md" ]; then
  echo "Error: Failed to create product/product-overview.md"
  exit 1
fi
```

Also verify the file contains expected content:

- Check that the file is not empty
- Verify the first line starts with `# ` (the product name heading)

```bash
# Check file is not empty
if [ ! -s "product/product-overview.md" ]; then
  echo "Error: product/product-overview.md is empty"
  exit 1
fi

# Check first line is a heading
first_line=$(head -1 product/product-overview.md)
if [[ ! "$first_line" =~ ^#\  ]]; then
  echo "Warning: product/product-overview.md may be malformed - first line should be '# [Product Name]'"
fi
```

### Validate Required Sections

After creating the file, verify all required markdown sections exist:

**Required sections:**

- `## Description` — Product description
- `## Problems & Solutions` — At least one `### Problem N:` subsection
- `## Key Features` — Feature list

**Validation Script:**

```bash
# Check for required sections
CONTENT=$(cat product/product-overview.md)

# Check for ## Description
if ! echo "$CONTENT" | grep -q "^## Description"; then
  echo "Warning: Missing '## Description' section"
fi

# Check for ## Problems & Solutions
if ! echo "$CONTENT" | grep -q "^## Problems & Solutions"; then
  echo "Warning: Missing '## Problems & Solutions' section"
fi

# Check for at least one ### Problem subsection
if ! echo "$CONTENT" | grep -q "^### Problem"; then
  echo "Warning: Missing problem subsections (expected '### Problem 1:', '### Problem 2:', etc.)"
fi

# Check for ## Key Features
if ! echo "$CONTENT" | grep -q "^## Key Features"; then
  echo "Warning: Missing '## Key Features' section"
fi
```

**If any section is missing:**

```
Warning: product-overview.md is missing required section(s):
- [list missing sections]

The file may not display correctly in Design OS. Would you like me to fix the formatting?
```

Use AskUserQuestion with options:

- "Yes, fix the formatting" — Regenerate with correct sections
- "No, continue as is" — Proceed (user will fix manually)

If validation fails, report to user and offer to recreate the file.

## Step 5: Confirm Completion

Let the user know:

"I've created your product overview at `/product/product-overview.md`. The homepage will now display **[Product Name]** with your product vision. You can run `/product-roadmap` next to break this down into development sections."

## Important Notes

- Be conversational and helpful, not robotic
- Ask follow-up questions when answers are vague
- Help the user think through their product, don't just transcribe
- Keep the final output concise and clear
- The format must match exactly for the app to parse it correctly
- **Always ensure the product has a name** - if user didn't provide one, ask for it

### Length Guidelines

Keep content focused and scannable:

- **Description:** 1-3 sentences (max 50 words)
- **Problems & Solutions:** 3-5 problems (prioritize the most impactful)
- **Key Features:** 5-8 features (focus on core differentiators)

If the user provides 10+ features or problems, help them prioritize:

"You've listed quite a few features. To keep the overview focused, which 5-8 would you consider the absolute core of your product? We can always expand later."
