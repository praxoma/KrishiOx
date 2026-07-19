/* ==========================================================================
   KrishiOx — Booking Engine: WhatsApp Delivery Adapter
   Single responsibility: implement the DeliveryAdapter contract
   (delivery-adapter.js) for WhatsApp — the current and only delivery
   channel. No backend: "delivering" a booking here means building a
   wa.me deep link from the serialized message text and opening it, so
   the farmer's own WhatsApp app sends it from their own number, exactly
   as KrishiOx has always worked.
   ========================================================================== */

import { buildWhatsAppLink } from "../whatsapp.js";

/**
 * @type {import("./delivery-adapter.js").DeliveryAdapter}
 */
export const whatsappDeliveryAdapter = {
  name: "whatsapp",

  /**
   * @param {import("./serializer.js").BookingPayload} payload
   * @returns {import("./delivery-adapter.js").DeliveryResult}
   */
  deliver(payload) {
    const url = buildWhatsAppLink(payload.text);
    // "noopener" matches every target="_blank" anchor elsewhere in the app —
    // without it, the new tab gets a live `window.opener` reference back to
    // this page (a known reverse-tabnabbing/perf issue on Chrome, Safari,
    // Firefox, and Edge alike).
    window.open(url, "_blank", "noopener");
    return { channel: "whatsapp", url };
  }
};
