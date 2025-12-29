<!-- v1.0.0 -->
<!-- Usage: Design guidance for distinctive frontend interfaces -->

name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.

---

<!--
Referenced by:
- /design-shell (Step 1: Validate, Step 5: Apply)
- /design-screen (Step 1: Validate, Step 5: Apply)

Changes to this file affect both shell and screen design quality.

Fallback: When this skill file is unavailable or has insufficient content,
commands use agents.md → "Enhanced Fallback Design Guidance" section.
-->

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme. Choose a distinct aesthetic direction from categories like:
  - _Clean/Professional_: brutally minimal, luxury/refined, corporate polish
  - _Bold/Expressive_: maximalist chaos, brutalist/raw, industrial/utilitarian
  - _Playful/Warm_: organic/natural, soft/pastel, playful/toy-like
  - _Heritage/Artistic_: art deco/geometric, editorial/magazine, retro-futuristic
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Tailwind, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:

- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML; consider Framer Motion for React if available, otherwise CSS transitions always work. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, Helvetica, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Tailwind CSS Patterns

When working with Tailwind CSS (especially v4), apply these techniques to achieve distinctive aesthetics within a utility-first framework:

**Typography Distinctiveness:**

- Use `font-[family-name]` with Google Fonts imports for distinctive typography
- Apply `tracking-tight` or `tracking-wide` for dramatic heading effects
- Combine `text-balance` with responsive font sizes for editorial layouts

**Color Expression:**

- Use Tailwind's color palette creatively — `lime-400` over `green-500` for unexpectedness
- Apply color through borders, shadows, and accents rather than large fills
- Use `bg-gradient-to-*` with unexpected angle combinations (not just `to-r`)

**Spatial Creativity:**

- Break out of containers with `relative` + `absolute` positioned decorative elements
- Use negative margins (`-mt-8`, `-ml-4`) for controlled overlap
- Apply `gap-*` asymmetrically with custom spacing values

**Motion with Tailwind:**

- Define custom `transition-*` durations: `duration-150` for snappy, `duration-500` for dramatic
- Use `group-hover:` and `peer-*` for sophisticated interaction patterns
- Apply `animate-*` with custom keyframes defined in CSS `@theme` blocks

**Dark Mode Distinctiveness:**

- Don't just invert — create different moods with `dark:bg-stone-900` vs `dark:bg-slate-950`
- Use different accent colors for dark mode (e.g., `lime-400` light, `lime-300` dark)
- Apply `dark:ring-*` and `dark:shadow-*` for subtle depth differences

**Avoiding Generic Patterns:**

- Skip `rounded-md` everywhere — vary with `rounded-none`, `rounded-xl`, `rounded-3xl`
- Don't default to `shadow-md` — try `shadow-2xl shadow-lime-500/20` for colored shadows
- Avoid `p-4` uniformly — create rhythm with varied padding (`p-3`, `p-6`, `p-8`)

## Accessibility Integration

Distinctive design must ALSO be accessible. Apply these principles alongside aesthetic choices:

**Color & Contrast:**

- Minimum 4.5:1 contrast ratio for body text (WCAG AA)
- Minimum 3:1 for large text (18pt+) and UI components
- Never rely on color alone to convey meaning — add icons, patterns, or text labels
- Test with grayscale filter to verify information is still clear

**Focus States:**

- All interactive elements need visible focus indicators
- Use `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[primary]`
- Don't remove focus outlines without replacing them with equally visible alternatives
- Focus indicators should have 3:1 contrast against adjacent colors

**Motion & Animation:**

- Wrap decorative animations in `motion-safe:` for users who prefer reduced motion
- Use `motion-reduce:transition-none` for essential interactions
- Keep functional animations under 300ms for responsiveness
- Avoid flashing content (no more than 3 flashes per second)

**Keyboard Navigation:**

- All interactive elements must be reachable via Tab
- Escape should close modals, drawers, and popovers
- Arrow keys for menu and listbox navigation
- Space/Enter for activation of buttons and links

**Semantic Structure:**

- Use proper heading hierarchy (h1 → h2 → h3, don't skip levels)
- Use landmark regions (`<main>`, `<nav>`, `<aside>`, `<footer>`)
- Add `aria-label` or `aria-labelledby` to icon-only buttons
- Use `<button>` for actions, `<a>` for navigation

**Screen Reader Support:**

- Add `sr-only` class for visually hidden but screen-reader-accessible text
- Use `aria-live` regions for dynamic content updates
- Ensure form inputs have associated labels
- Provide alt text for meaningful images; use `alt=""` for decorative images

> **Remember:** Accessibility is not a constraint on creativity — it's a dimension of quality. The best designs are both beautiful AND usable by everyone.
