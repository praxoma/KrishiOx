/* ==========================================================================
   KrishiOx — Service Worker
   Strategy (tuned for poor/flaky rural connectivity, not just "offline"):
   - App shell (HTML/CSS/JS/icons/manifest) precached on install, resiliently —
     one flaky asset must not fail the whole precache on a bad 2G/3G link.
   - Navigation: race network against a short timeout. If the network is
     slower than that (common on 2G), serve the cached page immediately
     instead of making the farmer stare at a blank screen; the network
     request keeps running in the background and still updates the cache
     for next time.
   - Static assets: cache-first, revalidate in background (unchanged — this
     is already the fast option under poor connectivity).
   - Cache versioning: bump CACHE_VERSION to invalidate old caches on deploy.
     Combined with the update logic in js/main.js, this is what makes a new
     version available to a device that already has the PWA installed.
   - Update handoff: a new worker installs and precaches in the background
     but does NOT skipWaiting() automatically — it waits for an explicit
     "SKIP_WAITING" message from the page. That message only gets sent once
     the user taps the header's update icon, so a farmer mid-way through the
     booking wizard is never yanked onto a fresh reload without asking.
   ========================================================================== */

const CACHE_VERSION = "krishiox-v5";
const STATIC_CACHE = CACHE_VERSION + "-static";
const NAV_TIMEOUT_MS = 4000;

const APP_SHELL = [
  "./",
  "./index.html",
  "./services.html",
  "./booking.html",
  "./partners.html",
  "./about.html",
  "./contact.html",
  "./terms.html",
  "./privacy.html",
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
      // Cache each file independently (not cache.addAll, which is all-or-nothing) —
      // on a flaky rural connection, one timed-out asset shouldn't sink the whole
      // precache and leave the farmer with zero offline support.
      return Promise.allSettled(
        APP_SHELL.map(function (url) { return cache.add(url); })
      );
    })
    // No self.skipWaiting() here on purpose — the new worker sits fully
    // precached and "waiting" until the page explicitly asks it to take
    // over (see the message listener below), instead of forcing every open
    // tab onto it immediately.
  );
});

self.addEventListener("message", function (event) {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
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

  // Navigation requests: race the network against a short timeout. If the
  // network is faster, use it (and cache it) — freshest content when the
  // connection is decent. If it's slower than NAV_TIMEOUT_MS (typical on
  // rural 2G/3G), serve the cached page immediately instead of leaving the
  // farmer staring at a blank screen; the network fetch keeps running and
  // still updates the cache for the next visit.
  if (req.mode === "navigate") {
    event.respondWith(
      (function () {
        // cache: "no-store" forces this past the browser's own HTTP disk
        // cache (GitHub Pages sends max-age=600) so a fresh deploy is seen
        // immediately instead of only after that window expires.
        const networkPromise = fetch(req, { cache: "no-store" }).then(function (res) {
          const resClone = res.clone();
          caches.open(STATIC_CACHE).then(function (cache) { cache.put(req, resClone); });
          return res;
        });

        const timeoutPromise = new Promise(function (resolve) {
          setTimeout(function () { resolve(null); }, NAV_TIMEOUT_MS);
        });

        return Promise.race([networkPromise, timeoutPromise])
          .then(function (fastResult) {
            if (fastResult) return fastResult;
            return caches.match(req).then(function (cached) {
              return cached || networkPromise.catch(function () { return caches.match("./offline.html"); });
            });
          })
          .catch(function () {
            return caches.match(req).then(function (cached) {
              return cached || caches.match("./offline.html");
            });
          });
      })()
    );
    return;
  }

  // Static assets: cache-first, update cache in background.
  event.respondWith(
    caches.match(req).then(function (cached) {
      const fetchPromise = fetch(req, { cache: "no-store" }).then(function (res) {
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
