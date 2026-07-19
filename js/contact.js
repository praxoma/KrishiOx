/* ==========================================================================
   KrishiOx — Contact Configuration
   Single responsibility: the ways a farmer or visitor can reach KrishiOx —
   WhatsApp, phone, and the legal-grievance email address — plus the
   support-hours label shown alongside them. Update `whatsappNumber` and
   `callNumber` before going live.
   ========================================================================== */

/**
 * Contact channels and support hours.
 * @type {{
 *   whatsappNumber: string,
 *   callNumber: string,
 *   supportHours: string,
 *   legalContactEmail: string
 * }}
 */
export const KRISHIOX_CONTACT = {
  // WhatsApp business number in international format, no + or spaces.
  whatsappNumber: "919015579855",

  // Phone number for direct calling (tel: link)
  callNumber: "+919015579855",

  // Support hours, shown on the Contact page
  supportHours: "सुबह 6 बजे – रात 9 बजे (सातों दिन)",

  // Grievance/contact inbox — required for grievance redressal under India's
  // DPDP Act 2023, shown on privacy.html / terms.html. Set up as a free Zoho
  // Mail mailbox on the krishiox.in domain — confirm it's actually receiving
  // mail before --go-live.
  legalContactEmail: "legal@krishiox.in"
};
