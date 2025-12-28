---
name: dos-data-warn-placeholder-content
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: product/sections/[^/]+/data\.json$
  - field: new_text
    operator: regex_match
    pattern: "(Test \d|Lorem ipsum|Sample \d|Example \d|Foo|Bar|Baz|placeholder|TODO|TBD|FIXME)"
---

## WARNING: Placeholder content detected in sample data

`data.json` should contain **realistic sample data**, not placeholders.

### Avoid

```json
{
  "invoices": [
    { "id": "1", "client": "Test 1", "amount": 100 },
    { "id": "2", "client": "Test 2", "amount": 200 },
    { "id": "3", "client": "Lorem ipsum", "amount": 300 }
  ]
}
```

### Use Instead

```json
{
  "invoices": [
    {
      "id": "inv-2024-001",
      "client": "Acme Corporation",
      "amount": 4250.0,
      "status": "paid",
      "dueDate": "2024-02-15"
    },
    {
      "id": "inv-2024-002",
      "client": "TechStart Inc.",
      "amount": 1875.5,
      "status": "pending",
      "dueDate": "2024-03-01"
    },
    {
      "id": "inv-2024-003",
      "client": "Global Services Ltd.",
      "amount": 12500.0,
      "status": "overdue",
      "dueDate": "2024-01-20"
    }
  ]
}
```

### Why Realistic Data Matters

1. **Design quality**: Realistic data reveals edge cases (long names, special characters)
2. **Screenshots**: Screenshots look professional with real-looking content
3. **Export quality**: Implementation agents understand the expected format
4. **Testing**: Realistic data catches UI issues early

### Good Sample Data Includes

| Aspect           | Example                                               |
| ---------------- | ----------------------------------------------------- |
| Varied lengths   | Short names AND long company names                    |
| Different states | active, pending, overdue, cancelled                   |
| Edge cases       | $0.00 amounts, empty descriptions, special characters |
| Realistic IDs    | `inv-2024-001` not `1`                                |
| Proper dates     | `2024-02-15` not `date1`                              |

### Placeholder Patterns to Avoid

- `Test 1`, `Test 2`, `Test N`
- `Sample X`, `Example Y`
- `Lorem ipsum dolor sit amet`
- `Foo`, `Bar`, `Baz`
- `TODO`, `TBD`, `FIXME`, `placeholder`

### See Also

- `/sample-data` command documentation
- `agents.md` > "File Validation Pattern"
