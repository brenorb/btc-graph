# Roadmap

## Phase 1: Foundation Vertical Slice
Goal: ship a running static app with a functional graph, sidebar, local progress state, and tests for core logic.

Deliverables:
- App scaffold with build/test workflow.
- Node data model + validation.
- Graph rendering with hierarchical layout.
- Node details panel (desktop sidebar, mobile bottom sheet).
- Progress states (`Need to learn`, `Learning`, `Know it`) with localStorage.
- Basic search + category filtering.

Exit criteria:
- Unit tests passing.
- App builds and runs locally.
- Visual verification performed.

## Phase 2: Product Features Completion
Goal: complete collaboration, URL state, theming, donation, and UX rules from spec.

Deliverables:
- Shareable URL view state (selected node + filters).
- Legend toggle behavior with hidden prerequisite gray-context nodes.
- Issue-link contribution actions (`Suggest change`, `Add concept`, `Generic change`).
- Export/import progress actions.
- Light/dark mode support.
- Donation entry point.

Exit criteria:
- Feature tests for core behaviors and edge cases pass.
- Responsive behavior verified on desktop/mobile.

## Phase 3: Comprehensive Content
Goal: research provided Bitcoin sources and populate a broad, coherent node graph.

Deliverables:
- Curated branch taxonomy and stable node IDs.
- Comprehensive node set with prerequisites and curated resources.
- Content QA checks (schema, dead links, duplicate IDs, cycle checks).

Exit criteria:
- Content validation passes.
- Graph remains performant and navigable.

## Phase 4: Production Hardening and Launch
Goal: publish online with CI, docs, and quality gates.

Deliverables:
- GitHub Actions CI: tests + build + content validation.
- GitHub Pages deployment workflow.
- Contributor docs and issue templates.
- Final smoke test and launch notes.

Exit criteria:
- Live URL works.
- CI green on `master`.
