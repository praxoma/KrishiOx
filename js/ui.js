/* ==========================================================================
   KrishiOx — UI
   Single responsibility: shared visual chrome and cross-cutting UI widgets
   used on every page — header, footer, floating WhatsApp button, toast,
   consent banner, text-size control, FAQ accordion, offline banner, and the
   rotate-to-portrait overlay. Page-specific content (hero, testimonials,
   service grids) stays in each page's own inline <script>; the booking
   wizard's own step UI lives in booking.js. This is intentionally the
   broadest module by function count — it's the single place responsible
   for all shared UI chrome that isn't specifically page navigation
   (navigation.js) or PWA lifecycle (pwa.js).
   ========================================================================== */

import { KRISHIOX_CONFIG } from "./app.js";
import { krishiOxIcon } from "./icons.js";
import { KrishiOxStore } from "./storage.js";
import { buildWhatsAppLink } from "./whatsapp.js";
import { currentPageKey } from "./navigation.js";

/* ---- Header ---- */

/**
 * Renders the sticky site header into `#siteHeader`: brand mark/name, the
 * (initially hidden) update and install buttons — populated later by
 * pwa.js — the text-size toggle, and the call button. No-ops if the mount
 * element isn't present.
 * @returns {void}
 */
export function renderHeader() {
  const mount = document.getElementById("siteHeader");
  if (!mount) return;
  mount.innerHTML =
    '<a href="index.html" class="brand">' +
      '<span class="brand-mark">' + KRISHIOX_CONFIG.brandInitials + '</span>' +
      '<span class="brand-text"><strong>' + KRISHIOX_CONFIG.appName + '</strong><span>' + KRISHIOX_CONFIG.serviceArea + "</span></span>" +
    "</a>" +
    '<div class="header-actions">' +
      '<button type="button" class="header-action header-action-update" id="updateBtn" aria-label="नया अपडेट उपलब्ध है — लगाने के लिए दबाएं" style="display:none;">' + krishiOxIcon("refresh") + "</button>" +
      '<button type="button" class="header-action header-action-install" id="installBtn" aria-label="ऐप इंस्टॉल करें" style="display:none;">' + krishiOxIcon("install") + "</button>" +
      '<button type="button" class="header-action text-size-btn" id="textSizeBtn" aria-label="टेक्स्ट का आकार बड़ा करें">A+</button>' +
      '<a class="header-action header-action-call" href="tel:' + KRISHIOX_CONFIG.callNumber + '" aria-label="कॉल करें">' + krishiOxIcon("phone") + "</a>" +
    "</div>";
}

/* ---- Footer ---- */

/**
 * Renders the footer's quick-links row into `#footerLinks`, highlighting
 * the current page (via navigation.js's `currentPageKey`). No-ops if the
 * mount element isn't present.
 * @returns {void}
 */
export function renderFooterLinks() {
  const mount = document.getElementById("footerLinks");
  if (!mount) return;
  const active = currentPageKey();
  const links = [
    { href: "index.html", label: "होम", key: "home" },
    { href: "services.html", label: "सेवाएँ", key: "services" },
    { href: "about.html", label: "हमारे बारे में", key: "about" },
    { href: "partners.html", label: "पार्टनर", key: "partners" },
    { href: "contact.html", label: "संपर्क", key: "contact" },
    { href: "terms.html", label: "नियम व शर्तें", key: "terms" },
    { href: "privacy.html", label: "गोपनीयता नीति", key: "privacy" }
  ];
  mount.innerHTML = links.map(function (l) {
    return '<a href="' + l.href + '"' + (l.key === active ? ' style="color:var(--copper);font-weight:800;"' : "") + '>' + l.label + "</a>";
  }).join('<span style="opacity:.4;">•</span>');
}

/**
 * Renders the footer's brand/tagline/copyright block plus the manual
 * "check for update" button into `#footerBrand` (wired up separately by
 * pwa.js's `initCheckUpdateButton`). Reads brand name/tagline from
 * config.js rather than hardcoding it per page. No-ops if the mount
 * element isn't present.
 * @returns {void}
 */
