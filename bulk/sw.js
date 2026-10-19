/* Service Worker: App sofort aus dem Cache, im Hintergrund frisch nachladen. */
var V = 'bulk-8ade3001a1';
var FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V && k.indexOf('bulk-') === 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  if (u.origin !== self.location.origin) return;
  if (u.href.indexOf(self.registration.scope) !== 0) return;
  e.respondWith(caches.open(V).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (r) {
      var f = fetch(e.request).then(function (n) { if (n && n.ok) c.put(e.request, n.clone()); return n; }).catch(function () { return r; });
      return r || f;
    });
  }));
});
