# Cloudflare Pages readiness — local proposal only

Reviewed 2026-10-31. Owner selected Pages Free and **https://printguard3d.roseandpaw.ca**. No account/project/domain availability, DNS authority, provider processing, pricing eligibility or applied headers have been verified. No Cloudflare action, private application access, GitHub connection or deployment has occurred. No deployment commands or workflow are enabled by this package.

## Proposed settings

| Setting | Proposed value / review condition |
| --- | --- |
| Source | jsnwilmot/PrintGuard3D, independently reviewed SHA only |
| Repository build root | `.` (the Git repository root contains package.json; local parent sites/printguard-3d is not a repository subdirectory) |
| Toolchain/build | Node 22, lockfile `npm ci`, `npm run build`; production artifact `dist` |
| Framework/output | Static React/Vite, base `/`, hash routes, manifest start URL `/`, service worker `/sw.js` and root scope |
| Canonical data origin | Only https://printguard3d.roseandpaw.ca; loopback is development only |
| Alternative hosts | pages.dev and previews are separate browser stores. Client bootstrap refuses workshop initialization on these aliases. Future owner-approved server redirect/access policy still required and unverified |
| SPA handling | No top-level 404.html; Pages' documented SPA default falls back to root. Hash routes require no server rewrite. The new native N01 uses a Node emulation of this documented extensionless fallback and verifies the rendered app/root assets from a nested route. Actual Pages/CDN behavior still needs separate hosting verification |
| Configuration template | [wrangler.pages.jsonc.example](wrangler.pages.jsonc.example), deliberately not active Wrangler configuration; project name remains unselected |
| User storage | Local IndexedDB only; JSON files are user-selected recovery files, not cloud backups. No account, remote DB, analytics, telemetry, push service or Pages Functions |
| Browser policy | Existing public/_headers retained, with conservative no-cache for executable delivery. CSP permits only local scripts/connects and constrained local images. Actual provider enforcement is NOT VERIFIED |

## Controlled setup plan requiring separate owner approval

1. Architect reviews implementation and evidence; owner separately authorizes merge. Neither approval is hosting permission.
2. Before any provider access, obtain explicit authorization covering project creation, initial externally accessible build risk, access/alias controls and the selected reviewed artifact/SHA. Do not create a project merely to discover its default settings.
3. Prefer a proposed Direct Upload/manual release process to avoid linking pushes/PRs to automatic deployment. Owner must decide the project type and approve initial creation; the first upload can be public. No real project name is chosen here. Do not connect GitHub or enable a generic deploy action. If Git integration is later selected, establish disabled production automation and preview None, and verify initial-connection behavior before connection; if an initial deployment cannot be avoided, STOP for a specifically approved setup plan.
4. Select a reviewed SHA; lockfile install, tests/build and artifact hash inventory must match that SHA. A separately approved manual operator may later upload only this artifact. Do not build/deploy unreviewed main implicitly. Retain previous complete compatible executable artifacts; code rollback is not data rollback.
5. After authorization, verify custom-domain association, DNS ownership/CNAME, HTTPS, pages.dev redirect and preview access. Prevent duplicate data-bearing origins; client refusal alone is not a provider access control. Do not assume alias data syncs with the canonical hostname.
6. Run separately authorized #16 live header/CSP/cache/redirect/SW and #25 installed-PWA/device/OS restart tests with synthetic data before any go-live decision. Verify provider logs/privacy and existing legal/manufacturer/manual gates independently. No test here certifies Canadian legal compliance.

## Official sources and their limits

Sources reviewed 2026-10-31; these describe provider capabilities, not this application's applied configuration.

- [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) (updated October 15, 2026): repository integration deploys on pushes and supplies previews. Disabling automation is distinct from creating/connecting the project.
- [Branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/) (updated April 21, 2026): production automation can be disabled and preview builds set to None. Defaults are not an approval gate.
- [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) (updated April 21, 2026): domain association and DNS are required; pages.dev redirection is a separate action. No CNAME target or account has been verified.
- [Headers](https://developers.cloudflare.com/pages/configuration/headers/): static _headers policy must be checked on real responses; source files alone prove no live enforcement.
- [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/): SPA fallback behavior informs the local artifact review; localhost is not evidence of CDN behavior.

Pages remains the owner-selected product despite broader current Cloudflare guidance preferring Workers for many new apps. This scoped work does not introduce Workers, change that decision or provision either product.
