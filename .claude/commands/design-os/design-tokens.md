# Design Tokens

You are helping the user choose colors and typography for their product. These design tokens will be used consistently across all screen designs and the application shell.

## Step 1: Check Prerequisites

First, verify that the product overview exists:

Read `/product/product-overview.md` to understand what the product is.

If it doesn't exist:

"Before defining your design system, you'll need to establish your product vision. Please run `/product-vision` first."

Stop here if the prerequisite is missing.

## Step 2: Explain the Process

"Let's define the visual identity for **[Product Name]**.

I'll help you choose:
1. **Colors** — A primary accent, secondary accent, and neutral palette
2. **Typography** — Fonts for headings, body text, and code

These will be applied consistently across all your screen designs and the application shell.

Do you have any existing brand colors or fonts in mind, or would you like suggestions?"

Wait for their response.

## Step 3: Choose Colors

Help the user select from Tailwind's built-in color palette. Present options based on their product type:

"For colors, we'll pick from Tailwind's palette so they work seamlessly with your screen designs.

**Primary color** (main accent, buttons, links):
Common choices: `blue`, `indigo`, `violet`, `emerald`, `teal`, `amber`, `rose`, `lime`

**Secondary color** (complementary accent, tags, highlights):
Should complement your primary — often a different hue or a neutral variation

**Neutral color** (backgrounds, text, borders):
Options: `slate` (cool gray), `gray` (pure gray), `zinc` (slightly warm), `neutral`, `stone` (warm gray)

Based on [Product Name], I'd suggest:
- **Primary:** [suggestion] — [why it fits]
- **Secondary:** [suggestion] — [why it complements]
- **Neutral:** [suggestion] — [why it works]

What feels right for your product?"

Use AskUserQuestion to gather their preferences if they're unsure:

- "What vibe are you going for? Professional, playful, modern, minimal?"
- "Any colors you definitely want to avoid?"
- "Light mode, dark mode, or both?"

## Step 4: Choose Typography

Help the user select Google Fonts:

"For typography, we'll use Google Fonts for easy web integration.

**Heading font** (titles, section headers):
Popular choices: `DM Sans`, `Inter`, `Poppins`, `Manrope`, `Space Grotesk`, `Outfit`

**Body font** (paragraphs, UI text):
Often the same as heading, or: `Inter`, `Source Sans 3`, `Nunito Sans`, `Open Sans`

**Mono font** (code, technical content):
Options: `IBM Plex Mono`, `JetBrains Mono`, `Fira Code`, `Source Code Pro`

My suggestions for [Product Name]:
- **Heading:** [suggestion] — [why]
- **Body:** [suggestion] — [why]
- **Mono:** [suggestion] — [why]

What do you prefer?"

## Step 5: Preview Colors in Light and Dark Mode

Before finalizing, help the user visualize how their color choices will look in both light and dark mode:

"Let's preview your colors in both light and dark mode to make sure they work well:

**Light Mode Preview:**
- Background: `[neutral]-50` or `[neutral]-100`
- Text: `[neutral]-900` or `[neutral]-800`
- Primary buttons: `bg-[primary]-600 text-white`
- Secondary elements: `[secondary]-100` with `[secondary]-800` text
- Borders: `[neutral]-200` or `[neutral]-300`

**Dark Mode Preview:**
- Background: `[neutral]-900` or `[neutral]-950`
- Text: `[neutral]-100` or `[neutral]-50`
- Primary buttons: `bg-[primary]-500 text-white` (slightly lighter for dark backgrounds)
- Secondary elements: `[secondary]-900` with `[secondary]-200` text
- Borders: `[neutral]-700` or `[neutral]-800`

**Contrast Check:**
- Primary on dark background: Is `[primary]-500` visible against `[neutral]-900`? ✓
- Text readability: Is `[neutral]-100` legible on `[neutral]-900`? ✓

