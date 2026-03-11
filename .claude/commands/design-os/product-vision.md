# Product Vision

You are helping the user define their product vision for Design OS. This is a conversational process that results in three files: the product overview, product roadmap, and data shape.

## Step 0: Choose Interview Mode

Present the user with two options:

"I'd love to help you define your product vision! Before we start, how would you like to approach this?

**Quick Mode** — I'll ask a few key questions, then generate all three files (overview, roadmap, data shape) in one go. Best if you already have a clear idea of what you're building.

**Deep Interview Mode** — We'll go through a thorough exploration of your product vision, one topic at a time. I'll draft each section for your review before writing the files. Best if you want to think things through or are still shaping the idea.

Which mode would you prefer? (Or just start sharing your ideas and I'll use Quick Mode)"

**Behavior:**
- If the user explicitly chooses "Deep" or "Deep Interview Mode" → proceed to **Deep Interview Mode Flow**
- If the user explicitly chooses "Quick" or "Quick Mode" → proceed to **Quick Mode Flow**
- If the user doesn't choose and starts sharing ideas directly → proceed to **Quick Mode Flow** (default)

---

## Quick Mode Flow

### Step 1: Gather Initial Input

First, ask the user to share their raw notes, ideas, or thoughts about the product they want to build. Be warm and open-ended:

"I'd love to help you define your product vision. Tell me about the product you're building - share any notes, ideas, or rough thoughts you have. What problem are you trying to solve? Who is it for? Don't worry about structure yet, just share what's on your mind."

Wait for their response before proceeding.

### Step 2: Ask Clarifying Questions

After receiving their input, use the AskUserQuestion tool to ask targeted questions covering all three areas. Ask questions one or two at a time, conversationally, with follow-ups as needed.

#### Product Vision Questions

Shape the core product definition:

- **The product name** - A clear, concise name for the product
- **The core product description** (1-3 sentences that capture the essence)
- **The key problems** the product solves (1-5 specific pain points)
- **How the product solves each problem** (concrete solutions)
- **The main features** that make this possible

**Important:** If the user hasn't already provided a product name, ask them:
- "What would you like to call this product? (A short, memorable name)"

Example questions (adapt based on their input):
- "Who is the primary user of this product? Can you describe them?"
- "What's the single biggest pain point you're addressing?"
- "How do people currently solve this problem without your product?"
- "What makes your approach different or better?"
- "What are the 3-5 most essential features?"

#### Roadmap Questions

Identify the main areas/sections of the product:

- "What are the main areas or screens of this product? (e.g., Dashboard, Settings, Invoices)"
- "What would you consider the most critical area to build first?"
- "Are there any areas that should be separate from the core functionality?"

#### Data Shape Questions

Identify the core entities ("nouns") of the product:

- "What are the main 'things' users will create, view, or manage in this product? (e.g., Projects, Invoices, Clients)"
- "How do these things relate to each other?"

The goal is to gather enough information for all three files before proceeding. Don't need exhaustive detail on every entity — just the core nouns and their relationships.

### Step 3: Auto-Proceed — Create All Three Files

Once you have enough information from the clarifying questions, **immediately proceed** without asking for approval. Write all three files uninterrupted:

#### 3a: Create Product Overview

Create the file at `/product/product-overview.md` with this exact format:

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

#### 3b: Create Product Roadmap

Create `/product/product-roadmap.md` with this exact format:

```markdown
# Product Roadmap

## Sections

### 1. [Section Title]
[One sentence description]

### 2. [Section Title]
[One sentence description]

### 3. [Section Title]
[One sentence description]
```

Sections should be:
- Ordered by development priority
- Self-contained enough to design and build independently
- 3-5 sections (ideal range)
- The numbered format (`### 1. Title`) is required for parsing

#### 3c: Create Data Shape

Create `/product/data-shape/data-shape.md` with this format:

```markdown
# Data Shape

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

Keep descriptions minimal — focus on what each entity represents, not every field it contains. Entity names should be singular (User, Invoice, Project — not Users, Invoices).

#### 3d: Inform the User

After all three files are created, present a summary:

"I've set up the foundation for **[Product Name]**:

1. **Product Overview** — `product/product-overview.md`
2. **Product Roadmap** — `product/product-roadmap.md` ([N] sections)
3. **Data Shape** — `product/data-shape/data-shape.md` ([N] entities)

**Sections:**
1. **[Section 1]** — [Description]
2. **[Section 2]** — [Description]
3. **[Section 3]** — [Description]

**Core Entities:** [Entity1], [Entity2], [Entity3]

Review these files and let me know if you'd like to adjust anything. When you're ready, run `/design-tokens` to choose your color palette and typography, or `/shape-section` to start designing a section."

---

## Deep Interview Mode Flow

In Deep Interview Mode, you explore the product vision thoroughly, one topic at a time. Each major section is drafted in conversation, reviewed by the user, and only then written to file.

**General rules for Deep Mode:**
- Ask **1-2 questions at a time**, never more
- If a response is vague or generic, ask a specific follow-up before moving on
- Present drafts as formatted text in the conversation (not as file writes)
- Only write files after the user approves each draft
- Be conversational and help the user think — don't just transcribe

### Step D1: Expanded Initial Input

"Let's explore your product vision in depth. To start, tell me about what you're building. Share anything — rough notes, ideas, inspirations, even what frustrates you about existing solutions. The more context, the better."

Wait for their response before proceeding.

### Step D2: Vision & Positioning

Explore the core product identity through focused questions. Ask 1-2 at a time:

- **Product name** — "What would you like to call this product?"
- **Core description** — "In 1-3 sentences, how would you describe this product to someone who's never heard of it?"
- **Target audience** — "Who is the primary user? Can you describe a specific person or role that would use this daily?"
- **Personas** — "Are there secondary users or stakeholders? (e.g., admins, managers, clients)"
- **Competition** — "How do people currently solve this problem? What tools or workarounds do they use?"
- **Differentiation** — "What makes your approach fundamentally different or better?"

**Follow-up enforcement:** If the user gives a generic answer like "everyone" for target audience, push for specifics: "Can you narrow that down? Think of one specific person — what's their job title, daily frustration, and what would make them switch to your product?"

### Step D3: Problems & Solutions Deep Dive

Explore each problem-solution pair:

- "What are the top 3-5 pain points your product addresses?"
- For each problem: "How specifically does your product solve this? Walk me through what the user experience would look like."
- "Which of these problems is the #1 reason someone would sign up?"
- **Success metrics** — "How would you measure if you're solving these problems well? What would success look like in 6 months?"

### Step D4: Draft & Approve Product Overview

Present a draft of the product overview in the conversation:

"Here's a draft of your product overview. Please review it — I can adjust anything before we save it:

---
**[Product Name]**

**Description:** [draft description]

**Target Audience:** [draft audience]

**Problems & Solutions:**
1. **[Problem]** — [Solution]
2. **[Problem]** — [Solution]
...

**Key Features:**
- [Feature 1]
- [Feature 2]
...

**Success Metrics:**
- [Metric 1]
- [Metric 2]
---

What would you like to change? Or say 'looks good' and I'll save it."

After approval, write `/product/product-overview.md` with this format:

```markdown
# [Product Name]

## Description
[The finalized description]

## Target Audience
[Who the product is for — personas, roles, characteristics]

## Problems & Solutions

### Problem 1: [Problem Title]
[How the product solves it]

### Problem 2: [Problem Title]
[How the product solves it]

## Key Features
- [Feature 1]
- [Feature 2]

## Success Metrics
- [Metric 1]
- [Metric 2]
```

**Note:** The `## Target Audience` and `## Success Metrics` sections are additional sections that the app's parser safely ignores — they don't break anything but add valuable context for the export/handoff.

### Step D5: Roadmap Exploration

Explore the product's sections/areas:

- "Now let's think about the main areas of your product. What are the distinct screens or sections a user would navigate between?"
- "Which of these is the core experience — the thing users would spend 80% of their time on?"
- "What's the right order to build these? What depends on what?"
- **Prioritization** — "If you could only launch with 2-3 of these sections, which would they be and why?"
- "Are there any sections that could be deferred to a v2?"

### Step D6: Draft & Approve Roadmap

Present a draft:

"Here's the proposed roadmap. Sections are ordered by build priority:

---
1. **[Section Title]** — [Description]
2. **[Section Title]** — [Description]
3. **[Section Title]** — [Description]
---

Would you reorder anything? Add or remove sections? Or does this look right?"

After approval, write `/product/product-roadmap.md` with the standard format:

```markdown
# Product Roadmap

## Sections

### 1. [Section Title]
[One sentence description]

### 2. [Section Title]
[One sentence description]

### 3. [Section Title]
[One sentence description]
```

### Step D7: Data Shape Exploration

Explore the core entities:

- "Let's identify the main 'things' in your system. What will users create, view, edit, or manage?"
- For each entity: "What's the purpose of [Entity]? How does it relate to [other entity]?"
- "Are there any entities that belong to or are owned by other entities?"
- "Is there anything users would search for, filter, or sort by frequently?"

### Step D8: Draft & Approve Data Shape

Present a draft:

"Here are the core entities and their relationships:

---
**Entities:**
- **[Entity]** — [description]
- **[Entity]** — [description]

**Relationships:**
- [Entity1] has many [Entity2]
- [Entity2] belongs to [Entity1]
---

Does this capture the main data concepts? Anything missing or incorrectly related?"

After approval, write `/product/data-shape/data-shape.md` with the standard format:

```markdown
# Data Shape

## Entities

### [EntityName]
[Description]

### [AnotherEntity]
[Description]

## Relationships

- [Entity1] has many [Entity2]
- [Entity2] belongs to [Entity1]
```

### Step D9: Final Summary

After all three files are written, present a comprehensive summary:

"Your product vision is fully defined! Here's what we created:

1. **Product Overview** — `product/product-overview.md`
   - Target audience, problems & solutions, key features, success metrics
2. **Product Roadmap** — `product/product-roadmap.md` ([N] sections)
3. **Data Shape** — `product/data-shape/data-shape.md` ([N] entities)

**Sections (in build order):**
1. **[Section 1]** — [Description]
2. **[Section 2]** — [Description]
3. **[Section 3]** — [Description]

**Core Entities:** [Entity1], [Entity2], [Entity3]

When you're ready, run `/design-tokens` to choose your color palette and typography, or `/shape-section` to start designing a section."

---

## Important Notes

- Be conversational and helpful, not robotic
- Ask follow-up questions when answers are vague
- Help the user think through their product, don't just transcribe
- Keep the final output concise and clear
- The format must match exactly for the app to parse it correctly
- **Always ensure the product has a name** - if user didn't provide one, ask for it
- In Quick Mode: Do NOT present a draft for approval — go straight to writing all three files after gathering enough info
- In Deep Mode: Always present drafts for approval before writing files
- If the user requests changes after reviewing, update the relevant files immediately