export function renderFooterBrand() {
  const mount = document.getElementById("footerBrand");
  if (!mount) return;
  mount.innerHTML =
    "<strong>" + KRISHIOX_CONFIG.appName + "</strong> — " + KRISHIOX_CONFIG.appTagline + "<br>" +
    "© " + new Date().getFullYear() + " " + KRISHIOX_CONFIG.appName + ". " + KRISHIOX_CONFIG.serviceArea + " में सेवा उपलब्ध।" +
    '<button type="button" id="checkUpdateBtn" class="footer-update-btn">नवीनतम अपडेट जांचें</button>';
}

/* ---- Floating WhatsApp button (global) ---- */

/**
 * Appends the floating WhatsApp button (present on every page) to
 * `document.body`, pre-filled with a generic inquiry message. Idempotent —
 * does nothing if it's already been rendered.
 * @returns {void}
 */
export function renderFab() {
  if (document.getElementById("globalFab")) return;
  const a = document.createElement("a");
  a.id = "globalFab";
  a.className = "fab-whatsapp";
  a.setAttribute("aria-label", "WhatsApp पर संपर्क करें");
  a.href = buildWhatsAppLink("नमस्ते " + KRISHIOX_CONFIG.appName + ", मुझे खेती सेवा के बारे में जानकारी चाहिए।");
  a.target = "_blank";
  a.rel = "noopener";
  a.innerHTML = krishiOxIcon("whatsapp");
  document.body.appendChild(a);
}

/* ---- Rotate-to-portrait overlay ----
   Manifest's "orientation": "portrait-primary" only locks orientation once
   installed to the home screen (standalone mode) on Android, and isn't
   honoured by iOS Safari at all even then. For everyone else (a regular
   browser tab, or any iOS user), this CSS-only overlay swaps in in place
   of the app whenever a touch phone is rotated to landscape, so the
   wizard/layout is never seen mid-rotation instead of just being locked. */

/**
 * Appends the "please rotate your phone" overlay to `document.body`. Shown
 * via a CSS media query whenever a touch device is in landscape — see the
 * file header comment for why this fallback exists. Idempotent.
 * @returns {void}
 */
export function renderRotateOverlay() {
  if (document.getElementById("rotateOverlay")) return;
  const el = document.createElement("div");
  el.id = "rotateOverlay";
  el.className = "rotate-overlay";
  el.innerHTML =
    '<div class="rotate-overlay-icon">' + krishiOxIcon("rotate") + "</div>" +
    "<p>बेहतर अनुभव के लिए कृपया अपना फ़ोन सीधा (पोर्ट्रेट मोड में) रखें</p>";
  document.body.appendChild(el);
}

/* ---- Text size toggle (for low-vision users — cycles 100% / 115% / 130%) ---- */

const TEXT_ZOOM_LEVELS = [1, 1.15, 1.3];

/**
 * Applies a text-zoom level by setting the `--text-zoom` CSS custom
 * property on the document root, consumed by `.page { zoom: var(--text-zoom); }`
 * in style.css.
 * @param {number} level - One of 1, 1.15, or 1.3.
 * @returns {void}
 */
export function applyTextZoom(level) {
  document.documentElement.style.setProperty("--text-zoom", level);
}

// Applied immediately at module load (not gated on DOMContentLoaded) so the
// saved preference takes effect before first paint rather than flashing at
// 100% first.
applyTextZoom(parseFloat(KrishiOxStore.get("textZoom", 1)));

/**
 * Wires up the header's "A+" button to cycle through 100% / 115% / 130%
 * text zoom, persisting the choice and showing a confirmation toast.
 * No-ops if the button isn't present on the page.
 * @returns {void}
 */
export function initTextSize() {
  const btn = document.getElementById("textSizeBtn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    const current = parseFloat(KrishiOxStore.get("textZoom", 1));
    const idx = TEXT_ZOOM_LEVELS.indexOf(current);
    const next = TEXT_ZOOM_LEVELS[(idx + 1) % TEXT_ZOOM_LEVELS.length];
    KrishiOxStore.set("textZoom", next);
    applyTextZoom(next);
    showToast("टेक्स्ट का आकार: " + Math.round(next * 100) + "%");
  });
}

/* ---- Data controls (used by privacy.html's "Clear my data" button) ----
   Kept as an explicit key list rather than clearing all localStorage —
   precise and auditable against what the Privacy Policy actually claims
   this button deletes. */

