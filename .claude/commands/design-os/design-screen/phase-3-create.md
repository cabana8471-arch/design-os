<!-- v1.0.0 -->

# Phase 3: Component Creation (Steps 6-11)

This phase covers Step 6 (Create Props-Based Component), Step 7 (Sub-Components), Step 8 (Secondary Views), Step 9 (Preview Wrapper), Step 10 (Component Index), Step 11 (Confirmation), plus Important Notes and Recovery Pattern.

---

## Step 6: Create the Props-Based Component

> **Note:** This step creates an **exportable component** — portable to any React codebase because it receives all data via props. It never imports data directly. The preview wrapper (Step 9) handles loading sample data for Design OS previews.

### Create Directory

First, create the necessary directories if they don't exist:

```bash
mkdir -p src/sections/[section-id]/components
```

Then validate the directory was created successfully:

```bash
if [ ! -d "src/sections/[section-id]/components" ]; then
  echo "Error: src/sections/[section-id]/components/ - Directory creation failed. Check write permissions."
  exit 1
fi
```

### Create the Component File

Then create the main component file at `src/sections/[section-id]/components/[ViewName].tsx`.

### Content Container Pattern (MANDATORY)

Every section screen design MUST wrap its content in a standardized container that applies consistent padding based on Information Density from `design-direction.md`.

**Standard Container Template:**

```tsx
export function [ViewName]({ ... }: [ViewName]Props) {
  return (
    <div className="h-full [background] [container-padding]">
      {/* Section content */}
    </div>
  );
}
```

**Container Values by Information Density:**

| Density     | Container Padding   | Background           |
| ----------- | ------------------- | -------------------- |
| Compact     | `px-3 py-3 sm:px-4` | `bg-[neutral]-50/50` |
| Comfortable | `px-4 py-4 sm:px-6` | `bg-[neutral]-50`    |
| Spacious    | `px-6 py-6 sm:px-8` | `bg-[neutral]-50`    |

**Responsive Padding Pattern:**

- Mobile: Use base padding (e.g., `px-4`)
- Tablet+: Use enhanced padding with `sm:` prefix (e.g., `sm:px-6`)

**Dark Mode:**

- Light: `bg-[neutral]-50 dark:bg-[neutral]-950`
- Or: `bg-white dark:bg-[neutral]-900` for card-style containers

**Example with Comfortable density and stone neutral:**

```tsx
export function InvoiceList({ invoices, onView }: InvoiceListProps) {
  return (
    <div className="h-full bg-stone-50 dark:bg-stone-950 px-4 py-4 sm:px-6">
      {/* Section content here */}
    </div>
  );
}
```

**Edge-to-Edge Exception:**

For dashboards or views that NEED full-width content (e.g., large data visualizations):

```tsx
<div className="h-full bg-stone-50 dark:bg-stone-950">
  {/* Full-width header */}
  <div className="px-4 sm:px-6 py-4 border-b">
    <h1>Dashboard</h1>
  </div>

  {/* Full-width content area */}
  <div className="flex-1">{/* Charts, maps, etc. */}</div>
</div>
```

Document the exception with a comment if used.

### Component Structure

The component MUST:

- Import types from the types.ts file
- Accept all data via props (never import data.json directly)
- Accept callback props for all actions
- Be fully self-contained and portable

### Import Path Guidelines

Components in Design OS use relative import paths. Here's how imports work for different file types:

| File Type                               | Import Strategy         | Example                                                                                       |
| --------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| **Types** (types.ts in product/)        | Relative via `@/` alias | `import type { InvoiceListProps } from '@/../product/sections/invoices/types'`                |
| **Sample data** (data.json in product/) | Relative via `@/` alias | `import invoiceData from '@/../product/sections/invoices/data.json'` (preview wrappers only!) |
| **Sub-components** (in same directory)  | Relative path           | `import { StatusBadge } from './StatusBadge'`                                                 |
| **UI components** (shared library)      | Alias path              | `import { Button } from '@/components/ui/button'`                                             |

**Path Resolution:**

- `@/` resolves to `src/` (TypeScript path alias)
- `@/../product/` resolves to the `product/` directory (for types.ts access)
- Relative paths (e.g., `./StatusBadge`) stay within the section's component folder

