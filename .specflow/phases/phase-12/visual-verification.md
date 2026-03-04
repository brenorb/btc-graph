# Phase 12 Visual Verification

## Captures
- Desktop light: `/tmp/btc-graph-phase12-desktop.png`
- Mobile light: `/tmp/btc-graph-phase12-mobile.png`
- Desktop dark: `/tmp/btc-graph-phase12-desktop-dark.png`
- Mobile dark: `/tmp/btc-graph-phase12-mobile-dark.png`

## Notes
- `peekaboo` permissions are unavailable in this environment (Screen Recording + Accessibility denied).
- Playwright screenshots were used as fallback.

## Commands
```bash
npm run dev -- --host 127.0.0.1 --port 4173
npx playwright screenshot --device="Desktop Chrome" http://127.0.0.1:4173/btc-graph/ /tmp/btc-graph-phase12-desktop.png
npx playwright screenshot --device="Pixel 5" http://127.0.0.1:4173/btc-graph/ /tmp/btc-graph-phase12-mobile.png
npx playwright screenshot --color-scheme=dark --device="Desktop Chrome" http://127.0.0.1:4173/btc-graph/ /tmp/btc-graph-phase12-desktop-dark.png
npx playwright screenshot --color-scheme=dark --device="Pixel 5" http://127.0.0.1:4173/btc-graph/ /tmp/btc-graph-phase12-mobile-dark.png
```
