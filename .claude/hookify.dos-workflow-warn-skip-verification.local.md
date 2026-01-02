---
name: dos-workflow-warn-skip-verification
enabled: true
event: prompt
action: warn
conditions:
  - field: user_prompt
    operator: regex_match
    pattern: "skip.*(verification|check|test)"
---

## Purpose

Warns when user attempts to skip verification steps.

## Example

```
skip the verification step
```

## Resolution

Verification ensures quality. If you must skip, document why and plan to verify later.
