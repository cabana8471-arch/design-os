<!-- v1.0.0 -->

# Product Interview

You are conducting a comprehensive product interview to gather detailed context for Design OS. This command creates `product/product-context.md` which is **required** by all other Design OS commands.

**Language:** Conduct the conversation in Romanian, but write all output files in English.

---

## Step 0: Mode Detection

Parse any arguments to determine interview mode:

```bash
# Available modes:
# --minimal     Quick interview (5 categories only)
# --stage=X     Focus on specific stage (vision, section, shell, data, scale, quality)
# --audit       Check completeness of existing context
# --skip-validation  Bypass validation for existing users
```

**Mode behaviors:**

| Mode                | Categories     | Output                               |
| ------------------- | -------------- | ------------------------------------ |
| Default             | All 12         | Full product-context.md              |
| `--minimal`         | 1, 3, 5, 6, 11 | Quick start context                  |
| `--stage=vision`    | 1, 2           | Foundation + User Research           |
| `--stage=section`   | 5, 6, 7, 11    | Section design context               |
| `--stage=shell`     | 3, 6, 7        | Shell design context                 |
| `--stage=data`      | 4, 10          | Data architecture context            |
| `--stage=scale`     | 8, 9           | Performance + Integration context    |
| `--stage=quality`   | 12             | Testing & Quality context            |
| `--audit`           | N/A            | Report on completeness               |
| `--skip-validation` | All 12         | Skip Step 1 (existing context check) |

---

## Step 1: Check Existing Context

First, check if `product/product-context.md` already exists:

```bash
if [ -f "product/product-context.md" ]; then
  echo "Existing context found"
  # Parse completeness from file
  COMPLETENESS=$(grep "Completeness:" product/product-context.md | grep -oE '[0-9]+' | head -1)
  echo "Current completeness: ${COMPLETENESS}%"
fi
```

**If existing context found:**

Use AskUserQuestion to ask:

"Am găsit context existent pentru produsul tău (${COMPLETENESS}% complet). Ce vrei să facem?"

Options:

- **Revizuim totul** — Pornim de la zero cu întrebări noi
- **Completăm ce lipsește** — Doar categoriile incomplete
- **Vedem ce avem** — Afișează contextul curent, apoi decide

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

