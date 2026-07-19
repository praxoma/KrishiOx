/* ==========================================================================
   KrishiOx — WhatsApp
   Single responsibility: build wa.me deep links. This is KrishiOx's only
   integration with an external system — there is no backend, so opening
   one of these links IS the booking/inquiry submission.
   ========================================================================== */

import { KRISHIOX_CONFIG } from "./app.js";

/**
 * Builds a wa.me deep link that opens WhatsApp with a pre-filled message to
 * the configured business number.
 * @param {string} message - Plain-text message body (not URL-encoded yet).
 * @returns {string} A full "https://wa.me/<number>?text=<encoded>" URL.
 */
export function buildWhatsAppLink(message) {
  const num = KRISHIOX_CONFIG.whatsappNumber;
  return "https://wa.me/" + num + "?text=" + encodeURIComponent(message);
}
