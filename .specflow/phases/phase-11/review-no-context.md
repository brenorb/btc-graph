# Phase 11 No-Context Review

## Findings

1. **High - Curation artifact contradicts implemented phase-11 nodes for Dev Philosophy concepts (requirement gap + traceability break).**
   - Plan requires concept-level keep/drop curation and adding missing high-signal concepts as nodes: `.specflow/phases/phase-11/plan.md:16-20`.
   - `curated-topics.json` marks these extracted concepts as `drop`:
     - Neutrality: `.specflow/phases/phase-11/extractions/curated-topics.json:3269-3272`
     - Trustlessness: `.specflow/phases/phase-11/extractions/curated-topics.json:3290-3293`
     - Fungibility: `.specflow/phases/phase-11/extractions/curated-topics.json:3353-3356`
     - Adversarial thinking: `.specflow/phases/phase-11/extractions/curated-topics.json:3465-3468`
     - Responsible disclosure: `.specflow/phases/phase-11/extractions/curated-topics.json:3619-3622`
   - The same concepts are required in the phase-11 node slice and are implemented as new nodes:
     - Required IDs in test: `tests/phase-11-content.test.ts:26-30`
     - Implemented nodes/resources:
       - `content/nodes/fundamentals.neutrality.json:2-21`
       - `content/nodes/fundamentals.trustlessness.json:2-21`
       - `content/nodes/privacy.fungibility.json:2-20`
       - `content/nodes/security.adversarial-thinking.json:2-20`
       - `content/nodes/security.responsible-disclosure.json:2-20`
   - Impact: curation decisions are not reliable as a source of truth for why phase-11 nodes exist; this can cause incorrect follow-up curation and review churn.

2. **Medium - Several phase-11 resources are broad GitHub landing pages, but broad-link checks do not catch them.**
   - Plan requires focused resources (deep links/topic pages), not broad landing pages: `.specflow/phases/phase-11/plan.md:23`.
   - Phase-11 nodes include repo-root GitHub links (broad landing pages):
     - `content/nodes/extension.ecash.json:26`
     - `content/nodes/extension.lnurl.json:26`
     - `content/nodes/extension.submarine-swaps.json:26`
     - `content/nodes/ops.utreexo.json:26`
   - Current broad-link heuristic only rejects very short/root paths and does not special-case GitHub repo roots: `tests/phase-11-content.test.ts:94-121`.
   - Impact: resource specificity requirement can regress while tests stay green.

3. **Medium - Missing test coverage for curation-to-node consistency allowed Finding #1 to slip through.**
   - Phase-11 tests validate node files but do not validate that `keep_new_node`/`keep_existing_node` decisions in curation artifacts align with implemented phase-11 IDs.
   - Evidence: tests only load `content/nodes` (`tests/phase-11-content.test.ts:68-80`) and never parse `.specflow/phases/phase-11/extractions/curated-topics.json`.
   - Impact: plan criterion "Curated keep/drop decisions are captured for extracted topics" (`.specflow/phases/phase-11/plan.md:41`) is not enforceable by automated checks.

## Open Questions / Assumptions

- Assumption: `curated-topics.json` is intended to be authoritative for phase-11 keep/drop outcomes. If it is intentionally only a partial/temporary draft, that should be explicitly documented.

## Validation Notes

- Executed locally:
  - `npm test` (pass)
  - `npm run build:data` (pass)
  - `npm run build` (pass)
  - `npm run check:links` (failed in this environment with network `fetch failed` for all external URLs; unable to distinguish network restriction vs true link health from this run alone)
