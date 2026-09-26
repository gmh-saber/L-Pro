---
name: safe-feature
description: Safely implements an approved feature in an existing application using dependency analysis, minimal blast radius, backward compatibility, isolated architecture, MCP-assisted verification, testing, regression protection, and Git diff review.
---

# Safe Feature Implementation

## Mission

Implement the approved feature without unnecessarily changing existing behavior.

This skill is for implementation after architecture has been investigated.

If no architecture audit exists, perform a focused investigation before coding.

The feature must remain inside its approved boundary.

Generate audit report name based on the topic. Do not overwrite existing audit reports if any audit report already exists, renew audit report instead.

---

# 1. Preconditions

Before modifying files, confirm:

- the requested feature is understood
- relevant architecture has been investigated
- existing functionality has been searched
- dependencies are understood
- database impact is understood
- security impact is understood
- runtime behavior is understood where relevant
- an implementation boundary exists
- the expected file changes are known
- high-risk changes have been approved

If these conditions are not satisfied, STOP and investigate.

---

# 2. Approved Change Manifest

Create or consume an approved manifest containing:

### New files

Files allowed to be created.

### Existing files

Files allowed to be modified.

For every existing file:

- reason
- expected change
- known dependents
- risk

### Forbidden files

Existing files that should not be modified without renewed approval.

### Database

- migrations allowed
- migrations forbidden
- destructive changes

### External systems

- allowed integrations
- forbidden integrations

### Tests

Expected tests.

### Deployment

Whether deployment changes are allowed.

---

# 3. Protect Existing User Work

Before coding:

- inspect Git status
- identify modified/untracked files
- determine which changes predate this task

Never:

- reset
- clean
- checkout over user changes
- discard unrelated changes
- overwrite user files

If existing work conflicts with the implementation, STOP and ask.

---

# 4. Use Existing Architecture

Before creating a new abstraction, search for an existing equivalent.

Reuse:

- services
- actions
- repositories
- DTOs
- validators
- models
- policies
- components
- API resources
- query scopes
- events
- jobs
- feature flags

Reuse does not mean modifying shared code unnecessarily.

If a stable abstraction can be consumed without modification, prefer that.

---

# 5. Prefer Isolation

Prefer a structure like:

    New Feature
        ↓
    Feature-specific service/action
        ↓
    Existing stable abstraction
        ↓
    Existing application

Avoid:

    New Feature
        ↓
    modify shared core
        ↓
    many unrelated consumers
        ↓
    regression risk

Use feature-specific classes when they reduce coupling.

Examples:

- Feature-specific service
- Feature-specific action
- Feature-specific DTO
- Feature-specific request
- Feature-specific policy
- Feature-specific job
- Feature-specific event

Do not create abstractions solely to satisfy a pattern.

---

# 6. Existing File Modification Rule

Before modifying an existing file:

1. Reconfirm why it is necessary.
2. Inspect dependents.
3. Inspect tests.
4. Check runtime behavior if relevant.
5. Check Git history if behavior is unusual.
6. Determine whether a new component can avoid the modification.
7. Preserve public contracts.
8. Keep the change minimal.

If the modification becomes broader than expected, STOP.

---

# 7. MCP Usage During Implementation

Use the appropriate available MCP based on the question.

### Dependency / architecture

Use Graphify/dependency graph and repository search.

### Runtime

Use Chrome DevTools for browser behavior, network requests, console errors, and runtime verification.

### Database

Use the actual database system involved in the feature.

### UI

Use existing components, Figma, Stitch, and shadcn resources when relevant.

### Documentation

Use official documentation tools when verifying external APIs.

### Performance

Use Chrome DevTools and Lighthouse when performance/accessibility/SEO is part of the feature.

### Deployment

Use Vercel only when the project actually uses it and deployment work is approved.

Do not invoke unrelated MCPs.

Never invent MCP capabilities.

---

# 8. Database Implementation

Before creating a migration, verify:

- existing schema
- existing relationships
- existing indexes
- existing constraints
- tenant/data ownership
- existing application queries

Prefer additive changes.

Do not:

- drop tables
- drop columns
- rewrite large data sets
- change existing semantics destructively

without explicit approval.

---

# 9. API and Contract Safety

Preserve:

- routes
- method signatures
- constructor signatures
- API responses
- status codes
- validation
- events
- event payloads
- jobs
- queue payloads
- config keys
- frontend contracts

If a breaking change is required:

STOP and obtain approval.

---

# 10. Security

Do not weaken:

- authentication
- authorization
- policy checks
- tenant isolation
- object-level access control
- validation
- sensitive data handling

When adding a new endpoint or action, explicitly verify authorization.

Never use a security bypass as an implementation shortcut.

---

# 11. Frontend Implementation

