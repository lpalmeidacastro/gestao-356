// gestao-356 · service worker · v5
// Guarda só o "esqueleto" do app (arquivos do próprio site). Firebase e fontes passam direto pela rede.
const VERSAO = 'g356-v13';
const ARQUIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './logo-356.png', './logo-356-claro.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Firebase, gstatic, jsdelivr: rede normal
  // rede primeiro (sempre a versão nova); sem rede, usa o guardado
  e.respondWith(
    fetch(req)
      .then(r => {
        if (r && r.ok) { const cp = r.clone(); caches.open(VERSAO).then(c => c.put(req, cp)); }
        return r;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
