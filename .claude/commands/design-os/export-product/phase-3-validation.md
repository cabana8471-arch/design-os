<!-- v1.0.0 -->

# Phase 3: Component Validation and Copying (Steps 8-9)

This phase validates all components are portable and copies them to the export package.

---

## Step 8: Validate All Components

Before proceeding with export, validate that all components are portable and follow the props-based pattern. This is a **blocking step** — the export cannot proceed if validation fails.

### Validate Shell Components

**Skip this section if `INCLUDE_SHELL` is false** (user chose to proceed without shell in Step 1).

Validate ALL shell components at `src/shell/components/` (primary AND secondary):

**Primary components (always validated):**

- `AppShell.tsx` — Main shell wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu component
- `index.ts` — Component exports

**Secondary components (validate if they exist):**

- `NotificationsDrawer.tsx`
- `SearchModal.tsx`
- `ThemeToggle.tsx`
- `SettingsModal.tsx`
- `ProfileModal.tsx`
- `HelpPanel.tsx`
- `FeedbackModal.tsx`
- `MobileMenuDrawer.tsx`

**List all shell components to validate:**

```bash
# Get all shell components (excluding index.ts)
SHELL_COMPONENTS=$(ls -1 src/shell/components/*.tsx 2>/dev/null | xargs -I {} basename {} .tsx)
echo "Validating shell components: $SHELL_COMPONENTS"
```

For EACH shell component file, validate:

1. **Check imports:**
   - [ ] No static data imports: `import data from '@/../product/...'`
   - [ ] No dynamic data imports: `import('@/../product/...')` or `await import('@/../product/...')`
   - [ ] No CommonJS data imports: `require('@/../product/...')`
   - [ ] No direct imports of `.json` files (static, dynamic, or require)
   - [ ] Only imports from external libraries or relative component files

2. **Check component structure:**
   - [ ] Component accepts all data via props
   - [ ] All callbacks are optional and use optional chaining: `onAction?.()`
   - [ ] No state management code (useState, useContext, etc.) — _EXCEPTION: Secondary components like ThemeToggle MAY use useState for local UI state_
   - [ ] No routing logic or navigation calls

3. **Check Props interface (primary components only):**

```bash
# Validate primary shell components export Props interfaces
for component in AppShell MainNav UserMenu; do
  if [ -f "src/shell/components/${component}.tsx" ]; then
    if ! grep -q "export interface ${component}Props" "src/shell/components/${component}.tsx"; then
      echo "Warning: ${component}.tsx missing Props interface export"
    fi
  fi
done
```

**Note:** Secondary components (drawers, modals) may use local useState for their open/close state. This is acceptable as long as:

- Data still comes via props
- Callbacks notify parent components
- No global state management (Zustand, Redux, etc.)

### Validate Section Components

For each section, validate all component files in `src/sections/[section-id]/components/`:

1. **Check imports:**
   - [ ] No static data imports: `import data from '@/../product/...'`
   - [ ] No dynamic data imports: `import('@/../product/...')` or `await import('@/../product/...')`
   - [ ] No CommonJS data imports: `require('@/../product/...')`
   - [ ] No direct imports of `.json` files (static, dynamic, or require)
   - [ ] Types imported from `@/../product/sections/[section-id]/types` (these will be transformed to `../types`)

2. **Check component structure:**
   - [ ] Component accepts all data via props
   - [ ] All callbacks are optional and use optional chaining: `onAction?.()`
   - [ ] No state management code (useState, useContext, etc.)
   - [ ] No routing logic or navigation calls

**Automated Props-Based Validation Script:**

```bash
# Validate section components are props-based (don't import data.json directly)
VALIDATION_ERRORS=0

for section_dir in src/sections/*/; do
  section_id=$(basename "$section_dir")

  for component in "$section_dir"components/*.tsx; do
    [ -f "$component" ] || continue
    component_name=$(basename "$component")

    # Check for direct data.json imports
    if grep -qE "import.*from.*data\.json" "$component"; then
      echo "Error: $section_id/$component_name imports data.json directly. Components must receive data via props."
      VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi

    # Check for product directory imports
    if grep -qE "from ['\"].*product/" "$component"; then
      echo "Error: $section_id/$component_name imports from product/ directory. Use relative imports or props instead."
      VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi

    # Check component has a Props interface
    if ! grep -qE "(interface|type).*Props" "$component"; then
      echo "Warning: $section_id/$component_name missing Props interface. Components should define props for portability."
      # This is a warning, not an error - component may still work without explicit Props
    fi
  done
done

if [ $VALIDATION_ERRORS -gt 0 ]; then
  echo ""
  echo "Found $VALIDATION_ERRORS props-based validation error(s). Fix before exporting."
  exit 1
fi
```

