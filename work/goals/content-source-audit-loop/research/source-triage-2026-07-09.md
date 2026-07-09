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
- Source context: `Great Consensus Cleanup explained Part 1: Time Warp Attack`
- Source context: `Duplicate transaction bug explained`
- Reason: Bitcoin-native consensus-cleanup bug branch covering timestamp manipulation and txid uniqueness failures

## Cypherpunk Library

- Implemented in branch: `history.chaumian-ecash`
- Source cluster: `Protecting Privacy with Electronic Cash` and `The Beauty of eCash`
- Reason: historical bridge between blind signatures, pre-Bitcoin digital cash, and modern Bitcoin-backed ecash systems
