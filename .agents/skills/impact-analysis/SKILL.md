---
name: impact-analysis
description: Performs a read-only change-impact and blast-radius analysis for a proposed feature or implementation plan. Use before implementation to determine direct and indirect dependencies, shared components, database effects, runtime effects, security implications, and whether the proposed change should be approved, changed, or redesigned.
---

# Change Impact Analysis

## Mission

Determine what the proposed implementation would actually affect.

This skill is READ-ONLY.

Do not implement the feature.

Do not modify source code, migrations, configuration, tests, package files, generated files, database records, or deployment configuration.

Treat the supplied implementation plan as a hypothesis, not as truth.

Generate audit report name based on the topic. Do not overwrite existing audit reports if any audit report already exists, renew audit report instead.

---

# 1. Inputs

The input may be:

- an existing implementation plan
- a feature description
- a list of files
- a proposed architecture
- a proposed database migration
- a proposed frontend design
- a proposed API change

If important information is missing, investigate the repository rather than guessing.

---

# 2. Build the Proposed Change Set

Extract:

- new files
- modified files
- deleted files
- routes
- controllers
- services
- models
- database migrations
- frontend components
- APIs
- external integrations
- jobs
- events
- listeners
- configuration
- dependencies
- deployment changes
- tests

If the plan is vague, convert it into a concrete hypothetical change set for analysis only.

---

# 3. Verify Every Existing File Modification

For every existing file the plan proposes to modify:

1. Identify its responsibility.
2. Find all direct dependents.
3. Find important indirect dependents.
4. Determine whether it is shared.
5. Determine whether it is part of a critical flow.
6. Inspect tests.
7. Inspect runtime usage when relevant.
8. Inspect Git history when behavior is unusual.
9. Determine whether modification is actually necessary.

Ask:

> Can this feature be implemented without modifying this existing file?

If yes, recommend the alternative.

---

# 4. Graph Analysis

Use Graphify or another available dependency/knowledge graph when available.

Investigate:

- callers
- callees
- imports
- inheritance
- interfaces
- traits
- route relationships
- controller relationships
- service relationships
- model relationships
- jobs
- events
- listeners
- dependency chains

Do not invent graph commands.

If graph results disagree with source search, investigate the discrepancy.

---

# 5. Repository Search

Cross-check important graph findings with repository search.

Especially verify:

- "only caller"
- "unused"
- "only used here"
- "safe to rename"
- "safe to remove"
- "only endpoint"
- "only consumer"

Never accept such claims from a single search result.

---

# 6. Runtime Impact

For browser-accessible functionality, inspect existing runtime behavior when practical.

Use Chrome DevTools or another available browser/runtime MCP to determine:

- current network calls
- endpoint usage
- request/response structures
- redirects
- authentication
- console errors
- browser-visible behavior

Determine whether the proposed implementation would alter existing runtime behavior.

---

# 7. Database Impact

Determine:

- whether a migration is needed
- whether existing schema can be reused
- whether existing data is affected
- whether indexes change
- whether constraints change
- whether tenant boundaries change
- whether queries become more expensive
- whether data backfills are required
- whether rollback is possible

Classify migrations:

- additive
- compatibility-sensitive
- destructive

Destructive changes require human approval.

---

# 8. API / Contract Impact

Check whether the proposal changes:

- routes
- method signatures
- constructor signatures
- response formats
- status codes
- validation
- events
- jobs
- queue payloads
- frontend contracts
- configuration
- environment variables

Identify every known consumer.

---

# 9. Security Impact

Check:

- authentication
- authorization
- policies
- gates
- middleware
- tenant isolation
- object-level authorization
- sensitive data exposure
- validation
- file access
- external API credentials

Any weakening of security is unacceptable.

If the feature requires security architecture changes, explicitly mark the change as high-risk.

---

# 10. Performance Impact

Check for:

- N+1 queries
- new repeated database queries
- large collection loading
- expensive joins
- unbounded loops
- synchronous external API calls
- cache invalidation changes
- queue behavior
- frontend bundle impact
- additional network requests

Do not optimize unrelated code.

If performance is uncertain, identify how it should be measured.

---

# 11. Design-System Impact

For UI changes:

- identify reused components
- identify shared components
- identify design tokens
- identify Figma references
- identify shadcn patterns
- identify responsive behavior

Determine whether the proposed UI introduces unnecessary duplication.

---

# 12. External Service Impact

Identify:

- Firebase
- Supabase
- MongoDB
- Vercel
- Google APIs
- other external services

Only include services that are actually connected to the feature.

Do not introduce a service solely because an MCP is available.

---

# 13. Blast-Radius Map

Produce:

    Requested feature
        ↓
    Direct files
        ↓
    Direct dependencies
        ↓
    Indirect dependencies
        ↓
    Critical flows
        ↓
    External systems

Mark each affected area:

- LOW
- MEDIUM
- HIGH
- CRITICAL

Do not use numeric scores or overall rankings.

---

# 14. Scope Expansion Detection

Compare:

    Original proposed scope
            vs
    Evidence-required scope

If additional files/components are required, identify:

- new file
- why it became necessary
- who depends on it
- why the original plan missed it
- whether the expansion is safe

If the expansion is broad, recommend stopping for human approval.

---

# 15. Change Budget

Create a proposed budget:

- new files
- modified existing files
- migrations
- shared components
- critical components
- dependency changes
- external services

The budget is a control mechanism, not an artificial limit.

If the proposal exceeds a reasonable budget, explain the architectural reason.

---

# 16. Safer Alternative

If a lower-blast-radius architecture exists, describe it.

Prefer:

    isolated feature component
        ↓
    stable existing abstraction

over:

    new feature
        ↓
    modify shared core
        ↓
    affect many consumers

Do not propose a large refactor merely because the existing architecture is imperfect.

---

# 17. Decision

Classify the proposal as exactly one of:

### APPROVE

Evidence supports the proposed architecture with no material safety concerns.

### APPROVE WITH CHANGES

The general architecture is viable but specific changes are needed.

### REQUIRES REDESIGN

The proposed approach has unacceptable coupling, risk, scope, or architectural conflict.

Do not provide a numerical score.

Do not rank alternatives as "best" or "worst."

---

# 18. Output

Return:

## Proposed Change

## Verified Change Set

## Direct Dependencies

## Indirect Dependencies

## Shared Components

## Critical Business Flows

## Runtime Impact

## Database Impact

## API / Contract Impact

## Security Impact

## Performance Impact

## Frontend / Design Impact

## External Service Impact

## Graph Findings

## Repository Cross-Checks

## Git / Historical Context

## Contradictions / Unknowns

## Blast-Radius Map

## Scope Expansion

## Change Budget

## Safer Alternative

## Decision

## Revised Implementation Plan

Do not modify files.
