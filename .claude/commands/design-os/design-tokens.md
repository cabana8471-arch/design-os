# Design Tokens

You are helping the user choose colors and typography for their product. These design tokens will be used consistently across all screen designs and the application shell.

## Step 1: Check Prerequisites

First, verify that the product overview exists:

Read `/product/product-overview.md` to understand what the product is.

If it doesn't exist:

```
Missing: product/product-overview.md. Run /product-vision to create it.
```

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

### Mono Font Default Detection

If the user doesn't specify a mono font, detect this scenario and apply the default:

**Detection Algorithm:**

```
function detectMonoFontChoice(userResponse):
  # Step 1: Check for explicit skip
  if contains(userResponse, ["skip mono", "don't need mono", "no mono", "skip the mono"]):
    return USE_DEFAULT

  # Step 2: Check for explicit mono font selection
  MONO_FONTS = ["IBM Plex Mono", "JetBrains Mono", "Fira Code",
                "Source Code Pro", "Roboto Mono", "Ubuntu Mono"]
  for font in MONO_FONTS:
    if contains(userResponse, font):
      return FONT_SELECTED(font)

  # Step 3: Check if only heading/body mentioned
  mentions_heading = contains(userResponse, ["heading", "title", "h1", "h2"])
  mentions_body = contains(userResponse, ["body", "paragraph", "text"])
  mentions_mono = contains(userResponse, ["mono", "code", "technical"])

  if (mentions_heading or mentions_body) and not mentions_mono:
    return USE_DEFAULT

  # Step 4: If ambiguous, ask for clarification
  return ASK_USER
```

**Detection criteria (any of these indicates no mono font specified):**
- User says "I don't need a mono font"
- User says "skip mono" or similar
- User only specifies heading and body fonts
- User's response doesn't mention any mono font option

**When no mono font is specified:**
```
"I'll use IBM Plex Mono as the default mono font. This ensures code blocks and technical content display correctly. If you'd prefer a different option, just let me know."
```

Then set `"mono": "IBM Plex Mono"` in typography.json.

**When detection is ambiguous:**
If the algorithm reaches `ASK_USER`, use AskUserQuestion:
```
"For the mono font (used in code blocks and technical content), would you like to:
- Use the default (IBM Plex Mono)
- Choose a specific mono font
- Skip if your product doesn't need code display"
```

### Font Weight Validation (Integrated)

After the user selects fonts, verify all required weights are available:

**How to Verify Font Weights:**

1. **Google Fonts API Check:** Visit `https://fonts.google.com/specimen/[Font+Name]` (replace spaces with `+`)
   - Example: `https://fonts.google.com/specimen/DM+Sans`
   - The page shows all available weights in the "Styles" section

2. **Required Weights by Usage:**
   | Font Type | Required Weights | Why Needed |
   |-----------|------------------|------------|
   | Heading | 400, 500, 600, 700 | Normal, medium, semibold headings, bold emphasis |
   | Body | 400, 500, 600 | Normal text, medium buttons, semibold labels |
   | Mono | 400, 500 | Code blocks, highlighted syntax |

3. **Common Font Weight Availability:**
   | Font | Available Weights |
   |------|-------------------|
   | Inter | 100-900 (variable) ✓ |
   | DM Sans | 400, 500, 600, 700 ✓ |
   | Poppins | 100-900 ✓ |
   | JetBrains Mono | 100-800 ✓ |
   | Fira Code | 300-700 ✓ |
   | Source Sans 3 | 200-900 ✓ |

**Verification Message:**

"Let me verify the fonts will work with all UI elements:

**[Heading Font]:** Checking for weights 400, 500, 600, 700...
**[Body Font]:** Checking for weights 400, 500, 600...
**[Mono Font]:** Checking for weights 400, 500...

All weights are available. ✓

(If any weights are missing, suggest an alternative font with full weight support.)"

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

### Contrast Validation Checklist

Before proceeding, verify each combination passes minimum contrast requirements (WCAG AA: 4.5:1 for text, 3:1 for large text/UI):

**Light Mode Validation:**
- [ ] Primary button text (`white` on `[primary]-600`) — Should have 4.5:1 contrast
- [ ] Body text (`[neutral]-800` on `[neutral]-50`) — Should have 4.5:1 contrast
- [ ] Secondary text (`[secondary]-800` on `[secondary]-100`) — Should have 4.5:1 contrast
- [ ] Border visibility (`[neutral]-200` on `[neutral]-50`) — Should be distinguishable

**Dark Mode Validation:**
- [ ] Primary button text (`white` on `[primary]-500`) — Should have 4.5:1 contrast
- [ ] Body text (`[neutral]-100` on `[neutral]-900`) — Should have 4.5:1 contrast
- [ ] Secondary text (`[secondary]-200` on `[secondary]-900`) — Should have 4.5:1 contrast
- [ ] Border visibility (`[neutral]-700` on `[neutral]-900`) — Should be distinguishable

**Colors Known to Have Dark Mode Issues:**
- `yellow` (500 and below often too light on dark backgrounds)
- `lime` (needs 600+ for dark mode visibility)
- `amber` (500 and below may need adjustment)
- `cyan` (check 400-500 range carefully)

If any validation fails, suggest shade adjustments (e.g., `yellow-500` → `yellow-400` for dark mode).

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

