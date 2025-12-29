# Design OS Hookify Rules

Design OS includes **hookify guardrails** that provide real-time feedback during development. These rules catch common mistakes before they cause problems.

## How It Works

Hookify rules are markdown files with YAML frontmatter that trigger on specific events:

- **file** events — When creating or editing files
- **prompt** events — When user submits a prompt
- **bash** events — When running bash commands

Each rule can either:

- **warn** — Show a warning and continue
- **block** — Prevent the action entirely

## Rule Categories

| Category       | Prefix           | Count | Purpose                                |
| -------------- | ---------------- | ----- | -------------------------------------- |
| Code Patterns  | `dos-code-`      | 6     | Prevent code that won't work correctly |
| Workflow       | `dos-workflow-`  | 3     | Guide command sequence                 |
| Data Integrity | `dos-data-`      | 4     | Ensure data.json correctness           |
| Design System  | `dos-design-`    | 4     | Enforce design consistency             |
| Accessibility  | `dos-a11y-`      | 2     | Catch accessibility issues             |
| File Structure | `dos-structure-` | 3     | Ensure correct file organization       |

See [categories.md](./categories.md) for detailed category explanations.

## Quick Reference

### Critical Rules (BLOCK)

These rules **prevent** actions that would break Design OS:

| Rule                                 | What It Blocks                                  |
| ------------------------------------ | ----------------------------------------------- |
| `dos-code-block-direct-data-import`  | Importing data.json in exportable components    |
| `dos-code-block-tailwind-config`     | Creating tailwind.config.js (v4 doesn't use it) |
| `dos-structure-block-tsx-in-product` | Creating .tsx files in product/ directory       |

### Warning Rules (WARN)

These rules **warn** about potential issues:

| Rule                              | What It Catches                      |
| --------------------------------- | ------------------------------------ |
| `dos-code-warn-missing-dark-mode` | Color classes without dark: variants |
| `dos-code-warn-relative-imports`  | Deep relative imports instead of @/  |
| `dos-workflow-warn-*-prereqs`     | Command prerequisites not met        |
| `dos-data-warn-missing-meta`      | data.json without \_meta structure   |
| `dos-design-warn-generic-fonts`   | Inter, Roboto, Arial usage           |

> **Note:** This table shows common examples. See [categories.md](./categories.md) for the complete list of all 19 warning rules.

## Managing Rules

### List All Rules

```bash
ls .claude/hookify.dos-*.local.md
```

### Disable a Rule

1. Open the rule file (e.g., `.claude/hookify.dos-code-warn-missing-dark-mode.local.md`)
2. Change `enabled: true` to `enabled: false`
3. Save — takes effect immediately

### Enable a Disabled Rule

1. Open the rule file
2. Change `enabled: false` to `enabled: true`
3. Save — takes effect immediately

### View Rule Details

Each rule file contains:

- YAML frontmatter with configuration
- Markdown message that displays when triggered

```yaml
---
name: dos-code-block-direct-data-import
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/sections/[^/]+/components/.*\.tsx$
  - field: new_text
    operator: regex_match
    pattern: import.*from\s+['"].*data\.json['"]
---
Your helpful error message here...
```

## Rule File Format

### Fields

| Field        | Required | Description                               |
| ------------ | -------- | ----------------------------------------- |
| `name`       | Yes      | Unique rule identifier                    |
| `enabled`    | Yes      | `true` or `false`                         |
| `event`      | Yes      | `file`, `prompt`, `bash`, or `all`        |
| `action`     | Yes      | `warn` or `block`                         |
| `pattern`    | No       | Simple regex pattern (single condition)   |
| `conditions` | No       | Array of conditions (multiple conditions) |

### Condition Operators

| Operator       | Description                         |
| -------------- | ----------------------------------- |
| `regex_match`  | Pattern must match the field        |
| `contains`     | Field must contain the string       |
| `not_contains` | Field must NOT contain the string   |
| `equals`       | Field must exactly equal the string |
| `starts_with`  | Field must start with the string    |
| `ends_with`    | Field must end with the string      |

### Available Fields by Event Type

| Event    | Fields                                         |
| -------- | ---------------------------------------------- |
| `file`   | `file_path`, `new_text`, `old_text`, `content` |
| `prompt` | `user_prompt`                                  |
| `bash`   | `command`                                      |

## Creating Custom Rules

1. Create a new file: `.claude/hookify.dos-[category]-[name].local.md`
2. Add YAML frontmatter with configuration
3. Add markdown message below the frontmatter
4. Save — rule is active immediately

### Example: Block Specific Import

```yaml
---
name: dos-custom-block-lodash
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.tsx?$
  - field: new_text
    operator: contains
    pattern: from 'lodash'
---
Design OS uses native JavaScript methods instead of lodash.

Use array methods like `.map()`, `.filter()`, `.reduce()` instead.
```

## Troubleshooting

### Rule Not Triggering

1. Verify `enabled: true` in the frontmatter
2. Check the regex pattern matches your file/content
3. Verify the event type is correct (`file` vs `prompt` vs `bash`)

### Too Many False Positives

1. Make the pattern more specific
2. Add additional conditions to narrow the scope
3. Consider changing from `block` to `warn`

### Rule Syntax Errors

Validate YAML syntax:

```bash
head -20 .claude/hookify.dos-*.local.md | grep -E "^(name|enabled|event|action|pattern):"
```

## Error Handling

### What Happens When a Rule Has Errors

If a hookify rule has YAML syntax errors or invalid configuration:

| Error Type             | Behavior                 | How to Diagnose                    |
| ---------------------- | ------------------------ | ---------------------------------- |
| Invalid YAML syntax    | Rule is silently ignored | Check YAML parsing                 |
| Missing required field | Rule is silently ignored | Verify all required fields present |
| Invalid operator       | Rule won't match         | Check operator spelling            |
| Invalid regex pattern  | Rule may error or skip   | Test pattern separately            |

### Diagnosing Non-Working Rules

1. **Check YAML syntax:**

   ```bash
   # Validate YAML structure (requires yq or similar)
   cat .claude/hookify.dos-[rule-name].local.md | sed -n '/^---$/,/^---$/p' | yq .
   ```

2. **Common YAML issues:**
   - Missing quotes around patterns with special characters
   - Incorrect indentation (YAML requires consistent spaces, not tabs)
   - Missing colons after field names
   - Unescaped special characters in patterns

3. **Test patterns manually:**
   ```bash
   # Test if a pattern matches expected files
   echo "src/sections/invoices/components/List.tsx" | grep -E "src/sections/[^/]+/components/.*\.tsx$"
   ```

### Example Fixes for Common Errors

**Problem:** Pattern with unquoted special characters

```yaml
# Wrong - special chars not quoted
pattern: import.*from\s+.*data\.json

# Correct - pattern in quotes
pattern: "import.*from\\s+.*data\\.json"
```

**Problem:** Missing required fields

```yaml
# Wrong - missing event and action
---
name: my-rule
enabled: true
pattern: "test"
---
# Correct - all required fields present
---
name: my-rule
enabled: true
event: file
action: warn
pattern: "test"
---
```

## Related Documentation

- [agents.md](../../agents.md) — Design OS agent directives
- [categories.md](./categories.md) — Detailed category explanations
- [SKILL.md](../skills/frontend-design/SKILL.md) — Frontend design guidance
