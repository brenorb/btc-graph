# Phase 8 Visual Verification

Date: 2026-03-03

## Desktop + Mobile Snapshots
- Desktop light: `/tmp/btc-graph-phase8-desktop-2.png`
- Mobile light: `/tmp/btc-graph-phase8-mobile-2.png`
- Desktop dark: `/tmp/btc-graph-phase8-dark-desktop.png`
- Mobile dark: `/tmp/btc-graph-phase8-dark-mobile.png`

## Verification Checklist
1. Label controls visible and aligned (`Show all labels`, `Hide all labels`) on desktop/mobile.
2. Labels are not tied to zoom threshold (no zoom-triggered hide/show behavior in app logic).
3. Progress buttons allow toggle-off on repeated click of active explicit state.
4. Dark mode renders correctly when `prefers-color-scheme: dark` is emulated.
5. Buttons/controls are vertically aligned with centered text in header and control rows.
6. Add-concept issue template wording uses `Post-requisite node ids`.
7. Footer is present with social icons (GitHub/Nostr/X) and useful project links.

## Commands Used
```bash
npm run dev -- --host 127.0.0.1 --port 4173
npx playwright screenshot --device="Desktop Chrome" http://127.0.0.1:4173/btc-graph/ /tmp/btc-graph-phase8-desktop-2.png
npx playwright screenshot --device="Pixel 5" http://127.0.0.1:4173/btc-graph/ /tmp/btc-graph-phase8-mobile-2.png
npx playwright screenshot --color-scheme=dark --device="Desktop Chrome" http://127.0.0.1:4173/btc-graph/ /tmp/btc-graph-phase8-dark-desktop.png
npx playwright screenshot --color-scheme=dark --device="Pixel 5" http://127.0.0.1:4173/btc-graph/ /tmp/btc-graph-phase8-dark-mobile.png
```
