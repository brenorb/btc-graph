# Phase 11 Plan: Topic Specificity and Source Coverage Expansion

## Objective
Ingest and curate full topic indexes from requested external websites, add graph-suitable missing concepts, and tighten resource specificity with concise descriptions.

## Scope
1. Extract all topics from:
   - https://btctranscripts.com/topics
   - https://bitcoinops.org/en/topics/
   - https://bitcoindevphilosophy.com/
   - https://opcodeexplained.com/
   - https://covenants.info/proposals/
   - https://covenants.info/use-cases/
   - https://covenants.info/extra/gsr/
   - https://covenants.info/extra/bitvm/
2. Curate extraction output into keep/drop decisions:
   - keep concept-level topics
   - map already-covered concepts to existing nodes
   - add missing high-signal concepts as new nodes
   - drop non-concept noise (time/place/event labels, navigation-only entries, trivial opcode constants)
3. Add a phase-11 node slice with stable IDs and strict prerequisites.
4. Ensure each new node has a short description (max 2 sentences).
5. Use focused resources (topic pages/deep links, not broad landing pages), and add Amazon books when useful.

## Test-First Tasks
1. Add failing tests requiring phase-11 node IDs.
2. Add failing edge-case tests for:
   - broad/non-specific resource URLs
   - description overflow (>2 sentences)
   - trivial-opcode rejection
   - non-bitcoin/non-concept topic rejection fixtures
3. Implement new nodes and focused resources to satisfy tests.
4. Run full validation:
   - `npm test`
   - `npm run build:data`
   - `npm run check:links`
   - `npm run build`

## Done Criteria
- Requested source indexes are represented in extraction artifacts.
- Curated keep/drop decisions are captured for extracted topics.
- Phase-11 required nodes exist with concise descriptions and focused resources.
- Independent no-context review findings are addressed.
- Full validation and visual verification pass.
