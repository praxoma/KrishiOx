# ARCHITECTURE.md — KrishiOx

> Documentation-only artifact. Describes the system as it exists on `main` at the time of
> writing. No application behavior was changed to produce this document.

## 1. Repository overview

KrishiOx is a **mobile-first Progressive Web App** for booking farm-equipment services
(tractor, rotavator, cultivator, harvesting, etc.) in the Saharanpur region of Uttar Pradesh,
India. It is:

- **Static** — no server, no database, no backend API of any kind.
- **Framework-free** — vanilla HTML, CSS, and JavaScript. No bundler, no transpiler, no
  package manager, no `node_modules`. `dev/*` scripts are zero-dependency Node/Python
  utilities run by hand; nothing in `dev/` is required at runtime.
- **Hindi-first** — all user-facing copy is Devanagari, with English terms kept alongside
  where farmers commonly know the English name (e.g. "रोटावेटर (Rotavator)").
- **WhatsApp-native** — the entire "backend" is a pre-filled `wa.me` deep link. There is no
  booking database; a completed booking *is* a WhatsApp message sent from the farmer's own
  phone number.
- **Installable** — a web app manifest + service worker make it installable to a phone home
  screen and functional offline for previously visited pages.
- **Deployed as GitHub Pages** — fully static hosting, relative asset paths throughout, custom
  domain `krishiox.in` via the `CNAME` file.

This architecture is a deliberate fit for the target user (a Hindi-speaking farmer with a
basic Android smartphone and a possibly unreliable data connection) and for the business model
at this stage (no payments, no login, human dispatch via WhatsApp/phone rather than an
automated backend).

## 2. System context

```
                    ┌─────────────────────────────┐
                    │   GitHub Pages (static host) │
                    │   krishiox.in (custom domain) │
                    └──────────────┬───────────────┘
                                   │ HTTPS, relative paths
                                   ▼
   ┌────────────────────────────────────────────────────────┐
   │                     Farmer's browser                    │
   │  ┌────────────┐   ┌───────────────┐   ┌───────────────┐ │
   │  │  9 HTML     │──▶│  css/style.css │   │  js/*.js       │ │
   │  │  pages      │   │  (design       │   │  (config,      │ │
   │  │             │   │   system)      │   │  icons, main,  │ │
   │  │             │   │                │   │  booking)      │ │
   │  └─────┬──────┘   └───────────────┘   └───────┬───────┘ │
   │        │                                       │         │
   │        │            ┌──────────────┐           │         │
   │        └───────────▶│ Service       │◀──────────┘         │
   │                     │ Worker (sw.js)│                     │
   │                     │ + Cache API   │                     │
   │                     └──────────────┘                     │
   │                     ┌──────────────┐                     │
   │                     │ localStorage  │ (draft, history,    │
   │                     │ (KrishiOxStore)│ text-zoom, consent) │
   │                     └──────────────┘                     │
   └───────────────────────────┬──────────────────────────────┘
                                │ tap "WhatsApp पर बुक करें"
                                ▼
                    ┌───────────────────────┐
                    │  wa.me/<number>?text=  │
                    │  (WhatsApp app/web)     │
                    └───────────┬────────────┘
                                │ farmer sends message
                                ▼
                    ┌───────────────────────┐
                    │  Business WhatsApp     │
                    │  number (human-staffed)│
                    └───────────────────────┘
```

There is no application server, no API, and no first-party data store beyond the browser's
own `localStorage`. The only outbound integration is the `wa.me` link, which hands off to
WhatsApp itself.

## 3. HTML architecture

9 top-level pages, each a standalone static HTML document (no templating engine, no includes)
sharing a consistent `<head>` and body-shell pattern:

| Page | Purpose |
|---|---|
| `index.html` | Home — hero, quick service grid, "how it works", testimonials |
| `services.html` | Full service catalogue |
| `booking.html` | 6-step booking wizard |
| `partners.html` | Equipment-owner / fleet-partner onboarding |
| `about.html` | Mission, values, roadmap |
| `contact.html` | WhatsApp/call contact methods + FAQ |
| `terms.html` | Terms & Conditions |
| `privacy.html` | Privacy Policy + "clear my data" control |
| `offline.html` | Offline fallback shell, served by the service worker |

**Shared `<head>` contract** (present on every indexable page): charset, responsive viewport,
unique `<title>`/meta description/canonical URL per page, a temporary `noindex` marker (see
§9 Technical debt), theme-color, PWA capability meta tags, a strict `Content-Security-Policy`
meta tag, Open Graph + Twitter Card tags, manifest/icon links, and `css/style.css`. `index.html`
carries a `Service` JSON-LD block; `contact.html` carries a matching `FAQPage` JSON-LD block.

