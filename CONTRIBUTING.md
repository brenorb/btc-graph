# Contributing

## Fast path
1. Open an issue using one of the templates:
   - `Add concept`
   - `Suggest change`
   - `Generic change`
2. Keep proposals concise and source-backed.
3. Use stable node ids (`category.slug-style`).

## Editing content locally

```bash
npm ci
npm run check
```

## Node quality rules

- One node = one specific concept.
- Prerequisites should be strict and minimal (no transitive redundancy in the same node).
- Prefer primary/canonical resources.
- Keep resources curated (2-3 links).

## Node schema

Required fields per file in `content/nodes/*.json`:
- `id`
- `title`
- `description`
- `category`
- `prerequisites`
- `resources`
- `estimatedTime`

Resource fields:
- `type`
- `title`
- `url`
- `notes` (optional)

`npm run check` runs lint, strict type checking (including tests), graph/test
validation, resource link checks, and the production build. CI and Pages use this
same gate. For a faster local loop, run `npm run lint` and `npm run typecheck`
separately.
