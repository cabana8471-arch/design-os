---
name: dos-structure-warn-deep-nesting
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: "(<div[^>]*>\\s*){6,}"
---

## Purpose

Warns about deeply nested div structures (6+ levels).

## Example

```tsx
<div>
  <div>
    <div>
      <div>
        <div>
          <div>Content</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Resolution

Extract nested content into sub-components:

```tsx
<Container>
  <Header />
  <Content />
  <Footer />
</Container>
```
