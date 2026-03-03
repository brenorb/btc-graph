# Phase 1 Plan: Foundation Vertical Slice

## Objective
Implement the first working, deployable-quality static prototype with TDD and edge-case coverage.

## Scope
1. Initialize static web app project with test setup.
2. Define graph schema and add starter content set.
3. Implement core graph state logic:
   - progress state transitions
   - prerequisite gap detection
   - search index/query
   - filter application with gray contextual prerequisite handling
4. Implement UI:
   - hierarchical graph canvas
   - desktop sidebar + mobile bottom sheet details
   - node state controls
5. Persist progress in localStorage.

## Test-First Tasks
1. Add tests for graph schema validation:
   - missing required fields
   - invalid state values
   - duplicate node IDs
2. Add tests for gap detection:
   - no prerequisites
   - unmet prerequisites
   - mixed met/unmet prerequisites
3. Add tests for filtering behavior:
   - hidden categories removed
   - hidden prerequisites rendered as contextual gray nodes
4. Add tests for search behavior:
   - title/description/tags/aliases matching
   - case-insensitive matches
5. Add tests for persistence:
   - save and restore progress map
   - malformed storage fallback

## Edge Cases To Cover
- Node references missing prerequisite ID.
- Circular dependency in content.
- Selecting node then hiding its category via filter.
- Empty graph dataset.
- localStorage unavailable or corrupted JSON.

## Done Criteria
- Tests pass.
- App runs locally and shows a usable graph.
- Visual verification done.
- Changes committed atomically.
