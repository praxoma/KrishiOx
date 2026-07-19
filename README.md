# KrishiOx 🌾

**खेती की सेवाएँ, समय पर बुकिंग.**
A mobile-first Progressive Web App for scheduling farming services (tractor, rotavator, cultivator,
laser leveller, harvesting, mini loader, tractor trolley, transport, irrigation, farm labour, and more)
in and around **Saharanpur, Uttar Pradesh** — advance booking, not on-demand dispatch.

No login. No payment. No app-store install required. Farmers pick a service, fill a short
Hindi-first wizard, and confirm the booking with **one tap into WhatsApp** via a pre-filled
`wa.me` message.

---

## ✨ Highlights

- **Pure HTML / CSS / vanilla JS** — zero frameworks, zero build step, zero external dependencies.
- **Hindi-first UI** with common English farming terms kept alongside (e.g. "रोटावेटर (Rotavator)").
- **BioRawNex premium theme** — Charcoal `#111827`, Copper `#8B5A2B`, Biomass Gold `#D9A441`,
  Ivory `#F7F5F2`, WhatsApp green for booking CTAs.
- **6-step booking wizard** designed to minimize typing: large tap targets, quick-select chips,
  quantity steppers, and date shortcuts (आज / कल / अगले सप्ताह).
- **WhatsApp-native confirmation** — no backend, no database; every booking becomes a structured,
  pre-filled WhatsApp message sent from the farmer's own number.
- **Installable PWA** — manifest + service worker, works offline for previously visited pages,
  "Add to Home Screen" support on Android & iOS.
- **GitHub Pages ready** — fully static, relative paths, deploy by pushing to a repo.

---

## 📚 Documentation

Deeper architectural docs live in [`docs/`](docs/):

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — system overview, HTML/CSS/JS/PWA/service-worker design, tech debt
- [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) — folder layout and "what lives where"
- [COMPONENTS.md](docs/COMPONENTS.md) — UI component inventory
- [DATA_FLOW.md](docs/DATA_FLOW.md) — navigation, booking, WhatsApp, and update sequences
- [DECISIONS.md](docs/DECISIONS.md) — why things are built the way they are
- [DOMAIN_MODEL.md](docs/DOMAIN_MODEL.md) — conceptual domain model for future backend evolution
- [COMPATIBILITY_REPORT.md](docs/COMPATIBILITY_REPORT.md) — Safari/Chrome/Firefox/Edge cross-browser review
- [ACCESSIBILITY.md](docs/ACCESSIBILITY.md) — accessibility audit (semantic HTML, ARIA, keyboard, contrast, headings)
- [PERFORMANCE.md](docs/PERFORMANCE.md) — performance review (JS/CSS loading, caching, PWA precaching, critical rendering path)

---

## 📁 Project structure

```
krishiox/
├── index.html            # Home
├── services.html         # Full service catalogue
├── booking.html           # 6-step booking wizard
├── partners.html          # Equipment owner / fleet partner onboarding
├── about.html              # Mission, values, roadmap
├── contact.html            # WhatsApp / call / FAQ
├── terms.html              # Terms & Conditions
├── privacy.html            # Privacy Policy + "clear my data" control
├── offline.html            # Offline fallback page (served by the service worker)
├── manifest.json           # PWA manifest (icons, shortcuts, theme)
├── sw.js                   # Service worker — app-shell caching + offline support
├── css/
│   └── style.css           # Full design system (tokens, components, layout)
├── js/
│   ├── branding.js          # Brand identity (appName, brandInitials, appTagline)
│   ├── contact.js           # WhatsApp/call numbers, support hours, legal contact email
│   ├── regions.js           # Service-area label
│   ├── services.js          # Service catalogue
│   ├── villages.js          # Village suggestion list
│   ├── app.js                # Composes branding/contact/regions into KRISHIOX_CONFIG
│   ├── storage.js            # localStorage wrapper
│   ├── icons.js               # Inline SVG icon library
│   ├── whatsapp.js             # wa.me deep-link builder
│   ├── navigation.js            # Page identity + bottom nav
│   ├── utils.js                  # Generic helpers (date formatting, clipboard, escaping)
│   ├── ui.js                      # Shared UI chrome (header, footer, FAB, toast, consent, ...)
│   ├── pwa.js                      # Service-worker registration, update handoff, install prompt
│   ├── main.js                      # App bootstrap — composition root, boot sequence
│   └── booking.js                    # Booking wizard state machine & WhatsApp message builder
├── icons/                   # Generated PWA icons (192/512, maskable, apple-touch, favicons)
├── robots.txt               # Crawler rules + sitemap pointer
├── sitemap.xml              # Indexable pages, for Google Search Console
├── CNAME                    # Only present once a custom domain is configured (see below)
└── dev/
    ├── generate_icons.py    # One-off Python/Pillow script used to generate icons/ (not needed at runtime)
    └── rebrand.js           # Renames the platform / switches domain everywhere in one command (not needed at runtime)
```

