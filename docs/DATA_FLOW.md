# DATA_FLOW.md — KrishiOx

> Documentation-only artifact tracing how data and control actually move through the app, as
> implemented today. No behavior was changed to produce this document.

## 1. Navigation flow

There is no client-side router — every link is a plain `<a href="page.html">`, and every page
load is a real HTTP navigation (intercepted opportunistically by the service worker, see §5).

```
                     ┌─────────┐
        ┌───────────▶│  index  │◀───────────┐
        │            └────┬────┘             │
        │                 │                   │
        │     ┌───────────┼────────────┐      │
        │     ▼           ▼            ▼      │
        │ services.html booking.html partners.html
        │     │           │            │      │
        │     └─────┐     │      ┌─────┘      │
        │           ▼     ▼      ▼             │
        │         about.html  contact.html     │
        │                        │             │
        │            ┌───────────┴──────┐      │
        │            ▼                  ▼      │
        │        terms.html        privacy.html│
        │                                       │
        └───────────────────────────────────────┘
   (bottom nav + footer links are present on every page and link back to
    Home/Services/Booking/Partners/Contact/Terms/Privacy — full mesh, not a tree)
```

`currentPageKey()` in `main.js` maps the current `pathname` to a key used to highlight the
active bottom-nav item and footer link — it recognizes `index.html` (and empty path, i.e. the
domain root), `services.html`, `booking.html`, `partners.html`, `about.html`, `contact.html`,
`terms.html`, `privacy.html`. Any unrecognized path defaults to highlighting "home".

**Deep-linking into booking**: `index.html`'s quick-service cards and `services.html` link to
`booking.html?service=<id>` — `booking.js`'s `initFromQuery()` reads the `service` query param
on load, pre-selects that service, and skips straight to wizard step 2 (see §2).

## 2. Booking flow (the core user journey)

### 2.1 Sequence

```
Farmer taps a service card (Home/Services)         Farmer taps "बुक करें" (bottom nav)
        │  or a "बुक करें" CTA                              │
        ▼                                                    ▼
  booking.html?service=<id>                            booking.html (no query)
        │                                                    │
        ▼                                                    ▼
  initFromQuery() finds service                    restoreDraftIfAny() checks
  → state.serviceId = id, state.step = 2           localStorage for an in-progress
  → clearDraft() (fresh start wins over             draft (step > 1)
    any stale draft)                                       │
        │                                          found ──┴── not found
        │                                            │             │
        │                                            ▼             ▼
        │                                     restore state    state.step = 1
        │                                     from draft,       (fresh wizard)
        │                                     toast "पिछली
        │                                     अधूरी बुकिंग
        │                                     वापस लाई गई है"
        │                                            │             │
        └────────────────────┬───────────────────────┴─────────────┘
                              ▼
                    renderProgress() + showStep(state.step)
                    + renderCurrentStepContent()
                              │
   ┌──────────────────────────┴──────────────────────────────────────┐
   ▼                                                                   │
STEP 1: Service (skip if pre-filled)                                  │
  tap a card → state.serviceId set → saveDraft() → auto-advance        │
  (setTimeout 220ms, so the "selected" state is visible first)         │
   │                                                                   │
   ▼                                                                   │
STEP 2: Village                                                       │
  free-text input (autocomplete <datalist>) OR tap a chip              │
  → state.village set on every keystroke/tap → saveDraft()             │
   │                                                                   │
   ▼                                                                   │
STEP 3: Quantity or Other-details                                     │
  normal service: +/− stepper, state.qty (min 1, max 999)              │
  service = "other": textarea instead, state.otherDetails              │
  → saveDraft() on every change                                       │
   │                                                                   │
   ▼                                                                   │
STEP 4: Date                                                          │
  quick-date chip (आज/कल/2 दिन बाद/अगले सप्ताह) OR native date picker    │
  → state.date (ISO) + state.dateLabel (Hindi-formatted) → saveDraft() │
   │                                                                   │
   ▼                                                                   │
STEP 5: Remarks + contact                                             │
  name (required), phone (optional, digits-only, max 10),              │
  free-text remarks (optional) → saveDraft() on every change            │
   │                                                                   │
   ▼                                                                   │
STEP 6: Confirm — renderSummary() builds an editable review;           │
  each row's "बदलें" link calls goToStep(N) to jump back and fix it     │
   │                                                                   │
   ▼                                                                   │
"WhatsApp पर बुक करें" tapped → goNext() sees step === TOTAL_STEPS       │
  → confirmBooking()                                                  ◀┘
```

