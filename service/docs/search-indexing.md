# Search indexing operations

## Application behavior

- `/robots.txt` allows public pages and points crawlers to `/sitemap.xml`.
- `/studio` and `/api` are disallowed in `robots.txt`.
- Studio pages also emit `noindex, nofollow` metadata as defense in depth.
- Canonical URLs use `NEXT_PUBLIC_SITE_URL`, which defaults to `https://onc-limb.com`.

## Production URL verification (OPS-04)

The official public URL is `https://onc-limb.com`. The default applies to canonical,
Open Graph, sitemap, robots sitemap references, and other absolute SEO URLs.
An explicit `NEXT_PUBLIC_SITE_URL` overrides the default. Check the build/deployment
configuration for a stale override before release; `NEXT_PUBLIC_*` values may be
embedded at build time. The repository's `wrangler.jsonc` does not define this
variable and uses `keep_vars: true`, so repository defaults alone do not prove the
value of externally managed production settings.

After an authorized release, verify the actual homepage canonical and `og:url`,
`/robots.txt`, and `/sitemap.xml` against the official domain. A code change or
passing unit test is not evidence that production metadata has changed.

## Google Search Console setup

1. Add or open the `onc-limb.com` domain property in Google Search Console.
2. Prefer DNS TXT verification. If HTML metadata verification is required instead,
   set `GOOGLE_SITE_VERIFICATION` to the token supplied by Google and redeploy.
3. Confirm that `https://onc-limb.com/robots.txt` contains the sitemap and disallow rules.
4. Submit `https://onc-limb.com/sitemap.xml` and wait until Search Console reports it as accepted.
5. Inspect `/`, `/profile`, `/portfolio`, and `/blog` and request indexing when needed.
6. Confirm that the corresponding `*.workers.dev` hostname is unavailable or redirects
   to `https://onc-limb.com`. Configure this in Cloudflare only after checking the actual hostname.

The application changes alone do not complete the Search Console acceptance or indexing checks;
record those results after the production deployment.
