/* ==========================================================================
   KrishiOx — App Bootstrap
   Composition root, not a single-responsibility module: wires the modules
   below together and drives the boot sequence shared by every page
   (header, bottom nav, footer, floating WhatsApp button, consent banner,
   service worker, install prompt, etc). Contains no business logic of its
   own — see navigation.js, ui.js, pwa.js, whatsapp.js, storage.js, icons.js,
   utils.js, and the configuration modules (app.js, branding.js, contact.js,
   regions.js, services.js, villages.js — see app.js for how those compose)
   for that. No exports: this file is only ever loaded directly by a
   <script type="module"> tag, never imported by another module.

   Also bridges a small set of functions/values onto `window` for the
   per-page inline <script> blocks embedded directly in each HTML file
   (hero fill, service grid, contact rows, "clear my data" — logic that
   predates this module system and is out of scope for this refactor).
   Every one of those inline scripts wraps its global-touching code in a
   DOMContentLoaded listener, and this bridging happens at module top
   level — which the HTML spec guarantees finishes before DOMContentLoaded
   fires — so load order between this file's <script type="module"> tag
   and any inline <script> tag on the page doesn't matter.
   ========================================================================== */

import { KRISHIOX_CONFIG } from "./app.js";
import { KRISHIOX_SERVICES } from "./services.js";
import { krishiOxIcon } from "./icons.js";
import { buildWhatsAppLink } from "./whatsapp.js";
import { renderBottomNav } from "./navigation.js";
import {
  renderHeader,
  renderFooterLinks,
  renderFooterBrand,
  renderFab,
  renderRotateOverlay,
  initFaq,
  initOfflineBanner,
  initTextSize,
  initConsentBanner,
  showToast,
  clearAllKrishiOxData
} from "./ui.js";
import {
  initInstallButton,
  initUpdateButton,
  initCheckUpdateButton,
  initServiceWorker,
  notifyIfJustUpdated
} from "./pwa.js";

// Bridge for classic (non-module) inline <script> blocks — see file header.
window.krishiOxIcon = krishiOxIcon;
window.buildWhatsAppLink = buildWhatsAppLink;
window.KRISHIOX_CONFIG = KRISHIOX_CONFIG;
window.KRISHIOX_SERVICES = KRISHIOX_SERVICES;
window.krishiOxToast = showToast;
window.clearAllKrishiOxData = clearAllKrishiOxData;

document.addEventListener("DOMContentLoaded", function () {
  renderHeader();
  renderBottomNav();
  renderFooterLinks();
  renderFooterBrand();
  renderFab();
  renderRotateOverlay();
  initFaq();
  initOfflineBanner();
  initInstallButton();
  initUpdateButton();
  initCheckUpdateButton();
  initTextSize();
  notifyIfJustUpdated();
  initConsentBanner();
});

initServiceWorker();
