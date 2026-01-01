<!-- v1.0.0 -->

# Phase 4: Documentation (Steps 10-12)

This phase generates section READMEs, shell README, and consolidates the data model.

---

## Step 10: Generate Section READMEs

For each section, create `product-plan/sections/[section-id]/README.md`:

````markdown
# [Section Title]

## Overview

[From spec.md overview]

## User Flows

[From spec.md user flows]

## Design Decisions

[Notable design choices from the screen design]

## Data Used

**Entities:** [List entities from types.ts]

**From global model:** [Which entities from data model are used]

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `[Component]` — [Brief description]
- `[SubComponent]` — [Brief description]

## Callback Props

| Callback   | Description                             |
| ---------- | --------------------------------------- |
| `onView`   | Called when user clicks to view details |
| `onEdit`   | Called when user clicks to edit         |
| `onDelete` | Called when user clicks to delete       |
| `onCreate` | Called when user clicks to create new   |

[Adjust based on actual Props interface]

## View Relationships

[Only include this section if spec.md contains a `## View Relationships` section]

These relationships show how views connect. Implement state management in your app to wire callbacks to secondary views.

| Primary View  | Callback | Secondary View    | Type   | Notes                               |
| ------------- | -------- | ----------------- | ------ | ----------------------------------- |
| AgentListView | onView   | AgentDetailDrawer | drawer | Opens side panel with agent details |
| AgentListView | onCreate | CreateAgentModal  | modal  | Opens centered dialog for new agent |

**Implementation pattern for drawers:**

```tsx
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);

// Wire callback to open drawer
const handleView = (id: string) => {
  setSelectedId(id);
  setIsDrawerOpen(true);
};
```
````

**Implementation pattern for modals:**

```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

// Wire callback to open modal
const handleCreate = () => {
  setIsModalOpen(true);
};
```

> **Note:** In Design OS, preview wrappers handle this wiring. In your production codebase, implement state management using your preferred pattern (useState, Zustand, Redux, etc.).

`````

### View Relationships Documentation

When copying section specs to export, check for `## View Relationships` in `product/sections/[section-id]/spec.md`. If present:

1. **Copy to README.md:** Include the "View Relationships" section in the section README (template above)
2. **Add implementation hints:** Include the state management patterns shown above
3. **Note the wiring:** Explain that callbacks need to be connected to state

**What NOT to export:**
- Preview wrappers (`src/sections/[id]/[ViewName].tsx`) — these are Design OS specific
- Wiring code — implementation depends on the target codebase's state management

**What TO export:**
- Relationship documentation — helps developers understand the intended UX
- Implementation patterns — provides starting points for wiring

## Step 10.5: Generate Shell README

**Skip this section if `INCLUDE_SHELL` is false** (user chose to proceed without shell in Step 1).

Create `product-plan/shell/README.md` to document the shell design and all its components:

````markdown
# Application Shell

## Overview

[From product/shell/spec.md overview section]

## Layout Pattern

[From spec.md - sidebar, top nav, or minimal]

## Components

### Primary Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `AppShell` | Main shell wrapper | children, navigationItems, user, onNavigate, onLogout, ... |
| `MainNav` | Navigation sidebar/bar | items, onNavigate, collapsed |
| `UserMenu` | User dropdown menu | user, onLogout, onProfileClick, onSettingsClick |

### Secondary Components

[List only components that were created. Skip if none exist.]

| Component | Type | Purpose | Props |
|-----------|------|---------|-------|
| `NotificationsDrawer` | drawer | Shows user notifications | notifications, onClose, onMarkRead |
| `SearchModal` | modal | Command palette (Cmd+K) | onClose, onSelect, recentItems |
| `ThemeToggle` | inline | Theme switcher | (uses local state) |
| `SettingsModal` | modal | App settings | settings, onClose, onSave |
| `ProfileModal` | modal | User profile editor | user, onClose, onSave |
| `HelpPanel` | drawer | Help and documentation | topics, onClose |
| `FeedbackModal` | modal | Feedback form | onClose, onSubmit |
| `MobileMenuDrawer` | drawer | Mobile navigation | navigationItems, onClose, onNavigate |

## Shell Relationships

