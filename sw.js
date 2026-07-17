/**
 * GOSPOLO - Service Worker Core
 */

const CACHE_NAME = 'gospolo-v1-cache';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Strategy: Cache First, Fallback to Network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                // Fetch fresh copy in the background asynchronously
                fetch(event.request).then(networkResponse => {
                    if (networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
                    }
                }).catch(() => {/* Ignore network errors when offline */});
                
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
