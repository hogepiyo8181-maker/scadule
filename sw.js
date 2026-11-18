// オフラインでも開けるように、アプリの画面をスマホに保存しておく
const CACHE = "schedule-v14";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png", "./icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// 新しい版があればそれを使い、電波がないときは保存しておいた画面を出す
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // このアプリのファイルは、スマホに残った古いコピーを使わず毎回サーバーに確かめる（変わっていなければすぐ終わる）
  const same = new URL(e.request.url).origin === location.origin;
  e.respondWith(
    (same ? fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" }).then(r => r.redirected && e.request.mode === "navigate" ? fetch(e.request) : r) : fetch(e.request)).then(res => {
      if (res.ok && same) {
        const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
