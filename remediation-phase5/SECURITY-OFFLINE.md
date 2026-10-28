# Local security and offline evidence

No production/private-site requests, deployments, access changes or user-data operations were performed. The reviewed source remains a local-first React/Vite application without app accounts, analytics, remote record storage or Cloudflare credentials. Manufacturer links are external navigation, not copied offline instructions.

D05 tests the existing `public/_headers` policy on an explicitly opted-in loopback review server:

- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` disables camera, microphone and geolocation.
- CSP limits scripts/connections/fonts to self, allows embedded images and inline styles required by React/charts, and denies objects, framing and cross-origin forms/base URLs.

This verifies source-policy behavior **locally**, not what the private host sends. `style-src 'unsafe-inline'` is an existing styling requirement, not script execution permission. HTTPS/HSTS, redirects, MIME types, frame policy, caches and CSP compatibility in a real preview remain an owner gate. There is no deployment workflow or active Cloudflare Pages project configuration introduced here. Eventual Pages review must confirm build command `npm run build`, output `dist`, source `_headers` application, worker scope/root assets and SPA navigation in an authorized preview; this document does not provision or change one.

The production build hashes all public app assets into a cache version, precaches the shell and serves navigation fallback from cached index on network failure. `_headers` and the generated worker itself are excluded from the asset list. Old app caches are removed on activation. This branch does not alter that engine/cache policy or erase IndexedDB. Native D05 disables GET connections at the test origin, proves an uncached direct request fails, closes the app tab, then reopens calendar/reports and compares all stores. It supplies no substitute application responses. Offline manufacturer-source warnings remain relevant; downloading current external instructions still requires internet.

Firefox browser-context offline emulation initially produced `NS_ERROR_OFFLINE` on reopening the final closed tab, while the same Windows Chromium/WebKit emulation case passed. This is separate from the common transport-loss test. Known [Playwright service-worker routing limitations](https://playwright.dev/docs/service-workers), [new-page offline report](https://github.com/microsoft/playwright/issues/34402) and [WebKit emulation issue](https://github.com/microsoft/playwright/issues/42775) are references, not proof of actual user-browser support. Real Work Offline/OS-disconnection and cold process restart remain NOT VERIFIED in the manual pack.

The review server's network toggle is enabled only with `--offline-control`, binds to `127.0.0.1`, affects only synthetic GET traffic and exists outside `dist`. Original native tests use the default server behavior. It does not alter OS networking, user browser profiles or any deployed service.

Dependency audit on 2026-10-28 found zero known advisories. Static validation checks the tracked/staged surface, obvious secret patterns, synthetic fixture identity, profile manifest and JavaScript syntax; it is a targeted check, not an exhaustive security certification. Original acknowledgment gating still prevents workshop-record reads/disclosure before current consent, including after replacement. Consent is a local UI control, not authentication/encryption.
