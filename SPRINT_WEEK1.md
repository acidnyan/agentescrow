# AgentEscrow - Sprint Week 1 (Security Core)

## Objective
Ship the minimum production-safe backend control layer by completing P0 security items.

## Scope (This Week)
1. P0-1 Server-side auth + RBAC
2. P0-2 Backend state transition guard
3. P0-3 Server-side payment verification
4. P0-4 Idempotency + duplicate payment prevention
5. P0-5 Append-only audit log

## Day-by-day plan

### Day 1: Auth + RBAC
- Implement auth middleware for all mutating endpoints
- Enforce role checks:
  - creator: approve/cancel
  - assignee: submit
- Add unit tests for unauthorized/forbidden access

### Day 2: State machine enforcement
- Implement allowed transitions:
  - open -> in_progress -> submitted -> completed
- Reject all invalid transitions with 4xx
- Add transition validation tests

### Day 3: Payment verification on server
- Move tx verification from frontend to backend
- Verify receipt status + token contract + recipient + amount
- Mark payment/job only after successful verification

### Day 4: Idempotency + duplicate guards
- Add idempotency key support on approve endpoint
- Add DB uniqueness constraint per job payment intent
- Ensure retries are safe (same result returned)

### Day 5: Audit logging
- Add append-only audit table
- Record actor/action/job_id/before/after/timestamp/tx_hash
- Add basic query endpoint or admin view for investigation

### Day 6-7: Integration and stabilization
- Run end-to-end tests for full lifecycle
- Fix regressions and edge cases
- Prepare minimum operational docs

## Definition of Done (Week 1)
- Client cannot self-mark payment `confirmed`
- Invalid transitions are blocked server-side
- Repeated approve requests do not create duplicate payouts
- All sensitive actions are recorded in audit logs
- Core lifecycle E2E tests pass

## Out of scope (defer)
- Dispute arbitration
- Multi-assignee jobs
- Advanced monitoring stack
- VC export and portability features
