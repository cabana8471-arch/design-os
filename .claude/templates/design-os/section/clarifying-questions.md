<!-- v1.1.0-section -->

## Before You Begin

Please ask me clarifying questions about this section:

1. **Data Relationships**
   - How does this section's data relate to other entities in the data model?
   - Are there any cross-section dependencies or shared data?
   - Do any entities from other sections need to be referenced here?

2. **Integration Points**
   - How should this section connect to existing features?
   - Any API endpoints already built that this should use?
   - Does this section share components or utilities with other sections?

3. **Section-Specific Permissions** (if different from global auth)
   - Are there role-based access controls specific to this section?
   - Any actions that require elevated permissions?
   - Should certain data be hidden based on user role?

4. **Backend Business Logic**
   - Any server-side logic, validations or processes needed beyond what's shown in the UI?
   - Background processes, notifications, or webhooks to trigger?
   - Real-time updates or polling requirements?

5. **State & Navigation**
   - How should navigation between views work within this section?
   - Any state that needs to persist across views?
   - Deep linking or URL parameter requirements?

6. **Section-Specific Edge Cases**
   - Questions about specific user flows in this section
   - Empty states, error handling, loading states
   - Pagination, filtering, or search behavior

**Note:** This prompt is for section-specific implementation. Tech stack and global authentication questions were addressed during foundation setup (see one-shot prompt).