---

## 🚀 Deploy to GitHub Pages

### Right now — no domain, no name decided yet

This works today, for free, with nothing to buy or configure:

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In **Settings → Pages**, set the source to your default branch, folder `/root`.
3. Your app is live at `https://<username>.github.io/<repo>/` within a minute — e.g. this project
   is currently live at `https://krishiox.in/`.

Because every asset reference uses **relative paths** (`css/style.css`, `js/main.js`,
`icons/icon-192.png`, etc.), the site works correctly whether it's served at a domain root or
inside a GitHub Pages sub-path — no path rewriting needed either way.

> **Note:** GitHub Pages serves over HTTPS, which is required for service workers and the
> "Add to Home Screen" install prompt to function — both already work on the free `github.io` URL.

**While you're testing, every page ships a temporary `<meta name="robots" content="noindex, follow">`**
(look for the `TEMP` comment right above it in each `<head>`). This stops Google from indexing the
throwaway `github.io` URL and later treating it as duplicate content once the real domain goes
live. Leave it in until you're ready to actually launch — see "Going live" below.

### Renaming the platform or changing the domain

Everything JS-rendered (header, footer, WhatsApp message text, toasts) already reads the brand
name from `js/branding.js` — edit `appName` / `brandInitials` there and it updates everywhere
at runtime, no other file needed.

What JS *can't* safely drive is the static SEO surface: `<title>`, meta description, canonical
URL, Open Graph/Twitter tags, JSON-LD, and `manifest.json`. Those have to be real static text —
WhatsApp/Facebook/Twitter link-preview bots and some crawlers don't execute JavaScript, so
JS-injecting them would make link previews and search snippets break. `dev/rebrand.js` is a
zero-dependency Node script (no `npm install` needed) that updates all of that in one command:

```bash
# See what's currently configured
node dev/rebrand.js --status

# Rename the platform everywhere (titles, OG tags, JSON-LD, manifest.json, branding.js, README, ...)
node dev/rebrand.js --name "AgriSetu" --initials "AS"

# Still testing, no domain yet — point every URL at your GitHub Pages address
node dev/rebrand.js --github-pages yourGithubUser/your-repo

# Once you've bought a domain and pointed DNS at it — see "Custom domain" below
node dev/rebrand.js --domain example.in

# Flags combine — do it all in one shot:
node dev/rebrand.js --name "AgriSetu" --initials "AS" --domain agrisetu.in
```

Run `git diff` afterward to review exactly what changed before committing.

### 🌐 Custom domain (once one is bought)

