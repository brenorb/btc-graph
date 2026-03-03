# Phase 3 Plan: Comprehensive Content Expansion

## Objective
Expand the graph into a broader, coherent Bitcoin curriculum using the sources in `bitcoin-content-sources.md` while preserving strict prerequisite semantics and stable IDs.

## Scope
1. Research and map source coverage:
   - local 101BTC project
   - Bitcoin Dev Network
   - Bitcoin Core Academy
   - Bitcoin.page
   - Bitcoin Design
   - canonical specs/docs (BIPs, BOLTs, Developer Guide, Bitcoin Optech)
2. Add a comprehensive new node set across categories.
3. Keep resources curated and high-signal (2-3 per node).
4. Validate content integrity via build-time checks.

## Test-First Tasks
1. Add/adjust content files first, then run validation to catch schema/dependency issues.
2. Ensure no duplicate IDs, unknown prerequisites, or cycles.
3. Verify runtime still loads and tests pass.

## Edge Cases
- Prerequisites referencing newly added nodes only (ordering-independent build).
- Overly broad concepts split into specific nodes.
- Potential cycle introduction while cross-linking advanced concepts.

## Done Criteria
- New node set is merged and validated.
- `npm run build:data` passes.
- `npm test` passes.
- No-context review completed and fixes applied.
