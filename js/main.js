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
      "contact.html": "contact"
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
      { href: "contact.html", label: "संपर्क", key: "contact" }
    ];
    mount.innerHTML = links.map(function (l) {
      return '<a href="' + l.href + '"' + (l.key === active ? ' style="color:var(--copper);font-weight:800;"' : "") + '>' + l.label + "</a>";
    }).join('<span style="opacity:.4;">•</span>');
  }

  /* ---- Header ---- */
  function renderHeader() {
    const mount = document.getElementById("siteHeader");
    if (!mount) return;
    mount.innerHTML =
      '<a href="index.html" class="brand">' +
        '<span class="brand-mark">GP</span>' +
        '<span class="brand-text"><strong>GOSPOLO</strong><span>' + GOSPOLO_CONFIG.serviceArea + "</span></span>" +
      "</a>" +
      '<div class="header-actions">' +
        '<button type="button" class="header-action text-size-btn" id="textSizeBtn" aria-label="टेक्स्ट का आकार बड़ा करें">A+</button>' +
        '<a class="header-action" href="contact.html" aria-label="Help">' + gospoloIcon("bell") + "</a>" +
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

  /* ---- Floating WhatsApp button (present on every page) ---- */
  function renderFab() {
    if (document.getElementById("globalFab")) return;
    const a = document.createElement("a");
    a.id = "globalFab";
    a.className = "fab-whatsapp";
    a.setAttribute("aria-label", "WhatsApp पर संपर्क करें");
    a.href = buildWhatsAppLink("नमस्ते GOSPOLO, मुझे खेती सेवा के बारे में जानकारी चाहिए।");
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

  /* ---- Service Worker registration ---- */
  function initServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {
          /* offline-first still works without SW registration succeeding */
        });
      });
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
    renderFab();
    initFaq();
    initOfflineBanner();
    initInstallButton();
    initTextSize();
  });

  initServiceWorker();
})();
