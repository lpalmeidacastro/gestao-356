// Cloud Function (2ª geração) chamada a cada minuto pelo Cloud Scheduler (tópico Pub/Sub "lembretes-minuto").
// Procura lembretes com proxAviso <= agora, marca como avisado (com histórico) e manda o aviso ao celular de quem foi escolhido.
const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const lib = require('./lib');
admin.initializeApp();
const db = admin.firestore();
const EMPRESA = '356';
const AREAS = [['empresas', false], ['pessoal', true]];

functions.cloudEvent('lembretes', async () => {
  const agora = Date.now(), fila = [];
  for (const [raiz] of AREAS) {
    const q = await db.collection(`${raiz}/${EMPRESA}/lembretes`).where('proxAviso', '<=', agora).get();
    q.docs.forEach(d => fila.push({ ref:d.ref, id:d.id, raiz }));
  }
  if (!fila.length) return;
  const aps = await db.collection(`empresas/${EMPRESA}/aparelhos`).get();
  const aparelhos = aps.docs.map(d => ({ ref:d.ref, ...d.data() }));
  for (const p of fila) {
    // marca antes de mandar, numa transação: duas execuções ao mesmo tempo não mandam o mesmo aviso duas vezes
    const l = await db.runTransaction(async t => {
      const s = await t.get(p.ref); if (!s.exists) return null;
      const x = s.data(), a = lib.acao(x, agora); if (!a) return null;
      const mud = { proxAviso:null, avisadoEm:a === 'mandar' ? agora : (x.avisadoEm || null) };
      const jr = db.collection(`${p.raiz}/${EMPRESA}/jornal`).doc();
      t.set(jr, { op:'atualizar', caminho:p.ref.path, dados:mud, merge:true, por:'servidor', em:admin.firestore.FieldValue.serverTimestamp(), app:'funcao-lembretes' });
      t.update(p.ref, { ...mud, jv:jr.id });
      return a === 'mandar' ? x : null;
    });
    if (!l) continue;
    const tokens = lib.tokensPara(aparelhos, l.para);
    if (!tokens.length) { console.log(`Lembrete ${p.id}: ninguém escolhido tem avisos ativados.`); continue; }
    const r = await admin.messaging().sendEachForMulticast({ tokens, data:lib.mensagem(l, p.id, agora), webpush:{ headers:{ Urgency:'high', TTL:'900' } } });
    console.log(`Lembrete ${p.id}: ${r.successCount} enviados, ${r.failureCount} falhas.`);
    const mortos = [];
    r.responses.forEach((x, i) => { if (!x.success && /registration-token-not-registered|invalid-registration-token/.test((x.error && x.error.code) || '')) mortos.push(tokens[i]); });
    for (const a of aparelhos) if (mortos.includes(a.token)) await a.ref.delete().catch(() => {});
  }
});
