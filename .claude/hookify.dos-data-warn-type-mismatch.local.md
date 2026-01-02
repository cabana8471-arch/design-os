---
name: dos-data-warn-type-mismatch
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: ends_with
    pattern: data.json
  - field: new_text
    operator: regex_match
    pattern: '"id":\\s*[0-9]+'
---

## Purpose

Warns when IDs are numbers instead of strings.

## Example

```json
{
  "users": [{ "id": 1, "name": "Jane" }]
}
```

## Resolution

Use string IDs for consistency:

```json
{
  "users": [{ "id": "u1", "name": "Jane" }]
}
```
