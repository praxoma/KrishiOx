/* ==========================================================================
   GOSPOLO — Service Worker
   Strategy:
   - App shell (HTML/CSS/JS/icons/manifest) precached on install.
   - Cache-first for static assets, network-first for navigation with
     offline.html fallback.
   - Cache versioning: bump CACHE_VERSION to invalidate old caches on deploy.
   ========================================================================== */

const CACHE_VERSION = "gospolo-v1";
const STATIC_CACHE = CACHE_VERSION + "-static";

const APP_SHELL = [
  "./",
  "./index.html",
  "./services.html",
  "./booking.html",
  "./partners.html",
  "./about.html",
  "./contact.html",
  "./offline.html",
  "./manifest.json",
  "./css/style.css",
  "./js/config.js",
  "./js/icons.js",
  "./js/main.js",
  "./js/booking.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(APP_SHELL);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key.indexOf(CACHE_VERSION) !== 0;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;

  // Navigation requests: network-first, fall back to cache, then offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          const resClone = res.clone();
          caches.open(STATIC_CACHE).then(function (cache) { cache.put(req, resClone); });
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (cached) {
            return cached || caches.match("./offline.html");
          });
        })
    );
    return;
  }

  // Static assets: cache-first, update cache in background.
  event.respondWith(
    caches.match(req).then(function (cached) {
      const fetchPromise = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          const resClone = res.clone();
          caches.open(STATIC_CACHE).then(function (cache) { cache.put(req, resClone); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || fetchPromise;
    })
  );
});
