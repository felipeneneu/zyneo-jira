# 2026-01-30 - Tasks report AI overview (Friday gated)

## Summary
- Added Gemini-powered performance overview for the tasks PDF report.
- Added PowerBI-style charts for status distribution and due health.
- Enforced Friday-only report generation in UI and API.

## Details
- New report overview endpoint:
  - Validates workspace membership and task scope.
  - Uses Gemini to generate overview, strengths, improvements, attention, and actions.
  - Enforces Friday-only availability with a 403 response.
  - File: `src/features/tasks/server/route.ts`
- PDF report enhancements:
  - Adds AI overview sections above the table.
  - Adds two bar charts for status distribution and due health.
  - File: `src/features/tasks/utils/generate-tasks-report.ts`
- UI integration:
  - New hook to request report insights.
  - Report button disabled outside Friday with tooltip guidance.
  - File: `src/features/tasks/components/task-view-switcher.tsx`
  - File: `src/features/tasks/api/use-generate-tasks-report.ts`
