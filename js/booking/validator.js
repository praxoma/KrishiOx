/* ==========================================================================
   KrishiOx — Booking Engine: Validation
   Single responsibility: check a Booking Object is complete/consistent
   before it's serialized and handed to a delivery adapter.

   This mirrors the booking wizard's existing per-step `validStep()` rules
   (js/booking.js) exactly — the wizard's Next button already refuses to
   advance past an incomplete step, so in normal use this validation
   should always pass by the time a booking reaches the engine. It exists
   as a defensive boundary check for the domain object itself (the same
   "don't trust the caller, re-check at the boundary" instinct behind the
   CI cache-version guard — see DECISIONS.md), not as a new user-facing
   rule. It must stay in sync with `validStep()` — the two are intentionally
   duplicated, not shared, because they answer different questions ("can
   the wizard advance one step" vs. "is this finished object deliverable")
   at different layers; see DECISIONS.md for why this duplication is kept.
   ========================================================================== */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} errors - Field names that failed validation, e.g. "village".
 */

/**
 * Validates a Booking Object.
 * @param {import("./model.js").Booking} booking
 * @returns {ValidationResult}
 */
export function validateBooking(booking) {
  const errors = [];

  if (!booking.service) errors.push("service");
  if (!booking.village || !booking.village.trim()) errors.push("village");

  if (booking.isOtherService) {
    if (!booking.otherDetails || !booking.otherDetails.trim()) errors.push("otherDetails");
  } else if (!(booking.quantity > 0)) {
    errors.push("quantity");
  }

  if (!booking.date) errors.push("date");
  if (!booking.contact.name || !booking.contact.name.trim()) errors.push("name");
  if (booking.contact.phone && booking.contact.phone.length !== 10) errors.push("phone");

  return { valid: errors.length === 0, errors };
}
