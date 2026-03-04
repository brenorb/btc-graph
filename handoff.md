# Session Handoff (2026-03-03)

## Repository
- Path: `/Users/breno/Documents/code/PROJECTS/btc-graph`
- Remote: `https://github.com/brenorb/btc-graph`
- Branch: `codex/specflow-phase7-comprehensive`

## Latest Committed + Pushed State
- Latest local commit: `b98bf6d`
- Message: `feat(phase7): add comprehensive source-driven nodes with quality tests`
- Remote baseline: `origin/master` at `0571c4e`

## Phase Status
- Phase 1: complete
- Phase 2: complete
- Phase 3: complete
- Phase 4: complete
- Phase 5: complete
- Phase 6: complete
- Phase 7: complete (local branch)

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

## Phase 7 Summary (Current)
- Added 22 additional source-driven nodes from the same corpus and canonical references.
- Graph size increased from `135` to `157` nodes.
- Added phase-7 quality tests:
  - `tests/phase-7-content.test.ts`
- Added phase-7 planning/research/review artifacts:
  - `.specflow/phases/phase-7/plan.md`
  - `.specflow/phases/phase-7/plan-2.md`
  - `.specflow/phases/phase-7/source-research.md`
  - `.specflow/phases/phase-7/review-no-context.md`
- New node areas:
  - relay internals (`addrv2`, inv/getdata, package relay, SIGHASH semantics)
  - dev workflows (descriptor imports, HWI + PSBT flow, fee-estimation RPC)
  - Lightning operations (gossip protocol, probing attacks, fee policies)
  - mining strategy (fee sniping, template construction)
  - node hardening (DNS seeds, ASMAP)
  - privacy heuristics (script fingerprinting, amount correlation)
  - custody operations (BSMS coordination, XOR seed shard tradeoffs)
  - economics/history (fee-pressure cycles, batching economics, Taproot activation, GPU-to-ASIC era)

## Operational Checks (Latest)
- `npm test` passes (`45` tests)
- `npm run build:data` passes (`157` nodes built)
- `npm run check:links` passes (`129` unique URLs, all reachable)
- `npm run build` passes

## Launch State
- CI workflow: green (`CI`, run `22638665193`)
- Pages workflow: green (`Deploy Pages`, run `22638665190`)
- Live URL: `https://brenorb.com/btc-graph/`
- Redirect URL: `https://brenorb.github.io/btc-graph/`