### Validate Sub-Components (Recursive)

Components may import other components. Validate the full dependency tree with a **maximum depth of 10 levels** to prevent infinite loops from circular imports.

> **Clarification:** "10 levels" means depth values 0 through 10 (where 0 is the root component). The check `if depth > 10` stops recursion at depth 11, allowing up to 10 nested import levels from the root.

**Recursion Limits and Stopping Conditions:**

| Condition                                 | Action                                 |
| ----------------------------------------- | -------------------------------------- |
| Max depth reached (10 levels)             | Stop recursion, warn user              |
| Component already visited in current path | Circular import detected, report error |
| No more local imports                     | Stop recursion (base case)             |
| Import file doesn't exist                 | Report missing dependency, stop branch |

**Step 1: Build dependency graph**

For each component file, extract its local imports:

```bash
# Find components imported by each file
for component in src/sections/*/components/*.tsx; do
  # Extract imports like: import { Button } from './Button'
  grep -E "^import.*from '\\./" "$component" | sed "s/.*from '\\.\\/\\([^']*\\)'.*/\\1/"
done
```

**Step 2: Validate all imported components (with depth tracking)**

For each component referenced in imports:

1. Check if current depth > 10 → Stop with warning: "Max recursion depth reached. Component tree may be too deep or contain cycles."
2. Check if component is already in the current validation path → Circular import detected, report error
3. Check if the imported file exists in `components/`
4. Apply the same validation rules (no data imports, props-based, etc.)
5. Recursively check that component's imports (increment depth counter)

**Recursion Implementation:**

> **Comprehensive Error Reporting:** This function collects errors as it traverses the component tree. When an error is encountered (circular import, max depth, missing component), it logs the error but continues checking other branches. All errors are reported together at the end of validation, not stopped at the first failure.

```
function validateComponent(path, depth = 0, visited = [], errors = []):
  if depth > 10:
    errors.append("Max recursion depth (10) reached at: {path}")
    return errors  # Stop this branch, but continue others

  if path in visited:
    errors.append("Circular import detected: {visited} -> {path}")
    return errors  # Circular dependency, continue other branches

  visited.append(path)

  # Validate this component's imports
  for import in getLocalImports(path):
    validateComponent(import, depth + 1, visited.copy(), errors)

  # Validate this component's portability
  portabilityErrors = checkPortability(path)
  errors.extend(portabilityErrors)

  return errors
```

**Validation Behavior:**

- Collect ALL validation errors before reporting
- Continue checking other components even if one has issues
- Report comprehensive summary at the end

**Step 3: Report missing sub-components**

If a component imports another component that doesn't exist:

```
Error: Component dependency missing:
- InvoiceList.tsx imports './InvoiceCard' but InvoiceCard.tsx doesn't exist

Please ensure all sub-components are created before export.
```

**Step 4: Validate sub-component portability**

All sub-components must also pass the portability checks:

- No data imports
- Props-based architecture
- No state management or routing

If a sub-component fails validation, report it along with its parent:

```
Error: Sub-component validation failed:
- InvoiceCard.tsx (imported by InvoiceList.tsx) - imports data directly

Fix the sub-component before export.
```

**Step 5: Handle circular imports**

If circular imports are detected:

```
Error: Circular import detected in component tree:
  InvoiceList.tsx → InvoiceCard.tsx → InvoiceRow.tsx → InvoiceList.tsx

Circular imports prevent proper validation and may cause issues in the target codebase.
Please refactor components to remove the circular dependency.
```

**Recovery Guidance for Circular Imports:**

To identify and fix circular imports:

1. **Map the dependency chain** — Follow the cycle shown in the error message
2. **Find shared logic** — Identify what's being shared that creates the cycle
3. **Extract to a new component** — Create a component that both can import without cycles:

   ```
   # Before (circular):
   InvoiceList → InvoiceCard → InvoiceRow → InvoiceList

   # After (fixed):
   InvoiceList → InvoiceCard → InvoiceRow
                     ↓              ↓
                 SharedUtils (new component)
   ```

4. **Common patterns causing cycles:**
   - Parent passing callbacks that child uses to modify parent
   - Shared type definitions imported from component files
   - Utility functions mixed with component code

5. **Re-run validation** after refactoring to confirm the cycle is broken

This ensures the entire component tree is portable, not just the top-level components, while preventing infinite loops during validation.

### If Validation Passes

Continue to Step 9 with confidence.

### If Validation Fails

**Do not proceed with export.** Instead:

1. **Report failures to user** — List all components that failed validation and specify why:
   - Component imports data directly from JSON
   - Component contains routing/navigation logic
   - Component uses state management

2. **Provide fix instructions** — Tell the user:

   ```
   The following components cannot be exported as-is:
   - [Component1] - imports data directly
   - [Component2] - contains routing logic

   Please run `/design-screen` for the affected sections and fix these issues:
   - Remove all direct data imports
   - Use props to accept all data instead
   - Replace routing with optional callbacks
   ```

3. **Do not create partial exports** — An incomplete export with missing or broken components will cause failures in the user's codebase. It's better to fix the components first, then re-run the export.

4. **Recovery workflow** — After fixing the issues:
   - You may resume from Step 8 (this step) to re-validate components
   - If validation passes, continue to Step 9 and subsequent steps
   - If earlier steps (1-7) were not completed, re-run `/export-product` from the beginning instead

## Step 8A: Validate Design Coherence (CONDITIONAL)

**Execute this step IF:**

1. `product/design-system/design-direction.md` exists, AND
2. The file contains a `## Visual Signatures` section

**Skip this step IF:**

- design-direction.md doesn't exist (shell not designed yet)
- The file exists but lacks Visual Signatures (minimal design direction)

```bash
# Check if Step 8A should run
SHOULD_RUN_8A=false

if [ -f "product/design-system/design-direction.md" ]; then
  if grep -q "## Visual Signatures" product/design-system/design-direction.md; then
    SHOULD_RUN_8A=true
  fi
fi

echo "Step 8A execution: $SHOULD_RUN_8A"
```

**If SHOULD_RUN_8A=true**, perform the design coherence check across all sections to ensure consistent styling.

### Check for Design Direction Document

First, check if a design direction document exists:

```bash
if [ -f "product/design-system/design-direction.md" ]; then
  echo "Design direction found - checking coherence against documented guidelines"
else
  echo "Note: No design-direction.md found. Inferring patterns from components."
fi
```

### Color Class Consistency

Extract and compare primary color usage across all section components:

```bash
# Find primary color patterns across sections
echo "Checking color consistency..."
for dir in src/sections/*/components; do
  if [ -d "$dir" ]; then
    section=$(basename $(dirname "$dir"))
    echo "Section: $section"
    grep -rh 'bg-[a-z]+-[0-9]\+' "$dir"/*.tsx 2>/dev/null | sort | uniq -c | sort -rn | head -3
  fi
done
```

**Check for inconsistencies:**

- Different primary colors across sections (e.g., `lime` in one, `blue` in another)
- Inconsistent shade usage (e.g., `-600` in one section, `-400` in another)
- Mixed color systems (e.g., some using `stone`, others using `slate`)

### Spacing Pattern Consistency

Check for consistent spacing patterns:

```bash
# Find spacing patterns
echo "Checking spacing consistency..."
grep -rh 'p-[0-9]\+\|px-[0-9]\+\|py-[0-9]\+\|gap-[0-9]\+' src/sections/*/components/*.tsx 2>/dev/null | sort | uniq -c | sort -rn | head -10
```

### Container Pattern Consistency

Check for consistent container patterns across section root components:

```bash
# Extract container patterns from section components
echo "Checking container consistency..."
grep -rh 'className="h-full\|className="min-h-full' src/sections/*/components/*.tsx 2>/dev/null | \
  sed 's/.*className="\([^"]*\)".*/\1/' | sort | uniq -c | sort -rn
```

