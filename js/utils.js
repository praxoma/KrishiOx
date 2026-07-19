/* ==========================================================================
   KrishiOx — Utilities
   Single responsibility: generic, stateless helpers with no dependency on
   app config, storage, or UI state — safe to import from any other module
   without creating a cycle.
   ========================================================================== */

/**
 * Escapes HTML special characters so untrusted text (e.g. farmer-typed
 * remarks) can be safely interpolated into `innerHTML`.
 * @param {*} str - Value to escape (coerced to string).
 * @returns {string} The escaped string.
 */
export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/**
 * Formats a Date as an ISO "YYYY-MM-DD" string, in local time.
 * @param {Date} dateObj
 * @returns {string}
 */
export function isoDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

/**
 * Formats a Date as a Hindi-readable string, e.g. "22 जुलाई 2026".
 * @param {Date} dateObj
 * @returns {string}
 */
export function formatDateHi(dateObj) {
  const months = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  return dateObj.getDate() + " " + months[dateObj.getMonth()] + " " + dateObj.getFullYear();
}

/**
 * Copies text to the clipboard, preferring the async Clipboard API and
 * falling back to a hidden-textarea + `execCommand("copy")` for contexts
 * where it's unavailable. Reports success/failure only — this function has
 * no UI side effects; callers decide what feedback (if any) to show.
 * @param {string} text
 * @returns {Promise<boolean>} Resolves `true` on success, `false` on failure.
 */
export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
      .then(function () { return true; })
      .catch(function () { return legacyCopy(text); });
  }
  return Promise.resolve(legacyCopy(text));
}

function legacyCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  let ok = true;
  try {
    document.execCommand("copy");
  } catch (e) {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}
