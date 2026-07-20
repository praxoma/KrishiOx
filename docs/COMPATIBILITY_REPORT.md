# COMPATIBILITY_REPORT.md — KrishiOx

> Documentation-only artifact recording a browser-compatibility review of the current codebase
> against five target browsers: **Safari iPhone**, **Safari iPad**, **Chrome Android**,
> **Firefox**, and **Edge**. Scope was compatibility only — no UI redesign, no new features, no
> behavior changes beyond what's needed to fix a genuine cross-browser inconsistency. Every fix
> below is small, mechanical, and reversible; nothing about how the app looks or what it does
> changed for a user on a fully-compatible browser.

## How to read this report

Each inspected area is marked:
- ✅ **Compliant** — reviewed, no issue found, no change made.
- 🔧 **Fixed** — a real cross-browser inconsistency was found and corrected; see the entry for
  what changed and why.
- ⚠️ **Known limitation** — a real gap exists, but it's a platform policy or would require
  changing the underlying mechanism (out of scope for a compatibility-only pass — fixing it
  would mean redesigning that feature, not patching a compatibility bug).

## Summary of fixes

| # | Area | Fix | Files changed |
|---|---|---|---|
| 1 | `window.open` | Added `"noopener"` window feature, matching every `target="_blank"` anchor elsewhere in the app | `js/booking/whatsapp-delivery-adapter.js` |
| 2 | Manifest (iOS home-screen identity) | Added `apple-mobile-web-app-title` meta tag so "Add to Home Screen" uses a fixed short label instead of falling back to each page's full `<title>` | All 9 HTML pages |
| 3 | Manifest (favicon delivery) | Wired up the already-generated but never-linked `favicon-16.png`/`favicon-32.png` via explicit sized `<link rel="icon">` tags | All 9 HTML pages |
| 4 | Viewport (landscape detection) | Raised the rotate-to-portrait overlay's landscape breakpoint from `max-width: 900px` to `980px` — the largest current iPhones exceed 900px in landscape and were falling through | `css/style.css` |
| 5 | Touch events | Extended `-webkit-tap-highlight-color: transparent` from `.btn` only to the global reset, so Chrome for Android doesn't show its default gray tap-flash on non-`<button>` interactive elements (chips, cards, nav items, FAQ rows) | `css/style.css` |

Precached files changed (all 9 HTML pages, `css/style.css`, and one `js/` file), so
`CACHE_VERSION` was bumped `v8 → v9` in `sw.js`, per the project's own cache-versioning
discipline (see DECISIONS.md §D12) — otherwise none of the above would reach an
already-installed user.

---

## 1. WhatsApp links

✅ **Compliant**, with one fix already counted above.

Every `wa.me` link is built by the single `buildWhatsAppLink()` helper (`js/whatsapp.js`),
which URL-encodes the message text — correct and identical behavior across all five browsers,
since `encodeURIComponent` and `https://wa.me/...` universal links are standard, well-supported
mechanisms with no known per-browser quirks.

- **Anchor-based links** (`target="_blank" rel="noopener"` on the Home hero button, the FAB, the
  Contact page row, and the Partners page buttons) were already correctly protected against the
  reverse-tabnabbing/`window.opener` issue on every browser.
