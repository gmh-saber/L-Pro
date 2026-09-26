---
name: architecture-audit
description: Performs a read-only architectural, dependency, database, runtime, and design audit of an existing codebase before feature development. Use when entering an unfamiliar area, investigating how a feature works, identifying safe extension points, or critically reviewing an implementation plan. Never modifies project files.
---

# Architecture Audit

## Mission

Understand the existing application before implementation.

This skill is READ-ONLY.

Do not modify source files, migrations, configuration, tests, package files, generated artifacts, or deployment settings.

Generate audit report name based on the topic. Do not overwrite existing audit reports if any audit report already exists, renew audit report instead.

The goal is to determine:

1. How the requested behavior currently works.
2. What existing functionality can be reused.
3. Which components are involved.
4. Who depends on those components.
5. Which parts are shared or critical.
6. What the runtime actually does.
7. What the database actually contains.
8. What the smallest safe extension point is.
9. What the likely blast radius is.
10. What must not be modified.
11. What evidence supports the proposed architecture.

---

# 1. Request Understanding

Restate the requested feature in implementation-neutral terms.

Identify:

- user-visible behavior
- backend behavior
- frontend behavior
- data requirements
- integrations
- authentication/authorization requirements
- performance expectations
- compatibility requirements
- explicit exclusions

Do not invent requirements.

List uncertainties separately.

---

# 2. Existing Architecture Reconnaissance

Inspect the repository structure and relevant Laravel architecture.

Investigate where applicable:

- routes/web.php
- routes/api.php
- other route files
- controllers
- form requests
- middleware
- policies
- gates
- models
- relationships
- services
- actions
- repositories
- DTOs
- resources
- jobs
- events
- listeners
- observers
- notifications
- commands
- providers
- configuration
- bootstrap
- console
- database/migrations
- database/seeders
- tests
- frontend components
- API clients
- external integrations
- queues
- scheduling
- caching
- storage

Do not inspect every file indiscriminately.

Follow the dependency path relevant to the request.

---

# 3. Find Existing Functionality First

Before proposing a new class, service, endpoint, model, table, component, helper, or API:

Search for an existing implementation that already solves part of the problem.

Look for:

- equivalent methods
- existing queries
- existing scopes
- existing services
- existing actions
- existing DTOs
- existing validators
- existing frontend components
- existing API endpoints
- existing database structures
- existing integrations
- existing feature flags

If something exists, determine whether it can be safely reused.

Do not duplicate functionality merely because the existing implementation is located elsewhere.

---

# 4. Graph / Dependency Analysis

If a dependency or knowledge graph such as Graphify is available, use it as an architectural accelerator.

Ask targeted questions such as:

- Who calls this class?
- Who calls this method?
- What classes does it depend on?
- What imports it?
- What inherits from it?
- What does it inherit from?
- What interfaces does it implement?
- Which controllers use it?
- Which jobs use it?
- Which events/listeners use it?
- Which routes eventually reach it?
- Which models are involved?
- What dependency chains lead to critical flows?
- What components are shared?
- What would be affected if this component changed?

Do not invent Graphify commands or assume a specific Graphify interface.

Use whatever Graphify capabilities are actually available in the environment.

If Graphify conflicts with source search, investigate the discrepancy.

Source code and runtime evidence are authoritative.

---

# 5. Dependency Chain

Build a concrete dependency chain.

For example:

    Browser
      ↓
    Route
      ↓
    Middleware
      ↓
    Controller
      ↓
    Form Request
      ↓
    Service
      ↓
    Model
      ↓
    Database

Or:

    Scheduler
      ↓
    Job
      ↓
    Service
      ↓
    External API

Identify both:

### Incoming dependencies

Who depends on the component?

### Outgoing dependencies

What does the component depend on?

This is necessary for blast-radius analysis.

---

# 6. Shared Component Analysis

Explicitly identify whether any proposed modification touches:

- shared service
- model used by multiple domains
- repository
- trait
- helper
- base class
- middleware
- provider
- global configuration
- shared API resource
- shared frontend component
- shared event/listener
- external API client
- queue contract

For each shared component, document:

- direct dependents
- indirect dependents
- critical flows
- contracts
- tests
- runtime usage
- historical context if relevant

If the feature can avoid modifying the shared component, recommend that.

---

# 7. Critical Flow Analysis

Determine whether the feature touches:

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
- financial calculations
- security
- permissions

If yes, classify the relevant components as high risk.

Do not recommend refactoring critical flows merely because they are imperfect.

---

# 8. Runtime Reconnaissance

If the feature is browser-accessible and a browser/runtime MCP such as Chrome DevTools is available:

