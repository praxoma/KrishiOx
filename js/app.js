/* ==========================================================================
   KrishiOx — App Configuration (composition root for config)
   Not a single-responsibility module — this file's only job is to compose
   the split-out configuration files below into the single `KRISHIOX_CONFIG`
   shape the rest of the app already depends on, plus hold the one config
   value that doesn't belong to any of them (`legalVersion`).

   ---- How configuration loading works ----
   Configuration used to live entirely in one file (`js/config.js`). It is
   now split by concern:

     js/branding.js  → KRISHIOX_BRANDING  (appName, brandInitials, appTagline)
     js/contact.js   → KRISHIOX_CONTACT   (whatsappNumber, callNumber,
                                            supportHours, legalContactEmail)
     js/regions.js   → KRISHIOX_REGION    (serviceArea)
     js/services.js  → KRISHIOX_SERVICES  (the service catalogue array)
     js/villages.js  → KRISHIOX_VILLAGES  (the village suggestion list)
     js/app.js       → KRISHIOX_CONFIG    (this file — see below)

   `KRISHIOX_SERVICES` and `KRISHIOX_VILLAGES` were always standalone
   top-level exports (never nested inside `KRISHIOX_CONFIG`), so
   `services.js` and `villages.js` need no composition step — any module
   that needs them imports directly from that file.

   `KRISHIOX_CONFIG`, by contrast, has always been consumed as one merged
   object (`KRISHIOX_CONFIG.whatsappNumber`, `KRISHIOX_CONFIG.appName`,
   etc.) by ui.js, pwa.js, whatsapp.js, and by the per-page inline
   `<script>` blocks that read it off `window` (bridged by main.js). To
   keep every one of those call sites unchanged, this file imports the
   three grouped objects above, merges them with `legalVersion`, and
   exports the result under the original `KRISHIOX_CONFIG` name and shape.
   Nothing that reads `KRISHIOX_CONFIG.x` needed to change — only its
   import path moved, from `"./config.js"` to `"./app.js"`.

   `legalVersion` lives here rather than in one of the five split files
   because it isn't brand, contact, or region data — it's app-wide
   consent-gating metadata (bump it whenever terms.html/privacy.html
   changes materially; ui.js's consent banner re-prompts anyone whose
   saved consent doesn't match this value). `legalContactEmail`, despite
   also being "legal"-prefixed, lives in contact.js instead, because it's
   a contact channel (a grievance email address) parallel to
   whatsappNumber/callNumber, not a versioning concern.
   ========================================================================== */

import { KRISHIOX_BRANDING } from "./branding.js";
import { KRISHIOX_CONTACT } from "./contact.js";
import { KRISHIOX_REGION } from "./regions.js";

/**
 * The composed, deployment-specific configuration object — same shape as
 * before the config split. Everything JS-rendered (header, footer,
 * toasts) reads from here; the static SEO surface (`<title>`, meta tags,
 * JSON-LD, `manifest.json`) can't be JS-driven and is kept in sync
 * separately by `dev/rebrand.js`.
 * @type {{
 *   whatsappNumber: string,
 *   callNumber: string,
 *   serviceArea: string,
 *   supportHours: string,
 *   appName: string,
 *   brandInitials: string,
 *   appTagline: string,
 *   legalVersion: string,
 *   legalContactEmail: string
 * }}
 */
export const KRISHIOX_CONFIG = {
  ...KRISHIOX_CONTACT,
  ...KRISHIOX_REGION,
  ...KRISHIOX_BRANDING,

  // Bump legalVersion (any string, e.g. an ISO date) whenever terms.html or
  // privacy.html changes in a way users should be re-notified about — the
  // consent banner in ui.js re-prompts anyone whose saved consent doesn't
  // match this value, instead of silently assuming old consent still holds.
  legalVersion: "2026-07-18.2"
};
