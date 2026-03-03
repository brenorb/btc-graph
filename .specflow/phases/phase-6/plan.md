# Phase 6 Plan: Source Corpus Saturation

## Objective
Expand graph coverage using the remaining high-signal material in `bitcoin-content-sources.md` with a focus on underrepresented operational, wallet-internals, and Lightning-routing topics.

## Scope
1. Research and map missing concepts from:
   - local 101BTC corpus
   - Bitcoin Dev Network
   - Bitcoin Core Academy
   - Bitcoin.page / Lopp
   - Bitcoin Design
   - Bitcoin Optech, BIPs, Developer Guide, BOLTs, Mastering Bitcoin, mempool docs
2. Add a new source-driven node slice with strict prerequisites and curated references.
3. Keep one concept per node, stable slug IDs, and concise resources (2-3 each).
4. Enforce quality with phase-specific tests for required IDs, domain policy, and dependency sanity.

## Test-First Tasks
1. Add failing tests that require the phase-6 target node set.
2. Add edge-case tests for duplicate prerequisites and transitive prerequisite redundancy.
3. Implement node files to satisfy tests.
4. Run validation and quality checks:
   - `npm test`
   - `npm run build:data`
   - `npm run check:links`
   - `npm run build`

## Planned Node Targets
- `protocol.headers-first-sync`
- `protocol.assumevalid`
- `protocol.bloom-filters-bip37`
- `protocol.witness-commitment`
- `dev.psbt-v2`
- `dev.output-script-descriptors`
- `lightning.route-blinding`
- `lightning.trampoline-routing`
- `lightning.channel-jamming`
- `mining.block-template-selection`
- `mining.stale-blocks`
- `ops.peer-discovery`
- `ops.txindex`
- `ops.compact-blocks-vs-filters`
- `privacy.change-detection`
- `privacy.utxo-consolidation-tradeoffs`
- `custody.air-gapped-signing`
- `custody.output-labeling`
- `economics.miner-revenue-composition`
- `history.segwit-activation`

## Done Criteria
- Required phase-6 nodes exist and pass quality tests.
- No new graph validation errors (unknown prerequisites, duplicates, cycles).
- No-context reviewer findings are addressed.
- All checks pass and changes are pushed to `master`.
