# Launch checks and verification

Checked September 10, 2026. Changes are local; nothing was deployed.

## Completed

- Production build passes; all four API-helper tests pass. ESLint has zero errors, with five image-element optimization warnings remaining.
- Removed five prototype pages, the analytics demo, both iPhone diagnostic pages, and the unused GlassExperience component. Tracked originals remain recoverable from Git. Kept operational admin/login/dashboard pages, contact, legal pages, and blog infrastructure. Empty blog is noindex and excluded from the sitemap.
- Sitemap generator excludes prototypes and 404 pages. Generated sitemap contains home, contact, privacy, and terms only. Removed diagnostic/prototype sample URLs return 404.
- Device-orientation controls, permission requests, and sensor listeners removed. Pointer/touch parallax and reduced-motion preferences retained.
- Compressed separate project preview assets without overwriting original screenshots: two mobile previews total 276,642 bytes versus roughly 4.9 MB originally, about a 94% reduction. Brand thumbnails and desktop previews were also reduced.
- WebGL lettering stops scheduling frames while offscreen or while the document is hidden.
- Removed reduced-opacity scroll reveals so content retains its contrast before scrolling. Fixed legal-footer contrast. Added visible keyboard focus, linked form errors to fields, announced errors, focused the first invalid field, and made CAPTCHA compact below 400 pixels. Standalone contact page now has an H1.
- Updated homepage/search/social titles for web design in Hammond, LA. Added factual Service structured data tied to Kade, without invented address, reviews, ratings, or results. Fixed the blog's broken services anchor.
- Fixed the CAPTCHA score check so numeric zero is not mistaken for a missing score. Existing checkbox integration remains intact.

## Accessibility and responsiveness results

axe-core found zero WCAG A/AA-tagged violations in final checks of home at 320, 358, 430, 768, 1024, 1440 and 1920 pixels; contact, privacy and terms at 320 pixels; and the open accessibility dialog. The slow-network/full-motion homepage scan also reports zero violations.

The dialog traps keyboard focus, closes with Escape, and restores focus to its trigger. Project expansion works. Form validation and mocked submissions pass at four widths; refresh returns to the header. Tested documents had no horizontal document overflow. User reports physical Safari works.

Limits: scans cannot certify ADA compliance or complete WCAG conformance. axe still marks some checks for manual review (including contrast in complex visual areas). Real screen-reader reading order, 200% text enlargement/400% browser zoom, every dialog/gallery state, real CAPTCHA accessibility, hardware tilt removal on a physical phone, and a broader browser/device matrix need human checks. Responsive viewport tests are not proof that every device works. No live CAPTCHA or email was submitted during automated checks; third-party scripts were blocked or mocked.

Target used: WCAG 2.2 AA. DOJ guidance distinguishes obligations from technical testing; this is an engineering audit, not a legal certification.

- https://www.w3.org/TR/WCAG22/
- https://www.ada.gov/resources/web-guidance/

## Speed results and remaining work

Follow-up: viewport-specific preload/eager priority for BOTH visible phone previews, plus deferral of decorative WebGL until after page load, reduced the same throttled LCP test to **3.37 seconds** (about 34% faster than 5.13 seconds). Final retest reported no axe violations; CLS was approximately 0.002. Still above the 2.5-second target, and still a local synthetic result rather than a field guarantee.

Local form follow-up: a credential-free connection test to Mailgun failed with EACCES in the restricted execution environment and succeeded outside it (HTTP 200). This is a plausible cause of the reported local submission failure, not proof of that individual request. No real email was sent and no original submission log was available. A persistent accessible error message was added to the form so failures do not disappear with the toast. To test actual local delivery, run the dev server from a normal network-enabled terminal; verify the live inbox separately.

Local tests show low layout shift, and assets are substantially smaller. However, a synthetic mobile test at 430 pixels, 150 ms latency, approximately 1.6 Mbps download and 4× CPU slowdown measured LCP around **5.13 seconds**, above the good target of 2.5 seconds. CLS was approximately **0.0007**. These are custom Chromium lab measurements, not Lighthouse scores or real-user Core Web Vitals. Third-party services were blocked, so they do not represent full production costs. INP has not been established from real traffic.

Do not describe performance as fully passing yet. Remaining candidates include deferring the decorative Three.js/font workload until critical content has loaded, converting active fonts to WOFF2, and measuring cold production delivery/CDN caching. Re-test with production PageSpeed Insights and Search Console after deployment. Good Core Web Vitals targets are LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at the 75th percentile of visits.

- https://web.dev/articles/vitals

## How to verify CAPTCHA and email yourself

CAPTCHA currently works on the live site, per your confirmation. Repeat this short end-to-end test when the new build is staged or deployed:

1. Confirm the hosting environment retains `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and the matching private `RECAPTCHA_SECRET`. The browser uses a checkbox/v2 integration; keep the correct key type. Ensure domain validation is enabled and your production domain is authorized. Never expose the secret in browser code.
2. Open the production form in a private Safari window. Fill it out with a real email you control and a unique message such as “Website delivery check — [date/time]”. Without completing CAPTCHA, it must not send. Complete CAPTCHA and submit once; expect the success message.
3. Check `stanforddevcontact@gmail.com` (or the configured `CONTACT_RECEIVER`), including spam. Confirm the unique message, name, phone/company if supplied, and reply-to address. Click Reply and confirm it targets the visitor address, not the site's sender address.
4. In Mailgun, find that message in Logs. Look for **delivered**, not only accepted. Delivered means the recipient's mail server accepted it; also verify actual inbox placement. If it fails, inspect the event reason and hosting function logs.
5. Verify the Mailgun sending domain's SPF and DKIM records, the configured `MAILGUN_DOMAIN`, `MAILGUN_API_KEY`, `MAILGUN_FROM`, and correct regional `MAILGUN_BASE_URL`. Confirm production Firebase credentials can perform the contact rate-limit transaction. Do not paste secrets into chat.
6. Check one phone-only inquiry as well, and verify that missing/invalid fields produce understandable feedback. Avoid repeatedly submitting tests: the endpoint defaults to five requests per hour.

If CAPTCHA succeeds but delivery fails, check the local API response/server logs: 503 can indicate the durable rate limiter; 400 can indicate validation/CAPTCHA; 500 can indicate mail delivery failure. A success toast by itself is not proof of inbox delivery.

- https://developers.google.com/recaptcha/docs/domain_validation
- https://documentation.mailgun.com/docs/mailgun/user-manual/domains/domains-verify
- https://documentation.mailgun.com/docs/mailgun/user-manual/events/events

## SEO follow-through

Technical SEO now aligns with custom websites, business tools, and advertising for small businesses near Hammond, Louisiana and beyond. Canonical domain, social image, crawlable public pages, descriptive content, language, metadata, and sitemap were checked locally. This does not guarantee indexing, rankings, or leads.

After deployment: verify the domain in Search Console, submit `/sitemap.xml`, inspect the homepage URL, confirm HTTP/www redirects choose one HTTPS canonical host, and check indexing. Keep an accurate Google Business Profile if eligible; use the real service area rather than inventing an address. Publish substantive client case studies and useful answers to actual customer questions as evidence becomes available. Do not create thin duplicate city pages or fabricate results/testimonials.

- https://developers.google.com/search/docs/fundamentals/seo-starter-guide

Detailed local test artifacts are in `tmp/site-audit.json`, `tmp/site-audit-slow.json`, and `tmp/readiness-results.json`.
