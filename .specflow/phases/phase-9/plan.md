# Phase 9 Plan: Advanced Policy, Ops, and Wallet Flow Expansion

## Objective
Continue comprehensive source-driven growth from `bitcoin-content-sources.md` by filling remaining high-signal operational and protocol-policy gaps.

## Scope
1. Expand deeper protocol and policy internals:
   - timelock opcodes and sequence locks
   - relay and standardness policy boundaries
2. Expand developer operational workflows:
   - key RPCs for mempool admission, funding, and UTXO scanning
3. Expand Lightning channel internals:
   - revocation/penalty model
   - reserve/dust constraints and HTLC timeout settlement paths
4. Expand mining and node operations:
   - empty-block strategy and propagation-latency tradeoffs
   - peer table bucketing and peer-eviction protection
5. Expand privacy/custody/economics/history:
   - clustering/change avoidance heuristics
   - MuSig2 descriptor workflows
   - on-chain cost allocation and RBF policy evolution

## Test-First Tasks
1. Add failing tests requiring the phase-9 node set.
2. Add edge-case tests for resource curation constraints.
3. Implement node files and prerequisite wiring.
4. Run full validation:
   - `npm test`
   - `npm run build:data`
   - `npm run check:links`
   - `npm run build`
5. Run no-context review and close findings in `plan-2.md`.

## Planned Node Targets
- `protocol.sequence-locks-bip68`
- `protocol.cltv-bip65`
- `protocol.csv-bip112`
- `protocol.wtxid-relay-bip339`
- `protocol.dust-policy`
- `protocol.standardness-policy`
- `dev.testmempoolaccept-rpc`
- `dev.fundrawtransaction-rpc`
- `dev.scantxoutset-rpc`
- `lightning.revocation-penalty-keys`
- `lightning.channel-reserve-policy`
- `lightning.htlc-timeout-settlement`
- `mining.empty-block-mining`
- `mining.block-propagation-latency`
- `ops.addrman-bucketing`
- `ops.peer-eviction-protection`
- `ops.utxo-set-management`
- `privacy.common-input-ownership`
- `privacy.change-avoidance`
- `custody.musig2-descriptors`
- `economics.onchain-cost-allocation`
- `history.rbf-policy-evolution`

## Done Criteria
- Required phase-9 nodes exist and pass quality tests.
- No graph validation regressions.
- No-context review findings are addressed.
- Full validation pipeline passes.
