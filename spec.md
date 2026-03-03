# Bitcoin Learning Graph - Product Spec (Working Draft)

## Status
- Draft version: 1.0
- Last updated: 2026-03-03
- Purpose: capture ongoing product decisions during brainstorming

## Vision
Create a public, interactive, static website (hosted on GitHub Pages) with a hierarchical Bitcoin knowledge graph where anyone can:
- inspect the full map of concepts
- mark what they already know
- identify missing prerequisites (knowledge gaps)
- choose and follow a strict learning path

## Core Product Direction (decided)
- Hosting/model:
  - static website
  - GitHub Pages deployment
  - no account/login in v1
  - no server-side runtime or dynamic backend in v1
- Learning model:
  - strict prerequisite graph (dependencies matter)
  - users are not blocked from marking progress out of order; prerequisites are guidance and gap detection, not hard gates
  - each node represents one specific concept
  - beginner/intermediate/advanced are represented by different nodes, not by labels inside one node
  - top-level branches will be defined later from source material and kept flexible for community evolution
- Node behavior:
  - graph view shows concept names
  - node labels are shown when zoomed in, or on mouse hover
  - click a node to open details in a right sidebar
  - details include a curated set of resources:
    - links/articles
    - videos
    - books
    - estimated learning time
  - resource list should be small and high-quality (not exhaustive)
- Progress:
  - each concept uses 3 learning states: `Need to learn`, `Learning`, `Know it`
  - progress can be set freely even when prerequisites are unmet
  - UI should clearly warn/show prerequisite gaps when out-of-order progress is set
  - local storage is acceptable for initial progress persistence in browser

## Information Architecture (initial)
- Graph canvas:
  - interactive pan/zoom
  - nodes + dependency edges
  - visual indication of node state (`Need to learn` / `Learning` / `Know it`)
  - visual indication of prerequisite gaps for selected/completed nodes (highlight missing prerequisite nodes directly on graph)
  - interactive legend: click color/category to show/hide matching nodes
  - branch/category filters (once branch taxonomy is defined)
  - search bar to find concepts by name/keyword
  - filtered/hidden categories are removed from view by default
  - if a hidden node is a prerequisite of a visible node, render it as a gray contextual node instead of fully hiding it
- Node detail panel/modal:
  - desktop: right sidebar
  - mobile: bottom sheet
  - concept name
  - short description
  - prerequisites
  - clear "gaps to fill" list when prerequisites are missing
  - next concepts unlocked
  - curated resources
  - estimated time
  - selecting a search result centers/zooms graph to the node and opens details
- Layout direction:
  - hierarchical learning flow (not free-form force layout)
  - orientation is opposite of usual maps: fundamentals lower, advanced/specialized higher
- Learner state:
  - mark node as `Need to learn`, `Learning`, or `Know it`
  - derive gaps from unmet prerequisites
  - persist state locally (`localStorage`)
  - include low-prominence `Export progress` and `Import progress` actions (not a primary CTA)

## Content Strategy (initial)
- User will provide many source places/resources.
- System should ingest and structure all relevant topics from those sources.
- Scope size (small vs big) will be decided after reviewing source coverage and graph quality.

## Collaboration Model (initial)
- Repository should be easy for anyone to contribute via GitHub issues and pull requests.
- Content structure should be simple to edit without deep technical knowledge.
- Branch definitions and node taxonomy should be community-maintainable over time.
- Curation quality remains important: contributions should stay concise and high-signal.
- In-product collaboration UX:
  - each node should have a `Suggest change` action with node context prefilled
  - graph page should have:
    - `Add concept` action with fields for dependencies and related/attached nodes
    - `Generic change` action for cross-cutting feedback
  - no direct `Quick edit PR` flow in v1 (issue flow only)
  - contribution flow should not require local coding setup
- Moderation:
  - no extra project-specific moderation rules required in v1

## Sustainability (decided)
- include a visible but secondary `Donate` entry point on the site to support project maintenance
- donation area should not distract from core learning flow

## Open Questions
- Exact visual style and layout strategy for graph at large scale.
- Final content schema (required vs optional metadata fields).
- How to handle conflicting prerequisite opinions between sources.
- Search behavior details (keyboard navigation and highlighting behavior).
- Filter interaction rules when hidden nodes are dependencies of visible nodes.

## Draft Node Data Model
Each node should minimally support:
- `id` (stable slug, e.g. `wallets.utxo-basics`)
- `title`
- `description` (short)
- `prerequisites` (array of node ids)
- `resources` (curated list)
- `estimated_time`
- `tags` (optional)
- `aliases` (optional, for better search)

Each resource entry should minimally support:
- `type` (`article` | `video` | `book` | `tool` | `other`)
- `title`
- `url`
- `notes` (optional)
- no hard cap on number of resources, but maintain strict curation quality

## Draft Learner State Model
- `node_id`
- `state` (`need_to_learn` | `learning` | `know_it`)
- `updated_at`

## Content Storage and Build Strategy (decided)
- Source of truth:
  - one file per node (clean diffs and easier review)
- Build output:
  - generate a combined graph data file at build time
  - generated artifact is committed or published as static asset
- Runtime:
  - browser reads static files only
  - no runtime data generation, no API, no backend
  - shareable URL state for selected node and active filters only (no progress in URL)
- Build location:
  - can run in CI (GitHub Actions) or locally before merge
  - either way, the deployed site remains fully static

## Theming (decided)
- v1 supports both light mode and dark mode

## Language (decided)
- v1 content and UI in English only

## Non-Goals (v1)
- user accounts and cloud sync
- social/community features
- recommendation engine personalization
- full LMS features (quizzes/certificates)

## Next Steps
1. Finalize v1 UX behavior (how users mark knowledge and inspect gaps).
2. Define graph/data schema and validation rules.
3. Collect source list from user and extract candidate topics.
4. Build first curated graph slice and test usability/performance.
5. Ship MVP on GitHub Pages.
