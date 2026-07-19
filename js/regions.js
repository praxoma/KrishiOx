/* ==========================================================================
   KrishiOx — Region Configuration
   Single responsibility: the service-area label shown across the app.
   KrishiOx currently operates in one region, so this holds a single
   field — see DOMAIN_MODEL.md §7 (Region) / §8 (District) for how this
   would grow into a real region/district hierarchy if the business ever
   expands into a second operating area with its own contact numbers or
   support hours. No such expansion exists today; this file only carries
   what the app currently uses.
   ========================================================================== */

/**
 * The service area label shown in the header, footer, and legal pages.
 * @type {{ serviceArea: string }}
 */
export const KRISHIOX_REGION = {
  serviceArea: "सहारनपुर, उत्तर प्रदेश"
};
