---
name: dos-data-warn-empty-arrays
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: ends_with
    pattern: data.json
  - field: new_text
    operator: regex_match
    pattern: '"\\w+":\\s*\\[\\s*\\]'
---

## Purpose

Warns when data.json contains empty arrays (no sample data).

## Example

```json
{
  "users": []
}
```

## Resolution

Add sample data for previews:

```json
{
  "users": [{ "id": "u1", "name": "Jane Smith" }]
}
```
