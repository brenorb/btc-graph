# Phase 3 Source Research Notes

Timestamp: 2026-03-03

## Sources Consulted

1. Local 101BTC corpus
- Path: `/Users/breno/Documents/Obsidian Vault/Projects/101BTC/`
- Used for: broad topic inventory (wallets, mining, regulation, confirmations, sidechains, privacy myths, self-custody operations).

2. Bitcoin Dev Network
- URL: https://bitcoindev.network/
- URLs referenced:
  - https://bitcoindev.network/bitcoin-script-101/
  - https://bitcoindev.network/bitcoin-wire-protocol/
  - https://bitcoindev.network/getting-started-with-nigiri/
  - https://bitcoindev.network/guides/bitcoinjs-lib/native-segwit-p2wpkh/
- Used for: implementation-oriented protocol/dev nodes.

3. Bitcoin Core Academy
- URL: https://bitcoincore.academy/
- URLs referenced:
  - https://bitcoincore.academy/consensus-model.html
  - https://bitcoincore.academy/testnets.html
  - https://bitcoincore.academy/address-relay.html
  - https://bitcoincore.academy/contributor-exercises.html
- Used for: consensus, networking, testnet/signet, contributor/dev workflow nodes.

4. Bitcoin.page
- URL: https://bitcoin.page (redirects to https://www.lopp.net/bitcoin-information.html)
- URLs referenced:
  - https://www.lopp.net/bitcoin-information/getting-started.html
  - https://www.lopp.net/bitcoin-information/recommended-wallets.html
  - https://www.lopp.net/bitcoin-information/full-node.html
  - https://www.lopp.net/bitcoin-information/history.html
  - https://www.lopp.net/bitcoin-information/fee-estimates.html
  - https://www.lopp.net/bitcoin-information/privacy.html
- Used for: curated orientation resources for fundamentals/history/privacy/node operations.

5. Bitcoin Design
- URL: https://bitcoin.design/guide/
- URLs referenced:
  - https://bitcoin.design/guide/how-it-works/backups/
  - https://bitcoin.design/guide/how-it-works/coin-selection/
  - https://bitcoin.design/guide/daily-spending-wallet/backup-and-recovery/landing-page/
- Used for: custody UX, backup/recovery, and wallet privacy behavior nodes.

6. Canonical technical references (from recommended additions)
- BIPs repo: https://github.com/bitcoin/bips
- Developer Guide: https://developer.bitcoin.org/devguide/
- BOLTs: https://github.com/lightning/bolts
- Bitcoin Optech Topics: https://bitcoinops.org/en/topics/

## Coverage Decisions
- Added depth where current graph was thin: SegWit/Taproot/timelocks/fee-bumping, custody passphrase/inheritance, chain-analysis/payjoin, LN routing+multipath+splicing+offers, signet+Tor ops, BIP32/39/44 and P2P messages, security budget.
- Kept one-concept-per-node and stable slug IDs.
- Avoided bloated resource lists; retained 2-3 high-signal links per node.
