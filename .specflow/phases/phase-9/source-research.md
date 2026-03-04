# Phase 9 Source Research Notes

Date: 2026-03-03

## Focus Areas
- Relative/absolute timelock internals and relay-policy boundaries.
- Core RPC operational workflows used by wallet/backend developers.
- Lightning commitment safety and HTLC timeout settlement paths.
- Mining propagation and template behavior.
- Node peer-management hardening.
- Privacy heuristics and custody aggregation workflows.
- Fee-economics and RBF policy history.

## Primary Source Families Used
1. BIPs repository (`github.com/bitcoin/bips`)
- BIP 65, 68, 112, 113, 125, 141, 327, 339, 380 for canonical protocol/wallet specs.

2. Developer Guide / RPC reference (`developer.bitcoin.org`)
- `transactions`, `contracts`, `p2p_network`, `wallets`, and RPC docs (`testmempoolaccept`, `fundrawtransaction`, `scantxoutset`).

3. Bitcoin Core Academy (`bitcoincore.academy`)
- `mempool-lifecycle`, `block-relay`, `addrman`, `p2p-attacks`, `scriptpubkeymanagers`, `bootstrapping`.

4. Bitcoin Optech (`bitcoinops.org`)
- Topics: package relay, compact relay, coin selection, payjoin, replace-by-fee, assumeutxo, anonymity networks, output linking.

5. Bitcoin Design + Lopp + mempool docs
- Wallet UX and privacy behavior (`bitcoin.design`).
- Historical/economic and operational context (`lopp.net`, `mempool.space/docs`).

## Curation Decisions
- Kept 2-3 resources per node.
- Kept prerequisites strict but minimal (mostly 1-2 direct dependencies).
- Avoided transitive redundant prerequisites (enforced by phase-9 tests).
- Stayed inside approved domain allowlist used by prior phase quality tests.
