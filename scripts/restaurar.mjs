// Devolve ao banco documentos de uma cópia (backup aberto ou "Baixar cópia completa" do app).
// Por segurança: SÓ MOSTRA o que faria, a menos que receba --aplicar. Nunca apaga nada.
// Sem --sobrescrever, só recria documentos que NÃO existem mais (o caso de algo apagado).
// Uso: FIREBASE_SERVICE_ACCOUNT='{...}' node scripts/restaurar.mjs <copia.json> [--so=empresas/356/lancamentos] [--aplicar] [--sobrescrever]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { deJSON } from './backup-lib.mjs';
const require = createRequire(import.meta.url);
const admin = require('firebase-admin');
const args = process.argv.slice(2), arq = args.find(a => !a.startsWith('--'));
const so = (args.find(a => a.startsWith('--so=')) || '').slice(5), aplicar = args.includes('--aplicar'), sobrescrever = args.includes('--sobrescrever');
if (!arq) { console.error('Uso: node scripts/restaurar.mjs <copia.json> [--so=caminho] [--aplicar] [--sobrescrever]'); process.exit(1); }
const copia = JSON.parse(fs.readFileSync(arq, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();
const F = { Timestamp: admin.firestore.Timestamp, GeoPoint: admin.firestore.GeoPoint, db };
const caminhos = Object.keys(copia.docs).filter(p => !so || p === so || p.startsWith(so + '/'));
let novos = 0, iguais = 0, trocados = 0, lote = db.batch(), n = 0;
for (const p of caminhos) {
  const atual = await db.doc(p).get();
  if (atual.exists && !sobrescrever) { iguais++; continue; }
  atual.exists ? trocados++ : novos++;
  console.log((atual.exists ? 'SOBRESCREVER ' : 'RECRIAR ') + p);
  if (aplicar) { lote.set(db.doc(p), deJSON(copia.docs[p], F)); if (++n === 400) { await lote.commit(); lote = db.batch(); n = 0; } }
}
if (aplicar && n) await lote.commit();
console.log(`${aplicar ? 'Feito' : 'Simulação (nada gravado)'}: ${novos} recriados, ${trocados} sobrescritos, ${iguais} já existiam e ficaram como estão.`);
