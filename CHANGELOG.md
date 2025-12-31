# Changelog

Get notified of major releases by subscribing here:
https://buildermethods.com/design-os

## [0.1.3] - 2025-12-31

### Fixed

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
