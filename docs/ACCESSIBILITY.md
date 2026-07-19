# ACCESSIBILITY.md — KrishiOx

> Documentation-only artifact recording a complete accessibility audit against eight review
> areas: **Semantic HTML, Keyboard navigation, ARIA, Focus management, Contrast, Heading
> hierarchy, Image alt text, Screen reader support.** Scope was safe accessibility improvements
> only — no UI redesign, no new features, no visual change. Every markup/CSS fix below is
> paired so the rendered appearance is unchanged; every finding that *would* require a visual
> change (a color decision) is reported but deliberately not fixed — see §5.

## How to read this report

- 🔧 **Fixed** — a real, safe issue was found and corrected (zero visual change).
- ⚠️ **Flagged, not fixed** — a real issue exists, but correcting it means changing a color or
  adding visible content, which is a design decision outside "safe, no-redesign" scope.
- ✅ **Reviewed, compliant** — checked, no issue found.

## Summary of fixes

| # | Area | Fix | Files |
|---|---|---|---|
| 1 | Heading hierarchy | Promoted `h4→h3` (index/about/partners card & step titles), `h4→h2` (contact.html contact-method cards, which had no h2 above them), `h3→h2` (services.html service rows) — paired with matching CSS selector renames so nothing looks different | `index.html`, `about.html`, `partners.html`, `contact.html`, `services.html`, `css/style.css` |
| 2 | Heading hierarchy | Added the two missing page `h1`s: promoted offline.html's only heading `h2→h1` (same inline style, zero visual change); added a visually-hidden `h1` to booking.html via a new `.sr-only` utility class | `offline.html`, `booking.html`, `css/style.css` |
| 3 | Semantic HTML / Screen reader support | Linked all 6 single-input form labels to their inputs via `for=`/`id` in the booking wizard; added `role="group" aria-labelledby=` to the village-chip, date-chip, and quantity-stepper groups | `booking.html` |
| 4 | Semantic HTML / Keyboard navigation | Converted the FAQ accordion questions from unfocusable `<div>`s to real `<button>`s with `aria-expanded`/`aria-controls`, keeping the exact visual appearance via a CSS button-reset | `contact.html`, `js/ui.js`, `css/style.css` |
| 5 | Semantic HTML / Keyboard navigation | Converted the booking summary's "बदलें" (change) links from `<a>` tags with no `href` (never focusable) to real `<button>`s | `js/booking.js`, `css/style.css` |
| 6 | ARIA / Screen reader support | Every icon returned by `krishiOxIcon()` is now `aria-hidden="true" focusable="false"` — applied centrally, once, so screen readers never try to describe decorative SVG markup that's redundant with adjacent visible text or an existing `aria-label` | `js/icons.js` |
| 7 | Screen reader support | Added `role="status" aria-live="polite"` to the toast notification and the offline banner (8 pages); added `role="region" aria-label` to the consent banner | `js/ui.js`, 8 HTML pages |
| 8 | ARIA | Added `aria-pressed` (reflecting selection state) to the booking wizard's service-card, village-chip, and date-chip toggle buttons | `js/booking.js` |
| 9 | Focus management | Wizard step transitions and the booking success screen now move keyboard/screen-reader focus to the new step's/success heading (`tabindex="-1"` + `.focus()`), only on actual transitions — never on initial page load | `booking.html`, `js/booking.js` |

`CACHE_VERSION` bumped `v9 → v10` in `sw.js` since precached HTML/CSS/JS changed.

---

## 1. Semantic HTML

