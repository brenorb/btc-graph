# Phase 5 Source Research Notes

Timestamp: 2026-03-03

## Sources Consulted

1. Local 101BTC corpus
- Path: `/Users/breno/Documents/Obsidian Vault/Projects/101BTC/`
- Used for: missing-topic discovery beyond existing graph coverage (layers, 51% attack framing, block height, governance activation history, operational node concerns).

2. Bitcoin Dev Network
- URL: https://bitcoindev.network/
- URLs referenced:
  - https://bitcoindev.network/bitcoin-script-101/
  - https://bitcoindev.network/bitcoin-wire-protocol/
- Used for: script and protocol implementation context for P2SH / OP_RETURN and message-relay related concepts.

3. Bitcoin Core Academy
- URL: https://bitcoincore.academy/
- URLs referenced:
  - https://bitcoincore.academy/bootstrapping.html
  - https://bitcoincore.academy/consensus-model.html
  - https://bitcoincore.academy/consensus-changes.html
  - https://bitcoincore.academy/block-relay.html
  - https://bitcoincore.academy/p2p-attacks.html
  - https://bitcoincore.academy/wallet-keys.html
- Used for: node operations, block relay, attack modeling, and key-management/custody references.

4. Bitcoin.page / Lopp resources
- URL: https://bitcoin.page
- URLs referenced:
  - https://www.lopp.net/bitcoin-information/history.html
  - https://www.lopp.net/bitcoin-information/full-node.html
  - https://www.lopp.net/bitcoin-information/recommended-wallets.html
- Used for: curation-oriented historical and operational resource anchoring.

5. Bitcoin Design
- URL: https://bitcoin.design/
- URLs referenced:
  - https://bitcoin.design/guide/how-it-works/lightning-services/
  - https://bitcoin.design/guide/how-it-works/liquidity/
  - https://bitcoin.design/guide/how-it-works/private-key-management/overview/
- Used for: user-facing conceptual framing of layers, liquidity/closure implications, and key-management privacy risks.

6. Canonical technical references
- Bitcoin Optech Topics:
  - https://bitcoinops.org/en/topics/assumeutxo/
  - https://bitcoinops.org/en/topics/compact-block-relay/
  - https://bitcoinops.org/en/topics/compact-block-filters/
  - https://bitcoinops.org/en/topics/soft-fork-activation/
  - https://bitcoinops.org/en/topics/anchor-outputs/
  - https://bitcoinops.org/en/topics/watchtowers/
- BIPs repository:
  - https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0016.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0034.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0042.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0113.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0148.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0157.mediawiki
  - https://github.com/bitcoin/bips/blob/master/bip-0158.mediawiki
- Developer Guide:
  - https://developer.bitcoin.org/devguide/block_chain.html
  - https://developer.bitcoin.org/reference/block_chain.html
  - https://developer.bitcoin.org/devguide/operating_modes.html
  - https://developer.bitcoin.org/devguide/transactions.html
  - https://developer.bitcoin.org/devguide/wallets.html
- BOLTs:
  - https://github.com/lightning/bolts/blob/master/00-introduction.md
  - https://github.com/lightning/bolts/blob/master/02-peer-protocol.md
  - https://github.com/lightning/bolts/blob/master/03-transactions.md
  - https://github.com/lightning/bolts/blob/master/05-onchain.md

## Coverage Decisions
- Added 18 new nodes to close gaps in protocol relay internals, activation mechanisms, Lightning commitment/closure mechanics, node sync internals, key-privacy leakage, and economic supply nuances.
- Preserved one-concept-per-node semantics with stable slug IDs and strict non-redundant prerequisites.
- Enforced curated resource lists (2-3 links per node) and validated all URLs via `npm run check:links`.
