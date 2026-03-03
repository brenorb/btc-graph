# btc-graph

Interactive, static Bitcoin learning graph built for GitHub Pages.

Live site: https://brenorb.github.io/btc-graph/

## Local development

```bash
npm ci
npm run build:data
npm test
npm run dev
```

## Quality checks

```bash
npm run build:data      # schema + duplicate + prerequisite + cycle checks
npm run check:links     # validates resource URLs in node content
npm test                # core logic tests
npm run build           # production build
```

## Content model

- Source of truth: `content/nodes/*.json` (one file per concept)
- Build output: `public/data/graph.json`
- Each node must keep:
  - stable `id`
  - one specific concept
  - strict prerequisites (guidance, not hard UI gates)
  - 2-3 curated high-signal resources

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Quick issue entry points:
- [Add concept](https://github.com/brenorb/btc-graph/issues/new?template=add-concept.md)
- [Suggest change](https://github.com/brenorb/btc-graph/issues/new?template=suggest-change.md)
- [Generic change](https://github.com/brenorb/btc-graph/issues/new?template=generic-change.md)
