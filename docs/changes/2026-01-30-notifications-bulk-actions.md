# 2026-01-30 - Notifications bulk actions + AI fallback

## Summary
- Added "mark all read" and "remove all" actions in Notifications.
- Added API endpoints for bulk read/removal.
- Added fallback generation when Gemini is unavailable for daily focus and task report overview.
- Enabled report generation button in development environment.

## Details
- Notifications UI:
  - New buttons in Notifications header.
  - File: `src/features/notification/components/notifications-list.tsx`
- Notifications API:
  - New routes: `/api/notifications/mark-all-read`, `/api/notifications/remove-all`.
  - File: `src/features/notifications/server/route.ts`
  - Hook updates: `src/features/notifications/api/use-notification-actions.ts`
- Report gating:
  - Friday-only enforced in production, unlocked in dev.
  - File: `src/features/tasks/server/route.ts`
  - File: `src/features/tasks/components/task-view-switcher.tsx`
- AI fallback:
  - If Gemini is missing/unavailable, fallback insights are used.
  - Files: `src/features/notifications/server/route.ts`, `src/features/tasks/server/route.ts`
