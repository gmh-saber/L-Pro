# Project Safety Rules

## Purpose

These are permanent hard rules for AI-assisted development in this repository.

They apply to every task, regardless of whether the user explicitly invokes a skill.

The existing application is a protected system.

A requested feature is the variable being introduced into that system.

The agent must investigate before modifying, minimize the blast radius, preserve existing behavior, isolate new behavior, test the result, inspect the actual diff, and stop when the requested change cannot be completed safely within the approved boundary.

---

# 1. Core Principle

Treat the existing application as intentional unless there is evidence otherwise.

The goal is not to make the codebase "cleaner."

The goal is to implement the requested change while preserving unrelated behavior.

Prefer:

- additive changes
- isolated components
- existing abstractions
- existing conventions
- small diffs
- backward-compatible contracts
- explicit dependency direction
- reversible changes
- evidence over assumptions

Avoid:

- opportunistic refactoring
- broad cleanup
- replacing working architecture because a different design looks nicer
- changing shared infrastructure for convenience
- changing dependencies merely to make implementation easier
- destructive database changes
- unrelated bug fixes
- speculative modernization
- changing behavior that was not part of the request

---

# 2. Investigate Before Modifying

Before changing an existing file, understand:

1. What responsibility the file has.
2. Who calls or imports it.
3. What it calls or depends on.
4. Whether it is shared.
5. Whether it participates in a critical business flow.
6. Whether tests cover it.
7. Whether runtime behavior matches the source.
8. Whether Git history provides useful historical context.
9. Whether a new isolated component can avoid modifying it.

Never infer architecture from filenames alone.

Never assume a class is unused because one search returned no results.

Never assume a method has one caller because one dependency graph view shows one caller.

Cross-check important conclusions with independent evidence when practical.

---

# 3. Evidence Hierarchy

Use evidence appropriate to the question.

Preferred evidence sources include:

1. Actual source code.
2. Actual automated tests.
3. Actual runtime behavior.
4. Database/schema inspection.
5. Dependency/knowledge graph such as Graphify, when available.
6. Repository search.
7. Git history and blame.
8. Installed dependency/version metadata.
9. Official documentation or documentation MCPs.
10. Comments/docblocks.
11. AI model assumptions.

No tool is automatically authoritative.

If Graphify conflicts with source code, investigate the discrepancy and treat the source/runtime evidence as authoritative.

If documentation conflicts with the installed dependency version, verify the installed version and use documentation appropriate to that version.

If source code and runtime behavior disagree, record the discrepancy rather than silently choosing one.

---

# 4. MCP / Tool Selection Rules

Use tools because they answer a concrete investigation question, not merely because they are available.

Known project MCP categories may include:

- Graph/dependency analysis such as Graphify
- Chrome DevTools
- Lighthouse
- Figma
- Stitch
- shadcn/component resources
- Firebase
- MongoDB
- Supabase
- Vercel
- Google developer documentation/knowledge
- Google Search Console

The exact available tools and names may vary by environment. Never invent an MCP tool name or capability.

Use the smallest relevant set of tools.

### Architecture/dependency questions

Prefer:

- source search
- dependency graph / Graphify
- Git history
- tests
- routes/configuration

### Runtime/browser questions

Prefer:

- Chrome DevTools
- browser/runtime inspection
- application logs
- source code

### Performance/accessibility/SEO questions

Prefer:

- Chrome DevTools
- Lighthouse
- Search Console when SEO data is relevant

### Database questions

Use only the database system actually involved in the application's dependency path.

Possible sources include:

- migrations
- Eloquent models
- repositories/query builders
- database schema
- MongoDB MCP
- Supabase MCP
- Firebase MCP

Do not use an installed database MCP merely because it exists.

### UI/design questions

Prefer:

- existing application components
- Figma
- Stitch
- shadcn resources

Existing project UI conventions take precedence over generated design suggestions.

### Deployment questions

Use deployment infrastructure such as Vercel only when the project actually uses it.

Deployment, production configuration, domains, secrets, and environment changes are high-risk operations.

### Documentation/version questions

Use official documentation or a documentation MCP when verifying an external API, framework API, or package behavior.

Always check the installed dependency version first.

---

# 5. Read vs Write

Reading and investigating may be broad.

Writing must be narrow.

The agent may inspect broadly to understand the system, but implementation must stay within the approved change boundary.

High-risk mutations require explicit approval when they are outside the normal approved feature plan, including:

- production changes
- destructive database operations
- destructive Git operations
- dependency upgrades
- environment variable changes
- authentication changes
- authorization changes
- payment changes
- tenant isolation changes
- global middleware changes
- shared provider changes
- public API contract changes
- breaking schema changes
- deployment configuration changes
- domain/DNS changes