**Why `@/../product/`?**

- Components live in `src/sections/[section-id]/components/`
- Types live in `product/sections/[section-id]/types.ts`
- The `@/../product/` pattern navigates from `src/` up to root, then into `product/`

**Example with actual paths:**

```tsx
// Component location: src/sections/invoices/components/InvoiceList.tsx
// Types location: product/sections/invoices/types.ts

// Import types using the @/../product/ pattern
import type { InvoiceListProps } from "@/../product/sections/invoices/types";

export function InvoiceList({
  invoices,
  onView,
  onEdit,
  onDelete,
  onCreate,
}: InvoiceListProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Component content here */}

      {/* Example: Using a callback */}
      <button onClick={onCreate}>Create Invoice</button>

      {/* Example: Mapping data with callbacks */}
      {invoices.map((invoice) => (
        <div key={invoice.id}>
          <span>{invoice.clientName}</span>
          <button onClick={() => onView?.(invoice.id)}>View</button>
          <button onClick={() => onEdit?.(invoice.id)}>Edit</button>
          <button onClick={() => onDelete?.(invoice.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Design Requirements

- **Mobile responsive:** Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) and ensure the design layout works gracefully on mobile, tablet and desktop screen sizes.
- **Light & dark mode:** Use `dark:` variants for all colors
- **Use design tokens:** If defined, apply the product's color palette and typography
- **Follow the frontend-design skill:** Create distinctive, memorable interfaces

### Applying Design Tokens

**If `/product/design-system/colors.json` exists:**

- Use the primary color for buttons, links, and key accents
- Use the secondary color for tags, highlights, secondary elements
- Use the neutral color for backgrounds, text, and borders

**If `/product/design-system/typography.json` exists:**

- Note the font choices for reference in comments
- The fonts will be applied at the app level, but use appropriate font weights

**If design tokens don't exist:**

- Fall back to `stone` for neutrals and `lime` for accents (Design OS defaults)

### Design Token Shade Guide

Use specific shades for each UI element type to ensure consistency:

**Primary Color Shades:**
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Primary button background | `[primary]-600` | `[primary]-500` |
| Primary button hover | `[primary]-700` | `[primary]-400` |
| Primary link text | `[primary]-600` | `[primary]-400` |
| Primary accent/highlight | `[primary]-500` | `[primary]-400` |
| Primary badge/tag background | `[primary]-100` | `[primary]-900` |
| Primary badge/tag text | `[primary]-800` | `[primary]-200` |

**Secondary Color Shades:**
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Secondary button background | `[secondary]-100` | `[secondary]-800` |
| Secondary button text | `[secondary]-800` | `[secondary]-100` |
| Secondary badge background | `[secondary]-100` | `[secondary]-900` |
| Secondary badge text | `[secondary]-700` | `[secondary]-200` |
| Subtle highlight | `[secondary]-50` | `[secondary]-900/50` |

**Neutral Color Shades:**
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page background | `[neutral]-50` | `[neutral]-950` |
| Card background | `white` | `[neutral]-900` |
| Border/divider | `[neutral]-200` | `[neutral]-800` |
| Primary text | `[neutral]-900` | `[neutral]-100` |
| Secondary text | `[neutral]-600` | `[neutral]-400` |
| Muted/placeholder text | `[neutral]-400` | `[neutral]-500` |
| Disabled element | `[neutral]-300` | `[neutral]-700` |

**Example Usage:**

```tsx
// Primary button
<button className="bg-lime-600 hover:bg-lime-700 dark:bg-lime-500 dark:hover:bg-lime-400 text-white">
  Save Changes
</button>

// Secondary badge
<span className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
  Active
</span>

// Card with neutral styling
// Note: Replace [neutral] with your neutral color from design tokens (e.g., stone, slate, gray)
<div className="bg-white dark:bg-[neutral]-900 border border-[neutral]-200 dark:border-[neutral]-800">
  <p className="text-[neutral]-900 dark:text-[neutral]-100">Primary text</p>
  <p className="text-[neutral]-600 dark:text-[neutral]-400">Secondary text</p>
