# Source Triage 2026-07-09

Preserve the strongest pending source-family findings from the 2026-07-09 subagent pass so they can be revisited after the next implementation slice.

## Programming Lightning

- Implemented in branch: `lightning.per-commitment-secrets`
- Implemented in branch: `lightning.obscured-commitment-number`
- Implemented in branch: `lightning.commitment-output-scripts`
- Implemented in branch: `lightning.htlc-output-scripts`
- Source cluster: `lightning-tutorial/commitment-secrets` and `lightning-tutorial/commitment-transactions`
- Source cluster: `offered-htlcs`, `received-htlcs`, and `htlc-fees-dust`
- Reason: commitment-state bridge concepts between the broad commitment-transaction overview and downstream revocation, close, and HTLC behavior

## Bitcoin Dev Project Explained Posts

- Implemented in branch: `protocol.time-warp-attack`
- Implemented in branch: `protocol.duplicate-transaction-bug`
- Implemented in branch: `protocol.64-byte-transaction-bug`
- Implemented in branch: `fundamentals.lamport-signatures`
- Implemented in branch: `custody.shamirs-secret-sharing`
- Merged in branch: `Off-by-one difficulty bug explained` -> `protocol.time-warp-attack`
- Source context: `Great Consensus Cleanup explained Part 1: Time Warp Attack`
- Source context: `Duplicate transaction bug explained`
- Source context: `Episode 5: The 64-byte transaction bug explained simply`
- Source context: `Lamport Signature explained`
- Source context: `Shamir's secret sharing explained simply`
- Source context: `Off-by-one difficulty bug explained`
- Reason: Bitcoin-native consensus-cleanup bug branch covering timestamp manipulation and txid uniqueness failures

## Cypherpunk Library

- Implemented in branch: `history.chaumian-ecash`
- Implemented in branch: `privacy.secret-right-to-cash`
- Merged in branch: `A Cypherpunk's Manifesto` -> `history.cypherpunks`
- Merged in branch: `The Crypto Anarchist Manifesto` -> `history.bitcoin-anarchism`
- Source cluster: `Protecting Privacy with Electronic Cash` and `The Beauty of eCash`
- Source cluster: `A Cypherpunk's Manifesto`, `The Crypto Anarchist Manifesto`, `Your Secret Right to Cash`, `Protecting Privacy with Electronic Cash`, and `The Beauty of eCash`
- Reason: preserve the movement's primary source inside existing history coverage while adding the historical digital-cash bridge as its own node

## Pending Follow-ons

- `fundamentals.distributed-key-generation`
  - Source family: `Bitcoin Dev Project Explained Posts`
  - Current read: defer; likely wants a more concrete threshold-signing child such as `protocol.frost` before it lands cleanly

- `privacy.non-blockchain-privacy-leaks`
  - Source family: `Bitcoin Dev Philosophy`
  - Source cluster: `Chapter 3 Privacy -> 3.5 Non-blockchain privacy`
  - Current read: merge/defer into `privacy.pseudonymity`; better used to strengthen off-chain leakage examples than as its own node

- `economics.ideal-money`
  - Source family: `Cypherpunk Library`
  - Source cluster: `Ideal Money and Asymptotically Ideal Money`
  - Current read: distinct monetary-theory candidate focused on money as a stable measuring stick rather than mainly a scarce asset