Inspect the existing behavior.

Record:

- URL
- navigation flow
- HTTP requests
- HTTP methods
- request payloads
- response payloads
- status codes
- redirects
- authentication behavior
- console errors
- client-side exceptions
- relevant DOM behavior
- storage/cookies where relevant

Do not modify the application.

The purpose is to compare:

    source architecture
        +
    runtime behavior

If they disagree, record the discrepancy.

Do not silently assume which one is correct.

---

# 9. Database Analysis

Determine which database technology actually participates in the feature.

Inspect:

- migrations
- models
- relationships
- query builders
- repositories
- indexes
- constraints
- casts
- scopes
- existing records where safe and relevant

If MongoDB, Supabase, Firebase, or another database MCP is available, use it only if that system is actually part of the feature's data path.

Answer:

1. Does existing schema already support the feature?
2. Can existing relationships be reused?
3. Are new columns required?
4. Is a new table required?
5. Are indexes required?
6. Are constraints required?
7. Are tenant/data ownership rules involved?
8. Could the feature avoid a schema change?

Prefer no migration when the existing schema is sufficient.

---

# 10. External Dependency Analysis

If the feature needs an external library/API:

1. Inspect project dependency files.
2. Determine installed version.
3. Search existing repository usage.
4. Verify API compatibility with the installed version.
5. Use official documentation where available.

Do not propose a dependency upgrade merely because the preferred API is unavailable.

---

# 11. Frontend / Design Analysis

If the feature has UI:

Inspect:

- existing components
- component composition patterns
- design tokens
- CSS conventions
- Tailwind usage
- shadcn usage
- Figma references where available
- existing responsive behavior
- existing loading/error states

Figma/Stitch/design resources are evidence and design inputs, not authority to replace existing application architecture.

Prefer existing components.

---

# 12. Git History

When an existing component looks unusual, fragile, or unnecessarily complex, inspect Git history where useful.

Ask:

- when was it introduced?
- what changed around it?
- was it a bug fix?
- was it tied to a special requirement?
- are there related tests?

Do not remove behavior merely because its purpose is not obvious.

---

# 13. Contradiction Detection

Explicitly record contradictions such as:

- Graph says one caller; search finds many.
- Source suggests one API path; runtime uses another.
- Plan expects a new table; existing schema already supports it.
- Documentation describes a different API than the installed package.
- Frontend source suggests a component is unused; runtime loads it.

For each contradiction:

1. State the conflict.
2. Identify the evidence.
3. Investigate further.
4. State the resolution or uncertainty.

---

# 14. Blast Radius

Classify impact:

### LOW

- new isolated component
- no shared changes
- no schema change
- no public contract change

### MEDIUM

- limited existing feature changes
- small route/API addition
- additive schema change
- limited frontend integration

### HIGH

- shared service/model modification
- multiple domains affected
- public API behavior changes
- important database changes
- critical flow touched

### CRITICAL

- authentication
- authorization
- tenant isolation
- payments
- destructive schema changes
- production infrastructure
- secrets/environment configuration
- breaking public contracts

Explain why the classification applies.

Do not use numerical scores.

---

# 15. Safe Extension Point

Identify the smallest safe place to add the feature.

Prefer:

    New feature component
          ↓
    stable existing abstraction

over:

    New feature
          ↓
    modify heavily shared core component
          ↓
    many unrelated consumers

Explain why the chosen extension point has a smaller blast radius.

---

# 16. Expected File Changes

Produce:

### New files

- path
- responsibility

### Existing files to modify

For each:

- path
- reason
- dependents
- risk
- expected change

### Files that should NOT be modified

Explicitly list protected/shared files when known.

---

# 17. Testing Strategy

Recommend:

- unit tests
- feature tests
- integration tests
- authorization tests
- validation tests
- edge cases
- failure tests
- regression tests
- characterization tests
- browser smoke tests
- performance/accessibility checks when relevant

Do not implement them.

---

# 18. Audit Output

Return exactly these sections:

## Request Understanding

## Existing Architecture

## Relevant Components

## Dependency Map

## Graph Findings

## Runtime Findings

## Existing Functionality That Can Be Reused

## Shared / High-Risk Components

## Database Impact

## External Dependency Impact

## Frontend / Design Impact

## Git / Historical Findings

## Contradictions and Unknowns

## Recommended Extension Point

## Expected File Changes

## Files That Should Not Be Modified

## Blast Radius

## Regression Risks

## Testing Strategy

## Recommended Implementation Plan

## Approval / Stop Conditions

Do not modify files.

Do not claim the feature is safe unless the evidence supports that conclusion.
