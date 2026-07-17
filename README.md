# GOSPOLO 🌾

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

## 📁 Project structure

```
gospolo/
├── index.html            # Home
├── services.html         # Full service catalogue
├── booking.html           # 6-step booking wizard
├── partners.html          # Equipment owner / fleet partner onboarding
├── about.html              # Mission, values, roadmap
├── contact.html            # WhatsApp / call / FAQ
├── offline.html            # Offline fallback page (served by the service worker)
├── manifest.json           # PWA manifest (icons, shortcuts, theme)
├── sw.js                   # Service worker — app-shell caching + offline support
├── css/
│   └── style.css           # Full design system (tokens, components, layout)
├── js/
│   ├── config.js           # WhatsApp number, service catalogue, village list
│   ├── icons.js             # Inline SVG icon library
│   ├── main.js               # Header/nav rendering, WhatsApp helpers, SW registration
│   └── booking.js            # Booking wizard state machine & WhatsApp message builder
├── icons/                   # Generated PWA icons (192/512, maskable, apple-touch, favicons)
└── dev/
    └── generate_icons.py    # One-off Python/Pillow script used to generate icons/ (not needed at runtime)
```

---

## 🚀 Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `gospolo`).
2. Push the contents of this folder to the repository root (or to a `docs/` folder — your choice).
3. In **Settings → Pages**, set the source branch and folder (`/root` or `/docs`).
4. Your app will be live at `https://<username>.github.io/<repo>/`.

Because every asset reference in this project uses **relative paths** (`css/style.css`,
`js/main.js`, `icons/icon-192.png`, etc.), it works correctly whether deployed at a domain root
or inside a repo sub-path — no path rewriting needed.

> **Note:** GitHub Pages serves over HTTPS, which is required for service workers and the
> "Add to Home Screen" install prompt to function.

---

## ⚙️ Configuration

All deployment-specific values live in **`js/config.js`**:

```js
const GOSPOLO_CONFIG = {
  whatsappNumber: "919999999999",   // WhatsApp Business number, digits only, country code first
  callNumber: "+919999999999",      // Displayed / dialled for the "Call" contact option
  serviceArea: "सहारनपुर, उत्तर प्रदेश",
  supportHours: "सुबह 6 बजे – रात 9 बजे (सातों दिन)",
  ...
};
```

**Update `whatsappNumber` and `callNumber` before going live.**

The service catalogue (`GOSPOLO_SERVICES`) and the village/area suggestion list
(`GOSPOLO_VILLAGES`) are also defined in `config.js` — add, remove, or relabel entries there;
every page (Home, Services, Booking) reads from this single source of truth.

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

`sw.js` precaches the full app shell (all six pages, CSS, JS, icons) on first visit. Subsequent
visits — including with no signal — will serve cached pages instantly; any page that isn't yet
cached falls back to `offline.html`. Cache busting is controlled by bumping `CACHE_VERSION` in
`sw.js` on each deploy.

---

## 🔭 Built for future expansion

The codebase intentionally keeps a clean separation so these can be layered in without a rewrite:

| Feature | Where it plugs in |
|---|---|
| **Vendor dashboard** | New `vendor/` section; `js/config.js` service catalogue is already data-driven |
| **AI advisory** | New page + API call; `GOSPOLO_SERVICES` structure can extend with crop/advisory metadata |
| **Weather** | A `js/weather.js` module + card on Home, backed by any public weather API |
| **Marketplace** | `GOSPOLO_STORE` pattern in `config.js` can be extended into a product catalogue |
| **Payments** | Booking wizard already isolates a single `confirmBooking()` step in `booking.js` — swap the WhatsApp handoff for a payment step without touching steps 1–5 |
| **Equipment tracking** | `places_map`-style live map view, using the same design tokens in `style.css` |
| **Analytics** | `GospoloStore` (in `config.js`) already writes a local booking history — swap for a real analytics/events endpoint |

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

© 2026 GOSPOLO. Built for the farmers of Saharanpur, Uttar Pradesh.
