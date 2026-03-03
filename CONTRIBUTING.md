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
npm run build:data
npm run check:links
npm test
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