**Shared body shell**: every page wraps its content in `.app-shell` → `.site-header#siteHeader`
(empty at parse time, rendered by JS) → `main.page` → `footer.site-footer` (also JS-rendered)
→ `nav.bottom-nav#bottomNav` (JS-rendered). `offline.html` is the one exception — a minimal,
self-contained shell with no header/nav/scripts, since it must render even when the service
worker's own JS bundle might not be reachable.

Each page loads exactly one `<script type="module" src="js/main.js">` at the end of `<body>`;
`booking.html` additionally loads `<script type="module" src="js/booking.js">`. There is no
`<head>` script loading. `main.js` is an ES module and internally `import`s every other module
it needs (`config.js`, `icons.js`, `navigation.js`, `ui.js`, `pwa.js`, `whatsapp.js`) — the
browser resolves that dependency graph itself, so load order between `<script>` tags no longer
matters the way it did when every file was a classic script relying on globals defined by
whichever file happened to load first (see §5 and DECISIONS.md).

Page-specific interactive content (hero icons, quick service grid, testimonials, contact rows,
FAQ) is rendered by small inline `<script>` blocks at the bottom of each page — these predate
the module system and remain plain classic scripts, calling `krishiOxIcon()`,
`buildWhatsAppLink()`, `KRISHIOX_CONFIG`, `KRISHIOX_SERVICES`, `krishiOxToast()`, and
`clearAllKrishiOxData()` as `window` globals that `js/main.js` bridges on load (see §5).

## 4. CSS architecture

Single stylesheet: `css/style.css` (~1,250 lines), no preprocessor, no CSS-in-JS, no utility
framework (Tailwind, Bootstrap, etc.). Organized top-to-bottom as:

1. **`:root` design tokens** — color palette (BioRawNex theme: Charcoal, Copper, Biomass Gold,
   Ivory, WhatsApp green), shadows, radii, an 8-step spacing scale, font stack, layout
   constants (`--max-width`, `--header-h`, `--bottomnav-h`), and a user-controlled
   `--text-zoom` variable.
2. **Reset** — box-sizing, margin/padding normalization.
3. **Layout shell** — `.app-shell` (max-width column, centers the app on desktop), `.page`.
4. **Component sections**, each under its own banner comment: Header, Bottom Navigation,
   Buttons, Hero, Section headings, Service Cards, Generic Cards, Forms/Booking wizard inputs,
   Booking Wizard shell, Success screen, Floating WhatsApp button, Consent banner, misc
   About/Contact/Partners page styles, and the Rotate-to-portrait overlay.

**Conventions observed in the codebase:**
- Mobile-first; `.app-shell` caps width at `--max-width` (560px) and centers on wider
  viewports rather than using breakpoint-driven grid reflows.
- All color/spacing/radius values are consumed via CSS custom properties — there are no
  hard-coded hex colors inside component rules, only in `:root`.
- Text scaling is implemented via a single `zoom: var(--text-zoom)` on `.page`, driven by the
  header's "A+" button, rather than per-element `rem` scaling.
- No CSS modules/scoping mechanism exists or is needed — the project is small enough for one
  global stylesheet with a class-per-component naming style (`.service-card`, `.wizard-step`,
  `.contact-method`, etc.), close to BEM in spirit but not formally namespaced.

## 5. JavaScript architecture

Twenty-one files under `js/`, each a **real ES module** (`export`/`import`,
`<script type="module">`) — no bundler, no transpiler; native browser module resolution
handles the dependency graph. This is a change from the project's earlier structure (4 classic
scripts sharing globals via manual `<script>` tag ordering), chosen because native ES modules
give compiler-enforced per-module encapsulation and an explicit, cycle-checked dependency
graph instead of implicit globals and load-order sensitivity — without adding a build step
(every evergreen browser already resolves `import`/`export` natively). DECISIONS.md predates
this refactor and doesn't yet have an entry for it; still zero build step, zero npm
dependencies, zero frameworks either way.

Nineteen of the twenty-one are single-responsibility modules, matching the domain boundaries
below. The remaining two — `main.js` and `booking.js` — are **entry points**, not
single-responsibility modules: they're the only files referenced directly by a
`<script type="module">` tag in HTML; every other module (including all six configuration
files and the six-file booking engine under `js/booking/` — see the subsection below) is
loaded transitively via `import` statements and never referenced by HTML directly.

