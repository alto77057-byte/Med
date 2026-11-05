// Network-first service worker: always tries for the newest version, falls back to cache offline.
const C = "medgenius-v1";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(["/", "/manifest.webmanifest", "/icon-192.png"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); }
        return r;
      })
      .catch(() => caches.match(e.request).then((m) => m || caches.match("/")))
  );
});
