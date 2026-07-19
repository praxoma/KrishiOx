/* ==========================================================================
   KrishiOx — Booking Engine: Model
   Single responsibility: shape a Booking Object out of raw wizard form
   state. This is the "Booking Object" stage of the booking engine
   pipeline (Booking Form -> Booking Object -> Validation -> Booking
   Serializer -> Delivery Adapter -> WhatsApp).

   The Booking Object is the engine's internal, delivery-agnostic
   representation of a booking — it resolves the service reference once
   (instead of every downstream layer re-looking it up) and drops
   wizard-mechanical fields (like the wizard's current `step`) that have
   no meaning outside the form.
   ========================================================================== */

import { KRISHIOX_SERVICES } from "../services.js";

/**
 * @typedef {Object} Booking
 * @property {?{id: string, nameHi: string, nameEn: string, desc: string, icon: string, unit: string}} service
 *   The resolved service catalogue entry, or `null` if the form's
 *   `serviceId` didn't match anything (should not happen once validated).
 * @property {boolean} isOtherService - True when `service.id === "other"`.
 * @property {string} village
 * @property {number} quantity - Meaningful only when `!isOtherService`.
 * @property {string} otherDetails - Meaningful only when `isOtherService`.
 * @property {string} date - ISO "YYYY-MM-DD".
 * @property {string} dateLabel - Hindi-formatted date, e.g. "22 जुलाई 2026".
 * @property {{name: string, phone: string}} contact
 * @property {string} remarks
 */

/**
 * Builds a Booking Object from the booking wizard's raw form state.
 * Pure function — does not read or write the DOM, storage, or draft state.
 * @param {{
 *   serviceId: ?string, village: string, qty: number, otherDetails: string,
 *   date: string, dateLabel: string, name: string, phone: string, remarks: string
 * }} formState - The booking wizard's internal `state` object.
 * @returns {Booking}
 */
export function createBooking(formState) {
  const service = KRISHIOX_SERVICES.find(function (s) { return s.id === formState.serviceId; }) || null;
  return {
    service,
    isOtherService: formState.serviceId === "other",
    village: formState.village,
    quantity: formState.qty,
    otherDetails: formState.otherDetails,
    date: formState.date,
    dateLabel: formState.dateLabel,
    contact: { name: formState.name, phone: formState.phone },
    remarks: formState.remarks
  };
}
