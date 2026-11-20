// Envia o aviso das 9h. Lê boletos e contas agendadas do Firestore e manda push (FCM) aos aparelhos cadastrados.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const admin = require('firebase-admin');

const EMPRESA = '356';
const bruto = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!bruto) { console.error('Falta o segredo FIREBASE_SERVICE_ACCOUNT.'); process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(bruto)) });
const db = admin.firestore();

const pad = n => String(n).padStart(2, '0');
const hoje = new Intl.DateTimeFormat('en-CA', { timeZone:'America/Sao_Paulo', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date()); // AAAA-MM-DD
const mes = hoje.slice(0, 7);
const diasNoMes = m => { const [y, mo] = m.split('-').map(Number); return new Date(y, mo, 0).getDate(); };
const brl = v => Number(v).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

const itens = [];
// boletos que vencem hoje e não foram pagos
const bol = await db.collection(`empresas/${EMPRESA}/boletos`).where('vencimento', '==', hoje).get();
bol.docs.forEach(d => { const b = d.data(); if (!b.pago) itens.push({ nome:b.descricao, valor:b.valor }); });
// contas agendadas (únicas ou recorrentes) que vencem hoje e não foram pagas
const [defs, pags] = await Promise.all([
  db.collection(`empresas/${EMPRESA}/contas`).get(),
  db.collection(`empresas/${EMPRESA}/contasPag`).where('mes', '==', mes).get(),
]);
const pag = {}; pags.docs.forEach(d => { pag[d.id] = d.data(); });
defs.docs.forEach(d => {
  const c = d.data(), p = pag[d.id + '_' + mes];
  let venc;
  if (c.recorrente) {
    if (c.inicio && mes < c.inicio) return;
    if (c.ativa === false) return;
    venc = mes + '-' + pad(Math.min(Math.max(Number(c.dia) || 1, 1), diasNoMes(mes)));
  } else { venc = c.vencimento; }
  if (venc !== hoje || (p && p.pago)) return;
  itens.push({ nome:c.descricao, valor:(p && p.valor != null) ? p.valor : c.valor });
});

const teste = process.env.TESTE === 'true';
if (!itens.length && !teste) { console.log(`Nada vence em ${hoje}. Nenhum aviso enviado.`); process.exit(0); }

const total = itens.reduce((s, x) => s + (Number(x.valor) || 0), 0);
const titulo = itens.length ? `Vence hoje: ${itens.length} ${itens.length === 1 ? 'conta' : 'contas'} (${brl(total)})` : 'Gestão 356: teste do aviso das 9h';
const corpo = itens.length ? itens.slice(0, 5).map(x => `${x.nome} ${brl(x.valor)}`).join(' · ') + (itens.length > 5 ? ` · +${itens.length - 5}` : '') : 'Se você viu isto, os avisos estão funcionando.';

const aps = await db.collection(`empresas/${EMPRESA}/aparelhos`).get();
const tokens = aps.docs.map(d => d.data().token).filter(Boolean);
if (!tokens.length) { console.log('Nenhum aparelho com avisos ativados.'); process.exit(0); }

const r = await admin.messaging().sendEachForMulticast({ tokens, data:{ titulo, corpo }, webpush:{ headers:{ Urgency:'high', TTL:'3600' } } });
console.log(`Enviados: ${r.successCount} ok, ${r.failureCount} falhas. Itens: ${itens.length}.`);
// remove aparelhos que não existem mais
const mortos = [];
r.responses.forEach((x, i) => { if (!x.success && /registration-token-not-registered|invalid-registration-token|invalid-argument/.test(x.error?.code || '')) mortos.push(tokens[i]); });
for (const d of aps.docs) if (mortos.includes(d.data().token)) await d.ref.delete();
if (mortos.length) console.log(`Aparelhos removidos: ${mortos.length}.`);