1. At your domain registrar, add DNS records for the apex domain pointing to GitHub Pages:
   - Four `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - (Optional) a `CNAME` record for `www` → `<username>.github.io`, if you also want `www.<domain>` to work
2. Run `node dev/rebrand.js --domain yourdomain.com` — this writes the `CNAME` file GitHub Pages
   needs and repoints every canonical/OG/sitemap/robots URL in one go.
3. In **Settings → Pages**, set the custom domain to `yourdomain.com` and wait for DNS to verify.
4. Enable **Enforce HTTPS** once the certificate is issued (can take a few hours after DNS propagates).

### Going live (removing the noindex safety net)

Once the final name + domain are actually live and you *want* Google to index the site:

```bash
node dev/rebrand.js --go-live
```

This strips the temporary `noindex` tag (and its marker comment) from every page. Then submit the
site in Google Search Console (see SEO section below).

---

## 🔍 SEO (Saharanpur, Roorkee, Nakur, Gangoh, Bandukheri, Rampur region)

Every page has a unique `<title>`, meta description, canonical URL, and Open Graph / Twitter Card
tags naming the service area. `index.html` also carries a `Service` JSON-LD block (`areaServed` +
full service catalogue) and `contact.html` carries `FAQPage` JSON-LD matching its visible FAQ —
both are eligible for rich results in Google Search.

- `js/villages.js` → `KRISHIOX_VILLAGES` is the single source of truth for the area list
  (datalist suggestions in the booking wizard, and the text used across About/Contact copy).
  Add new towns there first.
- `robots.txt` + `sitemap.xml` (repo root) list all indexable pages; `offline.html` is marked
  `noindex` permanently since it's just the service-worker fallback shell, not real content. The
  other 8 pages carry a *temporary* `noindex` too, until you run `--go-live` (see above).
- Once live for real, add the site in **Google Search Console**, verify ownership, and submit
  `sitemap.xml` so pages get crawled.
- Internal technical identifiers — the `localStorage` key prefix (`krishiox:`, in `KrishiOxStore`)
  and the service worker's `CACHE_VERSION` — were renamed along with the brand during the
  GOSPOLO → KrishiOx rebrand, on purpose, so no trace of the old name remained anywhere in the
  codebase. The tradeoff: this orphans any returning user's already-saved booking draft/history,
  text-size preference, and consent record from before the rebrand (their data isn't deleted, it's
  just unreachable under the new key prefix). That was an acceptable one-time cost pre-launch. For
  any *future* rename, once there's real user data at stake, keep these two identifiers stable
  instead — they're plumbing, not user-facing branding, and stability here means a later rename
  never silently drops a returning user's saved state.

---

## ⚖️ Legal, consent, and data handling

`terms.html` and `privacy.html` are written to match how this app actually works — no backend, no
login, no payments, no cookies or analytics; booking details become a WhatsApp message sent from
the farmer's own number, and a few things (in-progress booking draft, recent history, text-size
preference, consent record) are saved only in the browser's local storage. **Have both reviewed by
a qualified lawyer before a real public launch** — they're a solid starting template, not legal
advice.

- **Not a cookie banner.** This app sets zero cookies (verified — grep for `document.cookie` comes
  back empty), so the consent banner in `js/ui.js` (`initConsentBanner`) is honestly scoped to
  what's real: local storage usage and the WhatsApp hand-off, with links to the full policies.
  Building a generic "we use cookies" banner here would itself be a compliance problem — it'd be
  false.
- **Versioned re-consent.** `KRISHIOX_CONFIG.legalVersion` (in `js/app.js`) is the single source
  of truth. Bump it whenever `terms.html` or `privacy.html` changes materially — anyone whose saved
  consent doesn't match the current version sees the banner again automatically, with different
  copy ("policy updated" vs. first-time), instead of a stale acceptance silently carrying forward.
- **"Clear my data"** on `privacy.html` removes exactly the keys the Privacy Policy says it does
  (`clearAllKrishiOxData()` in `js/ui.js`) — an explicit list, not a blanket `localStorage.clear()`,
  so it stays auditable against what the page actually claims.
- **Before real launch**, fill in `KRISHIOX_CONFIG.legalContactEmail` with a real, monitored inbox —
  it's shown on both legal pages and is expected for grievance redressal under India's Digital
  Personal Data Protection Act, 2023.
- `dev/rebrand.js` already includes `terms.html` and `privacy.html` in its file list, so a rename
  updates the brand name there too.

---

## ⚙️ Configuration

Deployment-specific values are split by concern across small files under `js/`, each with one
job, and composed back together where the rest of the app still expects a single object — see
`js/app.js`'s file-header comment for the full loading model. Quick map:

| File | Holds |
|---|---|
| `js/branding.js` | `appName`, `brandInitials`, `appTagline` |
| `js/contact.js` | `whatsappNumber`, `callNumber`, `supportHours`, `legalContactEmail` |
| `js/regions.js` | `serviceArea` |
| `js/services.js` | `KRISHIOX_SERVICES` — the service catalogue |
| `js/villages.js` | `KRISHIOX_VILLAGES` — the village/area suggestion list |
| `js/app.js` | Composes the three grouped objects above (plus `legalVersion`, which lives here) into `KRISHIOX_CONFIG` — the same merged shape every other module reads |

**Update `whatsappNumber` and `callNumber` in `js/contact.js` before going live.**

`KRISHIOX_SERVICES` and `KRISHIOX_VILLAGES` — add, remove, or relabel entries directly in
`services.js` / `villages.js`; every page (Home, Services, Booking) reads from these as the
single source of truth. Everything else (header, footer, WhatsApp helpers, the consent banner)
reads the merged `KRISHIOX_CONFIG` from `js/app.js`, exactly as it did when all of this lived
in one `config.js` file.

---

## 🧭 Booking flow (UX rationale)

Designed for **Hindi-speaking farmers with basic smartphone literacy**, so the wizard leans on
tapping over typing wherever possible:

1. **सेवा (Service)** — large icon cards, tap to auto-advance.
2. **गाँव (Village)** — free-text with autocomplete `<datalist>` + one-tap chips for nearby villages.
3. **मात्रा (Quantity/Area)** — a stepper (+ / −) instead of a numeric keyboard; unit label adapts
   to the chosen service (एकड़, घंटे, ट्रिप, किलोमीटर, व्यक्ति). "अन्य सेवा" swaps this for a short
   free-text description instead.
4. **तारीख (Date)** — quick chips (आज / कल / 2 दिन बाद / अगले सप्ताह) plus a native date picker.
5. **टिप्पणी (Remarks)** — optional name, optional 10-digit mobile number, optional free-text note.
6. **पुष्टि (Confirm)** — an editable summary; tapping **"WhatsApp पर बुक करें"** builds a structured
   Hindi message and opens `https://wa.me/<number>?text=<encoded message>` in a new tab/WhatsApp app.

