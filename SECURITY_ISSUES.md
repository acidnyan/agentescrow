# AgentEscrow Security Hardening Issues (Production Readiness)

Use this file to create GitHub Issues directly.

---

## P0-1: Server-side auth and RBAC
**Priority:** P0
**Goal:** Remove trust from frontend and enforce actor permissions server-side.

### Scope
- Add authenticated API layer
- Enforce `creator` / `assignee` permissions on all job actions
- Reject unauthorized actions with structured errors

### Acceptance Criteria
- Unauthenticated requests are rejected
- Only creator can approve/cancel
- Only assignee can submit deliverable
- Role checks covered by tests

---

## P0-2: State transition guard on backend
**Priority:** P0
**Goal:** Enforce valid lifecycle transitions server-side.

### Scope
- Implement state machine checks for `open -> in_progress -> submitted -> completed`
- Block illegal jumps and record attempts

### Acceptance Criteria
- Invalid transitions return 4xx
- Every transition recorded in audit log
- Transition tests included

---

## P0-3: Server-side payment verification
**Priority:** P0
**Goal:** Make payment confirmation authoritative and tamper-resistant.

### Scope
- Move tx receipt verification from client to server
- Verify `status`, `token contract`, `to`, `amount`
- Update job/payment status only on server verification success

### Acceptance Criteria
- Client cannot self-mark `confirmed`
- Verification supports Base/Ethereum and USDC/USDT
- Failed verifications are logged

---

## P0-4: Idempotency + double-spend prevention
**Priority:** P0
**Goal:** Prevent duplicate approve/payment execution.

### Scope
- Add idempotency key for approve endpoint
- Add DB constraint to prevent duplicate payment rows per job
- Handle retried requests safely

### Acceptance Criteria
- Repeated approve requests produce one payment intent only
- Duplicate writes blocked at DB layer

---

## P0-5: Append-only audit log
**Priority:** P0
**Goal:** Preserve forensic trace of all sensitive actions.

### Scope
- Audit entries: actor, action, job_id, before/after, timestamp, tx_hash
- Append-only table + immutable write policy

### Acceptance Criteria
- All lifecycle/payment actions create audit records
- Records are queryable by job and actor

---

## P1-1: Input validation and output sanitization
**Priority:** P1
**Goal:** Eliminate malformed and unsafe payload handling.

### Scope
- Strict validation for addresses, amounts, URLs, datetimes
- Escape/sanitize rendered user content
- Enforce URL protocol allowlist (`https`, optional `http`)

### Acceptance Criteria
- Invalid inputs rejected with clear codes
- No reflected/stored XSS in review tests

---

## P1-2: Rate limiting and abuse controls
**Priority:** P1
**Goal:** Reduce spam and brute-force behavior.

### Scope
- Per-IP and per-agent limits on sensitive endpoints
- Cooldown for repeated failed payment verifications

### Acceptance Criteria
- 429 returned on limit exceed
- Limits tunable via config

---

## P1-3: CSRF/CORS hardening
**Priority:** P1
**Goal:** Prevent cross-site request abuse.

### Scope
- If cookie auth: CSRF token on mutating endpoints
- Strict CORS allowlist for production origins

### Acceptance Criteria
- Cross-origin non-allowlisted requests blocked
- CSRF tests pass on state-changing routes

---

## P1-4: Secret management and rotation
**Priority:** P1
**Goal:** Prevent credential leakage and improve operational safety.

### Scope
- Move secrets from plain env usage to managed secrets flow
- Document and test key rotation process

### Acceptance Criteria
- No secrets committed in repo
- Rotation runbook validated

---

## P1-5: Safe error model
**Priority:** P1
**Goal:** Avoid leaking internals while keeping UX clear.

### Scope
- Standardize API error envelope
- Strip stack traces/internal details from client responses

### Acceptance Criteria
- Internal errors are generic externally
- Full detail preserved in server logs only

---

## P2-1: Webhook + confirmation depth
**Priority:** P2
**Goal:** Improve finality confidence for payment confirmations.

### Scope
- Optional webhook ingestion for tx updates
- Re-verify receipt and wait N confirmations before final status

### Acceptance Criteria
- Configurable confirmation depth
- Reorg-safe status behavior documented

---

## P2-2: Backup and restore drills
**Priority:** P2
**Goal:** Ensure recoverability.

### Scope
- Scheduled DB backups
- Restore procedure and periodic drill

### Acceptance Criteria
- Recovery point objective defined
- Successful restore test documented

---

## P2-3: Monitoring and alerting
**Priority:** P2
**Goal:** Detect failures before users do.

### Scope
- Metrics: error rate, latency, invalid transitions, payment failures
- Alerts for threshold breaches

### Acceptance Criteria
- Dashboard available
- Alert routing verified

---

## P2-4: Least-privilege admin model
**Priority:** P2
**Goal:** Reduce blast radius of operator mistakes.

### Scope
- Split admin roles (`viewer`, `operator`, `admin`)
- Protect high-risk actions with stronger auth

### Acceptance Criteria
- Role boundaries enforced in API
- Privileged actions audited

---

## P2-5: Security test pipeline
**Priority:** P2
**Goal:** Continuously catch regressions.

### Scope
- SAST + dependency vulnerability scan
- Core auth/payment E2E tests in CI

### Acceptance Criteria
- CI fails on high-severity findings
- Release checklist includes security gates