Never use a destructive command as a shortcut.

Never reset, clean, checkout over, or overwrite unrelated user work.

---

# 6. Shared Components Are High Risk

Treat these as high-risk modification targets:

- Models used across domains
- Shared services
- Repositories
- Traits
- Helpers
- Base classes
- Middleware
- Service providers
- Global configuration
- Authentication
- Authorization
- Policies
- Events used by multiple features
- Shared listeners
- Shared jobs
- Shared frontend components
- Shared API resources
- External API clients
- Database schema
- Queue payload contracts
- Core application bootstrapping

Before modifying one, determine:

- direct callers
- indirect callers
- critical flows
- public contracts
- tests
- runtime consumers
- historical context

If a new feature can be implemented without modifying a shared component, prefer that option.

---

# 7. Critical Business Logic

Treat these as protected/high-risk areas:

- authentication
- authorization
- tenant isolation
- payments
- checkout
- orders
- inventory
- pricing
- subscriptions
- financial calculations
- refunds
- billing
- security controls
- permission checks
- data access boundaries

Do not casually refactor or generalize these areas.

A feature that requires modification to critical business logic must have an explicit architectural reason and adequate tests.

If the required change is broad, cross-cutting, or uncertain, STOP and request approval before continuing.

---

# 8. Public Contract Preservation

Preserve existing contracts unless the requested feature explicitly requires a change.

Contracts include:

- method signatures
- constructor signatures
- routes
- route parameters
- API response structure
- API status codes
- validation behavior
- database semantics
- model relationships
- events
- event payloads
- queue payloads
- configuration keys
- environment variables
- frontend component contracts
- emitted events
- URL structures
- authentication behavior

Do not silently rename, remove, or change these contracts.

If a contract must change, identify all consumers first and document the compatibility impact.

---

# 9. Database Safety

Before creating a migration:

1. Inspect existing migrations.
2. Inspect relevant models.
3. Inspect relationships.
4. Inspect scopes/casts.
5. Inspect repositories/query builders.
6. Determine whether existing schema already supports the feature.
7. Determine whether the application uses MySQL/PostgreSQL/MongoDB/Supabase/Firebase/etc. for this path.
8. Check indexes and constraints.
9. Check tenant/data ownership boundaries.

Prefer:

- reuse of existing tables
- additive columns
- additive indexes
- additive relationships
- backward-compatible migrations

Avoid:

- dropping columns
- dropping tables
- destructive data changes
- changing existing column semantics
- changing primary/foreign key behavior
- changing enums destructively
- rewriting large datasets automatically

Destructive or high-risk schema changes require explicit approval.

---

# 10. Dependency and Version Safety

Before using a framework/package/API:

1. Inspect composer.json/package.json or equivalent.
2. Determine the installed version.
3. Inspect existing repository usage.
4. Verify the API against the installed version.
5. Prefer patterns already used in the repository.
6. Do not upgrade a dependency merely to simplify implementation.

Dependency upgrades are separate scope unless explicitly requested or approved.

---

# 11. Runtime Verification

When a feature affects a browser-accessible application, do not rely solely on static analysis.

Where appropriate, inspect:

- routes
- network requests
- request payloads
- response payloads
- HTTP status codes
- redirects
- console errors
- DOM behavior
- authentication state
- cookies/storage
- API calls
- browser-visible failures

Use browser/runtime tools such as Chrome DevTools when available.

If runtime behavior differs from source assumptions, investigate before modifying code.

---

# 12. Design-System Safety

Before introducing UI:

1. Inspect existing frontend components.
2. Inspect existing design patterns.
3. Reuse existing components when appropriate.
4. Check Figma/design references when available.
5. Check existing shadcn/component usage when relevant.
6. Use Stitch/design generation as a proposal, not as authority.
7. Do not replace working components merely because a generated component looks cleaner.
8. Do not introduce a second visual pattern for an existing UI problem.

Unrelated UI cleanup is out of scope.

---

# 13. Scope Control

Every feature must have an approved scope.

Track:

- files expected to be created
- existing files expected to be modified
- files explicitly forbidden from modification
- database changes
- routes
- frontend changes
- external integrations
- tests
- deployment changes

If implementation expands beyond the approved scope:

1. STOP.
2. Do not automatically revert changes.
3. Determine why the scope expanded.
4. Report the new dependency.
5. Update the impact analysis.
6. Request approval if the expansion is material.

Do not silently expand scope.

---

# 14. Change Budget

