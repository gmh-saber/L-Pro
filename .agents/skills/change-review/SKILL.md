---
name: change-review
description: Performs a read-only post-implementation review comparing the approved plan with the actual code changes, dependency graph, database changes, runtime behavior, tests, and Git diff. Use before considering an AI-generated feature complete.
---

# Change Review

## Mission

Determine whether the implementation actually matches the approved architecture and whether existing behavior remains protected.

This skill is READ-ONLY.

Do not modify files.

Do not fix findings.

Do not silently revert changes.

If a problem is found, report it and STOP.

Generate audit report name based on the topic. Do not overwrite existing audit reports if any audit report already exists, renew audit report instead.

---

# 1. Review Inputs

Use:

- approved feature plan
- approved change manifest
- architecture audit
- impact analysis
- actual Git status
- actual Git diff
- source code
- tests
- dependency graph
- database/schema
- runtime/browser behavior
- deployment information when relevant

---

# 2. Git Diff Is the Ground Truth for Actual Changes

Inspect:

- `git status`
- complete diff
- new files
- deleted files
- renamed files
- migrations
- configuration
- dependency files
- frontend files

Do not rely on the implementation agent's summary.

The agent's summary describes intent.

The Git diff describes reality.

---

# 3. Expected vs Actual

Build a comparison:

| Category | Approved | Actual | Result |
|---|---|---|---|
| New files | ... | ... | ... |
| Modified files | ... | ... | ... |
| Deleted files | ... | ... | ... |
| Migrations | ... | ... | ... |
| Routes | ... | ... | ... |
| Dependencies | ... | ... | ... |
| External systems | ... | ... | ... |
| Configuration | ... | ... | ... |

Investigate every unexpected difference.

---

# 4. Scope Violation

Identify:

- unexpected files
- unexpected dependencies
- unexpected migrations
- unexpected configuration changes
- unexpected shared component modifications
- unexpected external service usage

For each:

1. Identify why it changed.
2. Determine who depends on it.
3. Determine blast radius.
4. Determine whether the change was necessary.
5. Determine whether approval was obtained.

Do not automatically accept scope expansion.

---

# 5. Dependency Review

If Graphify/dependency analysis is available:

Check:

- new callers
- new dependencies
- changed dependency direction
- shared component usage
- inheritance changes
- route relationships
- service relationships
- model relationships

Ask:

> Did the implementation introduce unnecessary coupling?

Ask:

> Did a feature-specific component accidentally become a dependency of existing core behavior?

If yes, mark as a regression risk.

---

# 6. Shared Component Review

Check whether the implementation modified:

- shared services
- shared models
- repositories
- traits
- helpers
- base classes
- middleware
- providers
- global config
- shared frontend components
- shared API resources
- external clients

For each modified shared component:

- why was it changed?
- was the change approved?
- who depends on it?
- are tests adequate?
- does runtime behavior remain compatible?

---

# 7. Critical Flow Review

Check whether the implementation affected:

- authentication
- authorization
- tenant isolation
- payments
- checkout
- orders
- inventory
- pricing
- subscriptions
- billing
- security

Any unexpected modification to these areas should trigger STOP.

---

# 8. Database Review

Inspect actual migration/schema changes.

Verify:

- additive vs destructive
- indexes
- constraints
- relationships
- data ownership
- tenant isolation
- compatibility
- rollback considerations
- existing schema reuse

Check whether a migration was created unnecessarily.

Check whether the migration changes existing behavior.

Destructive changes require explicit approval.

---

# 9. Contract Review

Verify that existing:

- method signatures
- constructor signatures
- routes
- API responses
- status codes
- validation
- events
- event payloads
- queue payloads
- config keys
- frontend contracts

remain compatible.

If a contract changed unexpectedly:

STOP.

---

# 10. Runtime Review

For browser-accessible changes, use Chrome DevTools or another appropriate runtime tool when available.

Verify:

- page loads
- relevant routes work
- network requests succeed
- expected status codes
- response structures
- redirects
- authentication
- console errors
- browser behavior

Compare baseline behavior with post-change behavior where baseline exists.

New unexplained errors are regressions until explained.

---

# 11. Test Review

Inspect test results.

Confirm coverage for:

- feature happy path
- validation
- authorization
- edge cases
- failure handling
- integration behavior
- affected existing behavior

If tests pass but runtime behavior fails, runtime evidence must be reported.

If tests fail, classify:

- pre-existing
- feature-caused
- environment-caused
- dependency-caused
- unknown

Do not hide failures.

---

# 12. Performance / Accessibility / SEO Review

When relevant:

Use Lighthouse/Chrome DevTools to compare baseline and post-change behavior.

Look for:

- significant performance regression
- accessibility regression
- SEO regression
- additional expensive requests
- frontend errors
- excessive payloads

Do not expand scope to unrelated findings.

---

# 13. External Service Review

Determine whether implementation unexpectedly introduced or changed use of:

- Firebase
- Supabase
- MongoDB
- Vercel
- Google APIs
- other external services

Do not accept an external dependency merely because an MCP made it convenient.

If the service was not in the approved architecture, investigate and report it.

---

# 14. Design Review

For frontend changes:

Check:

- reuse of existing components
- design consistency
- responsive behavior
- Figma alignment where applicable
- shadcn consistency where applicable
- unnecessary duplicate components

Do not demand visual redesign outside the requested scope.

---

# 15. Security Review

Check for:

- missing authorization
- bypassed policies
- insecure direct object access
- sensitive data exposure
- weakened validation
- tenant boundary violations
- secrets committed to source
- unsafe environment changes

Any serious security regression means:

STOP.

---

# 16. Historical Review

If implementation removed or changed unusual existing behavior:

Inspect Git history when useful.

Determine whether:

- the old behavior had historical purpose
- a bug fix was removed
- a compatibility behavior was removed
- tests were missing

Unknown historical purpose is a reason to investigate, not automatically delete.

---

# 17. Approved vs Actual Architecture

Answer:

1. Did the implementation follow the approved architecture?
2. Did it introduce new coupling?
3. Did it modify more existing code than necessary?
4. Did it introduce unnecessary database changes?
5. Did it change public contracts?
6. Did it affect critical flows?
7. Did it preserve existing runtime behavior?
8. Did it stay within scope?

---

# 18. Final Classification

Use exactly one:

### PASS

The implementation matches the approved architecture, stays within scope, and evidence supports preserved behavior.

### PASS WITH REVIEW ITEMS

The implementation is usable but has documented non-blocking concerns that should be reviewed.

### STOP — SCOPE OR REGRESSION ISSUE

The implementation contains unexpected changes, regressions, architectural violations, or insufficient evidence.

### STOP — APPROVAL REQUIRED

A high-risk architectural or infrastructure change requires human approval.

Do not provide numerical scores.

Do not provide an overall ranking.

---

# 19. Output

Return exactly:

## Approved Scope

## Actual Changes

## Scope Differences

## Dependency Review

## Shared Component Review

## Critical Flow Review

## Database Review

## Contract Review

## Runtime Review

## Test Review

## Performance / Accessibility / SEO Review

## External Service Review

## Design Review

## Security Review

## Historical Review

## Risks

## Required Actions

## Final Classification

Do not modify files.