**Check for inconsistencies:**

| Pattern           | Expected                                                         | Status |
| ----------------- | ---------------------------------------------------------------- | ------ |
| Container wrapper | `h-full bg-[neutral]-50 dark:bg-[neutral]-950 px-4 py-4 sm:px-6` | ✓/✗    |
| Background color  | Consistent neutral across sections                               | ✓/✗    |
| Padding pattern   | Matches Information Density                                      | ✓/✗    |

**If container patterns are inconsistent:**

```
Warning: Inconsistent container patterns detected:

Section "agents": h-full bg-slate-50 px-4 sm:px-6 py-4
Section "machines": h-full bg-slate-50 p-1  <- INCONSISTENT
Section "dashboard": min-h-full             <- MISSING PADDING

These differences may be intentional (e.g., edge-to-edge dashboards).
Would you like to:
1. Continue anyway — document inconsistencies in export README
2. Stop — fix inconsistencies before exporting
```

Use AskUserQuestion with options:

- "Proceed — differences are intentional" — Continue with export
- "Stop — I'll fix the inconsistencies first" — END COMMAND

### Typography Consistency

Check for consistent font treatment:

```bash
# Find font patterns
echo "Checking typography consistency..."
grep -rh 'font-[a-z]\+\|text-[a-z]\+-[0-9]\+' src/sections/*/components/*.tsx 2>/dev/null | sort | uniq -c | head -10
```

### Report Findings

**If inconsistencies are found:**

```
Design Coherence Check - Potential Inconsistencies Found:

**Color Usage:**
- Section "invoices" uses lime-600 for primary buttons
- Section "reports" uses blue-500 for primary buttons

**Spacing:**
- Most sections use p-6 for card padding
- Section "settings" uses p-4

**Typography:**
- Inconsistent heading styles across sections

These may be intentional design choices. Please verify:
1. Are these differences intentional (different visual treatments for different areas)?
2. Should they be unified for visual consistency?

Proceed with export? (y/n)
```

Use AskUserQuestion with options:

- "Proceed — differences are intentional" — Continue with export
- "Stop — I'll fix the inconsistencies first" — END COMMAND

**If no significant inconsistencies found:**

```
Design Coherence Check - Passed

All sections appear to use consistent:
- Primary color: [detected color]-[shade]
- Spacing patterns: [detected patterns]
- Typography: [detected patterns]

Continuing with export...
```

### Copy Design Direction to Export

If `product/design-system/design-direction.md` exists, copy it to the export:

```bash
if [ -f "product/design-system/design-direction.md" ]; then
  mkdir -p product-plan/design-system
  cp product/design-system/design-direction.md product-plan/design-system/
  echo "Copied design-direction.md to export"
fi
```

This ensures implementation agents have access to the aesthetic direction when building the product.

## Step 8B: Validate Props-Based Pattern

Verify that exportable components don't import data directly (which would break in the target codebase):

```bash
# Check for direct data imports in exportable components
DIRECT_IMPORTS=$(grep -r "from.*data\.json" src/sections/*/components/*.tsx 2>/dev/null || true)

if [ -n "$DIRECT_IMPORTS" ]; then
  echo "Warning: Found components with direct data imports:"
  echo "$DIRECT_IMPORTS"
  echo ""
  echo "Exportable components should receive data via props, not import it directly."
  echo "These components may fail in the target codebase."
fi
```

**If direct imports are found:**

1. List the affected files to the user
2. Warn that these components need refactoring
3. Ask whether to continue anyway or stop to fix

```
Question: Direct data imports found in [N] component(s). How do you want to proceed?
- Continue anyway — I'll fix them in the target codebase
- Stop here — I need to refactor these components first
```

**Note:** Preview wrapper files (e.g., `InvoiceListView.tsx`) at the section root ARE allowed to import data — they're Design OS preview files and not exported. Only files in `components/` subdirectories must be props-based.

## Step 9: Copy and Transform Components

### Shell Components

**Skip this section if `INCLUDE_SHELL` is false** (user chose to proceed without shell in Step 1).

Copy ALL files from `src/shell/components/` to `product-plan/shell/components/`:

**Primary components (always copied if shell exists):**

