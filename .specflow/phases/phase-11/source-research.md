# Phase 11 Source Research Notes

## Extraction Summary
Raw extraction artifacts:
- `.specflow/phases/phase-11/extractions/raw-btctranscripts-topics.json` (164 topics)
- `.specflow/phases/phase-11/extractions/raw-bitcoinops-and-devphilosophy-topics.json`
  - `bitcoinops_topics`: 273
  - `devphilosophy_topics`: 78 (TOC/index entries only)
- `.specflow/phases/phase-11/extractions/raw-opcodes-and-covenants-topics.json`
  - `opcodeexplained_topics`: 261
  - `covenants_topics`: 19

Curated decisions artifact:
- `.specflow/phases/phase-11/extractions/curated-topics.json`
  - `keep_new_node`: 34 topic entries mapped into phase-11 additions
  - `keep_existing_node`: 140 topic entries mapped to existing graph nodes
  - `drop`: 621 topic entries (noise, duplicates, project/event labels, broad buckets, or trivial opcode constants)

## Curation Rules Applied
- Kept concept-level protocol/ops/security/wallet/economics topics.
- Mapped aliases and duplicates to existing nodes when possible.
- Added missing high-signal concepts as new nodes when topic specificity justified standalone study.
- Dropped non-concept entries (e.g., place/time tags, conference labels, navigation-only TOC entries).
- Dropped low-signal opcode constants/variants (e.g., `OP_PUSHBYTES_n`, `OP_PUSHDATAx`, `OP_RETURN_x`).

## Phase-11 New Nodes Added
- `protocol.annex`
- `mining.asicboost`
- `extension.channel-factories`
- `extension.coinswap`
- `extension.dual-funding`
- `extension.ecash`
- `custody.codex32`
- `privacy.silent-payments`
- `extension.sidechains`
- `ops.utreexo`
- `extension.lnurl`
- `extension.submarine-swaps`
- `protocol.transaction-pinning`
- `protocol.cpfp-carve-out`
- `security.exfiltration-resistant-signing`
- `protocol.fee-sponsorship`
- `protocol.discrete-log-equivalency`
- `fundamentals.trustlessness`
- `fundamentals.neutrality`
- `privacy.fungibility`
- `security.adversarial-thinking`
- `security.responsible-disclosure`

## Resource Specificity Notes
- Used direct topic pages for Bitcoin Optech resources (`/en/topics/<topic>/`).
- Used direct BTC Transcripts filtered topic URLs (`/search?filter_tags=<slug>`).
- Used direct anchor deep-links for Bitcoin Dev Philosophy concepts (`#<section-id>`).
- Kept covenant resources at proposal/use-case/extra topic pages (not index pages).
- Included Amazon book links where they directly support learning context for the node.
