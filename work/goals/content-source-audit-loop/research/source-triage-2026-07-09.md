# Source Triage 2026-07-09

Preserve the strongest pending source-family findings from the 2026-07-09 subagent pass so they can be revisited after the next implementation slice.

## Programming Lightning

- Implemented in branch: `lightning.per-commitment-secrets`
- Implemented in branch: `lightning.obscured-commitment-number`
- Source cluster: `lightning-tutorial/commitment-secrets` and `lightning-tutorial/commitment-transactions`
- Reason: commitment-state bridge concepts between the broad commitment-transaction overview and downstream revocation, close, and HTLC behavior

## Bitcoin Dev Project Explained Posts

- Implemented in branch: `protocol.time-warp-attack`
- Implemented in branch: `protocol.duplicate-transaction-bug`
- Implemented in branch: `protocol.64-byte-transaction-bug`
- Source context: `Great Consensus Cleanup explained Part 1: Time Warp Attack`
- Source context: `Duplicate transaction bug explained`
- Source context: `Episode 5: The 64-byte transaction bug explained simply`
- Reason: Bitcoin-native consensus-cleanup bug branch covering timestamp manipulation and txid uniqueness failures

## Cypherpunk Library

- Implemented in branch: `history.chaumian-ecash`
- Merged in branch: `A Cypherpunk's Manifesto` -> `history.cypherpunks`
- Merged in branch: `The Crypto Anarchist Manifesto` -> `history.bitcoin-anarchism`
- Source cluster: `Protecting Privacy with Electronic Cash` and `The Beauty of eCash`
- Source cluster: `A Cypherpunk's Manifesto`, `The Crypto Anarchist Manifesto`, `Protecting Privacy with Electronic Cash`, and `The Beauty of eCash`
- Reason: preserve the movement's primary source inside existing history coverage while adding the historical digital-cash bridge as its own node
