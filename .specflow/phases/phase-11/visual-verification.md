# Phase 11 Visual Verification

## Captures
- Desktop light: `/tmp/btc-graph-phase11-desktop.png`
- Mobile light: `/tmp/btc-graph-phase11-mobile.png`
- Desktop dark: `/tmp/btc-graph-phase11-desktop-dark.png`

## Commands
```bash
npx playwright screenshot --device="Desktop Chrome" http://127.0.0.1:4173/btc-graph/ /tmp/btc-graph-phase11-desktop.png
npx playwright screenshot --device="Pixel 5" http://127.0.0.1:4173/btc-graph/ /tmp/btc-graph-phase11-mobile.png
npx playwright screenshot --color-scheme=dark --device="Desktop Chrome" http://127.0.0.1:4173/btc-graph/ /tmp/btc-graph-phase11-desktop-dark.png
```
