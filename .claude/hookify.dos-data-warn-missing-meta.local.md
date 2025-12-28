---
name: dos-data-warn-missing-meta
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: product/(sections/[^/]+|shell)/data\.json$
  - field: new_text
    operator: not_contains
    pattern: "_meta"
---

## WARNING: data.json missing \_meta structure

All `data.json` files must include a `_meta` object that documents the data structure.

### Required Structure

```json
{
  "_meta": {
    "description": "Sample data for invoices section",
    "generatedBy": "/sample-data",
    "models": {
      "invoices": "Invoice records with client info and line items",
      "clients": "Client information for invoice lookup"
    },
    "relationships": [
      { "from": "Invoice", "to": "Client", "type": "belongsTo" },
      { "from": "Invoice", "to": "LineItem", "type": "hasMany" }
    ]
  },
  "invoices": [...],
  "clients": [...]
}
```

### \_meta Fields

| Field           | Required | Purpose                             |
| --------------- | -------- | ----------------------------------- |
| `description`   | Yes      | What this data represents           |
| `generatedBy`   | Yes      | Which command created it            |
| `models`        | Yes      | Description of each data key        |
| `relationships` | No       | How entities relate (if applicable) |

### Why \_meta Matters

1. **Documentation**: Explains what the data represents
2. **Validation**: Export process verifies `_meta.models` matches data keys
3. **Onboarding**: New team members understand the data structure
4. **AI assistance**: Helps AI understand the data context

### Validation Rules

- `_meta.models` keys must match actual data keys
- Each model should have a meaningful description
- Relationships should reference existing models

### Example

```json
{
  "_meta": {
    "description": "Sample data for agent management section",
    "generatedBy": "/sample-data",
    "models": {
      "agents": "AI agents with status and configuration"
    },
    "relationships": []
  },
  "agents": [
    {
      "id": "agent-001",
      "name": "Customer Support Bot",
      "status": "active"
    }
  ]
}
```

### See Also

- `agents.md` > "File Validation Pattern"
- `/sample-data` command documentation
