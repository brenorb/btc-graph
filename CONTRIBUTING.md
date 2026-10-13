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
- `regionalUrls` (optional map, e.g. `BR` for Brazil)
- `freeUrl` (optional HTTP(S) URL to an author-approved free text/chapter)
- `notes` (optional)

## Book links

Book `url` values use verified Amazon affiliate links. Reuse the existing pair
for the same book and edition; prefer a verified Brazil affiliate link in
`regionalUrls.BR` when available. Follow redirects all the way to the product
page and confirm title, edition, marketplace and affiliate tag. A short-link
redirect, HTTP service error, or reachability check alone does not establish a
valid listing. Record unverified destinations rather than guessing new editions.

Keep author-approved free chapters in `freeUrl`; the purchase and free links
appear within one curated resource. `npm run check:links` checks default,
regional and free URLs. See [the book audit](docs/research/book-affiliate-audit.md)
for verified destinations and remaining product-page checks.
