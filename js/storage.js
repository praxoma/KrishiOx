/* ==========================================================================
   KrishiOx — Local Storage
   Single responsibility: namespaced, fail-safe access to localStorage.
   Every other module that needs to persist something imports this instead
   of touching `localStorage` directly.
   ========================================================================== */

const KEY_PREFIX = "krishiox:";

/**
 * Namespaced wrapper around `localStorage`. All keys are stored under the
 * "krishiox:" prefix so KrishiOx's own data never collides with anything
 * else that might use localStorage on the same origin. Every method fails
 * silently (never throws) so a full/unavailable storage quota (e.g. private
 * browsing) degrades gracefully instead of crashing the page.
 */
export const KrishiOxStore = {
  /**
   * Reads and JSON-parses a stored value.
   * @param {string} key - Unprefixed key name.
   * @param {*} fallback - Value returned if the key is missing or storage is unavailable.
   * @returns {*} The parsed value, or `fallback`.
   */
  get(key, fallback) {
    try {
      const v = localStorage.getItem(KEY_PREFIX + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  },

  /**
   * JSON-stringifies and stores a value.
   * @param {string} key - Unprefixed key name.
   * @param {*} value - Any JSON-serializable value.
   * @returns {void}
   */
  set(key, value) {
    try {
      localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) { /* storage unavailable — ignore */ }
  },

  /**
   * Removes a single stored key.
   * @param {string} key - Unprefixed key name.
   * @returns {void}
   */
  remove(key) {
    try {
      localStorage.removeItem(KEY_PREFIX + key);
    } catch (e) { /* storage unavailable — ignore */ }
  }
};
