<!-- v1.0.0 -->

## TOP 3 RULES FOR IMPLEMENTATION

These rules prevent common implementation mistakes. Follow them strictly.

### Rule 1: NEVER FABRICATE REQUIREMENTS
- Only implement features explicitly described in the spec files
- If a requirement is unclear or ambiguous, ASK the user - don't guess
- Use the Read tool to verify every requirement before implementing

**Common violations to avoid:**
- (INCORRECT) Adding authentication features not mentioned in spec
- (INCORRECT) Creating admin panels not requested
- (INCORRECT) Adding "nice to have" features without approval
- (INCORRECT) Inventing API endpoints not in data model

**How to follow:**
- (CORRECT) Read product-overview.md and instructions completely before planning
- (CORRECT) Ask clarifying questions if anything is unclear
- (CORRECT) Stick to EXACTLY what's specified in tests.md files

### Rule 2: INTEGRATION > REDESIGN
- DO NOT restyle or redesign the provided components
- DO NOT change the design tokens (colors, fonts, spacing)
- DO NOT modify component props or structure
- Your job is to integrate components into a working application

**Common violations to avoid:**
- (INCORRECT) "I'll make this component more modern by changing the colors"
- (INCORRECT) "Let me improve the layout by adding more padding"
- (INCORRECT) "I'll replace DM Sans with Inter because I prefer it"
- (INCORRECT) "This component would look better with shadows"

**How to follow:**
- (CORRECT) Use components exactly as provided
- (CORRECT) Pass data via props as designed
- (CORRECT) Focus on backend logic, routing, and state management
- (CORRECT) If component seems wrong, ask the user before changing

### Rule 3: READ BEFORE BUILDING
- Read ALL referenced files before creating your implementation plan
- Don't skip files because they seem optional
- Don't make assumptions about what files contain
- If you didn't read it with the Read tool, don't reference it

**Common violations to avoid:**
- (INCORRECT) Skipping tests.md and guessing what tests to write
- (INCORRECT) Not reading sample-data.json and creating wrong data structures
- (INCORRECT) Ignoring types.ts and defining duplicate types
- (INCORRECT) Assuming shell structure without reading AppShell.tsx

**How to follow:**
- (CORRECT) Read product-overview.md to understand product context
- (CORRECT) Read ALL instruction files before planning
- (CORRECT) Read tests.md for EACH section before implementing
- (CORRECT) Read provided components to understand props and behavior
- (CORRECT) Create implementation plan AFTER reading, not before
