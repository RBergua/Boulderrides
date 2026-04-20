// ============================================================
// Service Worker (sw) — MapTiler vector tile cache
// ============================================================
//
// WHY THIS EXISTS
// ---------------
// MapTiler's free tier allows 100,000 tile requests/month. Each
// user loads may load roughly 200 tiles on their first visit. 
// Once the limit is hit, the map falls back to Stadia Outdoors for 
// everyone for the rest of the month.
//
// This Service Worker solves that by making sure each device only
// ever counts as ONE visitor. No matter how many times they come
// back within 120 days.
//
// HOW IT WORKS
// ------------
// The browser installs this file automatically the first time
// a user visits boulderrides.cc. After that, it silently sits
// between the browser and the internet, intercepting every
// network request.
//
// When a MapTiler tile is requested:
//   • Cache hit  → served instantly from disk. Zero API requests.
//   • Cache miss → fetched from MapTiler, then saved for next time.
//
// Tiles are kept for 120 days. After that they expire and are
// re-fetched fresh on the next visit. The total cache size for
// a typical Boulder-area session should be around 50 MB per user
// including generous zomming in and out.
//
// Unlike the regular browser HTTP cache, this cache lasts much 
// longer, survives hard-refreshes (Ctrl+Shift+R), tab closes, and 
// mobile app background-kills.
//
// FASTER EXPERIENCE FOR THE USER
// --------------------------------
// Beyond saving API quota, cached tiles load instantly from disk
// rather than travelling across the internet. On a return visit
// the map appears fully rendered in milliseconds. Noticeably
// faster than the first load, and completely unaffected by the
// user's network speed or MapTiler's server response time.
//
// CACHE LIFECYCLE
// ---------------
// On activation, two things happen automatically:
//   1. Any old cache versions are deleted.
//   2. A sweep evicts every tile already older than 120 days, so the
//      cache always starts clean and never silently accumulates old
//      tiles.
//
// To force every user to start from a completely empty cache (e.g.
// after a MapTiler style update), bump CACHE_NAME to v2. The activate
// listener will automatically delete v1 on every device.
//
// DEPLOYMENT
// ----------
// This file must live at the ROOT of the server:
//   https://boulderrides.cc/sw.js   ✓
//   https://boulderrides.cc/js/sw.js ✗  (won't work in a subfolder)
//
// TESTING (Chrome DevTools)
// -------------------------
// After deploying, open boulderrides.cc and press F12.
//
// Step 1 — Confirm the SW installed:
//   Application tab → Service Workers (left sidebar)
//   You should see sw.js with a green dot: "activated and running"
//
// Step 2 — Confirm cache is used on reload:
//   Reload with Ctrl+R → Network tab
//   Every tile should show "(ServiceWorker)" or "(disk cache)"in 
//   the Size column instead of a file size. That means zero bytes 
//   were fetched from the network.
//   The key check is 0.0 kB transferred in the bottom bar.
//
// Step 3 — Confirm the cache contents:
//   Cache size:    Application tab → Storage (left sidebar) → maptiler-tiles-v2
//   Cached files:  Application tab → Cache Storage (left sidebar) → maptiler-tiles-v1 → Cached Requests
// ============================================================

const CACHE_NAME  = 'maptiler-tiles-v1';  // bump to v2 to force-clear all cached tiles
const MAX_AGE_SEC = 120 * 24 * 3600;      // 120 days in seconds

function normalizeRequest(request) {
  const url = new URL(request.url);
  return new Request(url.origin + url.pathname);
}

// Runs once when this SW version activates (fresh install or after a CACHE_NAME bump).
// 1. Deletes every cache that isn't CACHE_NAME (cleans up old versions).
// 2. Sweeps the current cache and deletes anything already older than MAX_AGE_SEC,
//    so the cache never silently accumulates tiles and grows in size.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(async keys => {

      // 1. Delete old cache versions
      await Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );

      // 2. Sweep expired tiles out of the current cache
      const cache   = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      const now     = Date.now();

      await Promise.all(
        requests.map(async req => {
          const res        = await cache.match(req);
          const cachedTime = res?.headers.get('sw-cache-time');
          if (!cachedTime) return;
          const age = (now - parseInt(cachedTime, 10)) / 1000;
          if (age >= MAX_AGE_SEC) await cache.delete(req);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Only intercept MapTiler vector tiles requests. Ignore everything else.
  // HEAD requests (used for the availability) are not cached
  if (!url.includes('api.maptiler.com/tiles/')) return;
  
  if (event.request.method !== 'GET') return;

  const cacheKey = normalizeRequest(event.request);

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {

      // 1. Check the cache first
      const cached = await cache.match(cacheKey);

      if (cached) {
        const cachedTime = cached.headers.get('sw-cache-time');
        
        if (cachedTime) {
          const age = (Date.now() - parseInt(cachedTime, 10)) / 1000;

          // If the cached tile is still fresh, return it immediately  
          if (age < MAX_AGE_SEC) {
            return cached;
          }

          // Expired: block and fetch fresh from MapTiler
          await cache.delete(cacheKey);
        } 
      }

      // 2. Cache miss: fetch from MapTiler
      const response = await fetch(event.request);

      // 3. Save a clean copy to cache with timestamp (only if the request succeeded)
      if (response.ok) {
        const headers = new Headers(response.headers);
        headers.set('sw-cache-time', Date.now().toString());

        const responseToCache = new Response(await response.clone().arrayBuffer(), {
          status: response.status,
          statusText: response.statusText,
          headers
        });

        await cache.put(cacheKey, responseToCache);
      }

      // 4. Return the original response to the browser
      return response;
    })
  );
});