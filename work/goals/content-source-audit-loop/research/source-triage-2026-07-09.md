# Source Triage 2026-07-09

Preserve the strongest pending source-family findings from the 2026-07-09 subagent pass so they can be revisited after the next implementation slice.

## Programming Lightning

- Winner: `lightning.per-commitment-secrets`
- Source cluster: `lightning-tutorial/commitment-secrets`
- Reason: specific mechanism between commitment transactions and revocation/penalty handling, with lower duplicate risk than broader channel-state or onion-routing wrappers

## Bitcoin Dev Project Explained Posts

- Implemented in branch: `protocol.time-warp-attack`
- Source context: `Great Consensus Cleanup explained Part 1: Time Warp Attack`
- Reason: Bitcoin-native consensus exploit bridge between difficulty adjustment and timestamp constraints

## Cypherpunk Library

- Implemented in branch: `history.chaumian-ecash`
- Source cluster: `Protecting Privacy with Electronic Cash` and `The Beauty of eCash`
- Reason: historical bridge between blind signatures, pre-Bitcoin digital cash, and modern Bitcoin-backed ecash systems