| File | Responsibility | Key exports |
|---|---|---|
| `js/branding.js` | Brand identity: `appName`, `brandInitials`, `appTagline`. | `KRISHIOX_BRANDING` |
| `js/contact.js` | Contact channels and support hours: `whatsappNumber`, `callNumber`, `supportHours`, `legalContactEmail`. | `KRISHIOX_CONTACT` |
| `js/regions.js` | The service-area label. | `KRISHIOX_REGION` |
| `js/services.js` | The service catalogue. | `KRISHIOX_SERVICES` |
| `js/villages.js` | The village/area suggestion list. | `KRISHIOX_VILLAGES` |
| `js/app.js` | **Composition root for config, not a single-responsibility module.** Merges `branding.js` + `contact.js` + `regions.js` (plus `legalVersion`, an app-wide concern that belongs to none of them) into `KRISHIOX_CONFIG` — the single merged shape every consumer expects. See §8 for the full loading model. | `KRISHIOX_CONFIG` |
| `js/storage.js` | Namespaced, fail-safe `localStorage` access — the only file that touches `localStorage` directly. | `KrishiOxStore` (`.get`, `.set`, `.remove`) |
| `js/icons.js` | Inline SVG icon library lookup — avoids an icon-font or external SVG-sprite dependency. | `krishiOxIcon(name)` |
| `js/whatsapp.js` | Builds `wa.me` deep links — KrishiOx's only integration with an external system. | `buildWhatsAppLink(message)` |
| `js/navigation.js` | Current-page identity and the bottom navigation bar (page-to-page wayfinding). | `currentPageKey()`, `renderBottomNav()` |
| `js/utils.js` | Generic, stateless helpers with no dependency on config/storage/UI — a leaf module safe to import from anywhere. | `escapeHtml`, `isoDate`, `formatDateHi`, `copyToClipboard` |
| `js/ui.js` | Shared visual chrome used on every page: header, footer, floating WhatsApp button, toast, consent banner, text-size control, FAQ accordion, offline banner, rotate-to-portrait overlay. Intentionally the broadest module — it's the single place responsible for shared UI chrome that isn't page navigation (`navigation.js`) or PWA lifecycle (`pwa.js`). | `renderHeader`, `renderFooterLinks`, `renderFooterBrand`, `renderFab`, `renderRotateOverlay`, `applyTextZoom`, `initTextSize`, `clearAllKrishiOxData`, `initConsentBanner`, `showToast`, `initFaq`, `initOfflineBanner` |
| `js/pwa.js` | Service-worker registration, the tap-to-update handoff, and the "Add to Home Screen" install prompt. | `initInstallButton`, `initUpdateButton`, `initCheckUpdateButton`, `initServiceWorker`, `notifyIfJustUpdated` |
| `js/main.js` | **Entry point, not a single-responsibility module.** Composition root: imports the modules above and drives the shared boot sequence (header/nav/footer/FAB render, consent banner, service worker, install prompt). Also bridges a handful of functions/values onto `window` for the per-page inline `<script>` blocks that predate this module system (see §3). Contains no business logic itself. | none — never imported by another module |
| `js/booking.js` | **Entry point, not a single-responsibility module.** The "Booking Form" stage: the booking-wizard state machine (see DATA_FLOW.md §Booking flow). Collects raw field values and, on the final step, hands them to `js/booking/engine.js` — knows nothing about how a booking is validated, formatted, or delivered. Fully self-contained; boots itself on `DOMContentLoaded`. Only loaded on `booking.html`, since it targets DOM IDs unique to that page. | none — never imported by another module |
| `js/booking/model.js` | The "Booking Object" stage: shapes a `Booking` domain object from the wizard's raw form state (resolves the service reference once; drops wizard-mechanical fields like `step`). | `createBooking(formState)` |
| `js/booking/validator.js` | The "Validation" stage: checks a `Booking` object is complete before it's serialized/delivered. Mirrors the wizard's own `validStep()` rules as a defensive boundary check, not a new user-facing rule. | `validateBooking(booking)` |
| `js/booking/serializer.js` | The "Booking Serializer" stage: turns a validated `Booking` into a channel-agnostic `BookingPayload` — rendered Hindi `text` (byte-identical to the message KrishiOx has always sent) plus structured `fields`, for adapters that want field-level data instead of a flat string. | `serializeBooking(booking)` |
| `js/booking/delivery-adapter.js` | Defines the `DeliveryAdapter` contract every channel implements, and the one call site (`deliverBooking`) the engine uses to invoke one — the seam future adapters (REST API, SMS, Email, WhatsApp Cloud API, Push Notification) plug into. | `deliverBooking(adapter, payload)` |
| `js/booking/whatsapp-delivery-adapter.js` | The current, only concrete `DeliveryAdapter`: builds a `wa.me` link from the serialized text and opens it — unchanged from what KrishiOx has always done, now behind the adapter contract. | `whatsappDeliveryAdapter` |
| `js/booking/engine.js` | **Composition root for the booking engine, not a single-responsibility module.** Runs the full pipeline — Booking Object → Validation → Serializer → Delivery Adapter — behind one function. See the subsection below. | `submitBooking(formState, adapter?)` |

