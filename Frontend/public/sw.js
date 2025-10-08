// public/sw.js
const CACHE_STATIC = "gowa-static-v3";
const IMMUTABLE = [/^\/assets\//, /^\/icons\//, /^\/manifest\.json$/, /^\/logo\.png$/];

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_STATIC).then(c => c.addAll([
      "/manifest.json",
      "/logo.png",
    ]))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_STATIC).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const isNav = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  if (isNav) {
    e.respondWith(
      fetch(req).catch(() => caches.match("/index.html") || Response.error())
    );
    return;
  }

  const { pathname } = new URL(req.url);
  if (IMMUTABLE.some(re => re.test(pathname))) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (!res || !res.ok) return res; // đừng cache lỗi
        const copy = res.clone();
        caches.open(CACHE_STATIC).then(c => c.put(req, copy));
        return res;
      }))
    );
    return;
  }

  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
