# Screenshot Screen Design

You are helping the user capture a screenshot of a screen design they've created. The screenshot will be saved to the product folder for documentation purposes.

## Prerequisites: Check for Playwright MCP

Before proceeding, verify that you have access to the Playwright MCP tool.

### Tool Availability Check

Look for any of these tool names in your available tools:
- `browser_take_screenshot`
- `mcp__playwright__browser_take_screenshot`
- `playwright_screenshot`

**How to check:** The AI agent should check its available tool list. If any Playwright-related browser/screenshot tool is available, proceed. If not, show the installation message below.

### If Playwright MCP is NOT Available

Output this EXACT message to the user (copy it verbatim, do not modify or "correct" it):

---
To capture screenshots, I need the Playwright MCP server installed. Please run:

```
claude mcp add playwright npx @playwright/mcp@latest
```

Then restart this Claude Code session and run `/screenshot-design` again.
---

Do not substitute different package names or modify the command. Output it exactly as written above.

**END COMMAND** — Do not proceed with the rest of this command if Playwright MCP is not available.

### Graceful Degradation (Alternative)

If Playwright is unavailable and the user cannot install it, offer this alternative:

```
Alternative: If you can't install Playwright MCP, you can capture screenshots manually:

1. Start the dev server: npm run dev
2. Navigate to the screen design URL in your browser
3. Use your browser's screenshot tool or an extension
4. Save to: product/sections/[section-id]/[screen-name].png

Then run /export-product when ready — it will include any screenshots found in the section folders.
```

This allows users to continue with the workflow even without the MCP tool.

### If Playwright MCP IS Available

Proceed to Step 1.

## Step 1: Identify the Screen Design

First, determine which screen design to screenshot.

Read `/product/product-roadmap.md` to get the list of available sections, then check `src/sections/` to see what screen designs exist.

If only one screen design exists across all sections, auto-select it.

If multiple screen designs exist, use the AskUserQuestion tool to ask which one to screenshot:

"Which screen design would you like to screenshot?"

Present the available screen designs as options, grouped by section:
- [Section Name] / [ScreenDesignName]
- [Section Name] / [ScreenDesignName]

## Step 2: Start the Dev Server

Start the dev server yourself using Bash. Do NOT ask the user if the server is running or tell them to start it.

### Dev Server Detection and Startup

**First, check if a dev server is already running:**

```bash
# Check if dev server is already running on port 5173 (Vite default)
if lsof -i :5173 > /dev/null 2>&1; then
  echo "Dev server already running on port 5173"
  # Set flag: DEV_SERVER_PREEXISTING=true
else
  echo "Starting dev server..."
  npm run dev &
  # Set flag: DEV_SERVER_PREEXISTING=false
  # Wait for server to be ready
  sleep 5
fi
```

**Track the dev server state:**
- If `DEV_SERVER_PREEXISTING=true`: Do NOT kill the server in Step 6
- If `DEV_SERVER_PREEXISTING=false`: Kill the server in Step 6 (you started it)

**Verify server is ready:**

After the check/startup, verify `http://localhost:5173` returns a response before navigating to the screen design URL. If using port 3000 instead (older configs), check that port.

## Step 3: Capture the Screenshot

Use the Playwright MCP tool to navigate to the screen design and capture a screenshot.

The screen design URL pattern is: `http://localhost:3000/sections/[section-id]/screen-designs/[screen-design-name]`

**Route Verification:**
This URL pattern matches the route defined in `src/lib/router.tsx`:
- Router pattern: `/sections/:sectionId/screen-designs/:screenDesignName`
- Ensure `section-id` matches a directory in `src/sections/`
- Ensure `screen-design-name` matches a `.tsx` file (without extension) in `src/sections/[section-id]/`

If the page shows a 404 or blank screen, check:
1. The route exists in router.tsx
2. The file exists at `src/sections/[section-id]/[screen-design-name].tsx`
3. The component has a default export

1. First, use `browser_navigate` to go to the screen design URL
2. Wait for the page to fully load
3. **Hide the Design OS preview header** — Click the "Hide" link (with `data-hide-header` attribute). This is the Design OS preview chrome, separate from the product's shell navigation.
   - If the Hide button cannot be found, proceed without hiding.
4. Use `browser_take_screenshot` to capture the page (without the navigation bar)

**Screenshot specifications:**

| Viewport | Width | Height | Use Case |
|----------|-------|--------|----------|
| **Desktop** (default) | 1280px | 800px | Standard documentation screenshots |
| **Mobile** | 375px | 667px | Mobile-responsive variants |
| **Tablet** | 768px | 1024px | Tablet variants (optional) |

### Viewport Selection Guidance

**When to use each viewport:**

| Viewport | Best For | Examples |
|----------|----------|----------|
| **Desktop** | Primary documentation, complex layouts, data tables, dashboards | Admin panels, analytics dashboards, multi-column forms |
| **Mobile** | Touch-first interfaces, mobile-specific features, responsive validation | Mobile navigation, touch gestures, bottom sheets |
| **Tablet** | Hybrid layouts, side-by-side views, reading-focused content | Document viewers, email clients, iPad-optimized apps |

