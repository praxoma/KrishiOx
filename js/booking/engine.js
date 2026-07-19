/* ==========================================================================
   KrishiOx — Booking Engine
   The internal booking engine: runs the full submission pipeline —

     Booking Form -> Booking Object -> Validation -> Booking Serializer
       -> Delivery Adapter -> WhatsApp

   — behind a single function. The booking wizard (js/booking.js, the
   "Booking Form" stage) collects raw field values into its own `state`
   and hands that to `submitBooking()`; everything from there on (object
   construction, validation, serialization, delivery) is this engine's
   responsibility, not the wizard's.

   Composition root for the booking/ subsystem, not a single-responsibility
   module itself — see model.js, validator.js, serializer.js, and
   delivery-adapter.js for that.
   ========================================================================== */

import { createBooking } from "./model.js";
import { validateBooking } from "./validator.js";
import { serializeBooking } from "./serializer.js";
import { deliverBooking } from "./delivery-adapter.js";
import { whatsappDeliveryAdapter } from "./whatsapp-delivery-adapter.js";

/**
 * @typedef {Object} SubmitBookingResult
 * @property {boolean} ok
 * @property {string[]} [errors] - Present when `ok` is false — see validator.js.
 * @property {import("./model.js").Booking} [booking] - Present when `ok` is true.
 * @property {import("./serializer.js").BookingPayload} [payload] - Present when `ok` is true.
 * @property {import("./delivery-adapter.js").DeliveryResult|void} [delivery] - Present when `ok` is true.
 */

/**
 * Runs the full booking pipeline: build a Booking Object from the
 * wizard's form state, validate it, serialize it, and hand it to a
 * Delivery Adapter. Defaults to the WhatsApp adapter — the only channel
 * KrishiOx currently uses — but accepts any object matching the
 * DeliveryAdapter contract (delivery-adapter.js), which is how a future
 * REST API / SMS / Email / WhatsApp Cloud API / Push Notification channel
 * plugs in without changing this function, the wizard, or any earlier
 * pipeline stage.
 * @param {Object} formState - The booking wizard's internal `state` object.
 * @param {import("./delivery-adapter.js").DeliveryAdapter} [adapter] - Defaults to whatsappDeliveryAdapter.
 * @returns {SubmitBookingResult}
 */
export function submitBooking(formState, adapter) {
  const booking = createBooking(formState);

  const validation = validateBooking(booking);
  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  const payload = serializeBooking(booking);
  const delivery = deliverBooking(adapter || whatsappDeliveryAdapter, payload);

  return { ok: true, booking, payload, delivery };
}
