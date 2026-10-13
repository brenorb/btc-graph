# Bundle size and graph runtime performance

Analysis for issue #7, measured on 2026-10-13 against application revision
`9cf0c165f8b05510e1066a22aba9d74d6c8ade57`.

The bundle warning and the runtime pause have different causes. Cytoscape and its
layout dependencies dominate the JavaScript payload. Synchronous Dagre layout
dominates graph startup and category refresh work. An immediate dynamic import
makes the entry chunk smaller while still downloading the graph application at
startup; it does not reduce the required JavaScript or the layout cost.

## Environment and method

Apple M5 Max, 18 logical CPUs, 128 GiB RAM, macOS 27.0.1 (Darwin 27.0.0),
Node 24.21.0, Chrome 155.0.8059.40 in headless mode. Dependencies: Vite 7.3.1,
Cytoscape 3.33.1, cytoscape-dagre 2.5.0, Dagre 0.8.5, graphlib 2.1.8.

[Raw measurements](performance-2026-10-13.json) include the source revision,
dataset hash, emitted chunk sizes, Rollup module attribution and every browser
repetition. The current dataset contains **427 nodes and 608 prerequisite edges**.
Its JSON is **632,695 bytes**, or **100,207 bytes gzip**. It is fetched separately
from JavaScript and does not contribute to Vite's JavaScript chunk warning.

The audit builds into disposable directories with the same default Vite build
settings. The lazy trial changes only the temporary entry to dynamically import
`app.ts`; it calls that import immediately. A separate vendor split isolates
Cytoscape/Dagre dependencies to measure their emitted size. Neither experiment
changes the production application.

Browser trials use the minified production build with temporary timing probes.
Each cell contains three fresh browser contexts at 1280×900 or 390×844. Larger
fixtures contain disconnected copies of the existing graph, including each
copy's original edges, labels and categories. IDs are renamed consistently.
This preserves local topology but does not model every possible future graph.

The graph response is supplied locally and external image requests are blocked.
Readiness time is measured from navigation start until synchronous bootstrap
finishes. Layout time surrounds the actual `cy.layout(...).run()` call. Graph
refresh time includes element computation, element replacement, layout, row
normalization and related UI updates; it excludes subsequent asynchronous paint.
Two animation-frame opportunities after bootstrap are also recorded, without
claiming they isolate paint cost.

After 30 warm-up frames, the test sets zoom to 0.8 and alternates small pans for
90 requestAnimationFrame intervals. It then reruns the complete graph refresh.
These frame intervals test sustained programmatic pan in the visible viewport;
they are not end-to-end pointer latency or proof of responsiveness on phones.
The narrow viewport still runs on the same M5 desktop CPU. Browser caches are
isolated by context; the browser process is shared across repetitions.

## Bundle composition

| Build / chunk | Bytes | Gzip bytes |
| --- | ---: | ---: |
| baseline / index-vVFltt4n.js | 580,029 | 187,930 |
| lazy-trial / index-CBBdCO9U.js | 1,983 | 1,016 |
| lazy-trial / app-BCzdWDEb.js | 579,311 | 187,595 |
| vendor-split / graph-runtime-C9XRwMh6.js | 536,945 | 174,809 |
| vendor-split / index-DCI4O2qP.js | 43,010 | 13,122 |

The vendor-split runtime chunk is **536,945 bytes** (174,809 gzip), versus
43,010 bytes (13,122 gzip) for the application entry. It therefore accounts for
about **92.6% of emitted JavaScript** in that variant.

Rollup attributes 1,474,926 rendered bytes to Cytoscape, cytoscape-dagre, Dagre,
graphlib and Lodash, versus 69,870 to application/runtime code in the baseline:
about **95.5% of the rendered source before minification**. This percentage is
not an exact allocation of compressed production bytes. The vendor split above
provides a separate emitted-chunk measurement; chunk boundaries change
minification and compression, so its totals need not equal the baseline.

The lazy trial's tiny entry does not defer graph use: the next request still
loads the application and graph runtime immediately. It adds an import helper
and a request dependency. A separate shell would help only if users could use
it before choosing to open the graph, or if real network/cache measurements
showed a benefit from independently caching the runtime. Neither benefit is
established by this experiment.

