// gestao-356 · service worker · v5
// Guarda só o "esqueleto" do app (arquivos do próprio site). Firebase e fontes passam direto pela rede.
const VERSAO = 'g356-v34';
const ARQUIVOS = ['./', './index.html', './manifest.json', './manifest-lancar.json', './icon-lancar-180.png', './icon-lancar-192.png', './icon-192.png', './icon-512.png', './logo-356.png', './logo-356-claro.png'];

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

// avisos das 9h (mensagem só de dados, enviada pelo agendador do GitHub via FCM)
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  const m = d.data || d.notification || d;
  const titulo = m.titulo || m.title || 'Gestão 356';
  e.waitUntil(self.registration.showNotification(titulo, {
    body: m.corpo || m.body || '', icon: './icon-192.png', badge: './icon-192.png', tag: 'g356-9h', renotify: true, data: { url: './#/boletos' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(cs => {
    const c = cs.find(x => x.url.includes('gestao-356'));
    if (c) { c.navigate(url); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
