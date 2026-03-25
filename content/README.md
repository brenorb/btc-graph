# Content Structure

- `content/nodes/*.json` is the source of truth (one file per node).
- `npm run build:data` validates and compiles node files into `public/data/graph.json`.
- The web app loads `public/data/graph.json` at runtime.
- Resource entries may include optional `regionalUrls` overrides keyed by locale or country (for example `pt-BR`, `BR`, or `pt`).
