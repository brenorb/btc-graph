# Phase 7 Plan: Comprehensive Source Expansion

## Objective
Expand node coverage using the remaining high-signal material from `bitcoin-content-sources.md`, with emphasis on relay behavior, wallet operations, Lightning economics/privacy, and activation history.

## Scope
1. Research and map concept gaps from:
   - local 101BTC corpus
   - Bitcoin Dev Network
   - Bitcoin Core Academy
   - Bitcoin.page / Lopp
   - Bitcoin Design
   - Bitcoin Optech, BIPs, Developer Guide, BOLTs, Mastering Bitcoin, mempool docs
2. Add a broad source-driven node slice while keeping one-concept-per-node semantics and stable IDs.
3. Keep curated resources concise (2-3 primary references per node).
4. Add phase-specific test coverage for required IDs, domain policy, and dependency quality.

## Test-First Tasks
1. Add failing tests that require the phase-7 target node set.
2. Add edge-case tests for invalid resource domain and empty-prerequisite guardrails.
3. Implement node files to satisfy tests.
4. Run full validation:
   - `npm test`
   - `npm run build:data`
   - `npm run check:links`
   - `npm run build`

## Planned Node Targets
- `protocol.addr-v2-bip155`
- `protocol.transaction-relay-inv-getdata`
- `protocol.package-relay`
- `protocol.sighash-flags`
- `dev.descriptor-wallet-imports`
- `dev.hwi-psbt-flow`
- `dev.fee-estimation-rpc`
- `lightning.gossip-protocol`
- `lightning.probing-attacks`
- `lightning.channel-fee-policies`
- `mining.fee-sniping`
- `mining.template-construction`
- `ops.dns-seeds`
- `ops.asmap`
- `privacy.script-type-fingerprinting`
- `privacy.amount-correlation`
- `custody.bsms`
- `custody.seed-xor-shards`
- `economics.fee-pressure-cycles`
- `economics.transaction-batching-economics`
- `history.taproot-activation`
- `history.gpu-to-asic-era`

## Done Criteria
- Required phase-7 nodes exist and pass quality tests.
- No new graph validation errors (unknown prerequisites, duplicates, cycles).
- No-context reviewer findings are addressed.
- All checks pass.