[From product/shell/spec.md ## Shell Relationships section, if exists]

These relationships show how shell triggers connect to secondary components:

| Trigger | Action | Component | Type | Data |
|---------|--------|-----------|------|------|
| HeaderAction | notifications | NotificationsDrawer | drawer | notifications |
| HeaderAction | search | SearchModal | modal | none |
| UserMenu | profile | ProfileModal | modal | user |
| UserMenu | settings | SettingsModal | modal | settings |

**Implementation pattern for shell secondary components:**

```tsx
// In your app shell or layout component
const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
const [isSearchOpen, setIsSearchOpen] = useState(false)

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setIsSearchOpen(true)
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])

return (
  <>
    <AppShell
      onHeaderAction={(actionId) => {
        if (actionId === 'notifications') setIsNotificationsOpen(true)
        if (actionId === 'search') setIsSearchOpen(true)
      }}
      onProfileClick={() => setIsProfileOpen(true)}
      onSettingsClick={() => setIsSettingsOpen(true)}
    >
      {children}
    </AppShell>

    <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
      <SheetContent>
        <NotificationsDrawer
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </SheetContent>
    </Sheet>

    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <DialogContent>
        <SearchModal onClose={() => setIsSearchOpen(false)} />
      </DialogContent>
    </Dialog>
  </>
)
```

## Sample Data

See `sample-data.json` for example data for shell components (notifications, user, settings).

## Types

See `types.ts` for TypeScript interfaces for all shell component props.

## Visual Reference

See `screenshot.png` for the shell visual design (if captured).

## Responsive Behavior

- **Desktop:** [From spec.md responsive behavior]
- **Tablet:** [From spec.md]
- **Mobile:** [From spec.md]

## Design Notes

[From spec.md design notes section, if exists]
`````

## Step 11: Consolidate Data Model Types

Create unified type definitions and documentation for the entire data model in the export package.

### Create data-model/types.ts

Create `product-plan/data-model/types.ts` by consolidating types from all sections:

1. **Read the global data model:**
   - If `/product/data-model/data-model.md` exists, extract entity descriptions

2. **Consolidate all section types:**
   - For each section, read `product/sections/[section-id]/types.ts`
   - Extract all exported interfaces (exclude component Props interfaces)
   - Combine into a single consolidated types file

   **Handling Type Conflicts:**

   When the same type name appears in multiple sections with different definitions:

   | Scenario                         | Resolution                    | Action                                                      |
   | -------------------------------- | ----------------------------- | ----------------------------------------------------------- |
   | Global data model exists         | Global model is authoritative | Use the definition from `/product/data-model/data-model.md` |
   | No global model, types differ    | First section wins            | Use the first section's definition (alphabetical order)     |
   | No global model, types identical | Dedupe                        | Use shared definition once                                  |

   **When global data model exists but section type diverges:**

   If a section defines a type that differs from the global data model (different fields, types, or structure):
   1. Use the global data model definition (it is authoritative)
   2. Add a JSDoc comment above the type noting the divergence:
      ```typescript
      /**
       * Note: Section [section-id] defines additional/different fields for this type.
       * Global data model definition is authoritative. Review section types if needed.
       */
      ```
   3. Report the divergence to the user:
      ```
      Type divergence detected:
      - `[TypeName]`: global model used, section [section-id] has different definition
      Consider updating the global data model or section types for consistency.
      ```

   **When no global data model exists:**
   1. Sort sections alphabetically by section ID
   2. For each conflicting type, use the definition from the first section in sort order
   3. Add a JSDoc comment above the type noting the conflict:
      ```typescript
      /**
       * Note: This type is defined differently in sections [section-a] and [section-b].
       * Using definition from [section-a]. Review and consolidate if needed.
       */
      ```
   4. Report all conflicts to the user with this message format:
      ```
      Type conflicts detected (no global data model):
      - `[TypeName]`: defined in [section-a] (USED), [section-b] (SKIPPED)
      Consider running /data-model to create a global data model for consistency.
      ```

3. **Add JSDoc comments:**
   - Include descriptions from the global data model
   - Document relationships between entities
   - Add usage examples where helpful

4. **Export everything:**
   - Export all entity interfaces
   - Export any enums or type unions used across sections

**Example structure:**

```typescript
// =============================================================================
// Global Entity Types (from Data Model)
// =============================================================================

/** Represents a user in the system */
export interface User {
  id: string;
  name: string;
  email: string;
  // ... other fields
}

/** Represents a project managed by users */
export interface Project {
  id: string;
  name: string;
  ownerId: string; // References User.id
  // ... other fields
}

// =============================================================================
// Section-Specific Types
// =============================================================================

// From [Section 1]
export interface Task {
  id: string;
  projectId: string; // References Project.id
  // ... other fields
}

// From [Section 2]
export interface Document {
  id: string;
  projectId: string;
  // ... other fields
}

// =============================================================================
// Relationships & Documentation
// =============================================================================

/**
 * Type relationships in this product:
 * - User "owns" many Projects
 * - Project "contains" many Tasks
 * - Project "contains" many Documents
 */
```

### Create data-model/README.md

Create `product-plan/data-model/README.md` to document the data model:

```markdown
# Data Model

## Overview

[If global data model exists: "This product uses the following core entities:"]
[If not: "The following entities are used across sections:"]

## Entities

### [Entity 1]

[Description from data model or inferred from types]

- Fields: [List key fields]
- Relationships: [How it connects to other entities]

### [Entity 2]

[Repeat for all entities]

## Relationships

[Document how entities connect to each other]

- Users own Projects
- Projects contain Tasks
- etc.

## Sample Data

See `sample-data.json` for example data for each entity.

## Usage in Implementation

When building the product, these entity types should map to:

- Database schema
- API response models
- Component props and state

All sections use these shared types to ensure data consistency across the application.
```

### Create data-model/sample-data.json

Consolidate sample data from all sections:

```json
{
  "_meta": {
    "models": {
      "users": "Users of the application",
      "projects": "Projects owned and managed by users",
      "tasks": "Individual tasks within projects"
    },
    "relationships": [
      "Each User can own multiple Projects",
      "Each Project contains multiple Tasks"
    ]
  },
  "users": [
    {
      /* sample user data */
    }
  ],
  "projects": [
    {
      /* sample project data */
    }
  ],
  "tasks": [
    {
      /* sample task data */
    }
  ]
}
```

## Step 12: Generate Section Test Instructions

For each section, create `product-plan/sections/[section-id]/tests.md` with detailed test-writing instructions based on the section's spec, user flows, and UI design.

````markdown
# Test Instructions: [Section Title]

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

[Brief description of what this section does and the key functionality to test]

---

## User Flow Tests

### Flow 1: [Primary User Flow Name]

**Scenario:** [Describe what the user is trying to accomplish]

#### Success Path

**Setup:**

- [Preconditions - what state the app should be in]
- [Sample data to use - reference types from types.ts]

**Steps:**

1. User navigates to [page/route]
2. User sees [specific UI element - be specific about labels, text]
3. User clicks [specific button/link with exact label]
4. User enters [specific data in specific field]
5. User clicks [submit button with exact label]

**Expected Results:**

- [ ] [Specific UI change - e.g., "Success toast appears with message 'Item created'"]
- [ ] [Data assertion - e.g., "New item appears in the list"]
- [ ] [State change - e.g., "Form is cleared and reset to initial state"]
- [ ] [Navigation - e.g., "User is redirected to /items/:id"]

#### Failure Path: [Specific Failure Scenario]

**Setup:**

- [Conditions that will cause failure - e.g., "Server returns 500 error"]

**Steps:**

1. [Same steps as success path, or modified steps]

**Expected Results:**

- [ ] [Error handling - e.g., "Error message appears: 'Unable to save. Please try again.'"]
- [ ] [UI state - e.g., "Form data is preserved, not cleared"]
- [ ] [User can retry - e.g., "Submit button remains enabled"]

#### Failure Path: [Validation Error]

**Setup:**

- [Conditions - e.g., "User submits empty required field"]

**Steps:**

1. User leaves [specific field] empty
2. User clicks [submit button]

**Expected Results:**

- [ ] [Validation message - e.g., "Field shows error: 'Name is required'"]
- [ ] [Form state - e.g., "Form is not submitted"]
- [ ] [Focus - e.g., "Focus moves to first invalid field"]

---

### Flow 2: [Secondary User Flow Name]

[Repeat the same structure for additional flows]

---

## Empty State Tests

Empty states are critical for first-time users and when records are deleted. Test these thoroughly:

### Primary Empty State

**Scenario:** User has no [primary records] yet (first-time or all deleted)

**Setup:**

- [Primary data collection] is empty (`[]`)

**Expected Results:**

- [ ] [Empty state message is visible - e.g., "Shows heading 'No projects yet'"]
- [ ] [Helpful description - e.g., "Shows text 'Create your first project to get started'"]
- [ ] [Primary CTA is visible - e.g., "Shows button 'Create Project'"]
- [ ] [CTA is functional - e.g., "Clicking 'Create Project' opens the create form/modal"]
- [ ] [No blank screen - The UI is helpful, not empty or broken]

### Related Records Empty State

**Scenario:** A [parent record] exists but has no [child records] yet

**Setup:**

- [Parent record] exists with valid data
- [Child records collection] is empty (`[]`)

**Expected Results:**

- [ ] [Parent renders correctly with its data]
- [ ] [Child section shows empty state - e.g., "Shows 'No tasks yet' in the tasks panel"]
- [ ] [CTA to add child record - e.g., "Shows 'Add Task' button"]
- [ ] [No broken layouts or missing sections]

### Filtered/Search Empty State

**Scenario:** User applies filters or search that returns no results

**Setup:**

- Data exists but filter/search matches nothing

**Expected Results:**

- [ ] [Clear message - e.g., "Shows 'No results found'"]
- [ ] [Guidance - e.g., "Shows 'Try adjusting your filters' or similar"]
- [ ] [Reset option - e.g., "Shows 'Clear filters' link"]

---

## Component Interaction Tests

### [Component Name]

**Renders correctly:**

- [ ] [Specific element is visible - e.g., "Displays item title 'Sample Item'"]
- [ ] [Data display - e.g., "Shows formatted date 'Dec 12, 2025'"]

**User interactions:**

- [ ] [Click behavior - e.g., "Clicking 'Edit' button calls onEdit with item id"]
- [ ] [Hover behavior - e.g., "Hovering row shows action buttons"]
- [ ] [Keyboard - e.g., "Pressing Escape closes the modal"]

**Loading and error states:**

- [ ] [Loading - e.g., "Shows skeleton loader while data is fetching"]
- [ ] [Error - e.g., "Shows error message when data fails to load"]

---

## Edge Cases

- [ ] [Edge case 1 - e.g., "Handles very long item names with text truncation"]
- [ ] [Edge case 2 - e.g., "Works correctly with 1 item and 100+ items"]
- [ ] [Edge case 3 - e.g., "Preserves data when navigating away and back"]
- [ ] [Transition from empty to populated - e.g., "After creating first item, list renders correctly"]
- [ ] [Transition from populated to empty - e.g., "After deleting last item, empty state appears"]

---

## Accessibility Checks

- [ ] [All interactive elements are keyboard accessible]
- [ ] [Form fields have associated labels]
- [ ] [Error messages are announced to screen readers]
- [ ] [Focus is managed appropriately after actions]

---

## Sample Test Data

Use the data from `sample-data.json` or create variations:

[Include 2-3 example data objects based on types.ts that tests can use]

```typescript
// Example test data - populated state
const mockItem = {
  id: "test-1",
  name: "Test Item",
  // ... other fields from types.ts
};

const mockItems = [mockItem /* ... more items */];

// Example test data - empty states
const mockEmptyList = [];

const mockItemWithNoChildren = {
  id: "test-1",
  name: "Test Item",
  children: [], // No related records
};

// Example test data - error states
const mockErrorResponse = {
  status: 500,
  message: "Internal server error",
};
```
````

---

## Notes for Test Implementation

- Mock API calls to test both success and failure scenarios
- Test each callback prop is called with correct arguments
- Verify UI updates optimistically where appropriate
- Test that loading states appear during async operations
- Ensure error boundaries catch and display errors gracefully
- **Always test empty states** — Pass empty arrays to verify helpful empty state UI appears (not blank screens)
- Test transitions: empty → first item created, last item deleted → empty state returns

```

### Guidelines for Writing tests.md

When generating tests.md for each section:

1. **Read the spec.md thoroughly** — Extract all user flows and requirements
2. **Study the screen design components** — Note exact button labels, field names, UI text
3. **Review types.ts** — Understand the data shapes for assertions
4. **Include specific UI text** — Tests should verify exact labels, messages, placeholders
5. **Cover success and failure paths** — Every action should have both tested
6. **Always test empty states** — Primary lists with no items, parent records with no children, filtered results with no matches
7. **Be specific about assertions** — "Shows error" is too vague; "Shows red border and message 'Email is required' below the field" is specific
8. **Include edge cases** — Boundary conditions, transitions between empty and populated states
9. **Stay framework-agnostic** — Describe WHAT to test, not HOW to write the test code

---

**Next Phase:** Continue to `phase-5-prompts.md` for Steps 13-14 (design system and prompt generation).
```
