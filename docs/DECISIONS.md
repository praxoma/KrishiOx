# DECISIONS.md — KrishiOx

> Documentation-only artifact. Each entry records a decision already made and implemented in
> the codebase, and the reasoning for it as evidenced by the README, code comments, and commit
> history. This is a record of *why things are the way they are*, not a proposal to change
> anything. No application code was modified to produce this document.

Format: **Decision** — what was chosen. **Context** — the constraint or problem. **Why** — the
reasoning. **Trade-off accepted** — what was given up. **Evidence** — where this is visible in
the repo.

---

## D1. No frameworks, no build step, pure static HTML/CSS/vanilla JS

**Decision**: Zero frontend frameworks, zero bundler/transpiler, zero npm dependency tree.

**Context**: Target deployment is GitHub Pages; target user is a Hindi-speaking farmer on a
basic Android phone, often on a slow connection.

**Why**: A build step adds tooling overhead (Node version pinning, dependency updates,
build-time failures) disproportionate to the app's actual complexity (9 static pages + one
wizard). It also keeps time-to-first-byte and parse cost minimal for low-end devices/slow
links — every KB matters when "flaky rural connectivity" is a named design constraint (see
`sw.js` header comment).

**Trade-off accepted**: No component reuse abstraction beyond hand-copied HTML and shared JS
render functions (see PROJECT_STRUCTURE.md); no type checking; no dead-code elimination or
minification pipeline.

**Evidence**: README.md "Highlights" — "Pure HTML / CSS / vanilla JS — zero frameworks, zero
build step, zero external dependencies"; absence of `package.json` anywhere in the repo.

---

## D2. WhatsApp `wa.me` link as the entire "backend"

**Decision**: No server, no database, no booking API. A completed booking is a pre-filled
`wa.me` link opened by the farmer, sent from the farmer's own WhatsApp number.

**Context**: The business model at this stage is advance booking coordinated by a
human-staffed WhatsApp number, not automated dispatch; there is no payment or account system
to justify a backend.