At every step, `goNext()` first calls `validStep(state.step)` — if invalid, it shows a toast
("कृपया आवश्यक जानकारी भरें") and does not advance. `updateNextButtonState()` also
proactively disables the Next button whenever the current step's validity check fails, so the
farmer generally can't reach an invalid Next tap in the first place; the toast path exists as
a backstop for the auto-advance timer on step 1.

### 2.2 `confirmBooking()` — what happens on the final tap

As of the booking engine refactor (see ARCHITECTURE.md §5 "Booking engine" subsection and
DECISIONS.md §D15), `confirmBooking()` (`js/booking.js`) no longer builds the WhatsApp message
or link itself — it delegates to `submitBooking()` (`js/booking/engine.js`) and reacts to the
result:

```js
// js/booking.js confirmBooking() (paraphrased, not verbatim)
1. submitBooking(state)                 → runs the full engine pipeline (js/booking/engine.js):
     a. createBooking(state)              → Booking Object     (js/booking/model.js)
     b. validateBooking(booking)          → Validation          (js/booking/validator.js)
        — should always pass here; the wizard's own validStep() already gated every
          field before the farmer could reach this step (see §2.1)
     c. serializeBooking(booking)         → BookingPayload {text, fields} (js/booking/serializer.js)
        — `text` is the same Hindi message KrishiOx has always sent
     d. deliverBooking(adapter, payload)  → Delivery Adapter    (js/booking/delivery-adapter.js)
        — defaults to whatsappDeliveryAdapter (js/booking/whatsapp-delivery-adapter.js):
          builds "https://wa.me/<KRISHIOX_CONFIG.whatsappNumber>?text=<encoded text>"
          and calls window.open(url, "_blank") — this is where WhatsApp actually opens
2. Populate the success screen using result.payload.text (copy-message handler) and
   result.delivery.url (WhatsApp button href/label)
3. Hide #wizardWrap, show #successWrap
4. Append a compact record {service, village, date, ts} to KrishiOxStore's
   "bookingHistory" (capped at 20 entries, most-recent-first)
5. clearDraft()  — the in-progress draft is deleted now that it's "done"
```

No network request is made to any KrishiOx-controlled server at any point in this sequence —
the "submission" *is* step 1d, and it's the farmer's own browser/WhatsApp client that sends the
message, from the farmer's own WhatsApp account. The only change from before the engine
refactor is *when* `window.open()` fires relative to the success-screen DOM updates (now
first, inside step 1d, instead of last) — both happen in the same synchronous tick, so there is
no observable difference to the farmer.

### 2.3 Draft persistence detail

`saveDraft()` writes the *entire* `state` object to `localStorage` under
`krishiox:bookingDraft` (via `KrishiOxStore.set`) after essentially every field change. This
means:
- A dropped connection, killed tab, or accidental navigation away from `booking.html` does not
  lose progress — `restoreDraftIfAny()` picks it back up on return, as long as `state.step` in
  the saved draft is `> 1` (a draft that never left step 1 is not considered worth restoring).