## Runtime measurements

Medians of three repetitions, in milliseconds. Pan p95 is the range of the
three per-repetition p95 frame intervals.

| Viewport | Nodes / edges | Startup layout | Full startup refresh | Ready | Repeat layout | Repeat refresh | Pan p95 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1280×900 | 427 / 608 | 656.1 | 699.6 | 815.9 | 566.8 | 616.1 | 16.7–16.8 |
| 1280×900 | 854 / 1216 | 2440.3 | 2502.2 | 2607.0 | 2297.8 | 2369.5 | 16.7–16.8 |
| 1280×900 | 1708 / 2432 | 8906.5 | 9005.5 | 9188.3 | 8358.4 | 8480.0 | 16.7–16.8 |
| 390×844 | 427 / 608 | 470.3 | 499.3 | 572.0 | 359.0 | 388.9 | 16.7–16.8 |
| 390×844 | 854 / 1216 | 1533.1 | 1571.5 | 1651.3 | 1472.1 | 1516.9 | 16.7–16.8 |
| 390×844 | 1708 / 2432 | 5729.8 | 5799.8 | 5875.3 | 5656.2 | 5745.1 | 16.7–16.8 |

Startup and refresh layout durations grow substantially in the copied fixtures.
The layout measurement accounts for most synchronous refresh time; the
remaining CPU work and the two-frame settlement observation are much smaller.
At 854 nodes/1,216 edges, layout already takes roughly two seconds on this host;
at 1,708 nodes/2,432 edges it takes several seconds. Even the current graph has a
visible main-thread pause of about half a second when recomputing layout.

Pan frame intervals remain close to a 60 Hz cadence in the tested viewport.
At zoom 0.8 many nodes are outside the viewport, and the test does not cover
continuous zoom, high-density fit-to-screen rendering, selection latency,
low-end GPUs or mobile CPUs. **No universal interaction-degradation node count
is established.** The demonstrated degradation is startup/full-refresh layout,
already measurable at the current size and severe in the larger fixtures.

## Recommendation

1. Prioritize avoiding repeated synchronous full layouts. Prototype caching
   layout coordinates keyed by graph revision, visible node set and viewport
   mode, and measure category toggles. Consider build-time coordinates for the
   default full graph, preserving the existing row normalization and responsive
   behavior. Keep the initial prototype small and verify filtering visually.
2. If fresh layouts remain necessary, evaluate moving the Dagre computation to
   a worker. Measure time to usable graph and input responsiveness separately;
   moving work off the main thread does not itself reduce total layout time.
3. Keep bundle work as a separate follow-up. Test a runtime chunk for cache reuse
   and a genuinely deferred graph entry only if there is a usable shell. Compare
   cold navigation and warm-cache navigation under an explicit network profile.
   A smaller entry chunk alone is not a startup-performance result.
4. Repeat on an M1 and a physical mobile device before choosing runtime budgets
   or a supported size limit. Include category changes, node selection and zoom
   at both fit-to-screen and close-up views. Record long tasks and pointer latency.

The immediate decision is to pursue runtime layout work first. The evidence
also supports tracking the large library payload, but not shipping the eager
lazy-import trial solely to remove a chunk warning. This PR supplies analysis
and a repeatable measurement tool; optimization should follow in a separate
reviewable change with before/after runtime and UI verification.

## Reproduce

```bash
npm ci
node scripts/performance-audit.mjs performance-results.json

# Optional browser measurements: Playwright and its Chromium must be available.
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node scripts/performance-audit.mjs performance-results.json --browser
```

For an existing browser/runtime installation, set `CHROMIUM_PATH` to the browser
executable and/or `PLAYWRIGHT_MODULE` to its Playwright `index.mjs`. The audit
removes its temporary builds. A bundle-only run omits browser trials. Browser
measurements can take several minutes because the large fixtures run blocking
layouts twice per repetition.

Verification: the audit ran all three production build variants and 18 browser
contexts without page errors; timing probes are checked for missing values.
The repository's 110 existing tests passed. No content/generated-data update was
needed for this analysis.
