# Phase 5 Plan: Deep Content Expansion From Source Corpus

## Objective
Expand the curriculum beyond the existing 97 nodes by researching the sources in `bitcoin-content-sources.md` and adding missing high-signal concepts with strict prerequisites and curated references.

## Scope
1. Research source coverage for missing concepts:
   - local 101BTC corpus
   - Bitcoin Dev Network
   - Bitcoin Core Academy
   - Bitcoin.page / Lopp resources
   - Bitcoin Design
   - canonical references (Bitcoin Optech, BIPs, Developer Guide, BOLTs)
2. Add a new content slice of advanced and operational nodes across protocol, lightning, mining, node operations, privacy, custody, economics, and history.
3. Keep each new node one-concept-per-node with stable slug IDs and concise 2-3 resource links.
4. Validate schema/dependency integrity, dead links, and runtime compatibility.

## Test-First Tasks
1. Add failing tests for expected phase-5 node IDs and minimum quality constraints.
2. Implement node files to satisfy test expectations.
3. Run content validation to catch unknown prerequisites, duplicate IDs, and cycles.
4. Re-run app tests and link checks.

## Edge Cases
- New node prerequisites must reference existing or newly added IDs only.
- No cycles introduced while cross-linking protocol/lightning/ops concepts.
- Every new node keeps non-empty `prerequisites` and 2-3 resources.

## Done Criteria
- New source-driven nodes are merged.
- `npm run build:data` passes.
- `npm test` passes.
- `npm run check:links` passes.
- No-context review is completed and any findings are fixed.
