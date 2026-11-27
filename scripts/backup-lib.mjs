// Peças do backup do banco (sem Firebase aqui dentro, para poder testar no computador).
// - exportar(db): lê TODOS os documentos (coleções do topo e as de dentro de empresas/356, pessoal/356...)
// - cifrar/decifrar: compacta (gzip) e tranca com AES-256-GCM; a senha do AES vai trancada com a chave
//   pública RSA. Só quem tem a chave privada ("chave de abrir") consegue abrir.
// - guardar(pasta, ...): organiza os arquivos (30 dias + 1 por mês para sempre) e confere se o backup
//   não encolheu de repente (sinal de dado apagado ou de erro).
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const FORMATO = 'g356-backup-v1';
export const DIAS_GUARDADOS = 30;

// valores do Firebase viram JSON comum, com marca para o que não é texto/número
export function paraJSON(v, d = 0) {
  if (v === null || typeof v !== 'object' || d > 30) return v;
  if (typeof v.toDate === 'function') return { __data: v.toDate().toISOString() };
  if (Buffer.isBuffer(v) || v instanceof Uint8Array) return { __bytes: Buffer.from(v).toString('base64') };
  if (typeof v.latitude === 'number' && typeof v.longitude === 'number' && Object.keys(v).length <= 2) return { __geo: [v.latitude, v.longitude] };
  if (typeof v.path === 'string' && typeof v.id === 'string' && v.firestore) return { __ref: v.path };
  if (Array.isArray(v)) return v.map(x => paraJSON(x, d + 1));
  const o = {};
  for (const k of Object.keys(v)) o[k] = paraJSON(v[k], d + 1);
  return o;
}

// o caminho inverso, para restaurar (recebe as classes do firebase-admin)
export function deJSON(v, F, d = 0) {
  if (v === null || typeof v !== 'object' || d > 30) return v;
  if (Array.isArray(v)) return v.map(x => deJSON(x, F, d + 1));
  const ks = Object.keys(v);
  if (ks.length === 1) {
    if (ks[0] === '__data') return F.Timestamp.fromDate(new Date(v.__data));
    if (ks[0] === '__bytes') return Buffer.from(v.__bytes, 'base64');
    if (ks[0] === '__geo') return new F.GeoPoint(v.__geo[0], v.__geo[1]);
    if (ks[0] === '__ref') return F.db.doc(v.__ref);
  }
  const o = {};
  for (const k of ks) o[k] = deJSON(v[k], F, d + 1);
  return o;
}

// lê tudo. Subcoleções só são procuradas nos documentos do topo (empresas/356, pessoal/356, ...),
// que é onde o app guarda as coleções; assim o backup não faz uma chamada extra por documento.
export async function exportar(db, log = () => {}) {
  const docs = {};
  async function colecao(c, nivel) {
    const refs = await c.listDocuments();
    for (let i = 0; i < refs.length; i += 300) {
      const parte = refs.slice(i, i + 300);
      const snaps = await db.getAll(...parte);
      for (const s of snaps) if (s.exists) docs[s.ref.path] = paraJSON(s.data());
      if (nivel === 0) for (const r of parte) for (const sub of await r.listCollections()) await colecao(sub, nivel + 1);
    }
    log(`${c.path}: ${refs.length}`);
  }
  for (const c of await db.listCollections()) await colecao(c, 0);
  return docs;
}

export function cifrar(obj, chavePublicaPem) {
  const dados = zlib.gzipSync(Buffer.from(JSON.stringify(obj)), { level: 9 });
  const chave = crypto.randomBytes(32), iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', chave, iv);
  const corpo = Buffer.concat([c.update(dados), c.final()]);
  const trancada = crypto.publicEncrypt({ key: chavePublicaPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, chave);
  return Buffer.from(JSON.stringify({ formato: FORMATO, chave: trancada.toString('base64'), iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), dados: corpo.toString('base64') }));
}

export function decifrar(buf, chavePrivadaPem) {
  const e = JSON.parse(buf.toString());
  if (e.formato !== FORMATO) throw new Error('Arquivo não é um backup do 356 App (' + e.formato + ')');
  const chave = crypto.privateDecrypt({ key: chavePrivadaPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(e.chave, 'base64'));
  const d = crypto.createDecipheriv('aes-256-gcm', chave, Buffer.from(e.iv, 'base64'));
  d.setAuthTag(Buffer.from(e.tag, 'base64'));
  const dados = Buffer.concat([d.update(Buffer.from(e.dados, 'base64')), d.final()]);
  return JSON.parse(zlib.gunzipSync(dados).toString());
}

// grava na pasta: diario/AAAA-MM-DD.g356, mensal/AAAA-MM.g356 (o primeiro do mês, nunca apagado),
// ultimo.g356 e indice.json. Devolve um texto de alerta se o backup encolheu muito.
export function guardar(pasta, cifrado, total, dataISO) {
  const dia = dataISO.slice(0, 10), mes = dataISO.slice(0, 7);
  for (const p of ['diario', 'mensal']) fs.mkdirSync(path.join(pasta, p), { recursive: true });
  fs.writeFileSync(path.join(pasta, 'diario', dia + '.g356'), cifrado);
  fs.writeFileSync(path.join(pasta, 'ultimo.g356'), cifrado);
  const mensal = path.join(pasta, 'mensal', mes + '.g356');
  if (!fs.existsSync(mensal)) fs.writeFileSync(mensal, cifrado);
  const dias = fs.readdirSync(path.join(pasta, 'diario')).filter(f => /^\d{4}-\d{2}-\d{2}\.g356$/.test(f)).sort();
  for (const f of dias.slice(0, Math.max(0, dias.length - DIAS_GUARDADOS))) fs.unlinkSync(path.join(pasta, 'diario', f));
  const arqIdx = path.join(pasta, 'indice.json');
  let idx = [];
  try { idx = JSON.parse(fs.readFileSync(arqIdx, 'utf8')); } catch (e) { idx = []; }
  const ant = idx.length ? idx[idx.length - 1] : null;
  const sha = crypto.createHash('sha256').update(cifrado).digest('hex');
  idx = idx.filter(x => x.dia !== dia).concat([{ dia, quando: dataISO, documentos: total, bytes: cifrado.length, sha256: sha }]).slice(-800);
  fs.writeFileSync(arqIdx, JSON.stringify(idx, null, 1));
  if (total === 0) return 'O backup veio VAZIO (0 documentos).';
  if (ant && ant.documentos > 20 && total < ant.documentos * 0.7) return `O banco encolheu de ${ant.documentos} para ${total} documentos desde ${ant.dia}. Confira se algo foi apagado.`;
  return null;
}
