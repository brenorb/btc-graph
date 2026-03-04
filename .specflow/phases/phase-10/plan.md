# Phase 10 Plan: External Topic Corpus Integration

## Objective
Integrate meaningful Bitcoin learning concepts from external topic indexes and proposal catalogs into the graph, with concise node descriptions and precise, high-signal resources.

## Scope
1. Extract topics from:
   - https://btctranscripts.com/topics
   - https://bitcoinops.org/en/topics/
   - https://opcodeexplained.com/
   - https://covenants.info/proposals/
   - https://covenants.info/use-cases/
   - https://covenants.info/extra/gsr/
   - https://covenants.info/extra/bitvm/
2. Curate extraction output into graph-suitable concept nodes:
   - keep concept-level topics
   - drop irrelevant/non-concept entries (people names, places, and trivial opcode variants)
3. Add a phase-10 node slice with strict prerequisite semantics and stable IDs.
4. Ensure each new node has a short description (max 2 sentences).
5. Curate resources toward direct topic pages; include Amazon books when genuinely useful.

## Test-First Tasks
1. Add failing tests requiring the phase-10 target node IDs.
2. Add edge-case tests for:
   - overly broad/non-topic resource links
   - description sentence overflow (>2 sentences)
   - trivial-opcode rejection fixture
3. Implement node files and focused resources to satisfy tests.
4. Run full validation:
   - `npm test`
   - `npm run build:data`
   - `npm run check:links`
   - `npm run build`

## Done Criteria
- Requested source indexes are represented in extraction artifacts and curated decisions.
- Phase-10 required nodes exist with concise descriptions and focused resources.
- No-context reviewer findings are addressed.
- Full validation and deploy checks pass.
