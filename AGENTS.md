# btc-graph AGENTS Guide

This file defines project-specific rules for any coding agent working in this repo.

## Project Goal
Build a public, static, GitHub Pages website with an interactive hierarchical Bitcoin learning graph.

## Non-Negotiables
- Keep the site fully static (no backend runtime for v1).
- Preserve easy community contribution paths (issues/PRs).
- Keep content quality high and concise.

## Engineering Workflow
- Build in agile vertical slices, not waterfall:
  - from the first commit, there must be something visual and working
  - each commit should keep the project runnable and demonstrable
  - avoid large multi-part branches that only integrate at the end
  - add features incrementally on top of a working baseline
- Use TDD by default:
  - Red: add/fix a failing test first when practical.
  - Green: implement the smallest change to pass.
  - Refactor: clean up while keeping tests green.
- Close the loop for ALL work (not only UI):
  - verify results in the same session before considering the task done
  - for behavior changes, prove it with tests and/or executable checks
  - for UI changes, also verify visually in the running app
  - prefer using Peekaboo to inspect/capture rendered results when visual verification is needed
- Do not stop at code-only changes when behavior can be verified end-to-end.

## Definition Of Done
A task is done when all of the following are true:
- Requirements in `spec.md` are reflected in code.
- Relevant tests exist and pass (or a clear reason is documented).
- Close-the-loop verification is done for the implemented change.
- UI changes are visually verified (Peekaboo preferred) and match expected behavior.
- Docs/spec are updated when behavior or decisions changed.

## Content/Graph Rules
- Treat each concept as one specific node.
- Keep stable node IDs (slug style).
- Prefer strict prerequisites as graph semantics, but never hard-block user progress marking.
- Curate resources; avoid bloated lists.

## Collaboration Rules
- Keep contribution paths simple for non-coders.
- Preserve issue-based contribution entry points (`Suggest change`, `Add concept`, `Generic change`).
- Favor file and schema changes that produce clean, reviewable diffs.

## Naming Hygiene
- Never create branches named `codex/...`.
- Do not mention `codex` in commit messages, PR titles/descriptions, issue comments, code comments, or docs unless explicitly required by external tooling.

## Suggested Additions For Work Quality
- Add CI checks for:
  - schema validation
  - test run
  - link checking for node resources
- Add accessibility checks (keyboard navigation, contrast, focus states).
- Add performance budgets for graph render and interaction.
- Keep a lightweight decision log in `spec.md` as product choices evolve.