Recommendation: Run `/product-interview --stage=X` to complete missing sections.
```

---

## Step 2: Product Foundation

> **Note:** Steps 2-13 correspond to Categories 1-12 in the output file. Step 2 creates Category 1, Step 3 creates Category 2, etc.

**Ro:** "Să începem cu fundația produsului tău."

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
- **Sunt câțiva competitori** — Voi enumera 2-3
- **Piață aglomerată** — Mulți competitori, diferențiez prin X

### Question 2.4: Success Metrics

"Cum vei măsura succesul produsului?"

Prompt for 2-3 KPIs:

- Primary metric (e.g., user signups, revenue, engagement)
- Secondary metrics
- Timeline for measuring success

### Question 2.5: Business Model

"Care e modelul de business?"

Use AskUserQuestion:

Options:

- **Free / Open Source** — No monetization planned
- **Freemium** — Basic free, premium paid
- **Subscription SaaS** — Monthly/annual recurring
- **One-time purchase** — Pay once, use forever
- **Usage-based** — Pay per use/transaction
- **B2B Enterprise** — Sales-led, custom pricing

---

## Step 3: User Research & Personas

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

Options (multiselect):

- **Screen reader users** — Will need ARIA labels, semantic HTML
- **Keyboard-only navigation** — No mouse required
- **Color blindness** — Don't rely on color alone
- **Motor impairments** — Large click targets, reduced precision
- **Cognitive considerations** — Simple language, clear navigation
- **None known** — Standard accessibility is fine

### Question 3.4: Geographic & Language

"Unde sunt localizați utilizatorii tăi? Ce limbi vor folosi?"

Prompt for:

- Primary region(s)
- Primary language
- Multi-language support needed? (Yes/No)

---

## Step 4: Design Direction

**Ro:** "Acum definim direcția vizuală."

### Question 4.1: Aesthetic Tone

Use AskUserQuestion:

"Ce ton estetic vrei pentru produs?"

Options:

- **Professional / Corporate** — Clean, trustworthy, conservative. Good for: B2B, finance, healthcare.
- **Modern / Minimal** — Sleek, spacious, sophisticated. Good for: SaaS, tech products.
- **Bold / Expressive** — Vibrant, energetic, memorable. Good for: Consumer apps, creative tools.
- **Playful / Friendly** — Warm, approachable, fun. Good for: Consumer, education, social.
- **Technical / Dense** — Information-rich, efficient, compact. Good for: Developer tools, analytics, dashboards.

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

**Ro:** "Să discutăm despre structura datelor."

### Question 5.1: Data Sensitivity

Use AskUserQuestion:

"Ce fel de date va gestiona produsul?"

Options (multiselect):

- **Public data** — No sensitivity, freely shareable
- **Internal data** — Business data, not for public
- **Personal data (PII)** — Names, emails, addresses
- **Sensitive personal data** — Health, financial, biometric
- **Financial transactions** — Payments, account balances
- **Authentication credentials** — Passwords, tokens

### Question 5.2: Compliance Requirements

Use AskUserQuestion:

"Ce cerințe de compliance trebuie să respecti?"

Options (multiselect):

- **None specific** — Basic security practices
- **GDPR** — European data protection
- **HIPAA** — US healthcare data
- **SOC 2** — Security/availability certification
- **PCI-DSS** — Payment card data
- **Other** — Describe

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

**Ro:** "Să stabilim pattern-urile de UI."

### Question 7.1: Data Display Preference

Use AskUserQuestion:

"Cum preferi să afișezi liste de date?"

Options:

- **Cards** — Visual, scannable, good for mixed content
- **Table** — Dense, sortable, good for data-heavy views
- **List** — Compact, linear, good for simple items
- **Grid** — Thumbnail-based, good for visual content
- **Depends on context** — Mix based on data type

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

Options:

- **Toast (bottom-right)** — Non-intrusive, auto-dismiss
- **Toast (top-center)** — More visible, auto-dismiss
- **Banner** — Full-width, requires dismissal
- **Inline** — Next to related content
- **Mixed** — Based on importance

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

Options:

- **Modals** — Centered overlay, focused attention
- **Drawers** — Side panel, context preserved
- **Full page** — Navigate to new page
- **Inline expand** — Expand in place
- **Context-dependent** — Mix based on content size

---

## Step 8: Mobile & Responsive

**Ro:** "Să vorbim despre experiența mobilă."

### Question 8.1: Responsive Priority

Use AskUserQuestion:

"Care e prioritatea pentru responsive?"

Options:

- **Desktop-first** — Optimize for desktop, adapt for mobile
- **Mobile-first** — Optimize for mobile, enhance for desktop
- **Equal priority** — Both equally important
- **Desktop only** — Mobile not needed (internal tool)
- **Mobile only** — Mobile app or mobile-first product

### Question 8.2: Touch Interactions

Use AskUserQuestion:

"Ce interacțiuni touch vrei pe mobil?"

Options (multiselect):

- **Standard taps** — Just tapping, no special gestures
- **Swipe actions** — Swipe to delete, archive, etc.
- **Pull to refresh** — Pull down to reload
- **Long press** — Context menu on hold
- **Pinch to zoom** — For images, maps, charts

### Question 8.3: Mobile Navigation

Use AskUserQuestion:

"Ce tip de navigare pe mobil?"

Options:

- **Hamburger menu** — Hidden menu, more space
- **Bottom navigation** — Tabs at bottom, thumb-friendly
- **Tab bar + hamburger** — Main tabs + overflow menu
- **Full-screen menu** — Takeover navigation
- **Depends on complexity** — Simple = tabs, complex = hamburger

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

**Ro:** "Ce integrări externe ai nevoie?"

### Question 10.1: Authentication Provider

Use AskUserQuestion:

"Cum se autentifică utilizatorii?"

Options:

- **Email/password** — Classic username/password
- **Magic link** — Email link, no password
- **OAuth (Google)** — Sign in with Google
- **OAuth (multiple)** — Google, GitHub, etc.
- **SSO/SAML** — Enterprise single sign-on
- **No auth** — Public access only

### Question 10.2: External Services

Use AskUserQuestion:

"Ce servicii externe vei integra?"

Options (multiselect):

- **Payments** — Stripe, PayPal, etc.
- **Maps** — Google Maps, Mapbox
- **File storage** — S3, Cloudinary, etc.
- **Email** — SendGrid, Mailgun, etc.
- **Analytics** — Google Analytics, Mixpanel
- **Chat/Support** — Intercom, Zendesk
- **None for now** — Will add later

### Question 10.3: API Requirements

Use AskUserQuestion:

"Vei expune un API pentru terți?"

Options:

- **No** — Internal use only
- **Read-only API** — Others can read data
- **Full API** — Read and write access
- **Webhook events** — Push notifications to other systems
- **Public API product** — API is the product

---

## Step 11: Security & Compliance

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

Options:

- **No roles** — All users have same access
- **Basic roles** — Admin vs User
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

## Step 12: Error Handling Strategy

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

### 14.2: Generate product-context.md

Create directory and file:

```bash
mkdir -p product
```

Write the file with this structure:

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
| 11. Error Handling Strategy | [✅/⚠️/❌] | [Summary]     |
| 12. Testing & Quality       | [✅/⚠️/❌] | [Summary]     |

---

## 1. Product Foundation

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

## 11. Error Handling Strategy

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

### For /product-vision

- Use sections 1, 2 for product description
- Target audience from 2.1 informs user personas

### For /product-roadmap

- Use section 1 business model for scope
- Use section 8 for complexity estimation

### For /data-model

- Use section 4 for data sensitivity and relationships
- Use section 10 for security requirements

### For /design-tokens

- Use section 3 for aesthetic tone
- Use brand constraints for colors/fonts

### For /design-shell

- Use section 3 for aesthetic tone
- Use section 6 for component preferences
- Use section 7 for mobile navigation

### For /shape-section

- Use section 5 for detailed flows
- Use sections 6, 7 for UI patterns
- Use section 11 for error handling

### For /sample-data

- Use section 4 for data sensitivity
- Use section 5 for edge case data

### For /design-screen

- Use sections 6, 7 for component patterns
- Use section 5 for all states (empty, loading, error)
- Use section 11 for error display

### For /screenshot-design

- Context is not directly consumed (captures existing designs)
- Design decisions in screenshots reflect context from `/design-screen`
- No specific context sections required

### For /export-product

- All sections inform implementation prompts
- Security from section 10 affects deployment docs
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

# 6. Report validation results
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

- Conversația e în română, dar toate fișierele generate sunt în engleză
- Folosește AskUserQuestion cu opțiuni predefinite când e posibil
- Păstrează întrebările concise - nu repeta ce-ai aflat deja
- Dacă utilizatorul dă răspunsuri vagi, cere clarificări
- Validează consistența între răspunsuri (ex: Free/OSS + SSO/SAML = warning)

### Consistency Validation

After completing the interview, check for inconsistencies:

| Check                      | Inconsistency                                    | Action                                                                        |
| -------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| Business Model vs Features | Free/OSS chosen but SSO/SAML or compliance-grade | Warn: "Ai ales Free/OSS dar cu features enterprise. Vrei să ajustăm modelul?" |
| Mobile priority vs Touch   | Mobile-first but no touch interactions           | Warn: "Ai ales mobile-first dar fără interacțiuni touch. E intenționat?"      |
| Real-time vs Scale         | Live updates but 10k+ concurrent users           | Warn: "Real-time cu mulți utilizatori e complex. Sigur ai nevoie?"            |
| Offline vs Data            | Full offline but large file uploads              | Warn: "Offline cu fișiere mari e dificil. Ce prioritizezi?"                   |

### Recovery if Interrupted

> **Important:** The context file is only written at the end of the interview (Step 14). If interrupted before completion, progress is NOT automatically saved.

**To minimize data loss:**

1. **Use shorter modes** — `--minimal` (5 categories, ~15 min) or `--stage=X` (2-4 categories)
2. **Complete in one session** — Plan 30-45 minutes for full interview
3. **Take notes** — Copy important answers externally as you go

**If you must resume:**

1. Re-run `/product-interview`
2. If existing (partial) context is found, choose "Completăm ce lipsește"
3. If no context exists, choose "Revizuim totul" and re-enter previous answers

> **Note:** Step 1 detects existing `product-context.md` and offers to complete missing categories rather than starting over.