Then validate the directory was created:
```bash
if [ ! -d "product/design-system" ]; then
  echo "Error: Failed to create directory product/design-system."
  exit 1
fi
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
- **Mono font handling:** The mono field is required in the JSON file for consistent structure. If the user skips or doesn't specify a mono font, use `IBM Plex Mono` as the default. This ensures the typography.json file always has all three fields, preventing parsing errors in downstream tools.
- Design tokens apply to screen designs only — the Design OS app keeps its own aesthetic

### Tailwind Color Validation

Before saving colors, validate that each color name is a valid Tailwind v4 palette color:

**Valid Tailwind Colors:**
`red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`, `slate`, `gray`, `zinc`, `neutral`, `stone`

**Invalid color names to reject:**
- Custom/hex colors (e.g., `#3B82F6`) — Use the closest Tailwind equivalent
- Misspelled colors (e.g., `purle`, `organge`)
- Non-existent colors (e.g., `turquoise`, `coral`, `navy`)
- Old Tailwind v3 colors that no longer exist in v4

If the user provides an invalid color name:
```
"[color] isn't a standard Tailwind color. Did you mean [suggestion]? Here are the available options: [list relevant colors]"
```

### Google Fonts Validation

Before saving fonts, validate that each font name exactly matches the Google Fonts naming:

**Common Naming Mistakes:**
| User Input | Correct Name |
|------------|--------------|
| `DMSans` | `DM Sans` |
| `Jetbrains Mono` | `JetBrains Mono` |
| `Source Sans` | `Source Sans 3` |
| `Fira code` | `Fira Code` |
| `IBM Plex` | `IBM Plex Mono` (be specific) |
| `Open sans` | `Open Sans` |

**Validation Steps:**
1. Check for exact casing (most fonts use Title Case with spaces)
2. Check for version numbers where applicable (e.g., `Source Sans 3`)
3. Check for font weight suffixes that should be separate (e.g., `Inter` not `Inter Bold`)

If the user provides a potentially incorrect font name:
```
"Just checking — did you mean '[Correct Font Name]'? Font names need to match Google Fonts exactly for proper loading."
```

**Verification:** You can verify font names at [Google Fonts](https://fonts.google.com/) by searching for the font and checking the exact display name.

### Font Matching Between CSS and Design Tokens

When design tokens are exported, fonts must be properly connected between:
1. **typography.json** — The font names chosen by the user
2. **index.html** — The Google Fonts `<link>` tag for loading
3. **CSS/Tailwind** — The font-family declarations

**Ensuring Fonts Match:**

| Location | Format | Example |
|----------|--------|---------|
| typography.json | Exact Google Font name | `"heading": "DM Sans"` |
| index.html | URL-encoded for Google Fonts | `family=DM+Sans:wght@400;500;700` |
| CSS | CSS font-family with fallback | `font-family: 'DM Sans', sans-serif;` |
| Tailwind class | Custom font class | `font-heading` |

**Common Mismatch Issues:**

1. **Spaces in font names:**
   - typography.json: `DM Sans`
   - URL encoding: `DM+Sans` (spaces become `+`)
   - CSS: `'DM Sans'` (quotes required for multi-word names)

2. **Font weights:**
   - Include all weights used in the design
   - Example: `wght@400;500;600;700` covers regular, medium, semibold, bold

3. **Variable fonts:**
   - Some fonts (like Inter) support variable weights
   - Format: `wght@100..900` for full weight range

**Verification Checklist:**

Before finalizing design tokens, verify:
- [ ] Font names in typography.json exactly match Google Fonts
- [ ] index.html includes the correct Google Fonts URL with all weights
- [ ] CSS custom properties reference the correct font-family
- [ ] Tailwind classes (font-heading, font-body, font-mono) work correctly
- [ ] All font weights used in designs are loaded

### Font Weight Validation

Before finalizing typography choices, ensure all font weights needed for UI components are included in the Google Fonts URL:

**Common Weight Usage in UI Components:**

| UI Element | Typical Weight | Tailwind Class |
|------------|----------------|----------------|
| Body text | 400 (Regular) | `font-normal` |
| Emphasized text | 500 (Medium) | `font-medium` |
| Subheadings | 600 (Semibold) | `font-semibold` |
| Headings | 700 (Bold) | `font-bold` |
| Code/mono | 400-500 | `font-normal`/`font-medium` |

**Validation Process:**

1. **Review screen designs** — Check which font weights are used in existing components
2. **Verify weights are loaded** — Ensure the Google Fonts URL includes all needed weights:
   ```html
   <!-- Example: Loading 400, 500, 600, 700 weights -->
   <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap">
   ```
3. **Test fallback behavior** — If a weight isn't loaded, the browser substitutes the nearest available weight, which may look incorrect

**Common Issues:**

| Problem | Symptom | Solution |
|---------|---------|----------|
| Missing semibold (600) | `font-semibold` looks like bold or normal | Add `;600` to weight list |
| Missing medium (500) | `font-medium` looks like normal | Add `;500` to weight list |
| Only 400 loaded | All text looks the same weight | Add needed weights to URL |

**Minimum Recommended Weights:**
- **Heading font:** 400, 500, 600, 700
- **Body font:** 400, 500, 600 (700 optional)
- **Mono font:** 400, 500 (for code highlighting)

**Example Configuration:**

```json
// typography.json
{
  "heading": "DM Sans",
  "body": "Inter",
  "mono": "JetBrains Mono"
}
```

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
/* CSS custom properties */
:root {
  --font-heading: 'DM Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```