</div>
```

### What to Include

- Implement ALL user flows and UI requirements from the spec
- Use the prop data (not hardcoded values)
- Include realistic UI states (hover, active, etc.)
- Use the callback props for all interactive elements
- Handle optional callbacks with optional chaining: `onClick={() => onDelete?.(id)}`

### What NOT to Include

- No `import data from` statements - data comes via props
- No features not specified in the spec
- No routing logic - callbacks handle navigation intent
- No navigation elements (shell handles navigation)

## Step 7: Create Sub-Components (If Needed)

For complex views, break down into sub-components. Each sub-component should also be props-based.

### Component Size Guidelines

**When to split into sub-components:**

| Component Lines | Action                                                    |
| --------------- | --------------------------------------------------------- |
| < 150 lines     | Keep as single component                                  |
| 150-300 lines   | Consider splitting if there are distinct logical sections |
| > 300 lines     | **MUST split** into sub-components for maintainability    |

**Signs a component needs splitting:**

- Multiple distinct UI sections (header, filters, table, pagination)
- Repeated patterns that could be extracted (row components, card components)
- Complex conditional rendering with multiple branches
- More than 5-6 handler functions in one component

**Example split for a 400-line InvoiceList:**

```
InvoiceList.tsx (main - 150 lines)
├── InvoiceFilters.tsx (80 lines)
├── InvoiceTable.tsx (100 lines)
└── InvoicePagination.tsx (70 lines)
```

Create sub-components at `src/sections/[section-id]/components/[SubComponent].tsx`.

Example:

```tsx
import type { Invoice } from "@/../product/sections/[section-id]/types";

