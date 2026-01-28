# 2026-01-28 - Dev Guided Tutorial (first workspace) + quick create shortcuts

## Summary
- Dev-guided tutorial is now created only for the user's first workspace (software_dev).
- Added a progress bar and ScrollArea for the tutorial card to keep content readable.
- Added quick-create shortcuts and Kbd UI hints for task, project, and workspace creation.

## Details
- First-workspace gating:
  - Checks membership count and user prefs to decide if tutorial should be created.
  - Stores `hasCreatedWorkspace` in user prefs after the first workspace is created.
  - File: `src/features/workspaces/server/route.ts`
- Tutorial UI:
  - Progress indicator (0-3 / 3) with visual bar.
  - Scrollable content when it exceeds available space.
  - Shortcut hints using `Kbd` and `KbdGroup`.
  - File: `src/features/tutorial/dev-guided-tutorial.tsx`
- Shortcut UX:
  - Global shortcuts: Ctrl/Cmd + Shift + T (task), P (project), W (workspace).
  - Mounted once in dashboard layout.
  - Files: `src/app/components/quick-create-shortcuts.tsx`, `src/app/(dashboard)/layout.tsx`
- New shared UI:
  - `Kbd` and `KbdGroup` components.
  - File: `src/ui/kbd.tsx`
