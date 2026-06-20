# Security Specification & Threat Model

This document outlines the security invariants, "Dirty Dozen" malicious payload tests, and the verification spec to secure our Adexa IA mobile-terminal backend on Cloud Firestore.

## 1. Data Invariants

1. **User Invariant**: A user profile must be strictly tied to their authenticated UID. No user can read, write, or forge an alternative profile ID or modify their registered UID.
2. **Trade Log Invariant**: No trade log can exist without matching the authenticated user's ID as the owner. Users cannot execute, modify, or list trades belonging to other users.
3. **Conversational Invariant**: Users can only query, save, or clean up their own conversation history logs under their own nesting collections.

---

## 2. The "Dirty Dozen" Spoofed Payloads (Test Specifications)

### Payload 1: Privilege Escalation (Profile Spoofing)
* **Goal**: Write to another user's profile.
* **Payload**: `setDoc(/users/attacker_uid, { uid: 'victim_uid', email: 'v@a.ia' })`
* **Expected Result**: `PERMISSION_DENIED`

### Payload 2: Shape/Attribute Poisoning (Shadow Attribute)
* **Goal**: Inject a phantom field into the User schema.
* **Payload**: `setDoc(/users/user_1, { uid: 'user_1', email: 'u1@a.ia', superAdmin: true, virtualCapital: 100000 })`
* **Expected Result**: `PERMISSION_DENIED`

### Payload 3: Value Range Poisoning (Huge text injection)
* **Goal**: Intentionally inflate fields with massive buffer arrays or extreme strings.
* **Payload**: `setDoc(/users/user_1, { uid: 'user_1', email: 'abc...' /* 1MB */ })`
* **Expected Result**: `PERMISSION_DENIED`

### Payload 4: Invalid Identifier / SQL Injection attempts
* **Goal**: Use malicious paths to trigger logic breakdowns.
* **Payload**: `setDoc(/users/user_1/trade_logs/../admin_bypass, { ... })`
* **Expected Result**: `PERMISSION_DENIED`

### Payload 5: Anonymous Spoofing (Unauthenticated Writes)
* **Goal**: Save or write to the database anonymously without an active session.
* **Payload**: `setDoc(/users/user_1, { ... })` (as Guest)
* **Expected Result**: `PERMISSION_DENIED`

### Payload 6: Ownership Theft (Trade Log Hijack)
* **Goal**: Force creation of a trade log under someone else's user profile nesting.
* **Payload**: `setDoc(/users/victim_1/trade_logs/log_1, { userUid: 'attacker_1', symbol: 'BTC', total: 1000 })`
* **Expected Result**: `PERMISSION_DENIED`

### Payload 7: State Shortcutting (Mutate Immutable Logs)
* **Goal**: Update an existing trade log's immutable values.
* **Payload**: `updateDoc(/users/user_1/trade_logs/log_1, { amount: 999999 })`
* **Expected Result**: `PERMISSION_DENIED`

### Payload 8: Message Forgery
* **Goal**: Push chat history under another user's name.
* **Payload**: `setDoc(/users/victim_2/chat_messages/msg_1, { userUid: 'attacker' })`
* **Expected Result**: `PERMISSION_DENIED`

### Payload 9: Illegal Enum State (Status injection)
* **Goal**: Set a status on a trade log that is outside the legal enum values.
* **Payload**: `setDoc(/users/user_1/trade_logs/log_1, { status: "HACKED_COMPLETED" })`
* **Expected Result**: `PERMISSION_DENIED`

### Payload 10: System-Generated Fields Override
* **Goal**: Bypass server validations to configure custom system strategies.
* **Payload**: `updateDoc(/users/user_1, { activeStrategyId: "" })`
* **Expected Result**: `PERMISSION_DENIED`

### Payload 11: Bulk Retrieval Scraping (Unbounded query)
* **Goal**: Run blanket non-filtered fetch queries on collections without proper constraints.
* **Payload**: `getDocs(/users)`
* **Expected Result**: `PERMISSION_DENIED`

### Payload 12: Unauthorized Profile Updates (Read other people's chats)
* **Goal**: Run snapshot listener for chat messages on a separate user profile block.
* **Payload**: `getDocs(/users/victim_uid/chat_messages)`
* **Expected Result**: `PERMISSION_DENIED`

---

## 3. Test Script Framework Outline

The firestore security test definitions verify these invariants by asserting all invalid payloads fails:

```typescript
// Test runner skeleton verified via security specifications
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

// Standard security matrix verifies that Dirty Dozen requests match error expectations.
```
