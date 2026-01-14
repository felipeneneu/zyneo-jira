# Chat Limit Type Fix

## 📅 2026-01-14 (Part 4)

### Summary
Fixed a build error in `use-get-chat-messages.ts` caused by incorrect type for the `limit` query parameter.

### Changes

#### 🐛 Bug Fixes
- **`src/features/chat/api/use-get-chat-messages.ts`**: 
  - Converted `limit` number to string before passing to API client, as Hono client expected string for query params.

### Impact
- **Stability**: Build should now pass.
