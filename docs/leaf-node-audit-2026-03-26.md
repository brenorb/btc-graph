# Leaf Node Audit (2026-03-26)

This audit focused on topics that looked too foundational to remain leaves.

Applied changes:
- `economics.bitcoin-supply-demand` now feeds into `economics.volatility-psychology-risk-sizing`.
- `economics.miner-revenue-composition` now feeds into `economics.security-budget`.
- `fundamentals.bitcoin-layers` now feeds into `economics.onchain-cost-allocation`.
- `mining.environmental-debate` now depends on `mining.environmental-co-benefits`.
- `privacy.address-reuse` now depends on `privacy.pseudonymity`.
- `protocol.halving` now depends on `protocol.block-height`.
- `protocol.witness-commitment` now depends on `protocol.block-structure`.

Redundant direct edges removed:
- `economics.fee-pressure-cycles` no longer directly depends on `protocol.fee-market`.
- `economics.security-budget` no longer directly depends on `protocol.halving`.
- `protocol.coinbase-transaction` no longer directly depends on `protocol.block-structure`.
