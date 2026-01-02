---
name: dos-data-block-invalid-json
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: ends_with
    pattern: data.json
  - field: new_text
    operator: regex_match
    pattern: ",\\s*[}\\]]"
---

## Purpose

Blocks trailing commas in JSON files (invalid JSON syntax).

## Example

```json
{
  "items": [{ "id": 1 }]
}
```

## Resolution

Remove trailing comma:

```json
{
  "items": [{ "id": 1 }]
}
```
