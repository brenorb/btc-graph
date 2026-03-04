# Phase 7 Source Research Notes

Timestamp: 2026-03-03

## Sources Consulted

1. Local 101BTC corpus
- Path: `/Users/breno/Documents/Obsidian Vault/Projects/101BTC/`
- Used for: identifying remaining gaps around relay policy, wallet operations, mining incentives, and historical context.

2. Bitcoin Dev Network
- URL: https://bitcoindev.network/
- URLs used:
  - https://bitcoindev.network/bitcoin-wire-protocol/
  - https://bitcoindev.network/bitcoin-script-101/
- Used for: implementation-oriented framing for P2P relay and script-signing semantics.

3. Bitcoin Core Academy
- URL: https://bitcoincore.academy/
- URLs used:
  - https://bitcoincore.academy/address-relay.html
  - https://bitcoincore.academy/addrman.html
  - https://bitcoincore.academy/bootstrapping.html
  - https://bitcoincore.academy/mempool-lifecycle.html
  - https://bitcoincore.academy/p2p-attacks.html
  - https://bitcoincore.academy/pinning-attacks.html
  - https://bitcoincore.academy/scriptpubkeymanagers.html
  - https://bitcoincore.academy/wallet-interfaces.html
  - https://bitcoincore.academy/transaction-tracking.html
  - https://bitcoincore.academy/consensus-model.html
- Used for: wallet internals, node-ops hardening, relay policy, and mining/consensus operational depth.

4. Bitcoin.page / Lopp
- URLs used:
  - https://bitcoin.page
  - https://www.lopp.net/bitcoin-information/privacy.html
  - https://www.lopp.net/bitcoin-information/fee-estimates.html
  - https://www.lopp.net/bitcoin-information/full-node.html
  - https://www.lopp.net/bitcoin-information/mining.html
- Used for: operational and privacy curation, plus practical references for node operators and learners.

5. Bitcoin Design
- URL: https://bitcoin.design/
- URLs used:
  - https://bitcoin.design/guide/how-it-works/backups/
  - https://bitcoin.design/guide/how-it-works/coin-selection/
  - https://bitcoin.design/guide/how-it-works/liquidity/
  - https://bitcoin.design/guide/how-it-works/lightning-services/
  - https://bitcoin.design/guide/how-it-works/private-key-management/overview/
- Used for: user-facing wallet, custody, and Lightning routing/liquidity implications.

6. Canonical technical references
- Bitcoin Optech topics:
  - https://bitcoinops.org/en/topics/package-relay/
  - https://bitcoinops.org/en/topics/coin-selection/
  - https://bitcoinops.org/en/topics/multipath-payments/
  - https://bitcoinops.org/en/topics/fee-sniping/
  - https://bitcoinops.org/en/topics/taproot/
- BIPs:
  - https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0022.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0155.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0370.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki
- Developer Guide / Reference:
  - https://developer.bitcoin.org/devguide/p2p_network.html
  - https://developer.bitcoin.org/devguide/mining.html
  - https://developer.bitcoin.org/devguide/transactions.html
  - https://developer.bitcoin.org/devguide/wallets.html
  - https://developer.bitcoin.org/reference/p2p_networking.html
  - https://developer.bitcoin.org/reference/rpc/getblocktemplate.html
  - https://developer.bitcoin.org/reference/rpc/estimatesmartfee.html
- Lightning BOLTs:
  - https://github.com/lightning/bolts/blob/master/02-peer-protocol.md
  - https://github.com/lightning/bolts/blob/master/04-onion-routing.md
  - https://github.com/lightning/bolts/blob/master/07-routing-gossip.md
- Mastering Bitcoin:
  - https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch09_fees.adoc
  - https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch12_mining.adoc
- mempool docs:
  - https://mempool.space/docs

## Coverage Decisions
- Added 22 new source-driven nodes to deepen coverage in:
  - protocol relay internals and signature semantics
  - development workflows for descriptors, hardware signing, and fee estimation
  - Lightning gossip, probing, and fee-policy operations
  - mining fee-sniping and template construction
  - node bootstrapping hardening (DNS seeds, ASMAP)
  - privacy leakage heuristics (script and amount correlation)
  - custody coordination and advanced backup approaches
  - fee-cycle and batching economics
  - taproot-era and mining-hardware history
- Enforced strict dependency quality by removing transitive-redundant prerequisites during TDD fixes.
- Kept each node to 2-3 curated resources from canonical domains in `bitcoin-content-sources.md`.