- Starting a *new* booking via a `?service=` deep link intentionally discards any old draft
  (`clearDraft()` in `initFromQuery()`'s caller) — a fresh, explicit intent always wins over a
  stale abandoned one.
- A successful booking also discards the draft, so returning to `booking.html` afterward starts
  clean rather than replaying the just-submitted booking.

## 3. WhatsApp integration flow

KrishiOx has exactly one integration point with an external system: the `wa.me` deep link.
There is no WhatsApp Business API, no webhook, no server-side message sending — every
WhatsApp touchpoint is a client-side generated URL of the form:

```
https://wa.me/<whatsappNumber>?text=<URL-encoded message>
```

built by the single shared helper `buildWhatsAppLink(message)` in `js/whatsapp.js`, which reads
`KRISHIOX_CONFIG.whatsappNumber`. Three call sites use it directly; the booking wizard reaches
it indirectly through the booking engine's WhatsApp delivery adapter (see below).

**Every call site**, and the message each one pre-fills:

| Trigger | File | Message content |
|---|---|---|
| Home hero WhatsApp icon | `index.html` inline script | Generic "मुझे खेती सेवा बुक करनी है" (I want to book a farming service) |
| Global floating WhatsApp button (FAB) | `js/ui.js` `renderFab()` | Generic "मुझे खेती सेवा के बारे में जानकारी चाहिए" (I want information about farming services) |
| Contact page WhatsApp row | `contact.html` inline script | Generic "मुझे सहायता चाहिए" (I need help) |
| Booking wizard confirm | `js/booking.js` `confirmBooking()` → `submitBooking()` (`js/booking/engine.js`) → `serializeBooking()` builds the text → `whatsappDeliveryAdapter.deliver()` (`js/booking/whatsapp-delivery-adapter.js`) calls `buildWhatsAppLink()` | **Structured** booking details: service (Hindi + English), village, quantity+unit (or free-text "other" details), date, name, phone, remarks — each on its own labeled/emoji-prefixed line |

Tapping any of these opens the link with `target="_blank" rel="noopener"` (or, for the
booking wizard, an explicit `window.open(link, "_blank")` call made inside the WhatsApp
delivery adapter) — the OS/browser then hands off to the installed WhatsApp app if present, or
`web.whatsapp.com` otherwise. From that point on, KrishiOx has no further visibility into the
conversation — replies, confirmation, and any back-and-forth happen entirely inside WhatsApp,
between the farmer's number and `KRISHIOX_CONFIG.whatsappNumber` (a human-staffed business
number).

**Message text escaping**: `serializeBooking()` (`js/booking/serializer.js`) interpolates
farmer-provided free text (village, otherDetails, name, remarks) directly into the message
string, which is then passed through `encodeURIComponent` when `buildWhatsAppLink()` builds the
URL — this is correct for URL-safety, but note it means the raw text (including any
WhatsApp-formatting-significant characters like `*` or `_`) reaches WhatsApp verbatim; there is
no sanitization beyond URL encoding. This is unchanged from before the booking engine
refactor — only which file performs the interpolation moved.

## 4. Consent flow

```
Page loads → DOMContentLoaded → initConsentBanner()
        │
        ▼
  stored = KrishiOxStore.get("legalConsent", null)
        │
   ┌────┴─────────────────────────────┐
   │ stored.version ===                │ stored is null, OR
   │ KRISHIOX_CONFIG.legalVersion       │ stored.version !== current legalVersion
   ▼                                    ▼
 return (no banner)               Show banner
                                   - stored===null → "first time" copy
                                   - stored.version mismatch → "policy updated,
                                     please re-review" copy
                                        │
                                        ▼
                          Farmer taps "मैं सहमत हूँ" (I agree)
                                        │
                                        ▼
                    KrishiOxStore.set("legalConsent",
                      { version: KRISHIOX_CONFIG.legalVersion, ts: Date.now() })
                                        │
                                        ▼
                                 banner.remove()
```

This is explicitly **not** a cookie-consent banner (the app sets no cookies — CSP alone would
block most third-party cookie mechanisms anyway). It governs re-consent to Terms/Privacy, keyed
off a single version string (`KRISHIOX_CONFIG.legalVersion`) that must be bumped by hand
whenever `terms.html` or `privacy.html` changes materially. See DECISIONS.md for why this
exists instead of a generic cookie banner.

## 5. PWA install & update flow

### 5.1 Install

```
Browser fires `beforeinstallprompt` (Chromium/Android only)
        │
        ▼
main.js: e.preventDefault(); deferredInstallPrompt = e;
         show #installBtn in the header
        │
        ▼
Farmer taps install button
        │
        ▼
deferredInstallPrompt.prompt() → native OS install dialog
        │
        ▼
userChoice resolves → deferredInstallPrompt = null, hide button
(installed or dismissed — app doesn't distinguish further)
```

iOS Safari and Firefox never fire `beforeinstallprompt`, so `#installBtn` simply never
appears there; those users install manually via the browser's own "Add to Home Screen" share
action, which KrishiOx has no hook into.

### 5.2 Service worker registration

```
initServiceWorker() runs immediately (not gated on DOMContentLoaded, but the actual
register() call is inside a window "load" listener)
        │
        ▼
navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })
        │                          ↑ forces the browser to always re-fetch sw.js
        │                            from the network on update checks, bypassing
        │                            GitHub Pages' 10-minute HTTP cache
        ▼
watchForUpdates(reg) — attaches listeners for both:
  (a) a worker already waiting (updatefound fired before this page loaded)
  (b) a new "updatefound" event on this page's registration
        │
        ▼
document "visibilitychange" listener: whenever the tab becomes visible again,
  reg.update() is called — catches updates missed while the app was backgrounded
```

