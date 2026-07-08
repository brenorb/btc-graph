# Content Discovery Loop Prompt

Use this loop when the goal is to expand `btc-graph` from educational sources without bloating the graph or losing prerequisite rigor.

## Ready-To-Paste Goal

```text
/goal audit Bitcoin educational sources and expand btc-graph with atomic concepts and strict prerequisite edges

- first read `AGENTS.md`, `spec.md`, `README.md`, `CONTRIBUTING.md`, `bitcoin-content-sources.md`, one representative node in `content/nodes/*.json`, and `audit/feature-audit.json` so you match the repo's product and tracking conventions before browsing
- seed sources for the first audit pass:
  - Bitcoin Optech Topics: `https://bitcoinops.org/en/topics/`
  - BTC Transcripts Topics: `https://btctranscripts.com/topics`
  - Bitcoin Dev Philosophy: `https://bitcoindevphilosophy.com/`
  - Mastering Bitcoin book map: `https://github.com/bitcoinbook/bitcoinbook/blob/develop/BOOK.md`
  - Optech Schnorr/Taproot Workshop: `https://bitcoinops.org/en/schnorr-taproot-workshop/`
  - Decoding by Bitcoin Devs: `https://bitcoindevs.xyz/decoding`
- treat these as mandatory starting sources
- enumerate each source into the `Sources` sheet before extracting concepts
- for large sources, break them into page clusters or sections and track those separately
- work on a dedicated branch for this audit and never directly on the default branch
- open a draft PR early once the branch has the initial tracking artifact or first meaningful vertical slice
- commit frequently to that draft PR in small, reviewable increments
- each commit should preserve a runnable, reviewable repo state and keep the canonical tracker up to date
- create one canonical structured source-of-truth file for this audit and one generated spreadsheet for human review
- the spreadsheet is for tracking and review; the structured file is the canonical artifact

- create and maintain a single canonical workbook with these sheets:
  - `Sources`: one row per website, section, or course module being audited
  - `Concepts`: one row per atomic concept candidate
  - `Edges`: one row per proposed direct prerequisite edge
  - `Decisions`: conflicts, merges, exclusions, and rationale
  - `Coverage`: summary metrics and remaining gaps

- start with source inventory:
  - enumerate every target site, section, and major page cluster
  - track source name, URL, scope, crawl status, extraction status, dedupe status, and notes
  - do not mark a source complete until its relevant pages have been inspected and its concepts have been normalized against the existing graph

- for each source, extract every atomic concept
  - `atomic concept` means one specific learnable idea with one clear learning outcome
  - if a page bundles multiple ideas, split them into separate concepts
  - if a label contains multiple concepts joined by `and`, `or`, broad lists, or a full workflow, split it unless the combination itself is the real concept
  - prefer the smallest concept that can stand on its own as a node and help a learner identify a precise gap
  - do not create nodes that are only section headers, vibes, or broad umbrellas when the page really teaches narrower sub-concepts

- for each concept candidate, record at minimum:
  - proposed stable id in `category.slug-style`
  - title
  - short description
  - source URL
  - source name
  - source context or page title
  - existing node match if already present
  - status: `existing`, `new`, `merge`, `skip`
  - why it is atomic
  - candidate direct prerequisites
  - chosen direct prerequisites
  - prerequisite rationale
  - category
  - candidate aliases
  - candidate tags
  - candidate estimated time
  - 1 to 3 high-signal resource candidates
  - confidence
  - notes

- enforce graph rigor while extracting:
  - prerequisites must be direct only, not transitive duplicates
  - if `A -> B -> C`, do not also add `A -> C` unless it is independently required
  - prefer prerequisite edges that answer: `what must a learner already understand for this concept to make sense?`
  - if a source jumps over missing bridge concepts, create those bridge concepts explicitly instead of forcing bad edges
  - if two sources disagree on prerequisites, document the conflict in `Decisions` and choose the clearest learner-first path
  - keep node semantics descriptive, not pedagogical stages; difficulty belongs in graph structure, not labels

- dedupe aggressively:
  - before adding any node, check whether the concept already exists under a different title, alias, wording, scope, or neighboring prerequisite pattern
  - compare every candidate against existing nodes by title, aliases, description, and surrounding prerequisites
  - if a concept already exists, improve its metadata or resources instead of cloning it
  - if two candidates are near-duplicates, merge them and preserve useful aliases
  - record every merge, split, or exclusion in `Decisions`

- work in phases and loop until coverage is exhausted:
  - phase 1: inventory sources and page clusters
  - phase 2: extract raw concept candidates
  - phase 3: normalize candidates into atomic nodes
  - phase 4: assign direct prerequisite edges
  - phase 5: dedupe against existing graph
  - phase 6: identify missing bridge concepts and unresolved conflicts
  - phase 7: produce a prioritized queue of graph additions and edits
  - after finishing one source, move to the next source automatically
  - after finishing all listed sources, search for obvious missing high-signal Bitcoin learning sources and process them too

- keep the output useful for implementation:
  - the final prioritized queue should be ready to turn into `content/nodes/*.json`
  - prefer vertical slices that add a coherent mini-subgraph instead of random isolated nodes
  - each proposed node should be reviewable as a clean diff
  - do not dump huge unstructured notes; keep the canonical tracker current as you go

- quality bar:
  - favor canonical and long-lived educational sources
  - keep resources curated, not exhaustive
  - write concise descriptions
  - optimize for helping a learner diagnose gaps from zero to hero
  - optimize equally for graph completeness and graph teachability

- when the audit pass is complete:
  - summarize which sources were covered, which are still pending, and where the graph is still thin
  - identify the highest-value missing branches or bridge concepts
  - propose the next implementation slice in terms of concrete node files to add or update
```

## Recommended Canonical Fields

If you implement the tracker in JSON first and generate the spreadsheet from it, use fields close to these:

- `sources[]`: `id`, `name`, `url`, `scope`, `status`, `pagesReviewed`, `conceptsExtracted`, `dedupeStatus`, `notes`
- `concepts[]`: `id`, `title`, `description`, `category`, `sourceId`, `sourceUrl`, `sourceContext`, `existingNodeId`, `status`, `atomicityRationale`, `candidatePrerequisites`, `chosenPrerequisites`, `prerequisiteRationale`, `aliases`, `tags`, `estimatedTime`, `resourceCandidates`, `confidence`, `notes`
- `edges[]`: `from`, `to`, `type`, `status`, `rationale`, `sourceId`, `notes`
- `decisions[]`: `id`, `type`, `subject`, `status`, `rationale`, `relatedConceptIds`, `relatedSourceIds`, `notes`

## Why This Prompt Fits This Repo

- It matches the repo's existing pattern of a canonical structured audit artifact plus a generated spreadsheet.
- It respects the existing node model: one node per concept, stable ids, curated resources, and strict prerequisites.
- It biases toward bridge concepts and direct edges, which is what this graph needs if learners are supposed to diagnose precise gaps.
