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

## Phase 5: Deep Content Expansion (Post-Launch)
Goal: expand node coverage from the source corpus with stricter prerequisite quality and curated primary references.

Deliverables:
- Additional source-driven node set across protocol, lightning, mining, node operations, privacy, custody, economics, and history.
- Phase-specific content tests for required IDs and quality constraints.
- No-context review loop and fix pass documented in `.specflow/phases/phase-5/`.

Exit criteria:
- `npm run build:data` passes.
- `npm test` passes.
- `npm run check:links` passes.

## Phase 6: Source Corpus Saturation
Goal: cover remaining high-signal gaps from the source catalog with stronger operational and wallet-internals depth.

Deliverables:
- Additional node slice across protocol sync, wallet standards, Lightning privacy/routing, mining template policy, node operations, and privacy practices.
- Phase-specific tests requiring target IDs and enforcing source-domain and dependency quality constraints.
- Independent no-context review plus fix pass documented in `.specflow/phases/phase-6/`.

Exit criteria:
- `npm run build:data` passes.
- `npm test` passes.
- `npm run check:links` passes.
- `npm run build` passes.

## Phase 7: Comprehensive Source Expansion
Goal: continue source-corpus coverage with deeper relay policy, wallet operations, Lightning routing economics, and historical activation context.

Deliverables:
- Additional source-driven node slice across protocol relay/signing semantics, wallet tooling, Lightning gossip/privacy, mining incentives, node bootstrapping hardening, privacy heuristics, custody standards, and economic/history context.
- Phase-specific content tests requiring target IDs and enforcing domain/prerequisite quality constraints.
- Independent no-context review plus fix pass documented in `.specflow/phases/phase-7/`.

Exit criteria:
- `npm run build:data` passes.
- `npm test` passes.
- `npm run check:links` passes.
- `npm run build` passes.

## Phase 10: External Topic Corpus Integration
Goal: ingest concept topics from the external topic indexes (`btctranscripts`, `bitcoinops`, `opcodeexplained`, and `covenants.info`) and map meaningful items into curated graph nodes with focused resources.

Deliverables:
- Source extraction artifacts from each requested website and a curated keep/drop pass for graph-suitable concepts.
- Additional node slice focused on Script/opcode semantics, covenant design space, and advanced protocol proposals/use cases.
- Two-sentence-max descriptions for each new node and source-focused resources (no broad landing pages when specific topic pages exist).
- Phase-specific content tests requiring target IDs and enforcing quality constraints (resource precision, dependency quality, and description brevity).
- Independent no-context review plus fix pass documented in `.specflow/phases/phase-10/`.

Exit criteria:
- `npm run build:data` passes.
- `npm test` passes.
- `npm run check:links` passes.
- `npm run build` passes.
- Site is deployed and reachable on GitHub Pages with phase-8 content live.

## Phase 8: UI/UX Corrections
Goal: resolve post-launch UI interaction regressions and polish usability across desktop/mobile.

Deliverables:
- Label visibility controls (`Show all labels` / `Hide all labels`).
- Zoom-independent label visibility behavior.
- Progress-state toggle-off behavior for active explicit state.
- Dark mode fix and control alignment polish.
- Footer with social/project links.
- Independent no-context review and closeout docs in `.specflow/phases/phase-8/`.

Exit criteria:
- `npm test` passes.
- `npm run build:data` passes.
- `npm run check:links` passes.
- `npm run build` passes.

## Phase 9: Advanced Policy/Ops Content Expansion
Goal: add another comprehensive source-driven node slice focused on protocol policy, developer RPCs, Lightning channel internals, operations hardening, and economics/history.

Deliverables:
- 22 additional curated nodes across protocol/dev/lightning/mining/ops/privacy/custody/economics/history.
- Phase-specific tests for required IDs, prerequisite quality, and source-domain curation.
- Independent no-context review and closeout docs in `.specflow/phases/phase-9/`.

Exit criteria:
- `npm run build:data` passes.
- `npm test` passes.
- `npm run check:links` passes.
- `npm run build` passes.

## Phase 11: Topic Specificity and Source Coverage Expansion
Goal: process full topic indexes from requested external websites, add all graph-suitable missing concepts, and tighten resource precision with concise node descriptions.

Deliverables:
- Raw extraction artifacts for:
  - `btctranscripts` topics
  - `bitcoinops` topics
  - `bitcoindevphilosophy` table-of-contents topics
  - `opcodeexplained` opcode/script topics
  - `covenants.info` proposal/use-case/extra topics
- Curated keep/drop mapping over extracted topics with reasons and node mapping.
- 22 additional concept nodes for missing high-signal topics (policy, Lightning extensions, custody, privacy, mining, and security philosophy).
- Two-sentence-max descriptions on all newly added nodes.
- Focused resource links per node (topic page/deep link, no broad landing pages) plus relevant Amazon books where useful.
- Phase-specific tests enforcing required node IDs, prerequisite quality, concise descriptions, and resource precision.
- Independent no-context review plus fix pass documented in `.specflow/phases/phase-11/`.

Exit criteria:
- `npm run build:data` passes.
- `npm test` passes.
- `npm run check:links` passes.
- `npm run build` passes.

## Phase 11: Layout, Accessibility, and Foundations Math Expansion
Goal: resolve remaining graph usability bugs (layout/label readability/category bulk filtering/dark-mode contrast) and add missing foundational math/cryptography prerequisites for Bitcoin learners using the project source catalog.

Deliverables:
- Graph layout tuning for stronger vertical hierarchy and reduced horizontal sprawl.
- Label readability improvements to avoid dense overlap and improve contrast in both themes.
- Replace label bulk controls with category bulk controls (`Select all categories` / `Deselect all categories`).
- Dark-mode text readability fixes for graph labels and resource links.
- New foundational nodes for modular arithmetic, finite fields, Fermat's little theorem, discrete logarithms, elliptic-curve cryptography, secp256k1, and signature primitives.
- Phase-specific tests for UI helpers/config and required foundational node IDs/prerequisites.
- Independent no-context review and fix-pass docs in `.specflow/phases/phase-11/`.

Exit criteria:
- `npm test` passes.
- `npm run build:data` passes.
- `npm run check:links` passes.
- `npm run build` passes.
- Site is deployed on GitHub Pages with phase-11 updates.
