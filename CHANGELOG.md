# Changelog

Get notified of major releases by subscribing here:
https://buildermethods.com/design-os

## [0.1.5] - 2025-12-31

### Fixed (MEDIUM priority from Critical Analysis)

- **product-vision.md**: Added `Check for Existing Product Name` section to avoid asking for product name twice (now checks `product-context.md` first before asking).
- **product-vision.md**: Added `Borderline names (ACCEPT with clarification)` table to guide handling of names like "Dashboard", "Manager", "Portal" that are valid but could be more specific.
- **data-model.md**: Added `Circular and Self-Referential Relationships` section with guidance for parent-child hierarchies, self-referential entities, and bidirectional relationships.
- **design-shell.md**: Added `Step 8.0b: Validate Field-to-Component Matching` to verify that selected shell components have corresponding fields in `data.json`.

## [0.1.4] - 2025-12-31

### Fixed (HIGH priority from Critical Analysis)

- **product-interview.md**: Added explicit EXIT instruction after `--audit` mode report to prevent confusion about whether to continue with interview questions.
- **shape-section.md**: Added `dataRef Resolution` table clarifying which `data.json` file is used for entity lookups (section's own local data).
- **product-roadmap.md**: Added Step 1.5 to read product scope from `product-overview.md` and adjust section suggestions based on MVP/Standard/Enterprise scope.
- **screenshot-design.md**: Added `Dark Mode Screenshot Capture` section explaining how to toggle theme using Playwright MCP's `browser_evaluate` tool.

## [0.1.3] - 2025-12-31

### Fixed (CRITICAL priority from Critical Analysis)

- **audit-context.md**: Fixed variable scope bug in `process_ambiguity_results` function. The pipe (`|`) was creating a subshell where `AMBIGUITY_HIGH` and `AMBIGUITY_MEDIUM` counter modifications were lost. Changed to use here-string (`<<<`) to keep variables in the same shell scope.
- **screenshot-design.md**: Replaced arbitrary `sleep 5` with a proper curl retry loop for dev server readiness detection. Now waits up to 30 seconds with active polling, providing reliable startup on slow machines.

## [0.1.2] - 2025-12-19

- Fixed errors related to importing google fonts out of order.
- Handled sections that use '&' in their name.

## [0.1.1] - 2025-12-18

- In the export package, consolidated '01-foundation' and '02-shell' into one.
- Updated README.md tips that come in the export.

## [0.1] - 2025-12-16

- Initial release
