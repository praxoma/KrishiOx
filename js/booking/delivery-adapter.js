/* ==========================================================================
   KrishiOx — Booking Engine: Delivery Adapter Contract
   Single responsibility: define what a Delivery Adapter is, and provide
   the one call site the engine uses to invoke one. This is the seam the
   architecture is built around — every future channel (REST API, SMS,
   Email, WhatsApp Cloud API, Push Notification) is a new file that
   implements this same contract; nothing upstream (Booking Form, Booking
   Object, Validation, Serializer) needs to know which adapter is in use.

   Today only one concrete adapter exists — whatsapp-delivery-adapter.js —
   because that's the only channel KrishiOx actually uses. Adding a new
   channel means writing a new object matching the DeliveryAdapter shape
   below and passing it to `submitBooking()` (see engine.js); it does not
   mean touching this file, the engine, or anything upstream of it.
   ========================================================================== */

/**
 * @typedef {Object} DeliveryResult
 * @property {string} channel - e.g. "whatsapp", "sms", "email", "rest", "push".
 * @property {string} [url] - The link/handle used for delivery, if the
 *   channel produces one (e.g. a wa.me URL) — callers that need a
 *   fallback link (like the booking wizard's success screen) read this.
 */

/**
 * @typedef {Object} DeliveryAdapter
 * @property {string} name - Adapter identifier, e.g. "whatsapp".
 * @property {function(import("./serializer.js").BookingPayload): (DeliveryResult|void)} deliver
 *   Sends a serialized booking through this adapter's channel. May have
 *   side effects (opening a link, calling an API, etc.) and may
 *   optionally return a DeliveryResult describing what happened.
 */

/**
 * Invokes a Delivery Adapter. The engine calls through this single
 * function rather than calling `adapter.deliver()` directly, so any
 * future cross-cutting concern (delivery logging, retry, analytics) has
 * one place to hook in without touching the engine or any adapter.
 * @param {DeliveryAdapter} adapter
 * @param {import("./serializer.js").BookingPayload} payload
 * @returns {DeliveryResult|void}
 */
export function deliverBooking(adapter, payload) {
  return adapter.deliver(payload);
}
