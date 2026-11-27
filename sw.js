// gestao-356 · service worker
// Abre na hora, mesmo com internet lenta ou sem internet:
//  - arquivos do app: guardados na instalação e servidos do aparelho (a versão nova chega com um sw.js novo);
//  - Firebase e fontes (versão fixa, não mudam): guardados na primeira vez e servidos do aparelho.
// REGRA: a cada envio do index.html, trocar VERSAO aqui e APP_VERSAO no index.html (o teste confere).
const VERSAO = 'g356-v39';
const EXT = 'g356-ext-1'; // bibliotecas externas com versão fixa
const ARQUIVOS = ['./', './index.html', './manifest.json', './manifest-lancar.json', './icon-lancar-180.png', './icon-lancar-192.png', './icon-192.png', './icon-512.png', './logo-356.png', './logo-356-claro.png'];
const EXTERNOS = [
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400..600&family=Russo+One&display=swap'
];
const ehExterno = u => u.startsWith('https://www.gstatic.com/firebasejs/') || u.startsWith('https://fonts.googleapis.com/') || u.startsWith('https://fonts.gstatic.com/');

// busca com CORS; se o site não deixar, busca "opaco" (serve igual para <script> e <link>)
const buscarExt = u => fetch(u, { mode:'cors', credentials:'omit' }).then(r => r.ok ? r : Promise.reject(r)).catch(() => fetch(u, { mode:'no-cors', credentials:'omit' }));
const guardavel = r => r && (r.ok || r.type === 'opaque');

self.addEventListener('install', e => {
  e.waitUntil(Promise.all([
    caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)),
    // externos: melhor esforço (se falhar, guarda no primeiro uso)
    caches.open(EXT).then(c => Promise.all(EXTERNOS.map(u => c.match(u).then(j => j || buscarExt(u).then(r => guardavel(r) && c.put(u, r))).catch(() => {}))))
  ]).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSAO && k !== EXT).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    if (!ehExterno(req.url)) return; // banco e login do Firebase: rede normal (o banco tem cache próprio)
    e.respondWith(caches.open(EXT).then(c => c.match(req.url).then(hit => hit || fetch(req).then(r => { if (guardavel(r)) c.put(req.url, r.clone()); return r; }))));
    return;
  }
  // abrir o app (qualquer endereço do site, com ?lancar=1 ou ?convite=...): página guardada na hora
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(VERSAO).then(c => c.match('./index.html')).then(hit => hit || fetch(req)).catch(() => fetch(req)));
    return;
  }
  // demais arquivos do site: do aparelho; se não tiver, rede (e guarda)
  e.respondWith(caches.open(VERSAO).then(c => c.match(req, { ignoreSearch:true }).then(hit => hit || fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }))));
});

// avisos das 9h (mensagem só de dados, enviada pelo agendador do GitHub via FCM)
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  const m = d.data || d.notification || d;
  const titulo = m.titulo || m.title || 'Gestão 356';
  // lembretes mandam: tag (um por lembrete), url, som ('0' = sem som), vibrar ('0' = sem vibrar), fixo ('1' = fica na tela até tocar)
  const opc = { body: m.corpo || m.body || '', icon: './icon-192.png', badge: './icon-192.png', tag: m.tag || 'g356-9h', renotify: true,
    data: { url: m.url || './#/boletos' }, silent: m.som === '0', requireInteraction: m.fixo === '1', timestamp: Date.now() };
  if (m.vibrar !== '0') opc.vibrate = [300, 120, 300, 120, 300];
  e.waitUntil(self.registration.showNotification(titulo, opc));
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
