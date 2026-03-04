# Phase 8 Plan: UI/UX Corrections and Interaction Polish

## Objective
Resolve interaction regressions and visual quality issues reported after phase-7, while keeping the graph static and contribution-first.

## Scope
1. Add explicit label visibility controls:
   - `Show all labels`
   - `Hide all labels`
2. Remove zoom-based label reveal behavior so labels are readable independent of zoom level.
3. Allow progress-state toggle-off when clicking the currently active state.
4. Fix dark-mode application.
5. Improve control/button alignment and text centering.
6. Rename ambiguous dependency wording:
   - `Related/attached node ids` -> `Post-requisite node ids (nodes that depend on this concept)`
7. Add footer with icon links (GitHub, Nostr, X/Twitter) and useful project links.

## Test-First Tasks
1. Add failing unit tests for label visibility mode behavior.
2. Add failing unit tests for progress-state toggle-off behavior.
3. Implement app/state/style updates to satisfy tests.
4. Validate behavior and quality:
   - `npm test`
   - `npm run build:data`
   - `npm run check:links`
   - `npm run build`
5. Perform visual verification on desktop and mobile view.
6. Run no-context review and fix findings.

## Atomic Commit Plan
1. `test(phase8): add ui-state tests for label visibility and progress toggling`
2. `feat(phase8): add label controls and progress toggle-off semantics`
3. `fix(phase8): apply dark mode at document root and update copy text`
4. `style(phase8): align controls and add footer with social icons`
5. `docs(phase8): add review artifacts and handoff updates`

## Done Criteria
- All 7 requested UI items implemented.
- New tests cover edge cases and pass.
- Full validation pipeline passes.
- No-context review findings addressed.
