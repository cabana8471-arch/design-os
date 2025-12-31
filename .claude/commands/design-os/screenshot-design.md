<!-- v1.0.0 -->

# Screenshot Screen Design

You are helping the user capture a screenshot of a screen design they've created. The screenshot will be saved to the product folder for documentation purposes.

## Prerequisites: Check for Playwright MCP

Before proceeding, verify that you have access to the Playwright MCP tool.

### Tool Availability Check

The Playwright MCP provides browser automation tools. Check for these **exact tool names** in your available tools list:

**Primary Tools (from @playwright/mcp):**
| Tool Name | Purpose |
|-----------|---------|
| `mcp__playwright__browser_navigate` | Navigate to a URL |
| `mcp__playwright__browser_take_screenshot` | Capture screenshot |
| `mcp__playwright__browser_click` | Click elements |
| `mcp__playwright__browser_set_viewport_size` | Set viewport dimensions |

**Alternative Tool Names (older versions):**

- `browser_take_screenshot` — May appear without `mcp__playwright__` prefix
- `playwright_screenshot` — Deprecated, use `browser_take_screenshot`

**How to check:** The AI agent should examine its available tool list. If ANY Playwright browser tool is available (with or without the `mcp__playwright__` prefix), proceed. If no browser automation tools are found, show the installation message below.

> **Troubleshooting Tool Names:** If tool calls fail with "unknown tool" errors:
>
> 1. Run `/mcp` to see available MCP servers and their tools
> 2. Check the exact tool name prefixes used by your installation
> 3. Custom MCP configs may use different prefixes (e.g., `custom__browser_*`)
> 4. Update tool calls to match your available tool names

### If Playwright MCP is NOT Available

Output this EXACT message to the user (copy it verbatim, do not modify or "correct" it):

---

To capture screenshots, I need the Playwright MCP server installed. Please run:

```
claude mcp add playwright npx @playwright/mcp@latest
```

## Then restart this Claude Code session and run `/screenshot-design` again.

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

> **⚠️ CLEANUP REQUIREMENT:** If ANY step after this fails, you MUST run Step 6 (Clean Up) before ending. Failure to clean up will leave an orphaned dev server on port 3000. See "Error Recovery" section at the end for details.

### Dev Server Detection and Startup

**First, check if a dev server is already running:**

```bash
# Check if dev server is already running on port 3000 (configured in vite.config.ts)
DEV_SERVER_PREEXISTING=false

if lsof -i :3000 > /dev/null 2>&1; then
  echo "Dev server already running on port 3000"
  DEV_SERVER_PREEXISTING=true
else
  echo "Starting dev server..."
  npm run dev &
  DEV_SERVER_PREEXISTING=false

  # Wait for server to be ready with retry loop (more reliable than fixed sleep)
  MAX_RETRIES=30
  RETRY_COUNT=0
  echo "Waiting for dev server to be ready..."

  while ! curl -s http://localhost:3000 > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
      echo "Error: Dev server failed to start after ${MAX_RETRIES} seconds"
      exit 1
    fi
    sleep 1
  done

  echo "Dev server ready after ${RETRY_COUNT} seconds"
fi

echo "DEV_SERVER_PREEXISTING=$DEV_SERVER_PREEXISTING"
```

**Track the dev server state:**

- If `DEV_SERVER_PREEXISTING=true`: Do NOT kill the server in Step 6
- If `DEV_SERVER_PREEXISTING=false`: Kill the server in Step 6 (you started it)

**Verify server is ready:**

After the check/startup, verify `http://localhost:3000` returns a response before navigating to the screen design URL.

## Step 3: Capture the Screenshot

> **Recovery:** If this step fails, run Step 6 (Clean Up) before ending command.

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

4. First, use `browser_navigate` to go to the screen design URL
5. Wait for the page to fully load (at least 2-3 seconds for fonts and images)
6. **Hide the Design OS preview header** — Click the "Hide" link (with `data-hide-header` attribute). This is the Design OS preview chrome, separate from the product's shell navigation.
7. Use `browser_take_screenshot` to capture the page (without the navigation bar)

### Hide Button Failure Handling

If the Hide button cannot be found or clicked, follow this fallback procedure:

**Possible failure reasons:**
| Symptom | Likely Cause | Action |
|---------|--------------|--------|
| Element not found | Wrong selector | Try `[data-hide-header]` or text "Hide" |
| Click doesn't work | Element obscured | Wait longer for page load |
| No header visible | Already hidden or fullscreen route | Proceed without clicking |

**Fallback Procedure:**

1. **Try alternative selectors:**

   ```
   Selectors to try (in order):
   1. [data-hide-header]
   2. button:has-text("Hide")
   3. a:has-text("Hide")
   ```

   > **Note:** The `:has-text()` pseudo-selector is **Playwright-specific syntax**, not standard CSS. It's used by Playwright MCP's `browser_click` tool to select elements containing specific text. Standard CSS does not support `:has-text()`. When using Playwright MCP, these selectors work directly with `browser_click`.

2. **If all selectors fail:**
   - Check if you're on the `/fullscreen` variant of the URL (no header shown)
   - If on fullscreen URL, the header is already hidden — proceed to screenshot

3. **If click fails but element exists:**
   - Wait 2 more seconds for animations to complete
   - Retry the click once

4. **Final fallback:**
   - Proceed with screenshot capture
   - Note in the output: "Screenshot captured with Design OS header visible (Hide button not found)"
   - The screenshot is still usable; user can crop or retake later

**Screenshot specifications (quick reference):**

