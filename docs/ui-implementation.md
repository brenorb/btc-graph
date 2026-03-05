# UI Implementation Notes (Brand Rollout)

## Files changed
- `index.html`
- `src/app.ts`
- `src/styles.css`

## What was implemented
1. Branded layout shell
- Replaced basic title bar with an identity-led masthead:
  - `Proof of Learning` kicker
  - `Bitcoin Knowledge Atlas` headline
  - live total concept and branch counts
- Grouped controls into search + action clusters.

2. Learning telemetry strip
- Added inline overview metrics:
  - visible nodes
  - hidden branches
  - mastered nodes
- Metrics update with filter and progress changes.

3. Design system tokens
- Introduced cohesive CSS variable system for:
  - backgrounds and panel surfaces
  - text/muted hierarchy
  - accents, danger/success, edge tones
  - border and shadow behavior
- Added separate light and dark token sets.

4. Typography upgrade
- Replaced prior fonts with:
  - `Syne` (display)
  - `Archivo` (body)
  - `Azeret Mono` (utility/meta)

5. Canvas and interaction polish
- Graph canvas has atmospheric background treatment.
- Cytoscape nodes/edges tuned for stronger readability and selected-node emphasis.
- Buttons/chips/search rows get focus-visible rings and hover lift.

## Accessibility and behavior guardrails
- Existing IDs and handlers were preserved, so current interactions continue to work.
- Focus-visible styles were added for keyboard clarity.
- Mobile bottom-sheet behavior for node details remains unchanged in interaction model.

## Future extensions (optional)
1. Add branch-specific iconography in legend chips.
2. Add subtle node-entry animation when filters change.
3. Add an explicit “learning streak” stat once progress dates are used in UI.

## Node Sidebar AI (current behavior)
- Node detail sidebar now includes `Ask AI about this node` (collapsed by default).
- Expanding the section reveals:
  - quick actions (`Summarize`, `Explain simply`, `What next?`, `Quiz me`)
  - editable prompt textarea prefilled with node context
  - `Copy prompt` and `Open chat` actions
- Context includes selected node metadata, prerequisites, post-requisites, detected gaps, and current progress state.

## Iteration 2 improvements (post-merge polish)
1. Graph readability
- Increased dagre spacing and added viewport fitting after each graph rerender to avoid compressed “bottom strip” rendering.
- Added selection-context labels: selected node and its direct neighbors now stay labeled at lower zoom.

2. Selection focus mode
- Added focused-node visual mode in Cytoscape:
  - selected node gets strong orange emphasis
  - direct neighbors get green ring emphasis
  - connected prerequisite edges get highlighted

3. Category tone discipline
- Added explicit category-to-color mapping for known branches to keep palette stable and intentional across sessions.

4. Map-stage atmosphere
- Wrapped graph in a dedicated stage container with instructional hint overlay.
- Strengthened graph background with subtle contour/grid layers and accent lighting for depth.
