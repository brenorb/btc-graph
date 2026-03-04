# Findings

1. **Initial finding (resolved): broad resource-link edge case coverage was incomplete.**
   - No-context reviewer flagged that `https://covenants.info/use-cases/` was accepted as non-broad and the synthetic fixtures did not explicitly test broad-link rejection.

# Applied Fixes

- Updated broad-link guard in [tests/phase-10-content.test.ts](/Users/breno/Documents/code/PROJECTS/btc-graph/tests/phase-10-content.test.ts) to mark covenant section index pages (`/proposals/`, `/use-cases/`, `/extra/`) as broad.
- Added explicit broad-link synthetic assertions for:
  - `https://covenants.info/use-cases/` (broad)
  - `https://bitcoinops.org/en/topics/` (broad)
  - `https://btctranscripts.com/topics` (broad)
  - `https://covenants.info/use-cases/tx-templating/` (not broad)
- Replaced broad covenant landing-page resource in [protocol.covenants.json](/Users/breno/Documents/code/PROJECTS/btc-graph/content/nodes/protocol.covenants.json) with focused topic page:
  - `https://covenants.info/use-cases/tx-templating/`

# Validation

- `npm test` -> **pass** (8 files, 60 tests).
- `npm run build:data` -> **pass** (`Built 212 nodes -> public/data/graph.json`).
- `npm run check:links` -> **pass** (`Checked 212 unique resource URLs across 212 nodes. All links are reachable.`).
- `npm run build` -> **pass** (Vite production build succeeded).

# Verdict

**No remaining findings after fix pass.**

Phase-10 plan criteria are satisfied, including the broad/non-topic edge-case requirement.