### 5.3 Update detection → tap-to-update → reload

```
New sw.js deployed (CACHE_VERSION bumped) on the server
        │
        ▼
Browser's own update check (native, throttled ~24h) OR the app's own
  reg.update() call on visibilitychange detects a change
        │
        ▼
New worker starts installing → precaches full APP_SHELL in the background
  (does NOT call skipWaiting() — see sw.js's own install handler)
        │
        ▼
"statechange" → newWorker.state === "installed" AND there's already an
  active controller (i.e. this isn't the very first-ever install)
        │
        ▼
showUpdateIcon(reg) → updateRegistration = reg; #updateBtn becomes visible
  in the header (also mirrored by the footer's "नवीनतम अपडेट जांचें" button,
  which reuses updateRegistration rather than triggering its own reload path)
        │
        ▼
Farmer taps the header update icon
        │
        ▼
updateRegistration.waiting.postMessage("SKIP_WAITING")
        │
        ▼
sw.js's message listener calls self.skipWaiting()
        │
        ▼
New worker activates → deletes old-versioned caches → clients.claim()
        │
        ▼
"controllerchange" fires on the page → (guarded by `hadController` so this
  never fires on a brand-new first-ever install) →
  sessionStorage["krishiox:justUpdated"] = "1" → window.location.reload()
        │
        ▼
Page reloads with the new version → notifyIfJustUpdated() on next boot reads
  and clears that sessionStorage flag → toast "KrishiOx अपडेट हो गया है ✓"
```

The entire point of this two-phase (install-then-wait, then explicit
tap-to-activate) design is that a farmer mid-way through the booking wizard is never
force-reloaded out from under themselves — see DECISIONS.md.

## 6. Offline / navigation request flow (inside the service worker)

```
fetch event (GET only — non-GET requests are ignored, event.respondWith not called)
        │
   is it a navigation request (req.mode === "navigate")?
        │
   ┌────┴────┐
   │ yes      │ no
   ▼          ▼
Race:                              Cache-first:
 networkPromise (cache:"no-store")   cached = caches.match(req)
   vs.                                fetchPromise updates cache in background
 timeoutPromise (4000ms)              respond with cached ?? fetchPromise
   │
   ▼
network wins (faster than 4s) → respond with fresh page, cache it for next time
   │
timeout wins (network slower, e.g. rural 2G) → serve cached page immediately
   if present; the network fetch keeps running and still updates the cache
   │
both cache miss AND network failure → caches.match("./offline.html")
```

## 7. Data-at-rest summary (what's stored, where, and why)

All persistent client-side state lives in `localStorage`, namespaced under the `krishiox:`
prefix by `KrishiOxStore`. No first-party cookies, no IndexedDB, no server-side storage of
any kind.

| Key (after `krishiox:` prefix) | Written by | Contains | Cleared by |
|---|---|---|---|
| `bookingDraft` | `booking.js` `saveDraft()` | In-progress wizard `state` object | `clearDraft()` (on new deep-linked booking, or on successful submit), or "Clear my data" |
| `bookingHistory` | `booking.js` `confirmBooking()` | Array of up to 20 `{service, village, date, ts}` records | "Clear my data" only |
| `textZoom` | `main.js` `initTextSize()` | One of `1`, `1.15`, `1.3` | "Clear my data" (resets to `1`) |
| `legalConsent` | `main.js` `initConsentBanner()` | `{version, ts}` | "Clear my data" |

`clearAllKrishiOxData()` (called from `privacy.html`'s "Clear my data" button) removes exactly
these four keys — an explicit list rather than a blanket `localStorage.clear()`, so it stays
auditable against what the Privacy Policy claims it deletes (see DECISIONS.md).

The service worker's Cache Storage (`STATIC_CACHE`, i.e. `krishiox-v5-static` at the time of
writing) is a separate storage mechanism, holding cached HTTP responses for offline use — not
covered by "Clear my data", since it holds no personal information, only static assets.

---

Related documents: [ARCHITECTURE.md](ARCHITECTURE.md), [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md),
[COMPONENTS.md](COMPONENTS.md), [DECISIONS.md](DECISIONS.md).
