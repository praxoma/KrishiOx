/* ==========================================================================
   KrishiOx — Navigation
   Single responsibility: current-page identity and the bottom navigation
   bar (page-to-page wayfinding). Header/footer/FAB/etc. are ui.js's
   responsibility, not this module's.
   ========================================================================== */

import { krishiOxIcon } from "./icons.js";

const NAV_ITEMS = [
  { href: "index.html", icon: "home", labelHi: "होम", key: "home" },
  { href: "services.html", icon: "grid", labelHi: "सेवाएँ", key: "services" },
  { href: "booking.html", icon: "calendar", labelHi: "बुक करें", key: "booking", isBook: true },
  { href: "partners.html", icon: "handshake", labelHi: "पार्टनर", key: "partners" },
  { href: "contact.html", icon: "chat", labelHi: "संपर्क", key: "contact" }
];

/**
 * Identifies the current page from `location.pathname`, used to highlight
 * the active bottom-nav item and footer link. Unrecognized paths default
 * to "home".
 * @returns {string} One of: "home", "services", "booking", "partners",
 *   "about", "contact", "terms", "privacy".
 */
export function currentPageKey() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const map = {
    "index.html": "home",
    "": "home",
    "services.html": "services",
    "booking.html": "booking",
    "partners.html": "partners",
    "about.html": "about",
    "contact.html": "contact",
    "terms.html": "terms",
    "privacy.html": "privacy"
  };
  return map[path] || "home";
}

/**
 * Renders the 5-item bottom navigation bar into `#bottomNav`, highlighting
 * the current page. No-ops if the mount element isn't present on the page.
 * @returns {void}
 */
export function renderBottomNav() {
  const mount = document.getElementById("bottomNav");
  if (!mount) return;
  const active = currentPageKey();
  let html = "";
  NAV_ITEMS.forEach(function (item) {
    const isActive = item.key === active;
    if (item.isBook) {
      html += '<a class="nav-item nav-item-book' + (isActive ? " active" : "") + '" href="' + item.href + '">' +
        '<span class="nav-book-btn">' + krishiOxIcon(item.icon) + "</span>" +
        "<span>" + item.labelHi + "</span></a>";
    } else {
      html += '<a class="nav-item' + (isActive ? " active" : "") + '" href="' + item.href + '">' +
        krishiOxIcon(item.icon) + "<span>" + item.labelHi + "</span></a>";
    }
  });
  mount.innerHTML = html;
}