Dependency direction flows one way, leaf-first, with no cycles:

```
branding.js, contact.js, regions.js,      (leaves — no app-internal imports)
storage.js, icons.js
        │
        ▼
app.js (composes branding/contact/regions),   (depend only on the leaves above)
whatsapp.js, navigation.js, utils.js,
services.js, villages.js (also leaves — never
composed, imported directly by consumers)
        │
        ▼
ui.js                                     (depends on app.js/icons/storage/whatsapp/navigation)
        │
        ▼
pwa.js                                    (depends on app.js and ui.js, for showToast)
        │
        ▼
main.js, booking.js                       (entry points — import whatever they need,
                                            including services.js/villages.js directly)
        │
        ▼ (booking.js only, on submit)
js/booking/engine.js                       (imports model/validator/serializer/
                                             delivery-adapter/whatsapp-delivery-adapter —
                                             see subsection below)
```

**Style conventions**: ES5-leaning function syntax (`function () {}` rather than arrow
functions) is still used consistently for function bodies, matching the project's existing
style — only the module boundary mechanism (`export`/`import` instead of implicit globals)
changed. Modules are implicitly strict-mode, so the old per-file `"use strict"` directive was
dropped as redundant. `main.js` is the only file that writes to `window` — a short, explicit
list (`window.krishiOxIcon`, `window.buildWhatsAppLink`, `window.KRISHIOX_CONFIG`,
`window.KRISHIOX_SERVICES`, `window.krishiOxToast`, `window.clearAllKrishiOxData`), kept
deliberately small and named after exactly what the inline per-page `<script>` blocks (§3)
still reference, not a general-purpose global namespace.

State is never stored in a JS framework construct (no virtual DOM, no reactive store) — pages
re-render by rebuilding `innerHTML` strings from data and re-attaching event listeners, which
is why `js/ui.js`'s render functions (`renderHeader`, `renderFab`, etc.) are cheap, idempotent,
and called once per page load rather than diffed.

### Booking engine (`js/booking/`)

Submitting a booking used to be two tightly-coupled steps inside `js/booking.js`:
`buildBookingMessage()` formatted the wizard's raw `state` directly into a WhatsApp string, and
`confirmBooking()` immediately built a `wa.me` link from it and opened it — no boundary between
"turn form data into a message" and "send it over WhatsApp specifically." That coupling is what
made adding a second delivery channel (SMS, email, a REST API, WhatsApp Cloud API, push
notifications) hard to imagine without touching the wizard itself.

The booking engine (`js/booking/`) replaces that with an explicit pipeline, each stage its own
file:

```
Booking Form  →  Booking Object  →  Validation  →  Booking Serializer  →  Delivery Adapter  →  WhatsApp
(booking.js)      (model.js)         (validator.js)   (serializer.js)       (delivery-adapter.js +
                                                                              whatsapp-delivery-adapter.js)
```

- **Booking Form** (`js/booking.js`) is unchanged in behavior — same 6 steps, same fields, same
  per-step `validStep()` gating the Next button. It knows nothing about validation rules beyond
  step-advancement, message formatting, or WhatsApp; it just calls
  `submitBooking(state)` on the final step and reacts to the result.
- **Booking Object** (`js/booking/model.js`) — `createBooking(formState)` shapes the wizard's
  raw field values into a `Booking` object: resolves the service reference once (instead of
  every downstream stage re-searching `KRISHIOX_SERVICES`), and drops wizard-mechanical fields
  like `step` that have no meaning outside the form.
- **Validation** (`js/booking/validator.js`) — `validateBooking(booking)` re-checks the same
  rules as `validStep()`, applied to the finished object rather than one step at a time. In
  normal use it can never fail, since the wizard already refuses to reach the final step with
  incomplete data — it's a defensive boundary check on the domain object, the same instinct
  behind the CI cache-version guard (DECISIONS.md), not a new user-facing validation rule. It's
  intentionally a separate implementation from `validStep()`, not a shared one — see
  DECISIONS.md for why.
