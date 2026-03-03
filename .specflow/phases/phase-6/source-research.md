# Phase 6 Source Research Notes

Timestamp: 2026-03-03

## Sources Consulted

1. Local 101BTC corpus
- Path: `/Users/breno/Documents/Obsidian Vault/Projects/101BTC/`
- Used for: identifying underrepresented concept gaps around wallets, mining operations, node behavior, and privacy tradeoffs.

2. Bitcoin Core Academy
- URL: https://bitcoincore.academy/
- URLs referenced:
  - https://bitcoincore.academy/bootstrapping.html
  - https://bitcoincore.academy/hardcoded-consensus-values.html
  - https://bitcoincore.academy/consensus-model.html
  - https://bitcoincore.academy/wallet-interfaces.html
  - https://bitcoincore.academy/scriptpubkeymanagers.html
  - https://bitcoincore.academy/block-relay.html
  - https://bitcoincore.academy/addrman.html
  - https://bitcoincore.academy/address-relay.html
  - https://bitcoincore.academy/transaction-tracking.html
  - https://bitcoincore.academy/transaction-identification.html
  - https://bitcoincore.academy/mempool-lifecycle.html
  - https://bitcoincore.academy/pinning-attacks.html
- Used for: sync internals, operational node behavior, wallet internals, and relay/attack mechanics.

3. Bitcoin Dev Network
- URL: https://bitcoindev.network/
- URLs referenced:
  - https://bitcoindev.network/bitcoin-wire-protocol/
- Used for: protocol message-level framing to support sync and relay topics.

4. Bitcoin.page / Lopp resources
- URLs referenced:
  - https://www.lopp.net/bitcoin-information/privacy.html
  - https://www.lopp.net/bitcoin-information/fee-estimates.html
  - https://www.lopp.net/bitcoin-information/recommended-wallets.html
  - https://www.lopp.net/bitcoin-information/mining.html
- Used for: curated operational and privacy resource anchoring.

5. Bitcoin Design
- URL: https://bitcoin.design/
- URLs referenced:
  - https://bitcoin.design/guide/how-it-works/coin-selection/
  - https://bitcoin.design/guide/how-it-works/private-key-management/overview/
  - https://bitcoin.design/guide/how-it-works/lightning-services/
- Used for: wallet/privacy UX framing and practical Lightning routing implications.

6. Canonical technical references
- Bitcoin Optech Topics:
  - https://bitcoinops.org/en/topics/transaction-bloom-filtering/
  - https://bitcoinops.org/en/topics/rendez-vous-routing/
  - https://bitcoinops.org/en/topics/trampoline-payments/
  - https://bitcoinops.org/en/topics/channel-jamming-attacks/
  - https://bitcoinops.org/en/topics/compact-block-relay/
  - https://bitcoinops.org/en/topics/compact-block-filters/
  - https://bitcoinops.org/en/topics/soft-fork-activation/
- BIPs repository:
  - https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0022.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0148.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0370.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki
- Bitcoin Developer Guide / Reference:
  - https://developer.bitcoin.org/devguide/p2p_network.html
  - https://developer.bitcoin.org/reference/p2p_networking.html
  - https://developer.bitcoin.org/devguide/wallets.html
  - https://developer.bitcoin.org/devguide/transactions.html
  - https://developer.bitcoin.org/devguide/mining.html
  - https://developer.bitcoin.org/devguide/operating_modes.html
  - https://developer.bitcoin.org/devguide/block_chain.html
  - https://developer.bitcoin.org/reference/block_chain.html
  - https://developer.bitcoin.org/reference/rpc/getblocktemplate.html
  - https://developer.bitcoin.org/reference/rpc/getrawtransaction.html
- BOLTs:
  - https://github.com/lightning/bolts/blob/master/02-peer-protocol.md
  - https://github.com/lightning/bolts/blob/master/04-onion-routing.md
  - https://github.com/lightning/bolts/blob/master/12-offer-encoding.md
- Mastering Bitcoin:
  - https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch05_wallets.adoc
  - https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch09_fees.adoc
  - https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch12_mining.adoc

## Coverage Decisions
- Added 20 source-driven nodes to cover remaining high-signal gaps in:
  - protocol synchronization and legacy filtering
  - wallet standards and descriptor internals
  - Lightning privacy and routing patterns
  - mining block-template and stale-block mechanics
  - node operation indexing/discovery behavior
  - practical privacy and custody workflows
  - mining economics history and activation context
- Tightened phase-specific dependency quality by avoiding direct transitive prerequisite redundancy.
- Preserved one-concept-per-node semantics with stable slug IDs and curated 2-3 resources each.