🔧 **Fixed** (see #1–#5 above). Findings:

- **FAQ questions were `<div>`s with click handlers**, not buttons — invisible to keyboard
  users and announced as generic text by screen readers instead of as an expandable control.
  Fixed (#4).
- **Summary "बदलें" links had no `href`** — browsers exclude an `<a>` with no `href` from the
  tab order entirely, so this control was permanently unreachable by keyboard. Fixed (#5).
- **Form labels existed but weren't programmatically linked to their inputs** — visually
  adjacent only. A screen reader user tabbing into `#villageInput` would hear only the
  placeholder/type, not "गाँव का नाम." Fixed (#3).
- **Heading tags skipped levels** in five places (h2→h4, h1→h4, h1→h3) — see §6.

✅ **Already compliant**: landmark structure (`<header>`, `<nav>`, `<main>`, `<footer>` used
correctly on every page), `<html lang="hi">` set everywhere, service-grid cards / chips /
header buttons were already real `<button type="button">` elements, `lang` and document
structure otherwise sound.

## 2. Keyboard navigation

🔧 **Fixed** (see #4, #5, #9). The FAQ and summary-edit fixes above restore keyboard
operability to two controls that were completely unreachable via Tab. Focus management (#9)
ensures a keyboard/screen-reader user isn't left with stale focus on a "Next" button that's no
longer relevant after the step changes.

✅ **Reviewed, compliant**: every other interactive element (service cards, chips, header
buttons, nav links, form inputs) was already keyboard-operable — all real `<button>`/`<a href>`/
form control elements, none suppress their native focusability. No `tabindex` values greater
than 0 exist anywhere (a common anti-pattern that scrambles tab order) — the only `tabindex`
values in the codebase are the `-1`s added by this audit, which intentionally keep those
elements *out* of the tab order while remaining programmatically focusable.

## 3. ARIA

🔧 **Fixed** (see #6, #7, #8). Findings:

- **No live regions existed anywhere** — the toast (validation errors, copy confirmation,
  update notices), the offline banner, and the consent banner could all appear or change
  without a screen reader user being told, since nothing marked them for announcement. Fixed.
- **Selectable toggle buttons (service cards, chips) didn't expose their selected state** —
  visually indicated only by a border/background/badge change. Fixed via `aria-pressed`.
- **Decorative icons had no `aria-hidden`** — every one of the ~35 SVGs in the icon library
  could potentially be exposed to assistive tech with no useful content of its own. Fixed
  centrally in `krishiOxIcon()` (one change covers every icon, everywhere, forever).

✅ **Already compliant**: every icon-only button already had a correct, descriptive
`aria-label` (call button, install/update buttons, text-size button, quantity +/− steppers,
FAB) — these were not touched, since they were already right.

## 4. Focus management

🔧 **Fixed** (see #9). The booking wizard is a 6-step single-page flow — tapping "आगे बढ़ें"
swaps visible content without a real page navigation. Previously, focus stayed wherever it was
(usually the Next button) after a step change, so a screen reader user got no indication new
content had appeared other than whatever they happened to explore next. Now, `goToStep()`
moves focus to the new step's heading, and `confirmBooking()` moves focus to the success
screen's heading — both via `tabindex="-1"` (focusable programmatically, never added to the
Tab key's sequence) plus a `.focus()` call, added only on actual transitions, never on the
initial page load (so a fresh visit to any page — including booking.html — still starts focus
at the top of the document, consistent with every other page in the app).

⚠️ **Reviewed, deliberately not changed**: no page currently overrides the browser's default
focus-visible outline for buttons/links/chips (only form inputs replace it, with a compliant
box-shadow ring). This is compliant as-is. Adding a custom, on-brand focus-ring color was
considered and **not implemented** — verifying a single color has sufficient contrast against
every background context in this app (light ivory page, dark charcoal header/nav/cards) without
being able to render and inspect it visually was judged too risky to do blind; a wrong choice
here would be a regression, not an improvement. Left for a follow-up with visual QA.

## 5. Contrast

⚠️ **Flagged, not fixed** — every finding below is a brand-color decision, not a markup bug,
so none were changed (per "no redesign"). Ratios computed via the standard WCAG relative
luminance formula, not estimated.

| Combination | Ratio | WCAG AA needs | Result | Where it appears |
|---|---|---|---|---|
| Charcoal text (`#111827`) on the copper end of the gold→copper gradient (`#8B5A2B`) | **3.04:1** | 4.5:1 (normal text) | **Fails** | `.btn-primary` (every primary CTA button, every page), `.brand-mark` (header logo initials, every page), `.avatar-circle` (testimonial initials, Home) |
| White text/icons (`#fff`) on WhatsApp green (`#25D366`) | **1.98:1** | 4.5:1 text / 3:1 icons | **Fails both** | `.btn-whatsapp` (booking success button, partners.html tier button), `.fab-whatsapp` (floating button, every page) |
| WhatsApp-dark text/icon (`#1DA851`) on a 12%-opacity WhatsApp-green tint | **2.84:1** | 4.5:1 text / 3:1 icons | **Fails both** | `.badge-live` (Contact page support-hours badge), `.contact-method.wa` icon (Contact page) |
| Charcoal icon stroke on the copper end of the gradient | 3.04:1 | 3:1 (icons only) | Passes (barely) | `.nav-book-btn` icon, `.success-icon`, `.header-action-update` icon |

**Why these weren't fixed**: the gold→copper gradient is the site's signature brand treatment
(BioRawNex theme), and the WhatsApp green/white pairing is WhatsApp's own official brand
convention, reproduced deliberately so the button is instantly recognizable as "opens
WhatsApp." Changing either is a color/brand decision for whoever owns visual design, not a
markup fix — but the numbers above are real WCAG AA failures and should be revisited (e.g., a
darker copper stop, or reserving white-on-green for icon-only contexts and using a dark-on-tint
treatment wherever WhatsApp buttons carry visible text).

✅ **Reviewed, compliant** (computed, not estimated): body text (`#1A1712` on `#F7F5F2`,
>15:1), muted text on ivory (`#5B564C` on `#F7F5F2`, 6.70:1), light text on the dark
header/nav/cards including the reduced-opacity variant (`rgba(247,245,242,0.68)` effectively
~8.00:1 against `#111827`), gold text on charcoal (7.89:1 — used for `.chip.selected`,
`.step-num`, bottom-nav active state), the info-strip's dark-brown-on-cream text (7.91:1), and
the header's gold call-button icon against its translucent backdrop (~6.20:1 even under a
worst-case solid-charcoal assumption). Form inputs already meet the 16px minimum that prevents
iOS Safari's auto-zoom-on-focus (unrelated to contrast, but adjacent — see
COMPATIBILITY_REPORT.md).

## 6. Heading hierarchy

🔧 **Fixed** (see #1, #2). Found and corrected:

- **index.html**: "कैसे काम करता है" section skipped h2→h4 for its 4 step titles → now h3.
- **about.html**: "हमारे मूल्य" skipped h2→h4 for its 4 value cards → now h3; "आगे क्या आ रहा
  है" skipped h2→h4 for its 6 roadmap items → now h3.
- **partners.html**: "पार्टनर बनने के फायदे" skipped h2→h4 for its 4 value cards → now h3;
  "जुड़ने की प्रक्रिया" skipped h2→h4 for its 4 process steps → now h3. (`partner-tier-card`'s
  existing `h3`s — "Equipment Owner"/"Fleet Partner" — were already correctly nested and
  untouched.)
- **contact.html**: the two contact-method cards ("WhatsApp पर संदेश भेजें", "कॉल करें") went
  straight from the page's `h1` to `h4` — skipping *two* levels, and with no natural h2
  section to nest under. Promoted to `h2`, making them siblings of the page's other h2 sections
  (FAQ, CTA).
- **services.html**: every service-row title went straight from the page's `h1` to `h3`,
  skipping h2 (no h2 existed anywhere on the page). Promoted to `h2`.
- **offline.html**: its only heading was an `h2` with no `h1` anywhere on the page — promoted
  to `h1` (same inline style, so identical appearance).
- **booking.html**: had no `h1` at all — the wizard's six step titles are all `h2`, and none of
  them is really "the page title." Added a visually-hidden `h1` ("सेवा बुक करें") via a new
  `.sr-only` utility class, so a screen reader user gets a page-level orientation cue that
  sighted users don't need (the header/bottom-nav already tell them where they are visually).

Every tag-level change was paired with a corresponding CSS selector rename in the same commit
of work (`.step-item h4`→`h3`, `.value-card h4`→`h3`, `.roadmap-item h4`→`h3`,
`.contact-method .cm-body h4`→`h2`, `.service-row .row-body h3`→`h2`) — the visual size/weight
of every heading is identical to before.

✅ **Reviewed, compliant**: `privacy.html` and `terms.html` (h1 → h2 "in brief" → h3 "clear my
data" → back to h2 for each numbered section — going back up to a sibling h2 after a nested h3
is correct, not a skip) needed no changes.

## 7. Image alt text

✅ **N/A — no `<img>` elements exist anywhere in the codebase.** All visual content is inline
SVG (the icon library) or CSS backgrounds/gradients; there is no `images/` directory and no
raster content photography (confirmed in ARCHITECTURE.md). The equivalent concern for this
codebase is SVG icon accessibility, addressed in §3/#6 (every icon is now `aria-hidden`, since
every one is decorative-alongside-text or inside an already-labeled control).

## 8. Screen reader support

🔧 **Fixed** (see #3, #6, #7, #8, #9 — this section is the sum of the fixes above, viewed from
the screen-reader user's perspective). Before this audit, a screen reader user would have hit
several real obstacles in the booking flow specifically (the app's core task): unlabeled form
fields, an unreachable FAQ accordion and summary-edit control, silent toast/validation
messages, and no indication that tapping "Next" changed the page's content. All fixed.

⚠️ **Flagged, not fixed**: the contrast failures in §5 affect low-vision and some
screen-magnifier users more than screen-reader users specifically, but are grouped here since
they're the primary remaining barrier this audit identified.

---

## What was deliberately not touched

- No color changes (§5) — flagged for design review, not auto-fixed.
- No custom focus-ring color (§4) — reviewed and judged unsafe to guess without visual QA.
- No restructuring of the booking wizard's flow, steps, or field set — every fix here is
  additive markup/ARIA/focus-JS; the wizard behaves identically to before.
- No new pages, no new visible copy (the one exception, booking.html's `h1`, is
  `.sr-only` — invisible to sighted users, present only in the accessibility tree).

---

Related documents: [ARCHITECTURE.md](ARCHITECTURE.md), [COMPONENTS.md](COMPONENTS.md),
[COMPATIBILITY_REPORT.md](COMPATIBILITY_REPORT.md), [DECISIONS.md](DECISIONS.md).