No booking data is sent to any server — the entire flow runs client-side, and the "confirmation"
*is* the WhatsApp message itself, sent from the farmer's own number so the vendor can call back
directly.

---

## 🔌 Offline support

`sw.js` precaches the full app shell (all pages, CSS, JS, icons) on first visit. Subsequent
visits — including with no signal — will serve cached pages instantly; any page that isn't yet
cached falls back to `offline.html`. Cache busting is controlled by bumping `CACHE_VERSION` in
`sw.js` on each deploy.

**Before every commit that touches any HTML page, `css/style.css`, or any `js/*.js` file**, run:

```bash
node dev/bump_cache.js
```

This increments `CACHE_VERSION` in `sw.js` (e.g. `krishiox-v2` -> `krishiox-v3`). Skipping this is
the single most common way to ship a fix that returning users don't actually see — without a
version bump, an already-installed service worker keeps its cache-first strategy serving the old
file, and a real user has no easy way to force a refresh the way you can with your own browser's
dev tools. `js/main.js` already auto-detects the new `CACHE_VERSION` on a returning user's next
app-foreground and reloads them onto it automatically — the bump is what makes that mechanism
have something new to find.

**This step has already been forgotten twice** (a real commit shipped a page change with no
version bump, so no browser ever found out), so it's no longer just a documented convention —
`.github/workflows/cache-version-guard.yml` runs on every push to `main`, checks whether any
precached file changed without `CACHE_VERSION` moving alongside it, and if so auto-commits the
bump itself and pushes it. It's a safety net, not a replacement for running the script yourself —
it just means forgetting no longer silently ships a stale site.

---

## 🔭 Built for future expansion

The codebase intentionally keeps a clean separation so these can be layered in without a rewrite:

| Feature | Where it plugs in |
|---|---|
| **Vendor dashboard** | New `vendor/` section; `js/services.js`'s service catalogue is already data-driven |
| **AI advisory** | New page + API call; `KRISHIOX_SERVICES` structure can extend with crop/advisory metadata |
| **Weather** | A `js/weather.js` module + card on Home, backed by any public weather API |
| **Marketplace** | `KRISHIOX_SERVICES`-style catalogue pattern (a new `js/store.js`) can be extended into a product catalogue |
| **Payments** | Booking wizard already isolates a single `confirmBooking()` step in `booking.js` — swap the WhatsApp handoff for a payment step without touching steps 1–5 |
| **Equipment tracking** | `places_map`-style live map view, using the same design tokens in `style.css` |
| **Analytics** | `KrishiOxStore` (in `js/storage.js`) already writes a local booking history — swap for a real analytics/events endpoint |

---

## 🛠 Local development

No build step needed. Any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` (or the port shown) in your browser or on a phone on the same
network for mobile testing.

---

## 🎨 Design tokens (quick reference)

| Token | Value | Usage |
|---|---|---|
| `--charcoal` | `#111827` | Header, bottom nav, dark cards |
| `--copper` | `#8B5A2B` | Accents, icons, secondary CTAs |
| `--gold` | `#D9A441` | Primary CTA gradient, active states |
| `--ivory` | `#F7F5F2` | Page background |
| `--whatsapp` | `#25D366` | WhatsApp CTAs only |

All tokens are defined once in `css/style.css :root` — update there to re-theme the whole app.

---

© 2026 KrishiOx. Built for the farmers of Saharanpur, Uttar Pradesh.