**Decision guide:**

1. **Always capture Desktop first** — This is the default and provides the most complete view
2. **Add Mobile if:**
   - The product targets mobile users
   - The spec mentions mobile-specific interactions
   - You want to verify responsive breakpoints work correctly
3. **Add Tablet if:**
   - The product specifically targets tablet users (e.g., iPad apps)
   - The layout has a unique tablet breakpoint (not just scaled desktop)
   - The spec mentions tablet-specific features

**Screenshot naming with viewports:**
- `invoice-list.png` — Desktop (default, no suffix needed)
- `invoice-list-mobile.png` — Mobile variant
- `invoice-list-tablet.png` — Tablet variant

**Requirements:**
- **Desktop is the default** — always capture at 1280x800 unless mobile/tablet requested
- Use **full page screenshot** to capture the entire scrollable content (not just the viewport)
- PNG format for best quality
- Consistent viewport dimensions ensure documentation screenshots look uniform

When using `browser_take_screenshot`:
- Set `fullPage: true` to capture the entire page including content below the fold
- Set viewport size before capturing: `browser_set_viewport_size` with width and height from the table above

## Step 4: Save the Screenshot

The Playwright MCP tool can only save screenshots to its default output directory (`.playwright-mcp/`). You must save the screenshot there first, then copy it to the product folder.

1. **First**, use `browser_take_screenshot` with just a filename (no path):
   - Use a simple filename like `dashboard.png` or `invoice-list.png`
   - The file will be saved to `.playwright-mcp/[filename].png`

2. **Then**, copy the file to the product folder using Bash:
   ```bash
   cp .playwright-mcp/[filename].png product/sections/[section-id]/[filename].png
   ```

3. **Verify the screenshot was saved:**
   ```bash
   # Check if the screenshot file exists and has content
   if [ -f "product/sections/[section-id]/[filename].png" ] && [ -s "product/sections/[section-id]/[filename].png" ]; then
     echo "Screenshot saved successfully."
   else
     echo "Error: Screenshot file not found or is empty."
   fi
   ```

**Naming convention:** `[screen-design-name]-[variant].png`

Examples:
- `invoice-list.png` (main view)
- `invoice-list-dark.png` (dark mode variant)
- `invoice-detail.png`
- `invoice-form-empty.png` (empty state)

If the user wants both light and dark mode screenshots, capture both.

## Step 5: Confirm Completion

Let the user know:

"I've saved the screenshot to `product/sections/[section-id]/[filename].png`.

The screenshot captures the **[ScreenDesignName]** screen design for the **[Section Title]** section."

If they want additional screenshots (e.g., dark mode, different states):

"Would you like me to capture any additional screenshots? For example:
- Dark mode version (same viewport, toggle theme)
- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Different states (empty, loading, error, etc.)"

When all screenshots are complete, guide the user to the next step:

"**Next step:** When all your sections have screen designs and screenshots, run `/export-product` to generate the complete handoff package for implementation."

## Step 6: Clean Up - Kill Dev Server

After you're done capturing screenshots, clean up the dev server process based on the detection from Step 2.

**If `DEV_SERVER_PREEXISTING=false` (you started the server in Step 2):**

```bash
# Kill the npm run dev process on port 5173 (Vite default)
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

# Verify cleanup
if ! lsof -i :5173 > /dev/null 2>&1; then
  echo "Dev server stopped successfully"
fi
```

**If `DEV_SERVER_PREEXISTING=true` (server was already running):**

Do NOT kill the server. Inform the user:
```
"Leaving dev server running (it was already running before this command)."
```

**Important:** Never kill a pre-existing dev server without explicit user confirmation. The detection in Step 2 ensures you know whether you started the server or not.

## Important Notes

- **Requires Playwright MCP** — This command requires the Playwright MCP server to be installed. Run `claude mcp add playwright npx @playwright/mcp@latest` if not already set up
- **Dev server management** — Detect if server is running before starting; only kill servers you started
- Start the dev server yourself - do not ask the user to do it
- Screenshots are saved to `product/sections/[section-id]/` alongside spec.md and data.json
- Use descriptive filenames that indicate the screen design and any variant (dark mode, mobile, etc.)
- **Standard viewports:** Desktop 1280x800 (default), Mobile 375x667, Tablet 768x1024
- **Default port:** Vite uses port 5173 by default
- Always capture full page screenshots to include all scrollable content
- **Cleanup:** Only kill the dev server if you started it (DEV_SERVER_PREEXISTING=false)

### Performance Note

This command involves several steps that may take time:
- **Dev server startup** (Step 2) — Wait for the server to be fully ready before navigating
- **Page rendering** (Step 3) — Allow time for fonts, images, and animations to load
- **Screenshot capture** — Full page screenshots of complex pages may take a moment

If the screenshot appears incomplete or shows loading states, try waiting a few seconds longer before capturing.