Do these combinations look good for your product? Any adjustments needed for dark mode?"

If the user wants adjustments, iterate on the color choices. Some colors (like `yellow` or `lime`) may need shade adjustments for dark mode visibility.

## Step 6: Present Final Choices

Once they've reviewed both modes:

"Here's your design system:

**Colors:**
- Primary: `[color]`
- Secondary: `[color]`
- Neutral: `[color]`

**Typography:**
- Heading: [Font Name]
- Body: [Font Name]
- Mono: [Font Name]

**Verified for:**
- ✓ Light mode readability
- ✓ Dark mode readability
- ✓ Sufficient contrast

Does this look good? Ready to save it?"

## Step 7: Create the Files

Once approved:

### Create Directory

First, ensure the design-system directory exists:
```bash
mkdir -p product/design-system
```

### Create the Token Files

Then create two files:

**File 1:** `/product/design-system/colors.json`
```json
{
  "primary": "[color]",
  "secondary": "[color]",
  "neutral": "[color]"
}
```

**File 2:** `/product/design-system/typography.json`
```json
{
  "heading": "[Font Name]",
  "body": "[Font Name]",
  "mono": "[Font Name]"
}
```

## Step 8: Confirm Completion

Let the user know:

"I've saved your design tokens:
- `/product/design-system/colors.json`
- `/product/design-system/typography.json`

**Your palette:**
- Primary: `[color]` — for buttons, links, key actions
- Secondary: `[color]` — for tags, highlights, secondary elements
- Neutral: `[color]` — for backgrounds, text, borders

**Your fonts:**
- [Heading Font] for headings
- [Body Font] for body text
- [Mono Font] for code

These will be used when creating screen designs for your sections.

Next step: Run `/design-shell` to design your application's navigation and layout."

## Reference: Tailwind Color Palette

Available colors (each has shades 50-950):
- **Warm:** `red`, `orange`, `amber`, `yellow`, `lime`
- **Cool:** `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`
- **Purple:** `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`
- **Neutral:** `slate`, `gray`, `zinc`, `neutral`, `stone`

## Reference: Popular Google Font Pairings

These are starting suggestions — feel free to explore [Google Fonts](https://fonts.google.com/) for other combinations that match your product's personality.

### Sans-Serif Pairings
- **Modern & Clean:** DM Sans + DM Sans + IBM Plex Mono
- **Professional:** Inter + Inter + JetBrains Mono
- **Friendly:** Nunito Sans + Nunito Sans + Fira Code
- **Bold & Modern:** Space Grotesk + Inter + Source Code Pro
- **Geometric:** Outfit + Outfit + Source Code Pro
- **Humanist:** Manrope + Manrope + Fira Code
- **Minimal:** Work Sans + Work Sans + JetBrains Mono
- **Approachable:** Poppins + Poppins + IBM Plex Mono

### Serif + Sans Combinations
- **Editorial:** Playfair Display + Source Sans 3 + IBM Plex Mono
- **Classic Modern:** Merriweather + Open Sans + Fira Code
- **Elegant:** Libre Baskerville + Lato + Source Code Pro
- **Sophisticated:** Cormorant Garamond + Raleway + JetBrains Mono

### Technical/Developer Focus
- **Tech-forward:** JetBrains Mono + Inter + JetBrains Mono
- **Hacker:** Fira Code + Fira Sans + Fira Code
- **Developer:** Source Code Pro + Source Sans 3 + Source Code Pro

### Tips for Custom Pairings
- Pair fonts with contrasting weights (bold heading + regular body)
- Keep heading and body from the same family for consistency
- Use mono fonts that complement your primary font's style

## Important Notes

- Colors should be Tailwind palette names (not hex codes)
- Fonts should be exact Google Fonts names
- Keep suggestions contextual to the product type
- The mono font is optional but recommended for any product with code/technical content
- Design tokens apply to screen designs only — the Design OS app keeps its own aesthetic