- **Booking Serializer** (`js/booking/serializer.js`) — `serializeBooking(booking)` produces a
  `BookingPayload`: a `text` field (the exact Hindi message KrishiOx has always sent — byte-identical
  output to the old `buildBookingMessage()`) and a `fields` object breaking the same data out
  by field, for any future adapter that wants structured data instead of a flat string.
- **Delivery Adapter** (`js/booking/delivery-adapter.js` + `whatsapp-delivery-adapter.js`) — the
  extension point. `delivery-adapter.js` defines the `DeliveryAdapter` contract (one method,
  `deliver(payload)`) and the single call site (`deliverBooking`) the engine uses to invoke
  one. `whatsapp-delivery-adapter.js` is today's only concrete adapter: it builds a `wa.me` link
  from `payload.text` and opens it, exactly as `confirmBooking()` used to do inline — now just
  behind the contract.
- **WhatsApp** is the external system the current adapter targets — no backend, no change here.

`js/booking/engine.js` is the composition root that runs all four stages behind one function,
`submitBooking(formState, adapter?)`, defaulting to `whatsappDeliveryAdapter` when no adapter
is given. **Adding a future channel — REST API, SMS, Email, WhatsApp Cloud API, Push
Notification — means writing one new file that implements the `DeliveryAdapter` contract and
passing it to `submitBooking()`; it does not mean changing the wizard, the model, the
validator, the serializer, or the engine itself.** None of those five future channels are
implemented — this only establishes the seam they'd plug into, per the request that produced
this subsystem.

**What stayed the same, deliberately**: the rendered WhatsApp message text, the wa.me link
construction, the "WhatsApp पर भेजें" success button, the "मैसेज कॉपी करें" fallback, and the
local booking-history write are all identical to before — see DATA_FLOW.md §2 for the full
before/after trace. The only behavioral wrinkle is timing-order, not outcome: `window.open()`
now happens inside `whatsappDeliveryAdapter.deliver()` (i.e. during `submitBooking()`, before
the success-screen DOM updates) rather than after them — both happen within the same
synchronous tick, so there is no observable difference.

## 6. PWA architecture

- **`manifest.json`** — name/short_name (Hindi), start_url, `display: standalone`,
  `orientation: portrait-primary`, brand background/theme colors, four icon sizes (192/512,
  standard + maskable), and two shortcuts (Book a service, View all services) for the
  long-press home-screen menu.
- **Install flow**: `js/pwa.js` listens for `beforeinstallprompt`, defers it, and surfaces a
  header "install" button (`#installBtn`) that replays the captured prompt on tap — the
  standard deferred-prompt pattern, needed because Chrome/Android suppresses the automatic
  mini-infobar once a page calls `preventDefault()` on the event.
- **Orientation lock caveat**: `orientation: portrait-primary` in the manifest only takes
  effect once installed to the home screen on Android, and iOS Safari never honors it (even
  installed). `js/ui.js`'s `renderRotateOverlay()` is a CSS-only fallback: a full-screen
  "please rotate your phone" overlay shown via a media query whenever a touch device is in
  landscape, covering the gap for everyone else (browser tab, or any iOS user).
- **Icons**: generated once by `dev/generate_icons.py` (a one-off Pillow script, not needed at
  runtime) into `icons/` — apple-touch-icon, two favicon sizes, and 192/512 standard +
  maskable PNGs.

See also DATA_FLOW.md §PWA install & update flow for the full sequence.

## 7. Service Worker architecture

`sw.js` implements an app-shell caching strategy specifically tuned for **poor/flaky rural
connectivity**, not just binary online/offline:

- **Install**: precaches the full `APP_SHELL` array (every HTML page, `css/style.css`, every
  `js/*.js` file, and the three most-used icon files) using `Promise.allSettled` over
  individual `cache.add()` calls rather than `cache.addAll()` — so one timed-out asset on a bad
  2G/3G link doesn't sink the entire precache and leave the farmer with zero offline support.