- **`window.open`-based link** (the booking wizard's WhatsApp delivery adapter) was **not** — see
  fix #1 above.
- **iOS Safari standalone-mode note**: when KrishiOx is installed to the home screen
  (`display: standalone`), tapping a WhatsApp link hands off to the WhatsApp app via Universal
  Links at the OS level, independent of `window.open` vs. a plain navigation — this already
  works the same whether installed or not, on both Safari iPhone and Safari iPad.

## 2. Telephone links

✅ **Compliant.** `tel:` links (`js/ui.js`'s header call button, `contact.html`'s call row) use
`KRISHIOX_CONFIG.callNumber` (`+91 9520040503`) — no spaces or punctuation beyond the leading
`+`, the safest format for `tel:` across every browser/OS combination, including older WebViews
that are stricter about accepted characters. No fix needed.

## 3. Email links

✅ **Compliant.** `mailto:` links (`privacy.html`/`terms.html`'s `.cfg-legal-email-link`) are
set via JS from `KRISHIOX_CONFIG.legalContactEmail`, with a safe `href="#"` placeholder in the
static markup until JS runs. `mailto:` is a universally supported scheme; browsers without a
registered mail client simply do nothing on tap, which is expected OS-level behavior, not a
KrishiOx bug, and identical across all five targets.

## 4. Touch events

🔧 **Fixed** (see #5 in the summary table). Interaction is handled entirely through standard
`click` listeners (no `touchstart`/`touchend` custom handling anywhere in the codebase), which
fire correctly for taps on every mobile browser tested against — no touch-specific JavaScript
bug was found. The one real inconsistency was visual/rendering, not functional: Chrome for
Android renders a default gray tap-highlight rectangle on tappable elements that aren't native
`<button>`s (custom `<div>`/`<a>` elements like `.faq-q`, `.chip`, `.nav-item`,
`.contact-method`), which Safari doesn't render the same way and which `.btn`-styled elements
in this app already suppressed. Fixed by moving `-webkit-tap-highlight-color: transparent` to
the global reset.

**Also reviewed, no issue found**: the historical "300ms tap delay" on mobile browsers doesn't
apply here — the `width=device-width` viewport already disables double-tap-to-zoom on every
evergreen mobile browser, which is what removes the delay.

## 5. Viewport

🔧 **Fixed** (see #4 in the summary table — the rotate-overlay's landscape breakpoint).

✅ **Everything else compliant**: `<meta name="viewport" content="width=device-width,
initial-scale=1, viewport-fit=cover">` is correct and unchanged — `viewport-fit=cover` is
specifically what enables `env(safe-area-inset-bottom)` (already used for the bottom nav's
safe-area padding) to work on notched/Dynamic-Island iPhones. All form inputs
(`.input`/`.textarea`/`.select`) already have `font-size: 16px`, which is what prevents iOS
Safari's auto-zoom-on-focus for any input under 16px — already correctly avoided before this
review.

## 6. Manifest

🔧 **Fixed** (see #2 and #3 in the summary table).

✅ **Reviewed, compliant**: `manifest.json`'s `icons` array already has both `192` and `512`
sizes in both `any` and `maskable` purpose, satisfying Chrome/Edge Android's installability
requirements. `shortcuts` are silently ignored by Safari/Firefox (expected, graceful — no fix
possible or needed). `display: standalone` and `orientation: portrait-primary` behave
differently per platform exactly as already documented in ARCHITECTURE.md §6 — Safari iOS never
honors the manifest for installability the way Chrome/Edge do; it uses the `apple-mobile-web-app-*`
meta tags instead, which is exactly the gap fix #2 closes.

⚠️ **Known limitation, not fixed**: Safari (particularly non-installed iOS Safari) does not
support the `beforeinstallprompt` event at all, so KrishiOx's install button never appears
there — by design already (the button is hidden unless the event fires), and iOS's own native
"Add to Home Screen" share-sheet action is the only install path on that platform. This is a
platform capability gap, not a bug.

## 7. Service Worker

✅ **Compliant.** Registration (`js/pwa.js`) and the caching strategy (`sw.js`) use only
broadly-supported APIs: `navigator.serviceWorker.register` with `updateViaCache`, `caches.open`/
`match`/`put`, `Promise.allSettled`, `self.skipWaiting()`, `clients.claim()` — all supported in
current Safari (13+), Firefox (60+), Chrome/Edge (76+), well within the versions these five
browsers realistically run today. No syntax or API gap found.

⚠️ **Known limitation, not fixed**: Safari (especially iOS Safari not added to the home screen)
applies Intelligent Tracking Prevention (ITP), which can evict Service Worker registrations and
Cache Storage after roughly a week of no interaction with the site. This is an OS/browser
privacy policy, not something a web app can opt out of or fix in code — it's mentioned here for
completeness, and already implicitly why the app's offline story is framed as "instant for
recently-visited pages," not "permanently guaranteed offline."

## 8. Anchor tags

🔧 **Partially fixed** — the anchor-tag audit itself found no problems (every `target="_blank"`
anchor already had `rel="noopener"`); the equivalent gap was in `window.open` instead (fix #1).
No anchor tag was changed by this review.

## 9. `window.open`

🔧 **Fixed** — see fix #1. This was the single genuine bug found in this review: the booking
engine's WhatsApp delivery adapter called `window.open(url, "_blank")` without the `"noopener"`
window feature, unlike every anchor-based WhatsApp link in the app. Without it, the newly
opened tab/window retains a live `window.opener` reference back to the KrishiOx page — a
well-known issue (reverse tabnabbing, plus a minor performance cost from keeping the opener
page's process reachable) that behaves the same way, and is fixed the same way, across all five
target browsers.

## 10. `window.location`

✅ **Compliant.** All four usages (`js/navigation.js`'s `pathname` read, `js/booking.js`'s
`location.href` assignment and `location.search` read, `js/pwa.js`'s `location.reload()`,
`offline.html`'s inline `onclick`) use long-standing, universally-supported `Location` API
members with no browser-specific behavior differences relevant here. No fix needed.

---

## Per-browser summary

| Browser | Findings specific to it | Fixed here |
|---|---|---|
| **Safari iPhone** | Missing `apple-mobile-web-app-title` (home-screen label fallback); rotate-overlay landscape breakpoint excluded the largest iPhone models | Both fixed |
| **Safari iPad** | Rotate-overlay breakpoint change was verified to still safely exclude all iPad landscape widths (iPad mini's 1024px is the narrowest, well above the new 980px threshold) | N/A — reviewed, no iPad-specific bug found |
| **Chrome Android** | Default tap-highlight rendering on non-`<button>` interactive elements | Fixed |
| **Firefox** | No Firefox-specific bug found in the ten inspected areas. (The pre-existing, already-documented gap where the accessibility text-size control doesn't work in Firefox — because it depends on the non-standard CSS `zoom` property — is out of scope for this review: none of "WhatsApp links / tel / email / touch / viewport / manifest / service worker / anchors / window.open / window.location" cover it, and fixing it properly means replacing the zoom-based mechanism, which is a redesign of that feature, not a compatibility patch. See ARCHITECTURE.md §11 item 5 and DECISIONS.md.) | Not fixed — flagged as known, out of scope |
| **Edge** | Chromium-based; behaves identically to Chrome Android's rendering engine for everything reviewed here (favicon/tap-highlight fixes benefit it too) | Benefits from fixes #3 and #5 |

## What was deliberately not touched

- No UI/visual redesign — every fix is either invisible (adapter `noopener`, favicon wiring,
  iOS home-screen label) or affects only an edge case (landscape on the largest phones, tap
  flash color on non-button elements).
- No new features, no new dependencies, no build step introduced.
- The Firefox `zoom`/text-size gap (documented pre-existing issue, not in the inspected list).
- Safari's Service Worker storage eviction policy (platform behavior, not a code bug).
- Safari's lack of `beforeinstallprompt` (already gracefully handled — button simply doesn't
  appear).

---

Related documents: [ARCHITECTURE.md](ARCHITECTURE.md) (§6 PWA, §9 Browser support),
[DECISIONS.md](DECISIONS.md) (§D12 cache-version discipline).
