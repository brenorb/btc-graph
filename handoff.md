# Session Handoff (2026-03-04)

## Repository
- Path: `/Users/breno/Documents/code/PROJECTS/btc-graph`
- Remote: `https://github.com/brenorb/btc-graph`
- Branch: `codex/phase11-topic-resource-specificity`

## Phase Status
- Phase 1: complete
- Phase 2: complete
- Phase 3: complete
- Phase 4: complete
- Phase 5: complete
- Phase 6: complete
- Phase 7: complete
- Phase 8: complete (UI/UX corrections)
- Phase 9: complete
- Phase 10: complete (external topic corpus integration)
- Phase 11: complete (topic specificity and source coverage expansion)
- Phase 12: complete (layout accessibility and foundations math expansion)

## Phase 11 Summary
- Added roadmap entry:
  - `Phase 11: Topic Specificity and Source Coverage Expansion`
- Added SpecFlow artifacts:
  - `.specflow/phases/phase-11/plan.md`
  - `.specflow/phases/phase-11/plan-2.md`
  - `.specflow/phases/phase-11/source-research.md`
  - `.specflow/phases/phase-11/review-no-context.md`
  - `.specflow/phases/phase-11/visual-verification.md`
  - `.specflow/phases/phase-11/extractions/raw-*.json`
  - `.specflow/phases/phase-11/extractions/curated-topics.json`
- Added phase-specific test:
  - `tests/phase-11-content.test.ts`
- Added 22 new curated nodes from requested source topics:
  - `protocol.annex`
  - `mining.asicboost`
  - `extension.channel-factories`
  - `extension.coinswap`
  - `extension.dual-funding`
  - `extension.ecash`
  - `custody.codex32`
  - `privacy.silent-payments`
  - `extension.sidechains`
  - `ops.utreexo`
  - `extension.lnurl`
  - `extension.submarine-swaps`
  - `protocol.transaction-pinning`
  - `protocol.cpfp-carve-out`
  - `security.exfiltration-resistant-signing`
  - `protocol.fee-sponsorship`
  - `protocol.discrete-log-equivalency`
  - `fundamentals.trustlessness`
  - `fundamentals.neutrality`
  - `privacy.fungibility`
  - `security.adversarial-thinking`
  - `security.responsible-disclosure`
- Updated generated graph artifact:
  - `public/data/graph.json` now contains `234` nodes.

## No-Context Review Outcome
- Reviewer identified one medium issue:
  - invalid prerequisite IDs in two new phase-11 nodes caused `build:data` failure.
- Applied fixes:
  - updated prerequisites in `protocol.discrete-log-equivalency` and `security.exfiltration-resistant-signing`
  - aligned expected prerequisites in `tests/phase-11-content.test.ts`
- Re-validation after fixes: all checks green.

## Operational Checks (Latest)
- `npm test` passes (`63` tests).
- `npm run build:data` passes (`234` nodes built).
- `npm run check:links` passes (`260` unique URLs, all reachable).
- `npm run build` passes.

## Visual Verification
- Local runtime verified at `http://127.0.0.1:4173/btc-graph/`.
- Screenshot artifacts:
  - `/tmp/btc-graph-phase11-desktop.png`
  - `/tmp/btc-graph-phase11-mobile.png`
  - `/tmp/btc-graph-phase11-desktop-dark.png`

## Phase 12 Summary
- Added roadmap entry:
  - `Phase 12: Layout, Accessibility, and Foundations Math Expansion`
- Added SpecFlow artifacts:
  - `.specflow/phases/phase-12/plan.md`
  - `.specflow/phases/phase-12/plan-2.md`
  - `.specflow/phases/phase-12/source-research.md`
  - `.specflow/phases/phase-12/review-no-context.md`
  - `.specflow/phases/phase-12/visual-verification.md`
- Added phase-specific tests:
  - `tests/phase-12-ui.test.ts`
  - `tests/phase-12-content.test.ts`
- UI fixes:
  - replaced `Show all labels` / `Hide all labels` with `Select all categories` / `Deselect all categories`
  - tuned graph layout to a stronger vertical hierarchy (`dagre` `ranker=tight-tree`, higher `rankSep`, lower `nodeSep`)
  - reduced label overlap by showing labels on hover/selection by default and enabling dense labels at higher zoom
  - dark-mode readability improvements for graph labels, legend text, and resource links
  - theme toggle now updates graph palette in-place without resetting viewport/layout
- Added foundational math/crypto nodes:
  - `fundamentals.modular-arithmetic`
  - `fundamentals.finite-fields`
  - `fundamentals.fermat-little-theorem`
  - `fundamentals.modular-inverse`
  - `fundamentals.discrete-log-problem`
  - `fundamentals.elliptic-curve-cryptography`
  - `fundamentals.scalar-multiplication`
  - `fundamentals.secp256k1`
  - `fundamentals.ecdsa`
  - `fundamentals.schnorr-signatures`
- Rewired existing prerequisites:
  - `fundamentals.public-private-keys`
  - `fundamentals.digital-signatures`
  - `protocol.taproot`
  - `protocol.op-checksigadd`
- Updated generated graph artifact:
  - `public/data/graph.json` now contains `244` nodes.

## Phase 12 Operational Checks
- `npm test` passes (`72` tests).
- `npm run build:data` passes (`244` nodes built).
- `npm run check:links` passes (`265` unique URLs, all reachable).
- `npm run build` passes.
- GitHub Pages deploy succeeded:
  - run `22655385934` (`master`, commit `a5e2df3`)

## Phase 12 Visual Verification
- Local runtime verified at `http://127.0.0.1:4173/btc-graph/`.
- Screenshot artifacts:
  - `/tmp/btc-graph-phase12-desktop.png`
  - `/tmp/btc-graph-phase12-mobile.png`
  - `/tmp/btc-graph-phase12-desktop-dark.png`
  - `/tmp/btc-graph-phase12-mobile-dark.png`
