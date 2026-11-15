# Security Specification — TELECHOBIS LAND

## 1. Data Invariants
- Every document in `/saves/{userId}` belongs strictly to the authenticated, email-verified user whose `request.auth.uid == userId`.
- No PII (`email`, `phone`, `address`) is stored in `/saves/{userId}`.
- `extrasUnlocked` can ONLY become `true` when `night6Completed == true` AND `completedNights == 6`.
- `completedNights` can only advance monotonically by at most `+1` per update (`0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6`), preventing state shortcutting directly to Night 6.
- `createdAt` and `userId` are immutable after document creation.
- `createdAt` and `updatedAt` MUST equal `request.time` (server timestamp).
- Collection `list` queries on `/saves` are forbidden (`allow list: if false`); each player accesses only their own `/saves/{uid}` document.

## 2. The "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Create**: `request.auth == null` writing to `/saves/user123`.
2. **Unverified Email Write**: `request.auth.token.email_verified == false` writing to `/saves/user123`.
3. **Identity Spoofing (Path vs Auth)**: User `alice` writing to `/saves/bob`.
4. **Identity Spoofing (Field vs Auth)**: User `alice` creating `/saves/alice` with `userId: "bob"`.
5. **Ghost Field Injection (Shadow Update)**: Valid save payload plus `{ isAdmin: true }`.
6. **State Shortcutting (Skip to Night 6)**: Updating `completedNights` from `0` directly to `6` or setting `extrasUnlocked: true` while `completedNights: 2`.
7. **Timestamp Forgery**: Providing a client `Date` for `updatedAt` instead of `request.time`.
8. **Immutable Field Tampering**: Changing `createdAt` or `userId` on update.
9. **Type Poisoning**: Passing `currentNight: "6"` (string) or `bestNightPowerRemaining: "100"` (string).
10. **Boundary Overflow / DoW**: Passing `displayName` of 5,000 characters or `currentNight: 99`.
11. **Path ID Poisoning**: Attempting to write to `/saves/invalid.id$123` or a 1,500-char document ID.
12. **Cross-User Read / Collection Scrape**: User `alice` reading `/saves/bob` or listing `/saves`.
