/* ==========================================================================
   KrishiOx — PWA
   Single responsibility: service-worker registration, the tap-to-update
   handoff, and the "Add to Home Screen" install prompt.

   There's no app store to push updates through, so a new deploy has to
   reach already-installed PWAs on its own. A new worker precaches itself
   in the background but deliberately does NOT take over automatically
   (see sw.js) — it sits "waiting" until the header's update icon is
   tapped, which posts it a message to finish activating. This means a
   farmer mid-way through the booking wizard is never yanked onto a fresh
   reload without asking; the update simply sits ready until they choose
   to take it (or until their next natural, idle page load).
   ========================================================================== */

import { KRISHIOX_CONFIG } from "./app.js";
import { showToast } from "./ui.js";

// Set once a new version is confirmed ready — read by the header icon and
// the footer's manual check.
let updateRegistration = null;

function showUpdateIcon(reg) {
  if (updateRegistration) return;
  updateRegistration = reg;
  const btn = document.getElementById("updateBtn");
  if (btn) btn.style.display = "inline-flex";
}

function watchForUpdates(reg) {
  // Covers the case where an update finished downloading in a background
  // tab before this page even loaded.
  if (reg.waiting && navigator.serviceWorker.controller) showUpdateIcon(reg);

  reg.addEventListener("updatefound", function () {
    const newWorker = reg.installing;
    if (!newWorker) return;
    newWorker.addEventListener("statechange", function () {
      // "installed" + an existing controller = a genuine update just
      // finished precaching, not the very first install on a new visit.
      if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
        showUpdateIcon(reg);
      }
    });
  });
}

/**
 * Wires up the header's update icon (`#updateBtn`): tapping it tells the
 * waiting service worker to activate via `postMessage("SKIP_WAITING")`.
 * No-ops if the button isn't present on the page.
 * @returns {void}
 */
export function initUpdateButton() {
  const btn = document.getElementById("updateBtn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    if (!updateRegistration || !updateRegistration.waiting || btn.disabled) return;
    btn.disabled = true;
    updateRegistration.waiting.postMessage("SKIP_WAITING");
  });
}

/**
 * Wires up the footer's "नवीनतम अपडेट जांचें" (check for update) button —
 * belt-and-braces alongside the automatic background check on
 * visibilitychange. Reuses the same detection as the header update icon
 * rather than applying an update itself, so behavior stays consistent:
 * this button only ever surfaces the header icon or reports "already
 * latest," it never forces a reload on its own. No-ops if the button
 * isn't present; hides it if the browser has no Service Worker support.
 * @returns {void}
 */
export function initCheckUpdateButton() {
  const btn = document.getElementById("checkUpdateBtn");
  if (!btn) return;
  if (!("serviceWorker" in navigator)) { btn.style.display = "none"; return; }
  btn.addEventListener("click", function () {
    navigator.serviceWorker.getRegistration().then(function (reg) {
      if (!reg) { showToast("अपडेट सेवा उपलब्ध नहीं है"); return; }
      if (updateRegistration) { showToast("नया अपडेट पहले से तैयार है — ऊपर आइकन दबाएं"); return; }
      showToast("नवीनतम जांच रहे हैं...");
      reg.update().then(function () {
        setTimeout(function () {
          showToast(updateRegistration ? "नया अपडेट मिला! ऊपर आइकन दबाएं" : "आप पहले से नवीनतम संस्करण पर हैं ✓");
        }, 2000);
      }).catch(function () {
        showToast("जांच नहीं हो सकी — नेटवर्क जांचें");
      });
    });
  });
}

/**
 * Registers `sw.js` and wires up the update-detection watchers. Also
 * reloads the page (once) after a new worker takes over, flagging
 * `sessionStorage["krishiox:justUpdated"]` so `notifyIfJustUpdated()` can
 * show a confirmation toast on the reloaded page. Safe to call
 * unconditionally — no-ops if the browser has no Service Worker support.
 * @returns {void}
 */
export function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function () {
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController || reloading) return;
      reloading = true;
      sessionStorage.setItem("krishiox:justUpdated", "1");
      window.location.reload();
    });

    // updateViaCache: "none" — without this, some browsers will check for a
    // new sw.js by reading it back from the HTTP disk cache (max-age=600 on
    // GitHub Pages) instead of the network, so an update check can report
    // "no change" for up to 10 minutes even though a new version was just
    // pushed. Forcing "none" means every check is a real network request.
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (reg) {
      watchForUpdates(reg);
      // The browser's own update check can lag on a poor connection;
      // re-check whenever the app comes back to the foreground.
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") reg.update().catch(function () {});
      });
    }).catch(function () {
      /* offline-first still works without SW registration succeeding */
    });
  });
}

/**
 * If the page was just reloaded as part of a service-worker update
 * handoff, shows a one-time confirmation toast and clears the flag. Call
 * once per page load, alongside `initServiceWorker()`.
 * @returns {void}
 */
export function notifyIfJustUpdated() {
  if (sessionStorage.getItem("krishiox:justUpdated")) {
    sessionStorage.removeItem("krishiox:justUpdated");
    showToast(KRISHIOX_CONFIG.appName + " अपडेट हो गया है ✓");
  }
}

/* ---- Install prompt (Add to Home Screen) ---- */

let deferredInstallPrompt = null;

// Registered immediately at module load (not gated on DOMContentLoaded) so
// the event is captured even if it fires before the page finishes parsing.
window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById("installBtn");
  if (btn) btn.style.display = "inline-flex";
});

/**
 * Wires up the header's install button (`#installBtn`): tapping it replays
 * the captured `beforeinstallprompt` event via `.prompt()`. No-ops if the
 * button isn't present; shows a fallback toast if no deferred prompt has
 * been captured (already installed, or the browser doesn't support the
 * deferred-prompt flow, e.g. iOS Safari/Firefox).
 * @returns {void}
 */
export function initInstallButton() {
  const btn = document.getElementById("installBtn");
  if (!btn) return;
  if (deferredInstallPrompt) btn.style.display = "inline-flex";
  btn.addEventListener("click", function () {
    if (!deferredInstallPrompt) {
      showToast("ऐप पहले से इंस्टॉल है या ब्राउज़र मेनू से इंस्टॉल करें");
      return;
    }
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(function () {
      deferredInstallPrompt = null;
      btn.style.display = "none";
    });
  });
}
