---
name: dos-data-warn-hardcoded-ids
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/[^/]+/components/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: (id|key)=["'][a-z0-9-]{8,}["']
---

## WARNING: Hardcoded ID detected in component

Components should use IDs from **props**, not hardcoded values.

### Wrong

```tsx
export function InvoiceDetail() {
  return (
    <div id="inv-2024-001">
      {" "}
      {/* Hardcoded! */}
      <h2>Invoice Details</h2>
    </div>
  );
}
```

### Correct

```tsx
export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  return (
    <div id={invoice.id}>
      {" "}
      {/* From props */}
      <h2>Invoice Details</h2>
    </div>
  );
}
```

### For Lists

```tsx
// Wrong - hardcoded keys
{
  invoices.map((inv, index) => (
    <div key="invoice-1">...</div> // Same key for all items!
  ));
}

// Correct - dynamic keys from data
{
  invoices.map((invoice) => <div key={invoice.id}>...</div>);
}
```

### Why This Matters

1. **Portability**: Hardcoded IDs don't work with different data
2. **React keys**: Duplicate keys cause rendering issues
3. **Testing**: Can't test with different data sets
4. **Accessibility**: IDs must be unique on the page

### Exceptions

Static IDs for landmark elements are OK:

```tsx
// OK - static landmark ID
<main id="main-content">

// OK - form field with static ID
<label htmlFor="email">Email</label>
<input id="email" />
```

### See Also

- React documentation on keys
- `agents.md` > "Props-Based Components"