For each feature, establish a reasonable change budget.

The budget may include:

- maximum number of existing files modified
- maximum number of new files
- database migrations
- shared components modified
- critical components modified
- dependency changes
- external service changes

A budget is not a rigid universal number.

If the budget is exceeded, the agent must explain why and reassess the architecture.

Do not artificially keep a change small if the architecture genuinely requires more work. Instead, STOP and explain the architectural reason.

---

# 15. No Opportunistic Refactoring

Do not:

- rename unrelated classes
- reorganize directories
- rewrite working services
- change coding style across files
- upgrade packages
- clean unrelated code
- replace one framework pattern with another
- "fix" unrelated technical debt
- modify unrelated tests
- rewrite legacy code simply because it is ugly

If unrelated problems are discovered, record them separately.

---

# 16. Failure Isolation

Where practical, a new feature should fail without breaking unrelated existing features.

Prefer:

- feature-specific services
- feature-specific actions
- feature-specific DTOs
- feature-specific validation
- feature-specific jobs
- feature-specific events
- feature flags where the existing application supports them

Avoid making existing core behavior depend on an optional new feature.

---

# 17. Feature Flags

Use feature flags when appropriate and consistent with the existing architecture.

Do not introduce a new feature-flag framework merely for one feature unless explicitly approved.

If an existing feature-flag mechanism exists, reuse it.

---

# 18. Git Safety

Before implementation:

- inspect Git status
- identify existing user changes
- avoid overwriting unrelated work
- prefer a dedicated feature branch when practical

After implementation:

- inspect Git status
- inspect the complete diff
- compare actual changes with approved changes
- inspect newly created files
- inspect deleted files
- inspect migrations
- inspect configuration changes

Never claim a change is safe without inspecting the actual diff.

---

# 19. Tests

At minimum, determine appropriate coverage for:

- happy path
- validation
- authorization
- authentication where relevant
- edge cases
- failure paths
- integration behavior
- existing behavior affected by modified components

If existing behavior has poor test coverage, consider characterization tests before modifying high-risk behavior.

Do not weaken or delete tests merely to make a feature pass.

If unrelated tests fail, do not immediately modify unrelated code.

Determine whether the failure is:

- pre-existing
- caused by the change
- environmental
- dependency-related
- genuinely related

---

# 20. Historical Context

Before removing or substantially changing unusual existing behavior, inspect Git history when practical.

Ask:

- Why was this introduced?
- What problem was it solving?
- Was it part of a bug fix?
- What files changed with it?
- Are there related tests?
- Is there an issue/commit reference?

If historical intent cannot be established, preserve the behavior unless the requested feature explicitly requires changing it.

UNKNOWN should normally mean PRESERVE, not DELETE.

---

# 21. Cross-Validation

For important conclusions, cross-check with independent evidence when practical.

Examples:

Graph says:
"Only one caller."

Verify:
repository search.

Source says:
"API returns X."

Verify:
runtime response.

Schema appears unused.

Verify:
models/repositories/query usage.

Code appears obsolete.

Verify:
Git history.

Frontend component appears unused.

Verify:
source references and runtime behavior.

Do not silently ignore contradictions.

---

# 22. Stop Conditions

STOP implementation and ask for human approval if:

- a shared core service must be substantially changed
- authentication must change
- authorization must change
- tenant isolation may change
- payment/billing logic must change
- destructive database changes are required
- public API contracts must break
- production configuration must change
- dependency upgrades are required
- deployment architecture must change
- a global provider/middleware/config must change substantially
- the dependency graph reveals unexpectedly broad impact
- actual implementation exceeds approved scope materially
- architecture is unclear
- source and runtime behavior contradict each other in a critical path
- tests unrelated to the feature fail and the cause is unknown
- the agent would need to guess
- the requested change cannot be isolated safely

Do not continue merely because the task "should be simple."

---

# 23. Human Approval Boundaries

Human approval is required for architectural escalation.

The agent may investigate alternatives.

The agent may propose a safer design.

The agent must not silently choose a high-impact design merely because it is technically possible.

---

# 24. Final Principle

The safest AI implementation is not the cleverest implementation.

It is the implementation that:

- understands the existing system
- reuses what already exists
- creates the smallest necessary boundary
- modifies the fewest existing components
- preserves contracts
- isolates failures
- verifies behavior
- respects the database
- respects security
- respects existing user work
- produces a reviewable diff
- stops when evidence is insufficient

Investigate first.

Minimize change.

Isolate new behavior.

Cross-check evidence.

Test existing behavior.

Inspect the diff.

Stop when uncertain.
