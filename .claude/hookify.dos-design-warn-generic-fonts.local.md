---
name: dos-design-warn-generic-fonts
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: (src/.*\.tsx$|\.css$)
  - field: new_text
    operator: regex_match
    pattern: font-(inter|roboto|arial|helvetica|system-ui)
---

## WARNING: Generic font detected

Design OS discourages generic fonts that create **"AI slop" aesthetics**.

### Fonts to Avoid

| Font      | Why Avoid                        |
| --------- | -------------------------------- |
| Inter     | Overused in AI-generated designs |
| Roboto    | Generic, lacks personality       |
| Arial     | System font, bland               |
| Helvetica | Overused, expected               |
| system-ui | Default, no character            |

### What to Use Instead

**From design tokens:**
Check `product/design-system/typography.json` for the product's font choices.

**If no tokens defined:**
Choose distinctive fonts from Google Fonts that match the product's aesthetic:

| Aesthetic             | Font Suggestions                               |
| --------------------- | ---------------------------------------------- |
| Modern/Tech           | Space Grotesk, JetBrains Mono, Outfit          |
| Elegant/Luxury        | Playfair Display, Cormorant, Libre Baskerville |
| Friendly/Approachable | Nunito, Quicksand, Poppins                     |
| Bold/Statement        | Bebas Neue, Anton, Oswald                      |
| Editorial             | Merriweather, Source Serif Pro                 |

### Design OS Default

When no design tokens are defined, Design OS uses:

- **Headings**: DM Sans (clean, geometric)
- **Body**: DM Sans
- **Mono**: IBM Plex Mono

### The SKILL.md Guidance

From `SKILL.md`:

> "**Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics..."

### See Also

- `.claude/skills/frontend-design/SKILL.md`
- `agents.md` > "Design System (Design OS Application)"
- `/design-tokens` command
