# Phase 2 Plan: Product Feature Completion

## Objective
Complete view-state sharing and interaction polish while preserving static architecture.

## Scope
1. URL view-state support:
   - selected node id
   - hidden category filters
   - no learner progress in URL
2. Apply URL state on initial load and keep URL in sync after interactions.
3. Keep current UX guarantees:
   - gray contextual hidden prerequisites
   - issue-based contribution links
   - import/export progress
   - donation entry point
   - light/dark mode

## Test-First Tasks
1. Add unit tests for URL state encode/decode:
   - roundtrip selected + filters
   - ignore malformed params
   - deduplicate/trim filters
   - never include progress fields
2. Add tests for selection reconciliation:
   - selected node in URL but filtered out on load => clear selection
3. Add tests for deterministic query formatting.

## Edge Cases
- Unknown category names in URL filters.
- Empty querystring.
- Nonexistent selected node id.
- Filter list with duplicates or whitespace.

## Done Criteria
- Tests pass.
- URL updates as interactions happen.
- URL restore works on reload.
- Build passes.