| Viewport              | Width  | Height | Use Case                           |
| --------------------- | ------ | ------ | ---------------------------------- |
| **Desktop** (default) | 1280px | 800px  | Standard documentation screenshots |
| **Mobile**            | 375px  | 667px  | Mobile-responsive variants         |
| **Tablet**            | 768px  | 1024px | Tablet variants (optional)         |

> **Canonical Source:** These dimensions are defined in `agents.md` → "Viewport Dimensions (Standardized)". If values differ, agents.md takes precedence. See that section for responsive breakpoint details and additional context.

### Viewport Selection Guidance

**When to use each viewport:**

| Viewport    | Best For                                                                | Examples                                               |
| ----------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| **Desktop** | Primary documentation, complex layouts, data tables, dashboards         | Admin panels, analytics dashboards, multi-column forms |
| **Mobile**  | Touch-first interfaces, mobile-specific features, responsive validation | Mobile navigation, touch gestures, bottom sheets       |
| **Tablet**  | Hybrid layouts, side-by-side views, reading-focused content             | Document viewers, email clients, iPad-optimized apps   |

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
- `invoice-list-dark.png` — Dark mode variant (desktop)

**Combining suffixes:** When capturing both viewport and theme variants, use this order: `[screen-name]-[viewport]-[variant].png`. Examples:

- `invoice-list-mobile-dark.png` — Mobile dark mode
- `invoice-list-tablet-dark.png` — Tablet dark mode

**Requirements:**

- **Desktop is the default** — always capture at 1280x800 unless mobile/tablet requested
- Use **full page screenshot** to capture the entire scrollable content (not just the viewport)
- PNG format for best quality
- Consistent viewport dimensions ensure documentation screenshots look uniform

> **Note:** The viewport sizes above are defaults. If your design uses custom breakpoints (e.g., `sm:` at 600px instead of 640px, or a custom `2xl:` at 1536px), adjust the viewport dimensions to match your actual breakpoint values. Check your component's responsive classes to ensure screenshots capture the intended layout at each breakpoint.

When using `browser_take_screenshot`:

- Set `fullPage: true` to capture the entire page including content below the fold
- **Important:** Set viewport size BEFORE navigating to the page: Call `browser_set_viewport_size(1280, 800)` at the start of Step 3, before `browser_navigate`. This ensures the page renders at the correct dimensions from the start.

## Step 4: Save the Screenshot

> **Recovery:** If this step fails, run Step 6 (Clean Up) before ending command.

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

> **Recovery:** Ensure Step 6 (Clean Up) runs after user interaction, even if user declines additional screenshots.

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

> **Important:** The `DEV_SERVER_PREEXISTING` flag set in Step 2 must be preserved through all subsequent steps. Before executing cleanup, verify the value of this flag to avoid accidentally killing a pre-existing server.

**If `DEV_SERVER_PREEXISTING=false` (you started the server in Step 2):**

```bash
# Kill the npm run dev process on port 3000 (configured in vite.config.ts)
lsof -ti :3000 | xargs kill -9 2>/dev/null || true

# Verify cleanup
if ! lsof -i :3000 > /dev/null 2>&1; then
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
- **Configured port:** 3000 (see vite.config.ts)
- Always capture full page screenshots to include all scrollable content
- **Cleanup:** Only kill the dev server if you started it (DEV_SERVER_PREEXISTING=false)

### Performance Note

This command involves several steps that may take time:

- **Dev server startup** (Step 2) — Wait for the server to be fully ready before navigating
- **Page rendering** (Step 3) — Allow time for fonts, images, and animations to load
- **Screenshot capture** — Full page screenshots of complex pages may take a moment

If the screenshot appears incomplete or shows loading states, try waiting a few seconds longer before capturing.

### Error Recovery (MANDATORY)

> **⚠️ CRITICAL:** If ANY step fails after Step 2 (Start Dev Server), you MUST execute the cleanup below. Do NOT end the command without cleaning up first.

If any step fails after starting the dev server, you must clean up to avoid leaving orphaned processes.

**Check if dev server is still running:**

```bash
lsof -i :3000
```

**If the command fails between Step 2 and Step 6:**

1. **Check `DEV_SERVER_PREEXISTING` value** — Did you start the server or was it already running?
2. **If you started it** (`DEV_SERVER_PREEXISTING=false`):

   ```bash
   # Kill the orphaned dev server
   lsof -ti :3000 | xargs kill -9 2>/dev/null || true

   # Verify it's stopped
   lsof -i :3000 || echo "Server stopped"
   ```

3. **If it was pre-existing** (`DEV_SERVER_PREEXISTING=true`):
   - Leave the server running
   - The user intentionally had it running

**Common failure scenarios:**

| Step   | Failure Type           | Recovery Action                               |
| ------ | ---------------------- | --------------------------------------------- |
| Step 2 | Server won't start     | Check port 3000 availability: `lsof -i :3000` |
| Step 3 | Page won't load        | Verify route exists in router.tsx             |
| Step 3 | Hide button not found  | Proceed with screenshot (header visible)      |
| Step 4 | Screenshot save fails  | Check .playwright-mcp/ directory permissions  |
| Step 4 | Copy to product/ fails | Check product/sections/[id]/ directory exists |

**If command terminates unexpectedly:**

Always run this cleanup check before re-running the command:

```bash
# Check for orphaned dev server
if lsof -i :3000 > /dev/null 2>&1; then
  echo "Dev server still running on port 3000"
  echo "Kill it with: lsof -ti :3000 | xargs kill -9"
else
  echo "Port 3000 is free"
fi
```

This prevents port conflicts when re-running `/screenshot-design`.