**Why**: WhatsApp is already the dominant communication channel for this user base — building
a custom backend + app-store app would add cost, login friction, and trust barriers ("no
login, no payment, no app-store install required" — README) without adding capability the
target users need yet.

**Trade-off accepted**: No structured booking data anywhere except the human reading a
WhatsApp message and, locally, an unsynced 20-entry booking history in the farmer's own
browser. No booking analytics, no way to query "how many bookings this week" without manually
reading WhatsApp. No true confirmation/cancellation state machine — it's conversational.

**Evidence**: README.md §"Booking flow (UX rationale)" and §"Built for future expansion" table
(Payments row: "Booking wizard already isolates a single `confirmBooking()` step... swap the
WhatsApp handoff for a payment step without touching steps 1–5"); `js/booking.js`
`confirmBooking()`.

---

## D3. Config split: `js/config.js` (dynamic) vs. static HTML tags (SEO surface)

**Decision**: Brand name/numbers/catalogue live in `js/config.js` and are read at runtime.
`<title>`, meta description, canonical URL, OG/Twitter tags, JSON-LD, and `manifest.json` are
hard-coded static text in each HTML file instead.

**Context**: Renaming the platform or changing domain needs to update both kinds of surface.

**Why**: Link-preview bots (WhatsApp, Facebook, Twitter) and many search crawlers do not
execute JavaScript. If SEO/social tags were JS-injected, link previews and search snippets
would show blank or stale content for these crawlers. Splitting the two lets runtime-rendered
UI stay data-driven while keeping crawler-visible content genuinely static.

**Trade-off accepted**: Two places to update on a rebrand instead of one — mitigated by
`dev/rebrand.js`, a scripted find-and-replace across both categories in one command, run by
hand and reviewed via `git diff` before committing.

**Evidence**: README.md §"Renaming the platform or changing the domain"; `dev/rebrand.js`
header comment.

---

## D4. Manual, tap-gated service-worker update handoff (no forced reload)

**Decision**: A new service worker precaches itself fully in the background but does **not**
call `self.skipWaiting()` automatically. It waits for an explicit `"SKIP_WAITING"` message,
sent only when the farmer taps a header icon.

**Context**: The default "new SW takes over immediately" pattern can reload a page out from
under a user mid-task.

**Why**: A farmer mid-way through the 6-step booking wizard should never be silently
force-reloaded and lose their place (draft persistence in `localStorage` mitigates data loss,
but an unexpected reload is still a jarring, trust-eroding UX event for a first-time PWA
user). Making the update explicit and farmer-initiated avoids that entirely, at the cost of
some users running a stale version for longer.

**Trade-off accepted**: Users who never notice/tap the update icon keep running an old
version indefinitely (mitigated by: an automatic re-check on every foreground/visibilitychange
event, and the fact that the update icon persists until acted on).

**Evidence**: `sw.js` header comment ("Update handoff..."); `js/main.js`
`showUpdateIcon`/`initUpdateButton`/`initServiceWorker` and their inline comments.

---

## D5. `updateViaCache: "none"` on service worker registration

**Decision**: `navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })`.

**Context**: GitHub Pages serves static assets with `Cache-Control: max-age=600`.

**Why**: Without this flag, some browsers check for a new `sw.js` by reading their own HTTP
disk cache rather than the network, so an update check could report "no change" for up to 10
minutes after a real deploy. Forcing `"none"` makes every SW update check a genuine network
request.

**Trade-off accepted**: Slightly more network traffic for `sw.js` checks; no meaningful
downside given `sw.js`'s small size.

**Evidence**: `js/main.js` inline comment directly above the `register()` call.

---

## D6. Navigation race (network vs. 4s timeout) instead of pure cache-first or network-first

**Decision**: For page navigations, race the network against a 4-second timeout; whichever
resolves first is served, and the network result (even if it loses the race) still updates the
cache.

**Context**: The target connectivity profile is "poor/flaky rural," not simply "sometimes
offline."

**Why**: Pure network-first would leave a farmer staring at a blank/loading screen on slow 2G;
pure cache-first would always show stale content even when a fast connection is available.
Racing gets the best of both: fresh content when the network is fast enough, instant cached
content when it isn't, and the cache still gets refreshed either way.

**Trade-off accepted**: Added complexity in `sw.js`'s fetch handler versus either pure
strategy; a small chance of serving a very-slightly-stale page when the network technically
would have won just after the timeout fired.

**Evidence**: `sw.js` header comment and the `navigate`-branch implementation
(`NAV_TIMEOUT_MS = 4000`).

---

## D7. Per-asset precaching (`Promise.allSettled` + individual `cache.add()`) instead of `cache.addAll()`

**Decision**: Install-time precaching adds each `APP_SHELL` file independently via
`Promise.allSettled`, rather than the more common single `cache.addAll()` call.

**Context**: `cache.addAll()` is all-or-nothing — if any single asset fails to fetch, the
entire precache operation fails and the install rejects.

**Why**: On a flaky rural 2G/3G connection, one timed-out asset (e.g. a less-critical icon)
should not sink offline support for the entire app shell.

**Trade-off accepted**: A worker can finish "installed" with a partially-precached app shell
(some assets missing); no retry/backoff logic exists to fill gaps beyond the next natural
cache-refresh from the cache-first fetch handler.

**Evidence**: `sw.js` install handler comment: "Cache each file independently (not
cache.addAll, which is all-or-nothing)..."

---

## D8. Explicit key-list deletion for "Clear my data," not `localStorage.clear()`

**Decision**: `clearAllKrishiOxData()` removes exactly four named keys
(`bookingDraft`, `bookingHistory`, `textZoom`, `legalConsent`) rather than wiping all of
`localStorage`.

**Context**: `privacy.html` makes a specific, auditable claim about what "Clear my data"
deletes.

**Why**: An explicit list stays verifiable against the Privacy Policy's actual wording — if a
future feature adds a new `localStorage` key, a blanket `.clear()` would silently start
deleting it (possibly over-promising) or the policy text would silently under-describe what a
wildcard clear does. The explicit list forces a conscious update to both the code and the
policy together.

**Trade-off accepted**: Any new persisted key must be remembered and added to this list by
hand, or it will survive a "Clear my data" tap unexpectedly.

**Evidence**: `js/main.js` inline comment above `clearAllKrishiOxData()`; README.md §"Legal,
consent, and data handling."

---

## D9. Consent banner scoped to local storage + WhatsApp handoff, explicitly not a cookie banner

**Decision**: The consent banner never mentions cookies; it describes local storage usage and
the WhatsApp handoff instead.

**Context**: The app sets zero cookies (verified in the README as a grep check against
`document.cookie`).

**Why**: A generic "we use cookies" banner would be factually false for this app and would
itself be a compliance problem — claiming a practice that isn't happening. The banner is
written to match what the app actually does.

**Trade-off accepted**: None substantive — this is a correctness fix relative to a common
copy-pasted pattern, not a compromise.

**Evidence**: README.md §"Legal, consent, and data handling" ("Not a cookie banner...");
`js/main.js` `initConsentBanner()` message copy.

---

## D10. Versioned re-consent via `legalVersion`, not a one-time acceptance flag

**Decision**: Consent is stored with the policy version it was given under
(`{version, ts}`); the banner reappears (with different copy) whenever
`KRISHIOX_CONFIG.legalVersion` no longer matches the stored value.

**Context**: `terms.html`/`privacy.html` will change over time.

**Why**: A simple boolean "has this user consented, ever" would silently carry forward
approval of policy text the user never actually saw. Tying consent to a version string means a
material policy change re-prompts automatically instead of relying on someone remembering to
force re-consent.

**Trade-off accepted**: Requires discipline — `legalVersion` must be bumped by hand whenever
`terms.html`/`privacy.html` changes "in a way users should be re-notified about" (not
necessarily every edit, e.g. typo fixes), which is a judgment call without tooling support
(unlike D12's CI-enforced `CACHE_VERSION`).

**Evidence**: `js/config.js` comment above `legalVersion`; `js/main.js`
`initConsentBanner()`.

---

## D11. Stable internal identifiers (`krishiox:` prefix, `CACHE_VERSION`) kept separate from user-facing branding — going forward

**Decision**: The `localStorage` key prefix and the service worker's cache-version identifier
are treated as internal plumbing, not branding, and — per the README — should stay stable
across any *future* rebrand once real user data exists.

**Context**: The GOSPOLO → KrishiOx rebrand *did* rename these identifiers, which orphaned any
pre-rebrand user's saved draft/history/preferences/consent (data not deleted, just
unreachable under the new key prefix).

**Why**: That one-time cost was judged acceptable pre-launch (no real users yet, and it fully
erased any trace of the old name from the codebase, which mattered for a pre-launch identity
change). But the same move against a live user base would silently drop real people's saved
bookings and consent records — an acceptable one-time decision that is explicitly called out
as **not** the right default going forward.

**Trade-off accepted**: The README documents this as a lesson learned, not a currently
enforced constraint — nothing in code prevents a future contributor from renaming these
identifiers again; it relies on this document (and the README) being read.

**Evidence**: README.md §"SEO" ("Internal technical identifiers... were renamed along with the
brand... on purpose... For any future rename... keep these two identifiers stable instead").

---

## D12. CI-enforced `CACHE_VERSION` bump guard, layered on top of a manual dev script

**Decision**: `dev/bump_cache.js` is the documented manual step ("run before every commit that
touches a precached file"), but `.github/workflows/cache-version-guard.yml` also runs on every
push to `main`, detects a missed bump, and auto-commits the fix.

**Context**: Forgetting the manual bump has actually happened twice in this project's history
(see `git log`: "Bump CACHE_VERSION — about.html change (21e2edb) shipped without it"), and a
missed bump means already-installed users never discover a shipped fix.

**Why**: Documentation and a convenient script are not suffient on their own — they rely on
someone remembering to run them. A CI guard makes the failure mode "auto-corrected before it
reaches users" instead of "silently wrong until someone notices," without removing the manual
script (still the faster, intentional path for a normal commit).

**Trade-off accepted**: A missed bump now costs an extra auto-commit (authored by
`github-actions[bot]`) on `main` after the fact, rather than being prevented at commit time;
CI has `contents: write` permission to push directly to `main`, which is a meaningful
permission grant to a workflow (scoped narrowly to this one corrective action).

**Evidence**: `.github/workflows/cache-version-guard.yml` header comment; `dev/bump_cache.js`
and `dev/check_cache_version.js`; git log entries `7934843`, `de59954`, `812adee`.

---

## D13. Village list and service catalogue centralized in one file each, not duplicated per page

**Decision**: `KRISHIOX_SERVICES` and `KRISHIOX_VILLAGES` are defined once and read by Home,
Services, and Booking (services), and by Booking alone (villages).

**Context**: Three different pages need to render largely the same service data in different
layouts (a 6-item quick grid, a full catalogue, a selectable wizard grid).

**Why**: A single source of truth means adding/removing/relabeling a service is a one-file
edit that automatically propagates everywhere, instead of three (or more) places needing
manual, error-prone synchronization.

**Trade-off accepted**: None significant — this is a straightforward DRY win with no real
downside given the project's scale.

**Evidence**: README.md §"Configuration"; `js/services.js`, `js/villages.js`; consuming code in
`index.html`, `services.html` (inferred from shared reads), `js/booking.js`
`renderServiceGrid()`/`renderVillageStep()`.

---

## D14. Rotate-to-portrait overlay as a CSS/JS fallback, not a reliance on manifest orientation lock

**Decision**: `manifest.json` declares `orientation: portrait-primary`, but `js/ui.js` also
renders a full-screen "please rotate your phone" overlay via `renderRotateOverlay()`.

**Context**: The manifest's orientation lock only applies once installed to an Android home
screen (standalone display mode); iOS Safari never honors it, even installed.

**Why**: The booking wizard's layout is designed for portrait; without a fallback, a
landscape-rotated phone (any iOS user, or anyone using the app in a normal browser tab rather
than installed) would see a broken/unintended layout instead of a clear prompt to rotate back.

**Trade-off accepted**: One more overlay component to maintain; relies on a touch-device media
query rather than a JS orientation API, so it can't distinguish "tablet where landscape might
be fine" from "phone where it isn't" beyond whatever the media query captures.

**Evidence**: `js/ui.js` `renderRotateOverlay()` inline comment; `manifest.json`
`"orientation": "portrait-primary"`.

---

## D15. Booking submission split into an explicit pipeline with a Delivery Adapter contract

**Decision**: `confirmBooking()` no longer builds a WhatsApp message and opens a `wa.me` link
inline. It now calls `submitBooking(state)` (`js/booking/engine.js`), which runs Booking Object
construction → Validation → Serialization → Delivery Adapter as four separate files, and the
WhatsApp-specific part of that (`js/booking/whatsapp-delivery-adapter.js`) implements a small
`DeliveryAdapter` contract (`js/booking/delivery-adapter.js`) rather than being hardcoded into
the pipeline.

**Context**: The only delivery channel KrishiOx has ever used is WhatsApp, and that isn't
changing today. But "the architecture must allow future adapters" (REST API, SMS, Email,
WhatsApp Cloud API, Push Notification) was an explicit requirement, without actually building
any of them yet.

**Why**: Before this, "turn a booking into a message" and "send it over WhatsApp" were the same
few lines of code — there was no seam where a second channel could attach without editing the
function that also handles WhatsApp. Separating Object/Validation/Serialization from Delivery
means a future adapter is a new file implementing one method (`deliver(payload)`), passed to
`submitBooking()` — it doesn't require touching the wizard, the model, the validator, or the
serializer, and it doesn't require the WhatsApp adapter to change either.

**Trade-off accepted**: Six small files (`js/booking/model.js`, `validator.js`, `serializer.js`,
`delivery-adapter.js`, `whatsapp-delivery-adapter.js`, `engine.js`) instead of one function —
more files to navigate for what is, today, still a single-channel flow. Justified here because
the multi-channel requirement was explicit and immediate, not speculative; see D16 for a related
piece of duplication this split introduced on purpose.

**Evidence**: `js/booking/engine.js`, `js/booking/delivery-adapter.js`; ARCHITECTURE.md §5
"Booking engine" subsection; DATA_FLOW.md §2.

---

## D16. `validateBooking()` duplicates `validStep()` rather than sharing an implementation

**Decision**: `js/booking/validator.js`'s `validateBooking()` re-implements the same field
rules as `js/booking.js`'s `validStep()` (service selected, village non-empty, quantity/other
details present, date set, name non-empty, phone empty-or-10-digits), instead of both calling
one shared rules function.

**Context**: Both functions are, in some sense, "checking whether the booking data is valid" —
sharing one implementation would be the obvious DRY move.

**Why**: They answer different questions at different layers. `validStep()` answers "can the
wizard's Next button advance past *this one step right now*" — it's UX gating, evaluated
step-by-step against live, possibly-incomplete `state` as the farmer types. `validateBooking()`
answers "is this *finished* Booking Object safe to serialize and deliver" — a domain-boundary
check against a fully-assembled object, structurally unable to run mid-step since `Booking`
objects don't exist until `createBooking()` runs on submit. Forcing them through one shared
function would mean designing a rules format flexible enough for both a single-field, per-step
UX check and a whole-object domain check — more indirection than either caller actually needs
today, for a "shared" implementation that would still need step-aware and object-aware code
paths internally.

**Trade-off accepted**: The two rule sets must be kept in sync by hand if a validation rule
ever changes (e.g. phone number length) — flagged explicitly in ARCHITECTURE.md §11 (Technical
debt, item 10) rather than left as a silent trap.

**Evidence**: `js/booking.js` `validStep()`; `js/booking/validator.js` `validateBooking()`;
ARCHITECTURE.md §11 item 10.

---

## Open / not-yet-decided (flagged, not resolved, by this document)

These are gaps observed in the codebase where no explicit decision record exists — surfaced
here for visibility, not acted on:

- **Internationalization beyond Hindi/English mix**: strings are inline literals, not a
  lookup table; adding a third language would be a new architectural layer, not a
  configuration change.
- **`--text-zoom` via CSS `zoom`**: no documented decision about the Firefox gap (see
  ARCHITECTURE.md §11 item 5) — it's unclear whether this was an accepted trade-off or an
  unnoticed gap.
- **No automated test suite**: no ADR-style note explaining why (likely just project stage/
  size), but worth a deliberate decision — even a lightweight smoke test for `booking.js`'s
  state machine — before the wizard grows more complex.

---

Related documents: [ARCHITECTURE.md](ARCHITECTURE.md), [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md),
[COMPONENTS.md](COMPONENTS.md), [DATA_FLOW.md](DATA_FLOW.md).