interface InvoiceRowProps {
  invoice: Invoice;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function InvoiceRow({
  invoice,
  onView,
  onEdit,
  onDelete,
}: InvoiceRowProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <p className="font-medium">{invoice.clientName}</p>
        <p className="text-sm text-stone-500">{invoice.invoiceNumber}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onView}>View</button>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
```

Then import and use in the main component:

```tsx
import { InvoiceRow } from "./InvoiceRow";

export function InvoiceList({
  invoices,
  onView,
  onEdit,
  onDelete,
}: InvoiceListProps) {
  return (
    <div>
      {invoices.map((invoice) => (
        <InvoiceRow
          key={invoice.id}
          invoice={invoice}
          onView={() => onView?.(invoice.id)}
          onEdit={() => onEdit?.(invoice.id)}
          onDelete={() => onDelete?.(invoice.id)}
        />
      ))}
    </div>
  );
}
```

## Step 8: Create Secondary View Components (If Relationships Exist)

If `CREATE_WIRED_PREVIEW = True` (from Step 4), create the secondary view components now.

**For each secondary view in `VIEWS_TO_CREATE`:**

### Secondary View Component Pattern

Secondary views (drawers, modals, inline panels) receive the **full entity object** rather than just an ID, because the preview wrapper does the lookup.

**Example: Drawer Component**

```tsx
// src/sections/[section-id]/components/AgentDetailDrawer.tsx
import type {
  Agent,
  AgentDetailDrawerProps,
} from "@/../product/sections/[section-id]/types";

export function AgentDetailDrawer({
  agent,
  onClose,
  onEdit,
  onDelete,
}: AgentDetailDrawerProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Header with close button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{agent.name}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Agent details */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-stone-500">Status</label>
          <p className="font-medium">{agent.status}</p>
        </div>
        <div>
          <label className="text-sm text-stone-500">Last Seen</label>
          <p className="font-medium">{agent.lastSeen}</p>
        </div>
        {/* Add more fields based on entity structure */}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={onEdit}
          className="flex-1 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
```

**Example: Modal Component (Create Form)**

```tsx
// src/sections/[section-id]/components/CreateAgentModal.tsx
import type { CreateAgentModalProps } from "@/../product/sections/[section-id]/types";

export function CreateAgentModal({ onClose, onSave }: CreateAgentModalProps) {
  return (
    <div className="space-y-6">
      {/* Modal header */}
      <div>
        <h2 className="text-xl font-semibold">Create New Agent</h2>
        <p className="text-sm text-stone-500">Add a new agent to your system</p>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Agent Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter agent name"
          />
        </div>
        {/* Add more fields as needed */}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            onSave?.({
              /* form data */
            })
          }
          className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700"
        >
          Create Agent
        </button>
      </div>
    </div>
  );
}
```

### Secondary View Props Pattern

The Props interfaces for secondary views should be generated by `/sample-data` in `types.ts`:

```typescript
// For drawer/detail views - receive full entity
export interface AgentDetailDrawerProps {
  agent: Agent;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// For create modals - no entity, just callbacks
export interface CreateAgentModalProps {
  onClose?: () => void;
  onSave?: (agent: Partial<Agent>) => void;
}

// For edit modals - receive entity + save callback
export interface EditAgentModalProps {
  agent: Agent;
  onClose?: () => void;
  onSave?: (agent: Agent) => void;
}
```

### Create Standalone Previews for Secondary Views

Each secondary view also gets its own standalone preview wrapper for isolated testing:

```tsx
// src/sections/[section-id]/AgentDetailDrawerPreview.tsx
import data from "@/../product/sections/[section-id]/data.json";
import { AgentDetailDrawer } from "./components/AgentDetailDrawer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { Agent } from "@/../product/sections/[section-id]/types";

export default function AgentDetailDrawerPreview() {
  // Use first entity from sample data for preview
  const agent = (data.agents as Agent[])[0];

  if (!agent) {
    return (
      <div className="p-8 text-center text-stone-500">
        No sample data available. Run /sample-data first.
      </div>
    );
  }

  return (
    <Sheet defaultOpen>
      <SheetContent>
        <AgentDetailDrawer
          agent={agent}
          onClose={() => console.log("Close drawer")}
          onEdit={() => console.log("Edit agent:", agent.id)}
          onDelete={() => console.log("Delete agent:", agent.id)}
        />
      </SheetContent>
    </Sheet>
  );
}
```

## Step 9: Create the Preview Wrapper

Create a preview wrapper at `src/sections/[section-id]/[ViewName].tsx` (note: this is in the section root, not in components/).

This wrapper is what Design OS renders. It imports the sample data and feeds it to the props-based component.

Example:

```tsx
import data from "@/../product/sections/[section-id]/data.json";
import { InvoiceList } from "./components/InvoiceList";

export default function InvoiceListPreview() {
  return (
    <InvoiceList
      invoices={data.invoices}
      onView={(id) => console.log("View invoice:", id)}
      onEdit={(id) => console.log("Edit invoice:", id)}
      onDelete={(id) => console.log("Delete invoice:", id)}
      onCreate={() => console.log("Create new invoice")}
    />
  );
}
```

The preview wrapper:

- Has a `default` export (required for Design OS routing)
- Imports sample data from data.json
- Passes data to the component via props
- Provides console.log handlers for callbacks (for testing interactions)
- Is NOT exported to the user's codebase - it's only for Design OS
- **Will render inside the shell** if one has been designed

### Wired Preview Wrapper Templates

If `CREATE_WIRED_PREVIEW = True` (from Step 4), use these templates instead of the console.log version.

**Template: Drawer Pattern**

When the spec defines a drawer relationship (e.g., `ListView.onView -> DetailDrawer (drawer, entityId)`):

```tsx
// src/sections/[section-id]/AgentListPreview.tsx
import { useState } from "react";
import data from "@/../product/sections/[section-id]/data.json";
import { AgentList } from "./components/AgentList";
import { AgentDetailDrawer } from "./components/AgentDetailDrawer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { Agent } from "@/../product/sections/[section-id]/types";

export default function AgentListPreview() {
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Lookup entity from sample data
  const selectedAgent = selectedId
    ? (data.agents as Agent[]).find((a) => a.id === selectedId)
    : null;

  // Wire onView callback to open drawer
  const handleView = (id: string) => {
    setSelectedId(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedId(null);
  };

  return (
    <>
      <AgentList
        agents={data.agents}
        onView={handleView}
        onEdit={(id) => console.log("Edit:", id)}
        onCreate={() => console.log("Create")}
      />

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent>
          {selectedAgent ? (
            <AgentDetailDrawer
              agent={selectedAgent}
              onClose={handleCloseDrawer}
              onEdit={() => console.log("Edit:", selectedId)}
              onDelete={() => {
                console.log("Delete:", selectedId);
                handleCloseDrawer();
              }}
            />
          ) : selectedId ? (
            <div className="p-4 text-red-500">
              Error: Agent with ID "{selectedId}" not found in sample data
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
```

**Template: Modal Pattern**

When the spec defines a modal relationship (e.g., `ListView.onCreate -> CreateModal (modal, none)`):

```tsx
// src/sections/[section-id]/AgentListPreview.tsx
import { useState } from "react";
import data from "@/../product/sections/[section-id]/data.json";
import { AgentList } from "./components/AgentList";
import { CreateAgentModal } from "./components/CreateAgentModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AgentListPreview() {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <AgentList
        agents={data.agents}
        onView={(id) => console.log("View:", id)}
        onCreate={() => setIsModalOpen(true)}
        onEdit={(id) => console.log("Edit:", id)}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <CreateAgentModal
            onClose={() => setIsModalOpen(false)}
            onSave={(agent) => {
              console.log("Created:", agent);
              setIsModalOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**Template: Inline Pattern**

When the spec defines an inline relationship (e.g., `ListView.onView -> DetailInline (inline, entityId)`):

```tsx
// src/sections/[section-id]/AgentListPreview.tsx
import { useState } from "react";
import data from "@/../product/sections/[section-id]/data.json";
import { AgentList } from "./components/AgentList";
import { AgentDetailInline } from "./components/AgentDetailInline";
import type { Agent } from "@/../product/sections/[section-id]/types";

export default function AgentListPreview() {
  // Inline expansion state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const expandedAgent = expandedId
    ? (data.agents as Agent[]).find((a) => a.id === expandedId)
    : null;

  return (
    <AgentList
      agents={data.agents}
      expandedId={expandedId}
      expandedContent={
        expandedAgent ? (
          <AgentDetailInline
            agent={expandedAgent}
            onClose={() => setExpandedId(null)}
          />
        ) : null
      }
      onToggle={handleToggle}
      onEdit={(id) => console.log("Edit:", id)}
    />
  );
}
```

**Template: Multiple Relationships (Drawer + Modal)**

When a primary view has multiple relationships:

```tsx
// src/sections/[section-id]/AgentListPreview.tsx
import { useState } from "react";
import data from "@/../product/sections/[section-id]/data.json";
import { AgentList } from "./components/AgentList";
import { AgentDetailDrawer } from "./components/AgentDetailDrawer";
import { CreateAgentModal } from "./components/CreateAgentModal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Agent } from "@/../product/sections/[section-id]/types";

export default function AgentListPreview() {
  // Drawer state (for onView)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modal state (for onCreate)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Lookup selected entity
  const selectedAgent = selectedId
    ? (data.agents as Agent[]).find((a) => a.id === selectedId)
    : null;

  // Handlers
  const handleView = (id: string) => {
    setSelectedId(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedId(null);
  };

  return (
    <>
      <AgentList
        agents={data.agents}
        onView={handleView}
        onCreate={() => setIsCreateModalOpen(true)}
        onEdit={(id) => console.log("Edit:", id)}
      />

      {/* Drawer for viewing details */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent>
          {selectedAgent && (
            <AgentDetailDrawer
              agent={selectedAgent}
              onClose={handleCloseDrawer}
              onEdit={() => console.log("Edit:", selectedId)}
              onDelete={() => {
                console.log("Delete:", selectedId);
                handleCloseDrawer();
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Modal for creating new agent */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <CreateAgentModal
            onClose={() => setIsCreateModalOpen(false)}
            onSave={(agent) => {
              console.log("Created:", agent);
              setIsCreateModalOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Multi-View Preview Wrappers

For sections with multiple views (defined in the spec's `## Views` section), you need to create a separate preview wrapper for each view.

**Workflow for multi-view sections:**

1. Run `/design-screen` for the first view (e.g., "List view")
   - Creates: `src/sections/[section-id]/InvoiceListView.tsx` (preview wrapper)
   - Creates: `src/sections/[section-id]/components/InvoiceList.tsx` (exportable component)
2. Run `/design-screen` again for the second view (e.g., "Detail view")
   - Creates: `src/sections/[section-id]/InvoiceDetailView.tsx` (preview wrapper)
   - Creates: `src/sections/[section-id]/components/InvoiceDetail.tsx` (exportable component)
3. Repeat for each additional view

**File structure after multiple views:**

```
src/sections/invoices/
├── InvoiceListView.tsx       ← Preview wrapper for list view
├── InvoiceDetailView.tsx     ← Preview wrapper for detail view
└── components/
    ├── InvoiceList.tsx       ← Exportable component
    ├── InvoiceDetail.tsx     ← Exportable component
    ├── InvoiceRow.tsx        ← Shared sub-component
    └── index.ts              ← Exports all components
```

**Each preview wrapper is independent:**

- Uses the same `data.json` (shared sample data)
- Passes relevant data to its specific component
- Can reference other views via callbacks (e.g., `onViewDetail` navigates to detail view)

## Step 10: Create Component Index

Create an index file at `src/sections/[section-id]/components/index.ts` to cleanly export all components.

### What to Export

The index file should export:

1. **Main view components** — Always export these
2. **Reusable sub-components** — Export if they may be useful standalone
3. **Props interfaces** — Re-export from types.ts for convenience

### Export Requirements

**Always export:**

- All view components (e.g., `InvoiceList`, `InvoiceDetail`)
- Components that might be reused in other sections

**Optionally export:**

- Internal sub-components used only within this section (e.g., `InvoiceRow`)
- Helper components that aren't standalone (consider keeping private)

**Re-export Props interfaces:**

- Include Props interfaces so consumers can import from one location
- This makes the component API more discoverable

**Where do Props come from?**
Props interfaces are defined in `product/sections/[section-id]/types.ts` by the `/sample-data` command. The types.ts file contains BOTH:

- Entity types (e.g., `Invoice`, `LineItem`) — describe the data structure
- Props interfaces (e.g., `InvoiceListProps`) — describe component inputs including data and callbacks

Components import Props from types.ts, not define them locally. This ensures Props interfaces are consistent with the data model.

### Example index.ts

```tsx
// Re-export components
export { InvoiceList } from "./InvoiceList";
export { InvoiceDetail } from "./InvoiceDetail";
export { InvoiceRow } from "./InvoiceRow";

// Re-export Props interfaces for convenience
export type {
  InvoiceListProps,
  InvoiceDetailProps,
} from "@/../product/sections/[section-id]/types";

// Optionally re-export entity types if useful
export type {
  Invoice,
  LineItem,
} from "@/../product/sections/[section-id]/types";
```

### When NOT to Export

Keep components private (don't export) if:

- They're highly specific to a single parent component
- They contain hardcoded layout assumptions
- They're being refactored and the API is unstable

**Note:** During export (`/export-product`), the import paths will be transformed to relative paths (e.g., `../types`).

## Step 11: Confirm and Next Steps

Let the user know:

"I've created the screen design for **[Section Title]**:

**Exportable components** (props-based, portable):

- `src/sections/[section-id]/components/[ViewName].tsx`
- `src/sections/[section-id]/components/[SubComponent].tsx` (if created)
- `src/sections/[section-id]/components/index.ts`

**Preview wrapper** (for Design OS only):

- `src/sections/[section-id]/[ViewName].tsx`

**Important:** Restart your dev server to see the changes.

[If shell exists]: The screen design will render inside your application shell, showing the full app experience.

[If design tokens exist]: I've applied your color palette ([primary], [secondary], [neutral]) and typography choices.

**Next steps:**

- Run `/screenshot-design` to capture a screenshot of this screen design for documentation
- If the spec calls for additional views, run `/design-screen` again to create them
- When all sections are complete, run `/export-product` to generate the complete export package"

If the spec indicates additional views are needed:

"The specification also calls for [other view(s)]. Run `/design-screen` again to create those, then `/screenshot-design` to capture each one."

### View Progress Tracking

After creating a component, check and report the view progress for multi-view sections:

```bash
# Count views from spec (lines starting with "- " under ## Views section)
SPEC_VIEWS=$(sed -n '/^## Views$/,/^## /p' product/sections/[section-id]/spec.md | grep -c '^- ')

# Count created components (excluding index.ts)
CREATED=$(ls src/sections/[section-id]/components/*.tsx 2>/dev/null | grep -v index.ts | wc -l | tr -d ' ')

if [ "$SPEC_VIEWS" -gt 0 ] && [ "$CREATED" -lt "$SPEC_VIEWS" ]; then
  REMAINING=$((SPEC_VIEWS - CREATED))
  echo "Progress: $CREATED of $SPEC_VIEWS views created. $REMAINING view(s) remaining."
fi
```

**Report to user:**

- For single-view sections: No additional message needed
- For multi-view sections: "Progress: Created X of Y views. Z view(s) remaining: [list pending view names]"

This helps users track their progress and ensures all views are completed before running `/export-product`.

## Important Notes

- ALWAYS read the `frontend-design` skill before creating screen designs
- Components MUST be props-based - never import data.json in exportable components
- The preview wrapper is the ONLY file that imports data.json
- Use TypeScript interfaces from types.ts for all props
- Callbacks should be optional (use `?`) and called with optional chaining (`?.`)
- Always remind the user to restart the dev server after creating files
- Sub-components should also be props-based for maximum portability
- Apply design tokens when available for consistent branding
- Screen designs render inside the shell when viewed in Design OS (if shell exists)
- For Lucide icons, follow stroke width conventions (see agents.md → "Icon Stroke Width Convention")

### Path Alias Validation (`@/` and `@/../`)

Screen design components use the `@/` path alias for imports. Before creating components, verify the alias is configured:

**Expected tsconfig.json configuration:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

> **How `@/../product/` works:**
>
> The `@/../product/` pattern is NOT a separate alias — it combines the `@/` alias with relative path navigation:
>
> 1. `@/` resolves to `./src/`
> 2. `../` navigates up from `src/` to the project root
> 3. `product/` enters the product directory
>
> **Result:** `@/../product/sections/invoices/types` → `./src/../product/sections/invoices/types` → `./product/sections/invoices/types`
>
> This pattern requires only the standard `@/*` alias configuration — no additional paths needed.

**Import patterns used in screen designs:**
| Pattern | Resolves To | Use Case |
|---------|-------------|----------|
| `@/components/ui/button` | `./src/components/ui/button` | UI components |
| `@/lib/utils` | `./src/lib/utils` | Utilities |
| `@/../product/sections/[id]/types` | `./product/sections/[id]/types` | Section types |
| `@/../product/sections/[id]/data.json` | `./product/sections/[id]/data.json` | Sample data (preview only) |

**Troubleshooting:**

| Issue              | Symptom                           | Fix                                       |
| ------------------ | --------------------------------- | ----------------------------------------- |
| Missing path alias | `Cannot find module '@/...'`      | Add `paths` to tsconfig.json              |
| Wrong baseUrl      | Imports resolve incorrectly       | Set `baseUrl: "."` in tsconfig.json       |
| Vite not resolving | Works in IDE but fails at runtime | Check `vite.config.ts` has matching alias |

**Vite alias configuration (if needed):**

```ts
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

---

## Recovery Pattern

If component creation fails, follow these recovery steps:

### Directory Issues

```bash
# Check write permissions
ls -la src/sections/[section-id]/

# Verify directory exists, create if missing
mkdir -p src/sections/[section-id]/components

# Retry the component creation step
```

### TypeScript Compilation Errors

```bash
# See all TypeScript errors
npm run type-check

# Common fixes:
# 1. Verify props interfaces match data.json structure
# 2. Check that all imports resolve correctly
# 3. Ensure component uses correct prop types from types.ts
```

### Import Resolution Errors

| Error                                 | Cause                     | Fix                                 |
| ------------------------------------- | ------------------------- | ----------------------------------- |
| `Cannot find module '@/...'`          | Path alias not configured | Check tsconfig.json paths           |
| `Cannot find module '../product/...'` | Wrong relative path       | Use `@/../product/` prefix          |
| `Type 'X' is not assignable`          | Props mismatch            | Compare component props to types.ts |

### Preview Not Loading

```bash
# Check dev server is running
lsof -i :3000

# Start if needed
npm run dev

# Navigate to: http://localhost:3000/sections/[section-id]/[view-name]
```

### Rollback Steps

If the component is fundamentally broken:

1. Delete the generated files: `rm -rf src/sections/[section-id]/`
2. Review the spec.md for clarity
3. Re-run `/design-screen` with clearer instructions
