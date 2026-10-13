# Book affiliate audit

Audit date: 2026-10-13. All 254 book-resource occurrences were inspected.
Eight Mastering Bitcoin chapter links now use the same existing default affiliate URL as the rest of the book references, with their original free chapters retained through `freeUrl`. Resource counts stay unchanged.

36 distinct affiliate URLs were followed to their final product destinations: 26 returned HTTP 200 with matching product titles; 10 returned service-error pages and remain unverified. Both direct retry URLs and short-link paths were checked. A service error does not establish that an ASIN is dead, and a working redirect alone does not establish that its product page works.

All observed default destinations carry `brenorb00-20`; all BR destinations carry `brenorb07-20`. The four `link.amazon` URLs correctly pass through `amzlinks.in` to Amazon Brazil. Successful listing responses verify the product page, not price, stock or shipping availability.

The old Bitcoin Standard BR ASIN `857522517X` was already removed before this PR. Its current BR short link targets `9949745780`, which still needs product-page verification. It has not been replaced with a guessed edition.

[Raw URL/ASIN/tag/status evidence](book-affiliate-audit-2026-10-13.json)

## Outstanding product checks

| Short URL | Destination | ASIN | Status |
| --- | --- | --- | --- |
| https://amzn.to/4s33eUd | www.amazon.com | 9916723591 | 500 (service error); clean-path retry 500 |
| https://amzn.to/4uRjb1v | www.amazon.com.br | 9916723591 | 500 (service error); clean-path retry 500 |
| https://amzn.to/4byFMZo | www.amazon.com.br | 9949745780 | 500 (service error); clean-path retry 500 |
| https://amzn.to/3NMybNF | www.amazon.com.br | 1676613285 | 500 (service error); clean-path retry 500 |
| https://amzn.to/4rTB6C8 | www.amazon.com.br | B07MWXRWNB | 500 (service error); clean-path retry 500 |
| https://link.amazon/B0j0dwMtg | www.amazon.com.br | 6555352175 | 500 (service error); clean-path retry 500 |
| https://amzn.to/4rXhk90 | www.amazon.com.br | B08YQMC2WM | 500 (service error); clean-path retry 500 |
| https://amzn.to/41xvliA | www.amazon.com.br | B0DX6X1S34 | 500 (service error); clean-path retry 500 |
| https://amzn.to/3NWFpyF | www.amazon.com.br | B0CH23YQZZ | 500 (service error); clean-path retry 500 |
| https://link.amazon/B0ggWGwrD | www.amazon.com.br | B08QVD9RYL | 500 (service error); clean-path retry 500 |

The requirement to verify every BR listing is incomplete while these destinations remain unverified. Keep this PR in draft until those listings are observed working or replaced by verified editions and affiliate URLs.

## Future additions

Use an existing, verified Amazon affiliate URL for a book’s default `url` and a verified Brazil affiliate URL in `regionalUrls.BR` when available. Reuse the canonical pair already used for the same edition. Follow the complete redirect chain, confirm the correct marketplace, product title/edition and affiliate tag, and record the check date. Do not treat a shortener’s 301 or a generic Amazon response as proof of a working listing.

For an author-approved free text or chapter, retain its canonical URL in `freeUrl` rather than replacing free access with a purchase link. The graph and static info pages show a separate “Read free” link within the same resource. The link checker now includes default, regional and free URLs. Product/edition review remains necessary even when the generic reachability check passes.
