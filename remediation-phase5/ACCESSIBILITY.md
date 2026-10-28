# Accessibility investigation and remaining evidence

There is **no WCAG 2.2 AA conformance claim**. Automated checks, computed colour ratios and emulated media do not replace qualified human screen-reader, keyboard, actual zoom/text-resize, physical-device or Safari testing. All 55 original criteria remain in [accessibility-register.csv](accessibility-register.csv), with the prior status/evidence preserved and a Phase 5 evidence column. The step-by-step independent gate is [MANUAL-RELEASE-PACK.md](MANUAL-RELEASE-PACK.md).

## What “18 incomplete evaluations” meant

The retained Phase 4 raw results contain **18 scans with incomplete contrast results and 139 node evaluations**, rather than 18 isolated defects. [phase4-incomplete-register.json](phase4-incomplete-register.json) retains every scan/target/check datum. Causes were:

| Axe reason | Investigation / correction | Remaining status |
| --- | --- | --- |
| `bgGradient` on local-storage panel, dashboard text, help panel | Gradients prevented background determination. Text now has solid theme panel or dark hero backgrounds, preserving readable foreground tokens. The hero caption has its own opaque dark background. | The repeated gradient uncertainty disappears in rerun scans; zero detected contrast violations. |
| `shortTextContent` on light workspace initial | Axe reported actual ratio about **4.04:1** for small normal text. This was a confirmed contrast issue, despite its incomplete classification. | Corrected using theme foreground/panel/control tokens; retained native/automated checks cover both themes. |
| `nonBmp` on a decorative search glyph inside `kbd` | It was a non-text magnifier presented as a keyboard shortcut, with no shortcut implementation. | Removed redundant decoration; the labelled search input and search icon remain. |
| `imgNode` / short chart ticks | SVG/chart backgrounds and short numeric labels defeat the automated contrast inference. Prior light activity-axis colour and dark default axis colour also needed correction. | Axis text/tspans now use tested theme muted tokens over the panel. Exact remaining SVG targets remain in the register; human chart/tooltip/graph contrast acceptance is still required. Record controls provide keyboard-accessible equivalents. |
| `elmPartiallyObscuring` on legal/consent scrolling content | The snapshot included text partly outside the scroll viewport. This is insufficient evidence of its full visible appearance or keyboard/screen-reader usability. | Opaque legal-copy background is explicit, but scrolling-content evaluations remain incomplete. A qualified tester must scroll/read every paragraph/control and verify focus/visibility; no inferred pass. |

In the equivalent 24-scan baseline audit rerun, incomplete observations reduce from **18 scans / 139 nodes to 6 scans / 35 nodes**. The additional 24 cross-engine scans add **12 scans / 78 incomplete nodes**, primarily the same chart SVG labels repeated across engines/themes. These counts describe evaluated observations, not 113 independent defects. Both sets detect **zero violations**. Full remaining targets and reasons are retained in [axe-incomplete-current.csv](axe-incomplete-current.csv). Counts are tied to the specific captured viewports/records and may vary with content or engine.

## Automated scope

The unchanged C01-C07 Chromium cases cover privacy/consent, nested dialogs, inert layers, unique headings, focus return/trapping, completion errors, controls/focus contrast, reduced motion, equivalent 200/400% reflow widths, text spacing, landscape/mobile navigation and keyboard calendar rescheduling. Their 24 axe scans remain required.

D02 adds keyboard activation and focus return for immutable calendar history; D06 adds both-theme dashboard/report/calendar/help scans in Chromium, Firefox and WebKit, 320px reflow, mobile navigation focus return and forced-colour **emulation**. D09 verifies storage-error focus while retaining all records. No axe rule is disabled, no target is excluded to obtain a pass, and incomplete results are kept. The CSS uses existing design tokens and supports the original contrast/reflow contracts.

Actual NVDA/JAWS/VoiceOver, real 200/400% browser zoom, text-only resizing, Windows forced-colour UI, physical touch devices, actual Safari, complex chart/tooltip contrast and full manual keyboard acceptance remain **NOT VERIFIED**. The criterion-level register and release pack identify how to collect that evidence. Engineering must not mark those gates complete merely because the native automated suites are green.