Before adding UI:

- inspect existing components
- inspect existing styling
- inspect design tokens
- inspect responsive patterns
- inspect Figma where relevant
- inspect shadcn usage where relevant

Reuse existing components where practical.

Generated designs from Stitch are proposals.

Do not replace existing UI architecture merely because generated code is attractive.

---

# 12. Error Isolation

A new feature should fail independently where practical.

Avoid making existing core behavior depend on optional feature behavior.

Examples:

Bad:

    Existing checkout
        ↓
    New comparison feature
        ↓
    comparison fails
        ↓
    checkout fails

Preferred:

    Checkout ──────────────→ existing flow

    Comparison ────────────→ comparison flow

The new feature may consume shared read-only abstractions, but unrelated critical flows should not depend on it unnecessarily.

---

# 13. Feature Flags

If the application already has feature flags and they are appropriate:

- reuse the existing system
- keep the feature disabled until verified
- ensure disabled behavior remains unchanged

Do not introduce a new feature-flag system solely for this feature without approval.

---

# 14. Implementation Discipline

Implement only the approved plan.

Do not:

- refactor unrelated code
- rename unrelated files
- upgrade dependencies
- fix unrelated bugs
- reorganize directories
- rewrite legacy code
- change global styling
- change global configuration
- add unrelated abstractions

If implementation reveals that the plan is wrong, STOP.

Do not silently redesign the system during implementation.

---

# 15. Scope Monitoring

Continuously compare:

    approved files
        vs
    actual modified files

If a new existing file must be modified:

1. Stop.
2. Identify why.
3. Inspect its dependencies.
4. Update impact analysis.
5. Request approval if the new impact is material.

Do not silently expand scope.

---

# 16. Testing

Run appropriate tests for:

### New feature

- happy path
- validation
- authorization
- edge cases
- failure handling
- integration behavior

### Existing behavior

Test existing behavior affected by modified components.

### High-risk components

Add or strengthen characterization/regression coverage when appropriate.

Do not weaken tests.

If an unrelated test fails:

1. Determine whether it was already failing.
2. Determine whether the change caused it.
3. Determine whether the environment caused it.
4. Do not immediately modify unrelated code.

---

# 17. Runtime Verification

For browser-accessible features:

Before implementation where practical, capture baseline behavior.

After implementation:

- open the relevant flow
- inspect network requests
- inspect response status
- inspect response payload
- inspect console
- verify redirects/authentication
- verify UI behavior

Compare before vs after.

Unexpected new errors require investigation.

---

# 18. Performance / Accessibility / SEO

Only when relevant:

Use Lighthouse and/or Chrome DevTools to compare:

- performance
- accessibility
- SEO
- best-practice signals

Do not fix unrelated findings.

Treat unrelated findings as separate work.

---

# 19. Git Verification

After implementation:

1. Run `git status`.
2. Inspect the full diff.
3. Inspect new files.
4. Inspect modified existing files.
5. Inspect deleted files.
6. Inspect migrations.
7. Inspect configuration changes.
8. Compare actual changes to the approved manifest.

The diff is evidence.

Never claim the implementation is complete without reviewing it.

---

# 20. Change Manifest

Produce:

### Created

- path
- purpose

### Modified

For every existing file:

- path
- reason
- dependents
- impact
- tests covering it

### Deleted

- path
- reason
- approval status

### Database

- migrations
- schema effects

### External systems

- services changed
- APIs used

### Intentionally untouched

Important existing components that were deliberately not modified.

---

# 21. Regression Review

Explicitly review:

- routes
- controllers
- middleware
- models
- validation
- authorization
- API resources
- database
- cache
- events
- listeners
- jobs
- notifications
- queues
- frontend shared components
- external integrations

Only review areas relevant to the change.

---

# 22. Stop Conditions

STOP if:

- approved scope is exceeded materially
- shared core behavior must change unexpectedly
- authentication/authorization must change unexpectedly
- destructive migration is needed
- dependency upgrade is needed
- public contract must break
- deployment configuration must change unexpectedly
- runtime behavior contradicts architecture
- tests fail unexpectedly
- a security issue appears
- the implementation requires guessing

Report the reason and wait for approval.

---

# 23. Final Report

Return:

## Implementation Summary

## Architecture Used

## Created Files

## Modified Existing Files

## Deleted Files

## Database Changes

## External Integrations

## Tests Run

## Runtime Verification

## Regression Verification

## Git Diff Summary

## Scope Deviations

## Remaining Risks

## Final Status

Use one of:

- IMPLEMENTED AND VERIFIED
- IMPLEMENTED WITH KNOWN RISKS
- STOPPED — APPROVAL REQUIRED

Do not claim "nothing else was affected" unless the evidence supports it.
