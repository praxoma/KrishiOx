/* ==========================================================================
   KrishiOx — Booking Engine: Serializer
   Single responsibility: turn a validated Booking Object into a
   delivery-agnostic payload — the "Booking Serializer" stage of the
   pipeline (Booking Form -> Booking Object -> Validation -> Booking
   Serializer -> Delivery Adapter -> WhatsApp).

   Produces two things a future adapter might need:
     - `text`   a rendered Hindi message, identical to what the app has
                always sent to WhatsApp. Any text-based channel (SMS,
                email body, push notification body, the current WhatsApp
                adapter) can use this as-is without knowing anything about
                Booking Object internals.
     - `fields` the same data broken out by field, for adapters that want
                structured data instead of a flat string (a REST API body,
                a WhatsApp Cloud API structured message template).
   Neither shape is adapter-specific — that's the point: the serializer
   doesn't know which adapter (if any) will consume its output.
   ========================================================================== */

/**
 * @typedef {Object} BookingPayload
 * @property {string} text - Rendered Hindi message, ready to send as-is.
 * @property {Object} fields - The same booking data broken out by field.
 */

/**
 * Serializes a Booking Object into a BookingPayload.
 * @param {import("./model.js").Booking} booking - Should already be valid
 *   (see validator.js) — this function does not re-validate.
 * @returns {BookingPayload}
 */
export function serializeBooking(booking) {
  const svc = booking.service;

  const fields = {
    service: svc ? { id: svc.id, nameHi: svc.nameHi, nameEn: svc.nameEn } : null,
    village: booking.village,
    quantity: booking.isOtherService ? null : { value: booking.quantity, unit: svc ? svc.unit : "" },
    otherDetails: booking.isOtherService ? booking.otherDetails : null,
    date: { iso: booking.date, label: booking.dateLabel },
    contact: booking.contact,
    remarks: booking.remarks
  };

  const lines = [];
  lines.push("नमस्ते KrishiOx 🙏");
  lines.push("मुझे निम्न सेवा बुक करनी है:");
  lines.push("");
  lines.push("🔧 सेवा: " + (svc ? svc.nameHi + " (" + svc.nameEn + ")" : "—"));
  lines.push("📍 गाँव: " + (booking.village || "—"));
  if (booking.isOtherService) {
    lines.push("📝 विवरण: " + (booking.otherDetails || "—"));
  } else {
    lines.push("📏 मात्रा: " + booking.quantity + " " + (svc ? svc.unit : ""));
  }
  lines.push("📅 तारीख: " + (booking.dateLabel || booking.date || "—"));
  if (booking.contact.name) lines.push("🙋 नाम: " + booking.contact.name);
  if (booking.contact.phone) lines.push("📞 मोबाइल: " + booking.contact.phone);
  if (booking.remarks) lines.push("🗒️ टिप्पणी: " + booking.remarks);
  lines.push("");
  lines.push("कृपया बुकिंग की पुष्टि करें। धन्यवाद!");

  return { text: lines.join("\n"), fields };
}
