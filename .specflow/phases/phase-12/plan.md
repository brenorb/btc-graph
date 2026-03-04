# Phase 12 Plan: Layout Accessibility and Foundations Math

## Objective
Fix reported graph UX regressions and add missing foundational mathematics/cryptography concepts required to understand Bitcoin signatures and script-era proposals.

## Scope
1. UI fixes
   - Make graph layout more vertical and reduce horizontal spread.
   - Reduce label overlap at default zoom while keeping discoverability.
   - Replace label bulk controls with category bulk controls:
     - `Select all categories`
     - `Deselect all categories`
   - Fix dark-mode readability for graph text and resource links.
2. Content expansion
   - Add foundational nodes:
     - modular arithmetic
     - finite fields
     - Fermat's little theorem
     - modular inverse
     - discrete logarithm problem
     - elliptic-curve cryptography
     - scalar multiplication
     - secp256k1
     - ECDSA basics
     - Schnorr signatures
   - Rewire key existing prerequisites (keys/signatures/taproot/op_checksigadd).

## TDD Tasks
1. Add failing tests for:
   - category bulk action helpers
   - vertical layout config defaults
   - dark-mode graph color palette
2. Add failing phase-12 content tests for required foundational nodes and prerequisite rewiring.
3. Implement smallest changes to pass tests.
4. Run full validation:
   - `npm test`
   - `npm run build:data`
   - `npm run check:links`
   - `npm run build`
5. Run no-context review and fix findings.
6. Capture desktop/mobile light/dark screenshots.
