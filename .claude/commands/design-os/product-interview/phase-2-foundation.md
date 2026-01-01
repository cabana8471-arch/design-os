<!-- v1.0.0 -->

# Phase 2: Foundation Categories (1-6)

This phase covers Steps 2-7: Product Foundation, User Research, Design Direction, Data Architecture, Section-Specific Depth, and UI Patterns.

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
>
> **Required vs Optional Questions:**
>
> | Type            | Indicator                      | Category Status if Skipped            |
> | --------------- | ------------------------------ | ------------------------------------- |
> | **Required**    | No indicator (default)         | ⚠️ Partial                            |
> | **Optional**    | Marked "(optional)"            | No impact on status                   |
> | **Conditional** | Part B of multi-part questions | ⚠️ Partial only if Part A requires it |
>
> By default, all questions are **required** unless explicitly marked "(optional)". Questions marked "(optional)" typically gather enhancement details that don't affect core design decisions.

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
> 5. **Revisiting Part A:**
>    - If user requests to change Part A after seeing Part B options, allow it
>    - Re-ask Part A, then proceed to appropriate Part B based on new answer
>    - This is a valid workflow — user may learn from Part B options what they actually need
> 6. **Part B with >4 options:**
>    - If Part B has more than 4 options, split into sub-parts OR use free-text with examples
>    - Example split: "Dintre acestea, care sunt prioritare?" → present 2-4 options at a time
>    - Example free-text: "Ce integrări specifice ai nevoie? (ex: Stripe, Google OAuth, Twilio)"

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

> **Note:** Mono/code font selection is handled by `/design-tokens` (defaults to IBM Plex Mono). Only collect general font preferences here.

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

**Next:** Continue to Phase 3 (Steps 8-13) for depth categories.
