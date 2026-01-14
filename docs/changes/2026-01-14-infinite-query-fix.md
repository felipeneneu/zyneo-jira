# Infinite Query Type Fix

## 📅 2026-01-14 (Part 3)

### Summary
Fixed a build error in `use-get-chat-messages.ts` caused by incorrect type inference of `pageParam`.

### Changes

#### 🐛 Bug Fixes
- **`src/features/chat/api/use-get-chat-messages.ts`**: 
  - Explicitly cast `pageParam` to `string | null` to match the expected `cursor` type in the API client.

### Impact
- **Stability**: Build should now pass.
