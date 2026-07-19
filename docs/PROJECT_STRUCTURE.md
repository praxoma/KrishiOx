# PROJECT_STRUCTURE.md — KrishiOx

> Documentation-only artifact, reflecting the repository layout as of this writing. No files
> were moved, renamed, or modified to produce this document.

## 1. Folder hierarchy

```
krishiox/  (repo root — deployed as GitHub Pages root, custom domain krishiox.in)
│
├── index.html                 Home page
├── services.html              Full service catalogue
├── booking.html                6-step booking wizard
├── partners.html                Equipment-owner / fleet-partner onboarding
├── about.html                    Mission, values, roadmap
├── contact.html                   WhatsApp / call / FAQ
├── terms.html                     Terms & Conditions
├── privacy.html                    Privacy Policy + "clear my data"
├── offline.html                     Offline fallback shell (served by sw.js)
│
├── manifest.json               PWA manifest (icons, shortcuts, theme)
├── sw.js                        Service worker — app-shell caching + offline
├── robots.txt                    Crawler rules + sitemap pointer
├── sitemap.xml                    Indexable pages, for Search Console
├── CNAME                          Custom domain marker for GitHub Pages (krishiox.in)
├── README.md                      Primary project documentation (deploy, config, SEO, legal)
│
├── css/
│   └── style.css               Full design system — tokens, reset, layout, every component
│
├── js/
│   ├── config.js                Deployment config: WhatsApp/call numbers, brand, service
│   │                             catalogue, village list, localStorage wrapper
│   ├── icons.js                  Inline SVG icon library (no icon font/external dependency)
│   ├── main.js                    Shared shell logic: header/nav/footer render, WhatsApp
│   │                               helpers, consent banner, SW registration, install prompt
│   └── booking.js                 Booking wizard state machine + WhatsApp message builder
│                                   (only loaded by booking.html)
│
├── icons/                       Generated PWA icons (not hand-edited — see dev/generate_icons.py)
│   ├── apple-touch-icon.png
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── icon-192.png
│   ├── icon-192-maskable.png
│   ├── icon-512.png
│   └── icon-512-maskable.png
│
├── dev/                          Dev-only tooling — NOT loaded at runtime by any page
│   ├── generate_icons.py          One-off Python/Pillow script that produced icons/
│   ├── rebrand.js                  Renames platform / switches domain across the repo
│   ├── bump_cache.js                Increments sw.js's CACHE_VERSION by one
│   └── check_cache_version.js       CI helper: verifies a precached-file change bumped
│                                     CACHE_VERSION; used by the workflow below
│
└── .github/
    └── workflows/
        └── cache-version-guard.yml  CI: auto-bumps CACHE_VERSION on push to main if a
                                      precached file changed without a manual bump
```

Total: 9 HTML pages, 1 CSS file, 4 runtime JS files, 4 dev-only scripts, 1 CI workflow, 7
generated icon assets, and the PWA/SEO metadata files at the root.

## 2. What lives where — quick lookup

| I need to change... | Edit this file |
|---|---|
| WhatsApp number, call number, support hours, service area copy | `js/config.js` → `KRISHIOX_CONFIG` |
| Brand name / initials / tagline (JS-rendered surfaces only) | `js/config.js` → `KRISHIOX_CONFIG.appName` / `brandInitials` / `appTagline` |
| `<title>`, meta description, canonical URL, OG/Twitter tags, JSON-LD, `manifest.json` name | Each HTML file's `<head>` directly, or run `dev/rebrand.js` for a full rename/domain change |
| The service catalogue (add/remove/relabel a service) | `js/config.js` → `KRISHIOX_SERVICES` |
| The village/area autocomplete list | `js/config.js` → `KRISHIOX_VILLAGES` |
| Any color, spacing, radius, shadow token | `css/style.css` → `:root` |
| A specific component's look (button, card, wizard step, nav) | `css/style.css` → its named section (see ARCHITECTURE.md §4) |
| An icon | `js/icons.js` → `KRISHIOX_ICONS` |
| Header, bottom nav, footer, consent banner, toast, SW registration, install prompt behavior | `js/main.js` |
| Booking wizard steps, validation, WhatsApp message text | `js/booking.js` |
| What gets precached / offline behavior / update strategy | `sw.js` |
| Legal copy | `terms.html`, `privacy.html` (bump `KRISHIOX_CONFIG.legalVersion` after any material change) |
| SEO crawl rules | `robots.txt`, `sitemap.xml` |
| Custom domain | `CNAME` (written by `dev/rebrand.js --domain ...`) |

## 3. Naming and file conventions observed

- **Pages**: lower-case, `.html`, one word per concept (`services.html`, not
  `our-services.html`).
- **JS files**: lower-case, single responsibility per file (`config`, `icons`, `main`,
  `booking`) — there is no further nesting under `js/` (no `js/components/`, no
  `js/utils/`), consistent with the project's small, framework-free scope.
- **Global identifiers**: everything KrishiOx-specific and shared across files is prefixed
  `KRISHIOX_` (constants) or `KrishiOx` (the `KrishiOxStore` object, the
  `krishiox:` `localStorage` key prefix) — this namespacing avoids collisions since there's no
  module system to scope things automatically.
- **CSS classes**: component-scoped, descriptive, lower-kebab-case (`.service-card`,
  `.wizard-step`, `.contact-method`), no CSS Modules/utility-class approach.
- **Dev scripts**: `dev/` holds anything with a shebang line (`#!/usr/bin/env node` /
  `#!/usr/bin/env python`) that a human runs manually before a commit or deploy — nothing in
  this directory is referenced by any `<script src>` tag or by `sw.js`'s precache list.

## 4. Directories intentionally absent

Worth noting explicitly, since their absence is a structural choice, not an oversight:

- **No `src/` / `dist`/`build` split** — there is no build step, so the files served are
  exactly the files in the repo. `PROJECT_STRUCTURE.md` is therefore a complete description
  of what ships, not just of source.
- **No `node_modules/`, no `package.json`** — nothing in the runtime path depends on npm; the
  Node scripts under `dev/` use only Node's standard library.
- **No `tests/`** — see ARCHITECTURE.md §11 Technical debt.
- **No `assets/` or `images/`** beyond `icons/`, since the app currently uses no content
  photography — all illustrative graphics are inline SVG in `js/icons.js`.
- **No `vendor/`** yet — listed in ARCHITECTURE.md §12 as a future extension point for a
  fleet-partner dashboard, but does not exist today.

---

Related documents: [ARCHITECTURE.md](ARCHITECTURE.md) (system-level design),
[COMPONENTS.md](COMPONENTS.md), [DATA_FLOW.md](DATA_FLOW.md), [DECISIONS.md](DECISIONS.md).
