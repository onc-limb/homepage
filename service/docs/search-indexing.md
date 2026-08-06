# Search indexing operations

## Application behavior

- `/robots.txt` allows public pages and points crawlers to `/sitemap.xml`.
- `/studio` and `/api` are disallowed in `robots.txt`.
- Studio pages also emit `noindex, nofollow` metadata as defense in depth.
- Canonical URLs use `NEXT_PUBLIC_SITE_URL`, which defaults to `https://onclimb.net`.

## Google Search Console setup

1. Add or open the `onclimb.net` domain property in Google Search Console.
2. Prefer DNS TXT verification. If HTML metadata verification is required instead,
   set `GOOGLE_SITE_VERIFICATION` to the token supplied by Google and redeploy.
3. Confirm that `https://onclimb.net/robots.txt` contains the sitemap and disallow rules.
4. Submit `https://onclimb.net/sitemap.xml` and wait until Search Console reports it as accepted.
5. Inspect `/`, `/profile`, `/portfolio`, and `/blog` and request indexing when needed.
6. Confirm that the corresponding `*.workers.dev` hostname is unavailable or redirects
   to `https://onclimb.net`. Configure this in Cloudflare only after checking the actual hostname.

The application changes alone do not complete the Search Console acceptance or indexing checks;
record those results after the production deployment.
