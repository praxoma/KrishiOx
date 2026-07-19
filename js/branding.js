/* ==========================================================================
   KrishiOx — Branding Configuration
   Single responsibility: the platform's brand identity. Everything
   JS-rendered (header, footer, floating WhatsApp button, update/toast
   copy) reads brand name/initials/tagline from here, so a rename only
   needs an edit in this one file.

   What this file deliberately does NOT cover: the static SEO surface
   (<title>, meta description, canonical, Open Graph, JSON-LD,
   manifest.json) — those are baked as literal text into each HTML file on
   purpose, since link-preview bots and some crawlers don't execute
   JavaScript. `dev/rebrand.js` keeps that static text in sync with this
   file in one command (see its `--name`/`--initials` flags).
   ========================================================================== */

/**
 * Brand identity used across every JS-rendered surface.
 * @type {{ appName: string, brandInitials: string, appTagline: string }}
 */
export const KRISHIOX_BRANDING = {
  appName: "KrishiOx",
  brandInitials: "KO",
  appTagline: "खेती की सेवाएँ, समय पर बुकिंग"
};