/**
 * Removes every locally-stored KrishiOx key (booking draft, booking
 * history, text-size preference, legal consent) and resets text zoom back
 * to 100%. Exposed on `window` by main.js so privacy.html's inline
 * `onclick` handler can call it without importing this module directly.
 * @returns {void}
 */
export function clearAllKrishiOxData() {
  ["bookingDraft", "bookingHistory", "textZoom", "legalConsent"].forEach(function (key) {
    KrishiOxStore.remove(key);
  });
  applyTextZoom(1);
}

/* ---- Consent banner (Terms / Privacy) ----
   Not a cookie banner — this app sets no cookies. Shown once on first
   visit, and again automatically if KRISHIOX_CONFIG.legalVersion changes,
   so a policy update doesn't get silently assumed-accepted for a
   returning visitor. */

/**
 * Shows the local-storage/WhatsApp-handoff consent banner on first visit,
 * and again if `KRISHIOX_CONFIG.legalVersion` has changed since the
 * visitor last accepted. No-ops if a banner is already showing or consent
 * is already current for this version.
 * @returns {void}
 */
export function initConsentBanner() {
  if (document.getElementById("consentBanner")) return;
  const stored = KrishiOxStore.get("legalConsent", null);
  if (stored && stored.version === KRISHIOX_CONFIG.legalVersion) return;

  const isUpdate = !!(stored && stored.version);
  const message = isUpdate
    ? "हमारी नियम व शर्तें और गोपनीयता नीति अपडेट हुई हैं — कृपया दोबारा देखें और स्वीकृति दें।"
    : KRISHIOX_CONFIG.appName + " का उपयोग जारी रखने पर आप हमारी नियम व शर्तें और गोपनीयता नीति से सहमत होते हैं। आपकी बुकिंग जानकारी सिर्फ एक WhatsApp मैसेज बनाने के लिए उपयोग होती है — किसी सर्वर पर सेव नहीं होती।";

  const banner = document.createElement("div");
  banner.id = "consentBanner";
  banner.className = "consent-banner";
  banner.innerHTML =
    "<p>" + message + "</p>" +
    '<div class="consent-actions">' +
      '<a href="terms.html" class="consent-link">नियम</a>' +
      '<a href="privacy.html" class="consent-link">गोपनीयता</a>' +
      '<button type="button" class="btn btn-primary btn-sm" id="consentAcceptBtn">मैं सहमत हूँ</button>' +
    "</div>";
  document.body.appendChild(banner);

  document.getElementById("consentAcceptBtn").addEventListener("click", function () {
    KrishiOxStore.set("legalConsent", { version: KRISHIOX_CONFIG.legalVersion, ts: Date.now() });
    banner.remove();
  });
}

/* ---- Toast ---- */

let toastTimer = null;

/**
 * Shows a transient toast message at the bottom of the screen, reusing a
 * single `#krishiOxToast` element across calls. Exposed on `window` as
 * `krishiOxToast` by main.js for the per-page inline `<script>` blocks.
 * @param {string} msg - Message text to display.
 * @param {number} [duration=2400] - Milliseconds before the toast hides.
 * @returns {void}
 */
export function showToast(msg, duration) {
  let toast = document.getElementById("krishiOxToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "krishiOxToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, duration || 2400);
}

/* ---- FAQ accordion (used on Contact/About pages) ---- */

/**
 * Wires up click-to-expand behavior for every `.faq-item` on the page,
 * closing any other open item first (single-open accordion). Harmless
 * no-op if there are no `.faq-item` elements on the page.
 * @returns {void}
 */
export function initFaq() {
  document.querySelectorAll(".faq-item").forEach(function (item) {
    const q = item.querySelector(".faq-q");
    if (!q) return;
    q.addEventListener("click", function () {
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        if (openItem !== item) openItem.classList.remove("open");
      });
      item.classList.toggle("open", !wasOpen);
    });
  });
}

/* ---- Offline banner ---- */

/**
 * Wires up `#offlineBanner` to show/hide based on `navigator.onLine`,
 * listening for the `online`/`offline` window events. No-ops if the
 * banner element isn't present on the page.
 * @returns {void}
 */
export function initOfflineBanner() {
  const banner = document.getElementById("offlineBanner");
  if (!banner) return;
  function update() {
    banner.classList.toggle("show", !navigator.onLine);
  }
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}
