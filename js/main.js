/* ==========================================================================
   GOSPOLO — Shared App Logic
   Runs on every page: header, bottom nav, WhatsApp helpers, SW, install prompt.
   ========================================================================== */

(function () {
  "use strict";

  /* ---- Bottom Navigation ---- */
  const NAV_ITEMS = [
    { href: "index.html", icon: "home", labelHi: "होम", key: "home" },
    { href: "services.html", icon: "grid", labelHi: "सेवाएँ", key: "services" },
    { href: "booking.html", icon: "calendar", labelHi: "बुक करें", key: "booking", isBook: true },
    { href: "partners.html", icon: "handshake", labelHi: "पार्टनर", key: "partners" },
    { href: "contact.html", icon: "chat", labelHi: "संपर्क", key: "contact" }
  ];

  function currentPageKey() {
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

  function renderBottomNav() {
    const mount = document.getElementById("bottomNav");
    if (!mount) return;
    const active = currentPageKey();
    let html = "";
    NAV_ITEMS.forEach(function (item) {
      const isActive = item.key === active;
      if (item.isBook) {
        html += '<a class="nav-item nav-item-book' + (isActive ? " active" : "") + '" href="' + item.href + '">' +
          '<span class="nav-book-btn">' + gospoloIcon(item.icon) + "</span>" +
          "<span>" + item.labelHi + "</span></a>";
      } else {
        html += '<a class="nav-item' + (isActive ? " active" : "") + '" href="' + item.href + '">' +
          gospoloIcon(item.icon) + "<span>" + item.labelHi + "</span></a>";
      }
    });
    mount.innerHTML = html;
  }

  /* ---- Footer quick links ---- */
  function renderFooterLinks() {
    const mount = document.getElementById("footerLinks");
    if (!mount) return;
    const active = currentPageKey();
    const links = [
      { href: "index.html", label: "होम", key: "home" },
      { href: "services.html", label: "सेवाएँ", key: "services" },
      { href: "about.html", label: "हमारे बारे में", key: "about" },
      { href: "partners.html", label: "पार्टनर", key: "partners" },
      { href: "contact.html", label: "संपर्क", key: "contact" },
      { href: "terms.html", label: "नियम व शर्तें", key: "terms" },
      { href: "privacy.html", label: "गोपनीयता नीति", key: "privacy" }
    ];
    mount.innerHTML = links.map(function (l) {
      return '<a href="' + l.href + '"' + (l.key === active ? ' style="color:var(--copper);font-weight:800;"' : "") + '>' + l.label + "</a>";
    }).join('<span style="opacity:.4;">•</span>');
  }

  /* ---- Footer brand block (name/tagline read from config, not hardcoded per page) ---- */
  function renderFooterBrand() {
    const mount = document.getElementById("footerBrand");
    if (!mount) return;
    mount.innerHTML =
      "<strong>" + GOSPOLO_CONFIG.appName + "</strong> — " + GOSPOLO_CONFIG.appTagline + "<br>" +
      "© " + new Date().getFullYear() + " " + GOSPOLO_CONFIG.appName + ". " + GOSPOLO_CONFIG.serviceArea + " में सेवा उपलब्ध।";
  }

  /* ---- Header ---- */
  function renderHeader() {
    const mount = document.getElementById("siteHeader");
    if (!mount) return;
    mount.innerHTML =
      '<a href="index.html" class="brand">' +
        '<span class="brand-mark">' + GOSPOLO_CONFIG.brandInitials + '</span>' +
        '<span class="brand-text"><strong>' + GOSPOLO_CONFIG.appName + '</strong><span>' + GOSPOLO_CONFIG.serviceArea + "</span></span>" +
      "</a>" +
      '<div class="header-actions">' +
        '<button type="button" class="header-action text-size-btn" id="textSizeBtn" aria-label="टेक्स्ट का आकार बड़ा करें">A+</button>' +
        '<a class="header-action header-action-call" href="tel:' + GOSPOLO_CONFIG.callNumber + '" aria-label="कॉल करें">' + gospoloIcon("phone") + "</a>" +
      "</div>";
  }

  /* ---- Text size toggle (for low-vision users — cycles 100% / 115% / 130%) ---- */
  const TEXT_ZOOM_LEVELS = [1, 1.15, 1.3];
  function applyTextZoom(level) {
    document.documentElement.style.setProperty("--text-zoom", level);
  }
  function initTextSize() {
    const btn = document.getElementById("textSizeBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const current = parseFloat(GospoloStore.get("textZoom", 1));
      const idx = TEXT_ZOOM_LEVELS.indexOf(current);
      const next = TEXT_ZOOM_LEVELS[(idx + 1) % TEXT_ZOOM_LEVELS.length];
      GospoloStore.set("textZoom", next);
      applyTextZoom(next);
      showToast("टेक्स्ट का आकार: " + Math.round(next * 100) + "%");
    });
  }
  applyTextZoom(parseFloat(GospoloStore.get("textZoom", 1)));

  /* ---- Data controls (used by privacy.html's "Clear my data" button) ----
     Kept as an explicit key list rather than clearing all localStorage —
     precise and auditable against what the Privacy Policy actually claims
     this button deletes. */
  function clearAllGospoloData() {
    ["bookingDraft", "bookingHistory", "textZoom", "legalConsent"].forEach(function (key) {
      try { localStorage.removeItem("gospolo:" + key); } catch (e) { /* storage unavailable */ }
    });
    applyTextZoom(1);
  }
  window.clearAllGospoloData = clearAllGospoloData;

  /* ---- Consent banner (Terms / Privacy) ----
     Not a cookie banner — this app sets no cookies. Shown once on first
     visit, and again automatically if GOSPOLO_CONFIG.legalVersion changes,
     so a policy update doesn't get silently assumed-accepted for a
     returning visitor. */
  function initConsentBanner() {
    if (document.getElementById("consentBanner")) return;
    const stored = GospoloStore.get("legalConsent", null);
    if (stored && stored.version === GOSPOLO_CONFIG.legalVersion) return;

    const isUpdate = !!(stored && stored.version);
    const message = isUpdate
      ? "हमारी नियम व शर्तें और गोपनीयता नीति अपडेट हुई हैं — कृपया दोबारा देखें और स्वीकृति दें।"
      : GOSPOLO_CONFIG.appName + " का उपयोग जारी रखने पर आप हमारी नियम व शर्तें और गोपनीयता नीति से सहमत होते हैं। आपकी बुकिंग जानकारी सिर्फ एक WhatsApp मैसेज बनाने के लिए उपयोग होती है — किसी सर्वर पर सेव नहीं होती।";

    const banner = document.createElement("div");
    banner.id = "consentBanner";
    banner.className = "consent-banner";
    banner.innerHTML =
      "<p>" + message + "</p>" +
      '<div class="consent-actions">' +
        '<a href="terms.html" class="consent-link">नियम</a>' +
        '<a href="privacy.html" class="consent-link">गोपनीयता</a>' +
        '<button type="button" class="btn btn-primary btn-sm" id="consentAcceptBtn">मैं सहमत हूँ</button>' +
      "</div>";
    document.body.appendChild(banner);

    document.getElementById("consentAcceptBtn").addEventListener("click", function () {
      GospoloStore.set("legalConsent", { version: GOSPOLO_CONFIG.legalVersion, ts: Date.now() });
      banner.remove();
    });
  }

  /* ---- Floating WhatsApp button (present on every page) ---- */
  function renderFab() {
    if (document.getElementById("globalFab")) return;
    const a = document.createElement("a");
    a.id = "globalFab";
    a.className = "fab-whatsapp";
    a.setAttribute("aria-label", "WhatsApp पर संपर्क करें");
    a.href = buildWhatsAppLink("नमस्ते " + GOSPOLO_CONFIG.appName + ", मुझे खेती सेवा के बारे में जानकारी चाहिए।");
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML = gospoloIcon("whatsapp");
    document.body.appendChild(a);
  }

  /* ---- WhatsApp helpers ---- */
  function buildWhatsAppLink(message) {
    const num = GOSPOLO_CONFIG.whatsappNumber;
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(message);
  }
  window.buildWhatsAppLink = buildWhatsAppLink;

  /* ---- Toast ---- */
  let toastTimer = null;
  function showToast(msg, duration) {
    let toast = document.getElementById("gospoloToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "gospoloToast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, duration || 2400);
  }
  window.gospoloToast = showToast;

  /* ---- FAQ accordion (used on Contact/About pages) ---- */
  function initFaq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      const q = item.querySelector(".faq-q");
      if (!q) return;
      q.addEventListener("click", function () {
        const wasOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
          if (openItem !== item) openItem.classList.remove("open");
        });
        item.classList.toggle("open", !wasOpen);
      });
    });
  }

  /* ---- Offline banner ---- */
  function initOfflineBanner() {
    const banner = document.getElementById("offlineBanner");
    if (!banner) return;
    function update() {
      banner.classList.toggle("show", !navigator.onLine);
    }
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
  }

  /* ---- Service Worker registration + forced update delivery ----
     There's no app store to push updates through, so a new deploy has to
     reach already-installed PWAs on its own. sw.js calls skipWaiting() as
     soon as a new version installs; here we detect that handover and
     reload automatically so the farmer is never stuck on stale code.
     The `hadController` guard stops this from firing (and reloading) on a
     brand-new first-ever visit, where there's no real "update" happening —
     only on a genuine version change for a returning visitor. */
  function initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", function () {
      const hadController = !!navigator.serviceWorker.controller;
      let reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (!hadController || reloading) return;
        reloading = true;
        sessionStorage.setItem("gospolo:justUpdated", "1");
        window.location.reload();
      });

      navigator.serviceWorker.register("sw.js").then(function (reg) {
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

  function notifyIfJustUpdated() {
    if (sessionStorage.getItem("gospolo:justUpdated")) {
      sessionStorage.removeItem("gospolo:justUpdated");
      showToast(GOSPOLO_CONFIG.appName + " अपडेट हो गया है ✓");
    }
  }

  /* ---- Install prompt (Add to Home Screen) ---- */
  let deferredInstallPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btn = document.getElementById("installBtn");
    if (btn) btn.style.display = "inline-flex";
  });

  function initInstallButton() {
    const btn = document.getElementById("installBtn");
    if (!btn) return;
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

  /* ---- Boot ---- */
  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderBottomNav();
    renderFooterLinks();
    renderFooterBrand();
    renderFab();
    initFaq();
    initOfflineBanner();
    initInstallButton();
    initTextSize();
    notifyIfJustUpdated();
    initConsentBanner();
  });

  initServiceWorker();
})();
