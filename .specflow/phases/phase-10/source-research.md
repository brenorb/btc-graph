# Phase 10 Source Research Notes

Timestamp: 2026-03-04

## Source Set

1. https://btctranscripts.com/topics
2. https://bitcoinops.org/en/topics/
3. https://opcodeexplained.com/
4. https://covenants.info/proposals/
5. https://covenants.info/use-cases/
6. https://covenants.info/extra/gsr/
7. https://covenants.info/extra/bitvm/

## Extraction Artifacts

- `.specflow/phases/phase-10/extractions/btctranscripts.json`
  - 164 topics extracted
  - non-concept tags filtered (`2025`, `atlanta`, person/project labels)
- `.specflow/phases/phase-10/extractions/bitcoinops-topics.json`
  - 273 topics extracted
  - aliases detected via italic entries and marked `keep_for_graph=false`
- `.specflow/phases/phase-10/extractions/opcodeexplained.json`
  - 261 entries extracted
  - trivial opcode families (`OP_PUSHBYTES_*`, number literals, `OP_RETURN_*`) marked `keep_for_graph=false`
- `.specflow/phases/phase-10/extractions/covenants-info.json`
  - 20 proposal/use-case/extra entries extracted
  - catch-all `others` marked `keep_for_graph=false`

## Curation Decisions

- Kept only concept-level entries that are useful as study targets.
- Rejected non-concepts and noisy labels:
  - people/place tags (example: `atlanta`)
  - pure event/year/community labels
  - implementation/project labels where no standalone concept exists
  - trivial opcode variants with no distinct learning value
- Prioritized missing high-signal concepts not already represented in existing nodes:
  - covenant proposals and use-case families
  - selective opcode semantics with meaningful study value
  - advanced relay, transport, privacy, and Lightning contract topics

## Implemented Node Slice

33 new nodes added:

- `protocol.covenants`
- `protocol.adaptor-signatures`
- `protocol.anyprevout`
- `protocol.op-checktemplateverify`
- `protocol.tluv`
- `protocol.txhash`
- `protocol.direct-introspection`
- `protocol.matt-ccv`
- `security.op-vault`
- `extension.great-script-restoration`
- `extension.bitvm`
- `protocol.op-cat`
- `protocol.op-checksigfromstack`
- `protocol.op-checksigadd`
- `protocol.op-codeseparator`
- `extension.transaction-templating`
- `extension.payment-pools`
- `extension.ark`
- `extension.statechains`
- `extension.spacechains`
- `extension.congestion-control`
- `extension.coinpools`
- `extension.discreet-log-contracts`
- `protocol.cross-input-signature-aggregation`
- `protocol.erlay`
- `protocol.cluster-mempool`
- `protocol.v2-p2p-transport`
- `protocol.ephemeral-anchors`
- `lightning.ptlc`
- `lightning.eltoo`
- `security.eclipse-attacks`
- `privacy.dandelion`
- `dev.reproducible-builds`

## Resource Curation Rules Applied

- Every new node uses focused links (topic/proposal/use-case pages), not broad homepages.
- Added Amazon book links where useful for deeper study:
  - Mastering Bitcoin
  - Programming Bitcoin
  - Mastering the Lightning Network
