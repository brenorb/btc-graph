# Session Handoff (2026-03-03)

## Repository
- Path: `/Users/breno/Documents/code/PROJECTS/btc-graph`
- Remote: `https://github.com/brenorb/btc-graph`
- Branch: `master`

## Latest Committed + Pushed State
- Use `git log --oneline -n 5` for current commit details.
- Remote sync: local `master` matches `origin/master` after push.

## Phase Status
- Phase 1: complete
- Phase 2: complete
- Phase 3: complete
- Phase 4: complete
- Phase 5: complete
- Phase 6: complete

## Phase 5 Summary
- Added 18 new nodes sourced from the corpus in `bitcoin-content-sources.md`.
- Graph size increased from `97` to `115` nodes.
- Added phase-specific content quality tests:
  - `tests/phase-5-content.test.ts`
- New node areas:
  - fundamentals layers
  - UASF history
  - protocol relay/activation primitives
  - lightning commitment/closure mechanics
  - mining attack model
  - node bootstrapping + AssumeUTXO
  - xpub privacy risks
  - watch-only custody
  - lost-coins economics

## Phase 6 Summary (Current)
- Added 20 additional source-driven nodes from the same corpus and canonical references.
- Graph size increased from `115` to `135` nodes.
- Added phase-6 quality tests:
  - `tests/phase-6-content.test.ts`
- Added phase-6 planning/research/review artifacts:
  - `.specflow/phases/phase-6/plan.md`
  - `.specflow/phases/phase-6/plan-2.md`
  - `.specflow/phases/phase-6/source-research.md`
  - `.specflow/phases/phase-6/review-no-context.md`
- New node areas:
  - headers-first sync, assumevalid, BIP37, witness commitment
  - PSBT v2 and output script descriptors
  - route blinding, trampoline routing, channel jamming
  - mining template selection and stale blocks
  - peer discovery, txindex, compact-relay vs filters
  - change detection, consolidation tradeoffs
  - air-gapped signing, output labeling
  - miner revenue composition and SegWit activation history

## Operational Checks (Latest)
- `npm test` passes (`41` tests)
- `npm run build:data` passes (`135` nodes built)
- `npm run check:links` passes (`126` unique URLs, all reachable)
- `npm run build` passes

## Launch State
- CI workflow: green (`CI`, run `22638665193`)
- Pages workflow: green (`Deploy Pages`, run `22638665190`)
- Live URL: `https://brenorb.com/btc-graph/`
- Redirect URL: `https://brenorb.github.io/btc-graph/`