- **Navigation requests** (`req.mode === "navigate"`): race the network (with `cache:
  "no-store"`, bypassing GitHub Pages' `max-age=600` HTTP cache) against a 4-second timeout
  (`NAV_TIMEOUT_MS`). Whichever resolves first wins; if the network loses the race, the cached
  page is served immediately and the network response — once it does arrive — still updates
  the cache for next time. Total failure (no cache, no network) falls back to `offline.html`.
- **Static assets** (everything else, GET only): cache-first, revalidate-in-background — serve
  the cached copy instantly if present, and refresh the cache from the network in parallel for
  the next visit.
- **Versioning**: `CACHE_VERSION` (currently `krishiox-v6`) namespaces the cache
  (`STATIC_CACHE = CACHE_VERSION + "-static"`); `activate` deletes any cache key not prefixed
  with the current version, so a version bump both invalidates old assets and cleans up old
  cache storage.
- **Update handoff is manual, not automatic**: a new worker installs and fully precaches in
  the background but does **not** call `self.skipWaiting()` on its own. It waits for an
  explicit `"SKIP_WAITING"` postMessage, sent only when the farmer taps the header's update
  icon (`#updateBtn`, wired up by `js/pwa.js`). This guarantees a farmer mid-way through the
  booking wizard is never yanked onto a fresh reload without asking — see DATA_FLOW.md for the
  full update sequence.

CACHE_VERSION discipline is enforced by tooling, not just convention — see §8 Configuration
architecture and DECISIONS.md.

## 8. Configuration architecture

Deployment-specific values are split across six files under `js/`, each with one concern, plus
one composition file that reassembles them into the shape the rest of the app already depends
on. This replaced a single `js/config.js` file that had grown to hold brand identity, contact
channels, the region label, the service catalogue, and the village list all at once.

| File | Holds | Consumed by |
|---|---|---|
| `js/branding.js` | `KRISHIOX_BRANDING` — `appName`, `brandInitials`, `appTagline` | Only `js/app.js` (composed into `KRISHIOX_CONFIG`) |
| `js/contact.js` | `KRISHIOX_CONTACT` — `whatsappNumber`, `callNumber`, `supportHours`, `legalContactEmail` | Only `js/app.js` |
| `js/regions.js` | `KRISHIOX_REGION` — `serviceArea` | Only `js/app.js` |
| `js/services.js` | `KRISHIOX_SERVICES` — the service catalogue (id, Hindi/English names, description, icon key, unit label) | Directly: `main.js` (window bridge), `booking.js` (steps 1 + 3) |
| `js/villages.js` | `KRISHIOX_VILLAGES` — the village/area autocomplete list | Directly: `booking.js` (step 2's `<datalist>` + quick-select chips) |
| `js/app.js` | **Composition root for config, not a single-responsibility module.** Merges `KRISHIOX_BRANDING` + `KRISHIOX_CONTACT` + `KRISHIOX_REGION` plus `legalVersion` (which belongs to none of the three — see below) into `KRISHIOX_CONFIG`, the same merged shape every consumer already expected. | `ui.js`, `pwa.js`, `whatsapp.js`, `main.js` (window bridge) |

**Loading order**: `KRISHIOX_SERVICES` and `KRISHIOX_VILLAGES` were always standalone exports,
never nested inside the config object, so `services.js`/`villages.js` need no composition step
— any module imports them directly. `KRISHIOX_CONFIG`, by contrast, is consumed everywhere as
one merged object (`KRISHIOX_CONFIG.whatsappNumber`, `.appName`, etc.), so `app.js` exists
purely to import the three grouped objects and merge them under that original name and shape —
no call site that reads `KRISHIOX_CONFIG.x` needed to change, only its import path (now
`"./app.js"` instead of `"./config.js"`).

**Why `legalVersion` lives in `app.js` rather than one of the three grouped files**: it isn't
brand, contact, or region data — it's app-wide consent-gating metadata (`ui.js`'s consent
banner re-prompts anyone whose saved consent doesn't match this value). `legalContactEmail`,
despite also being "legal"-prefixed, lives in `contact.js` instead, because it's a contact
channel (a grievance email address) parallel to `whatsappNumber`/`callNumber`, not a
versioning concern. See `js/app.js`'s file-header comment for the full reasoning, and
DECISIONS.md for the general "split by concern, compose where consumers need the old shape"
pattern also used for `KRISHIOX_CONFIG` in the JS module refactor (§5).

**What configuration can't reach**: static SEO surface — `<title>`, meta description,
canonical URL, Open Graph/Twitter tags, JSON-LD, and `manifest.json` — is baked as literal
text into each HTML file, on purpose, because link-preview bots (WhatsApp, Facebook, Twitter)
and some crawlers don't execute JavaScript. `dev/rebrand.js` is the tool that keeps that
static text in sync with `js/branding.js` in one command (rename, domain change, GitHub Pages
vs. custom domain, and stripping the temporary `noindex` tag for go-live) — it reads/writes
`appName`/`brandInitials` from `branding.js` specifically, not the other five config files.
See DECISIONS.md for why this split exists.

**Build-time configuration**: none. There is no `.env`, no build step, no environment-specific
config file — the six files under `js/` committed to the repo *are* the production
configuration, edited directly and redeployed by pushing to `main`.

## 9. Browser support

No explicit browser support matrix or polyfills are declared in the repo (no `.browserslistrc`,
no Babel, no autoprefixer). Support is implied by the features actually used:

- **Baseline requirement**: any evergreen mobile/desktop browser with native ES module support
  (`<script type="module">`, `import`/`export`) — Chrome/Edge 61+, Firefox 60+, Safari 10.1+.
  This is not a new constraint in practice: the codebase already used `let`/`const` and
  template literals before this refactor, and every browser old enough to lack ES modules also
  lacks the Service Worker API and installability the app already depends on (see below), so
  module support doesn't narrow the effective support matrix any further. Function bodies still
  deliberately avoid arrow-function syntax, matching the project's existing style.
- **PWA features** (service worker, manifest, install prompt) require HTTPS and are
  Chromium/Android-first — `beforeinstallprompt` is not fired by Safari/iOS or Firefox, so the
  install button simply never appears there (graceful — the page still works, just without a
  one-tap install affordance; iOS users install via Safari's native "Add to Home Screen" share
  action instead).
- **CSS**: uses `env(safe-area-inset-bottom)`, `backdrop-filter`-style glass tokens
  (`--charcoal-glass`), CSS custom properties, and `zoom` (a non-standard but widely
  supported-in-practice property, notably absent from Firefox's implementation of the CSS
  spec — Firefox users on this codebase get unscaled text from the A+ control, a known gap,
  see DECISIONS.md).
- **No IE11 support** — CSS custom properties and the service worker API alone rule it out;
  this is consistent with the project's "installable PWA" goal, which IE11 cannot fulfill
  regardless.

## 10. External dependencies

**Runtime**: none. Zero npm packages, zero CDN scripts, zero web fonts loaded from a
third-party origin (the font stack falls back through system fonts if `Noto Sans
Devanagari`/`Hind` aren't locally available — no `@font-face` `url()` import exists in
`style.css`), zero analytics, zero tracking pixels, zero third-party cookies. This is
enforced structurally by the `Content-Security-Policy` meta tag on every page
(`default-src 'self'`, `connect-src 'self'`), which would block any accidental third-party
network call.

**Dev-time**: `dev/generate_icons.py` depends on Python + Pillow (used once to generate the
`icons/` directory; not re-run on every deploy). `dev/rebrand.js` and `dev/bump_cache.js`
are zero-dependency Node scripts (only `fs`/`path`/`child_process` from the standard
library).

**CI**: `.github/workflows/cache-version-guard.yml` uses `actions/checkout@v4` and
`actions/setup-node@v4` — the only third-party dependencies in the entire project, and both
are GitHub-maintained actions, not application dependencies.

**Hosting**: GitHub Pages (static hosting only, no server-side execution). No database, no
serverless functions, no third-party API calls of any kind from client code.

## 11. Technical debt

See DECISIONS.md for the reasoning behind several of these; listed here as an inventory:

1. **Manual `CACHE_VERSION` bump discipline** — forgetting to bump `sw.js`'s `CACHE_VERSION`
   silently ships a stale site to already-installed users. This has happened twice in the
   project's history. A CI guard (`cache-version-guard.yml`) now auto-corrects it after the
   fact, but the root cause (a value that must be manually kept in sync with which files
   changed) is still present — a smarter build step could compute this from file hashes
   instead of trusting a hand-maintained version string.
2. **No automated tests** — there is no test suite (unit, integration, or E2E) anywhere in
   the repo. Correctness currently depends entirely on manual testing across the wizard flow,
   offline behavior, and the various HTML pages.
3. **Duplicated markup across pages** — there is no shared templating/include mechanism, so
   the `<head>` block (SEO tags, CSP, manifest links) and the general `.app-shell` skeleton
   are hand-copied into all 9 HTML files. A change to the CSP policy or a shared meta tag
   requires editing every file individually (`dev/rebrand.js` partially compensates for brand
   text, but not for structural markup changes).
4. **Two silently duplicated legal blocks** — `contact.html`'s inline FAQ markup and its
   `FAQPage` JSON-LD block repeat the same five Q&A pairs by hand; nothing enforces they stay
   in sync if one is edited without the other.
5. **`--text-zoom` via CSS `zoom`** — not supported by Firefox, so the accessibility text-size
   control silently does nothing there (no fallback, no feature-detection warning).
6. **No image optimization pipeline** — `icons/` PNGs are committed as-is from the one-off
   generation script; there's no automated recompression or `srcset` responsive-image setup
   (not a large concern today, since the only raster images are PWA icons, not content
   photography).
7. **Rebrand/config coupling is manual and easy to desync** — `dev/rebrand.js`'s `TEXT_FILES`
   list must be kept in sync by hand with any new page added to the site; a new HTML page that
   isn't added to that array will silently not get rebrand treatment.
8. **Temporary `noindex` tags require a scripted mass-edit to remove** — `--go-live` in
   `dev/rebrand.js` does a regex-based removal across all HTML files; if a page's `noindex`
   comment/tag pair is hand-edited to not exactly match the expected pattern, it will silently
   fail to be removed at go-live time.
9. **`main.js`'s `window` bridge is a deliberate, bounded seam, not a clean break** — the
   per-page inline `<script>` blocks (hero fill, service grid, contact rows, "clear my data")
   predate the ES module refactor and still expect `krishiOxIcon`, `buildWhatsAppLink`,
   `KRISHIOX_CONFIG`, `KRISHIOX_SERVICES`, `krishiOxToast`, and `clearAllKrishiOxData` as
   `window` globals; `main.js` re-exposes exactly those six. Any new inline page script that
   needs something else from the module graph will silently see `undefined` unless it's added
   to that bridge list by hand — converting those inline blocks to their own
   `<script type="module">` tags with real `import`s (as `main.js`/`booking.js` already do)
   would close this gap, but was out of scope for this refactor.
10. **`js/booking/validator.js` intentionally duplicates `js/booking.js`'s `validStep()` rules**
    — the two must be kept in sync by hand if a booking field's validation rule ever changes
    (e.g. phone number length). They're kept separate on purpose (see DECISIONS.md) rather than
    sharing one implementation, because they answer different questions at different layers —
    but nothing enforces they stay consistent, and a future edit to one without the other would
    either let the wizard advance to a step the engine then silently rejects, or let the engine
    accept something the wizard would have blocked.

## 12. Future extension points

The codebase is intentionally structured so these can be added without a rewrite (verified
against current code, not aspirational):

| Feature | Where it plugs in |
|---|---|
| **Vendor dashboard** | New `vendor/` section; `KRISHIOX_SERVICES` in `js/services.js` is already data-driven, so a dashboard could read the same catalogue |
| **AI advisory** | New page + external API call; `KRISHIOX_SERVICES` entries could extend with crop/advisory metadata without changing existing consumers (Home/Services/Booking only read the fields they already use) |
| **Weather** | A new `js/weather.js` module + card on Home, backed by any public weather API — no existing module needs to change |
| **Marketplace** | A `KRISHIOX_SERVICES`-shaped catalogue array in a new `js/store.js`, rendered by a new page |
| **Payments** | `js/booking/engine.js`'s `submitBooking()` is the single choke point between Validation and delivery — a payment step could run there (before `deliverBooking()`) without touching the wizard (steps 1–5), the model, or the validator |
| **Equipment tracking / live map** | A new page using the same `style.css` design tokens; no architectural blocker |
| **Analytics** | `KrishiOxStore` (`js/storage.js`) already writes a local booking history (`bookingHistory` key) on every confirmed booking, in `js/booking.js`'s `confirmBooking()` — this could be mirrored to a real analytics/events endpoint there, or as a second Delivery Adapter run alongside WhatsApp |
| **REST API / SMS / Email / WhatsApp Cloud API / Push Notification delivery** | The booking engine's `DeliveryAdapter` contract (`js/booking/delivery-adapter.js`) already exists specifically for this — see the "Booking engine" subsection in §5 |
| **Multi-language** | All user-facing strings are currently inline Hindi literals in HTML/JS rather than a lookup table — a genuine i18n layer would be new work, not a plug-in point today (see DECISIONS.md) |

---

Related documents: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) (file-by-file map),
[COMPONENTS.md](COMPONENTS.md) (UI component inventory), [DATA_FLOW.md](DATA_FLOW.md)
(navigation/booking/WhatsApp/update sequences), [DECISIONS.md](DECISIONS.md) (why things are
built this way).