- `AppShell.tsx` — Main shell wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu component
- `index.ts` — Component exports

**Secondary components (copy if they exist):**

- `NotificationsDrawer.tsx`
- `SearchModal.tsx`
- `ThemeToggle.tsx`
- `SettingsModal.tsx`
- `ProfileModal.tsx`
- `HelpPanel.tsx`
- `FeedbackModal.tsx`
- `MobileMenuDrawer.tsx`

**Copy all shell components:**

```bash
# Copy all .tsx files from shell/components
for file in src/shell/components/*.tsx; do
  if [ -f "$file" ]; then
    cp "$file" product-plan/shell/components/
    echo "Copied: $(basename $file)"
  fi
done

# Copy index.ts
if [ -f "src/shell/components/index.ts" ]; then
  cp src/shell/components/index.ts product-plan/shell/components/
  echo "Copied: index.ts"
fi
```

For each copied file:

- Transform import paths from `@/...` to relative paths
- Remove any Design OS-specific imports
- Ensure components are self-contained

**Shell data and types (if they exist):**

Also copy shell data and types if they exist:

```bash
# Copy shell data.json (rename to sample-data.json)
if [ -f "product/shell/data.json" ]; then
  cp product/shell/data.json product-plan/shell/sample-data.json
  echo "Copied: data.json -> sample-data.json"
fi

# Copy shell types.ts
if [ -f "product/shell/types.ts" ]; then
  cp product/shell/types.ts product-plan/shell/types.ts
  echo "Copied: types.ts"
fi
```

### Section Components

For each section, copy from `src/sections/[section-id]/components/` to `product-plan/sections/[section-id]/components/`:

- Transform import paths according to the table below
- Remove Design OS-specific imports
- Keep only the exportable components (not preview wrappers)

**IMPORTANT: Preview Wrappers are NOT Exported**

The `src/sections/[section-id]/` folder contains two types of files:

| Location             | Type                  | Exported? | Purpose                                       |
| -------------------- | --------------------- | --------- | --------------------------------------------- |
| `components/*.tsx`   | Exportable components | ✅ Yes    | Props-based UI components for production use  |
| `*.tsx` (root level) | Preview wrappers      | ❌ No     | Design OS preview files that load sample data |

Preview wrappers (files like `InvoiceListView.tsx` at the root of a section folder) are **Design OS-only** files. They:

- Import sample data from `data.json`
- Pass data to exportable components for preview
- Are NOT portable and should NEVER be copied to the export package

**Only copy files from the `components/` subdirectory**, not from the section root.

### Import Path Transformation Table

When copying components to the export package, transform all import paths to relative paths for portability:

| Design OS Path                                 | Exported Path        | Notes                                         |
| ---------------------------------------------- | -------------------- | --------------------------------------------- |
| `@/../product/sections/[section-id]/types`     | `../types`           | Type imports become relative                  |
| `@/../product/sections/[section-id]/data.json` | ❌ Remove            | Data should come via props                    |
| `@/components/ui/*`                            | ❌ Remove or inline  | UI components need to be included or replaced |
| `@/lib/*`                                      | ❌ Remove or inline  | Utilities need to be included or replaced     |
| `./[ComponentName]`                            | `./[ComponentName]`  | Relative imports stay unchanged               |
| `../[ComponentName]`                           | `../[ComponentName]` | Relative imports stay unchanged               |
| `react`, `lucide-react`, etc.                  | Unchanged            | External library imports stay as-is           |

**Key transformation rules:**

1. **Types** — Transform `@/../product/...` paths to relative `../types`
2. **Data imports** — Must be removed (validation should catch these in Step 8)
3. **Design OS imports** — `@/components/*`, `@/lib/*` must be removed or inlined
4. **Relative imports** — Keep unchanged (they're already portable)
5. **External libraries** — Keep unchanged (standard npm packages)

### Types Files

Copy `product/sections/[section-id]/types.ts` to `product-plan/sections/[section-id]/types.ts`

### Sample Data

Copy `product/sections/[section-id]/data.json` to `product-plan/sections/[section-id]/sample-data.json`

---

**Next Phase:** Continue to `phase-4-documentation.md` for Steps 10-12 (generating READMEs and data model).
