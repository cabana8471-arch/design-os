---
name: dos-data-warn-trailing-comma
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.json$
  - field: new_text
    operator: regex_match
    pattern: ,\s*[\}\]]
---

## WARNING: Possible trailing comma in JSON

JSON does **not** allow trailing commas. This will cause parse errors.

### Wrong

```json
{
  "name": "Invoice",
  "amount": 100 // ← trailing comma before }
}
```

```json
{
  "items": [
    "item1",
    "item2" // ← trailing comma before ]
  ]
}
```

### Correct

```json
{
  "name": "Invoice",
  "amount": 100
}
```

```json
{
  "items": ["item1", "item2"]
}
```

### Common Mistakes

| Mistake                 | Fix                                             |
| ----------------------- | ----------------------------------------------- |
| Comma before `}`        | Remove the trailing comma                       |
| Comma before `]`        | Remove the trailing comma                       |
| Copying from JavaScript | JavaScript allows trailing commas, JSON doesn't |

### Why This Matters

- JSON parsers will throw errors
- `import data from './data.json'` will fail
- Build process will break

### Validation

Paste your JSON into a validator to check:

- https://jsonlint.com/
- VS Code's built-in JSON validation

### Pro Tip

Configure your editor to show JSON syntax errors:

- VS Code: Built-in JSON validation
- Enable "Format on Save" to auto-fix formatting

### See Also

- JSON specification: https://www.json.org/
