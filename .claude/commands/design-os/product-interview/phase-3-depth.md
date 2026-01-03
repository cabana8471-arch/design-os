<!-- v1.0.1 -->

# Phase 3: Depth Categories (7-12)

This phase covers Steps 8-13: Mobile & Responsive, Performance & Scale, Integration Points, Security & Compliance, Error Handling, and Testing & Quality.

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

Use AskUserQuestion with `multiSelect: true`:

"Ce browsere trebuie să suporți? (Poți selecta mai multe)"

Options:

- **Modern only** — Chrome, Firefox, Safari, Edge (latest)
- **Include Safari iOS** — Mobile Safari support
- **Include older browsers** — IE11, older Edge
- **Progressive enhancement** — Basic works everywhere, best in modern

> **Note:** With exactly 4 options and `multiSelect: true`, this question stays within AskUserQuestion limits. Record all selected options in the output, e.g., "Modern only, Include Safari iOS".

---

**Next:** Continue to Phase 4 (Step 14) for synthesis and output.
