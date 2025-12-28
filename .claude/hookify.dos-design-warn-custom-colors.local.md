---
name: dos-design-warn-custom-colors
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/(sections|shell)/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: (#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\()
---

## WARNING: Custom color value detected

Design OS uses **Tailwind's built-in color palette**, not custom hex/rgb values.

### Avoid

```tsx
<div style={{ backgroundColor: '#ff5733' }}>
<div className="bg-[#ff5733]">
<div style={{ color: 'rgb(255, 87, 51)' }}>
<div style={{ borderColor: 'hsl(9, 100%, 60%)' }}>
```

### Use Instead

```tsx
<div className="bg-orange-500">
<div className="text-lime-600">
<div className="border-stone-300">
```

### Tailwind Color Palette

Design OS uses these built-in colors:

**Neutrals:**

- `stone` (warm gray) — Design OS default
- `slate`, `gray`, `zinc`, `neutral`

**Accents:**

- `lime` — Design OS default accent
- `teal`, `blue`, `green`, `red`, `yellow`, `orange`
- `purple`, `pink`, `indigo`, `cyan`, `emerald`, `amber`
- `rose`, `fuchsia`, `violet`, `sky`

### Design Tokens

If the product has design tokens defined in `product/design-system/colors.json`:

```json
{
  "primary": "lime",
  "secondary": "teal",
  "neutral": "stone"
}
```

Use the token colors throughout:

- Primary actions: `bg-lime-600`
- Secondary elements: `bg-teal-100`
- Backgrounds: `bg-stone-50`

### Why Tailwind Colors?

1. **Consistency**: Shades work together (50, 100, 200... 950)
2. **Dark mode**: Easy to pair light/dark variants
3. **Accessibility**: Pre-tested contrast ratios
4. **Maintainability**: No custom CSS to manage

### Exception: CSS Variables

CSS variables in `src/index.css` are OK:

```css
@theme {
  --color-brand: #84cc16;
}
```

These are applied at the theme level, not in components.

### See Also

- `agents.md` > "Tailwind CSS Directives"
- `agents.md` > "Design Token Shade Guide"
- `/design-tokens` command
