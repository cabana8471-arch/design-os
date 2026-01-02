---
name: dos-structure-warn-large-files
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/[^/]+/components/.*\.tsx$
---

## Purpose

Warns when component files exceed recommended size.

## Guidelines

Components should be:

- Under 300 lines of code
- Focused on a single responsibility
- Easy to understand at a glance

## Resolution

If this file is large:

1. Extract sub-components
2. Move logic to custom hooks
3. Split into multiple files
