# Phase 4 Plan: Production Hardening and Launch

## Objective
Ship production workflows for CI + GitHub Pages deployment with contributor-friendly docs and issue templates.

## Scope
1. Add CI workflow with quality gates:
   - content build validation
   - tests
   - link checks
   - production build
2. Add GitHub Pages deployment workflow.
3. Add contributor docs (`README`, `CONTRIBUTING`).
4. Add issue templates preserving project entry points:
   - Suggest change
   - Add concept
   - Generic change

## Validation Tasks
1. Run local checks equivalent to CI steps.
2. Review workflows/templates/docs for missing requirements.
3. Push to `master` and verify GitHub Actions runs.
4. Confirm live GitHub Pages URL serves updated build.

## Done Criteria
- CI workflow exists and runs on push/PR.
- Pages deployment workflow exists and deploys `dist`.
- Contributor docs and issue templates are in place.
- Live URL is reachable.
