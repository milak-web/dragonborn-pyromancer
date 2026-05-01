const CACHE_NAME = "dragonborn-pyromancer-v6";
const ASSETS = [
  "./",
  "./index_enemy_boss_escalation_rebuild.html",
  "./manifest.webmanifest",
  "./assets/ships/icon-192.png",
  "./assets/ships/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isGameHtml =
    event.request.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith(".html");

  if (isGameHtml) {
    event.respondWith(
      fetch(event.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return resp;
      }).catch(() =>
        caches.match(event.request).then(cached =>
          cached || caches.match("./index_enemy_boss_escalation_rebuild.html")
        )
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached =>
      fetch(event.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return resp;
      }).catch(() => cached || Response.error())
    )
  );
});
