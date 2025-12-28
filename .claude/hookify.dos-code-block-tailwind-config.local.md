---
name: dos-code-block-tailwind-config
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: tailwind\.config\.(js|ts|mjs|cjs)$
---

## BLOCKED: tailwind.config.js is not used in Tailwind CSS v4

Design OS uses **Tailwind CSS v4** which is CSS-based, not config-based.

### Tailwind v3 (OLD - Don't Use)

```javascript
// tailwind.config.js - NOT USED IN v4
module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        primary: "#84cc16",
      },
    },
  },
};
```

### Tailwind v4 (Design OS)

Configuration is done in CSS:

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-primary: #84cc16;
  --font-heading: "DM Sans", sans-serif;
}
```

### Where to Configure

| Configuration | v3 Location          | v4 Location                   |
| ------------- | -------------------- | ----------------------------- |
| Colors        | `tailwind.config.js` | `src/index.css` with `@theme` |
| Fonts         | `tailwind.config.js` | `src/index.css` with `@theme` |
| Plugins       | `tailwind.config.js` | CSS `@plugin` directive       |
| Content paths | `tailwind.config.js` | Automatic detection           |

### Design Tokens

For product design tokens, use the JSON files instead:

- `product/design-system/colors.json` — Color palette
- `product/design-system/typography.json` — Font choices

These are applied at build time and documented for export.

### See Also

- `agents.md` > "Tailwind CSS Directives"
- `agents.md` > "Tailwind v4 Specific Patterns"
