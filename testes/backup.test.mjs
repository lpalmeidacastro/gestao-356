// Teste do backup sem internet: banco de mentira -> exportar -> trancar -> guardar -> destrancar.
// Uso: node testes/backup.test.mjs  (precisa de uma chave privada de teste; gera uma na hora)
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { exportar, cifrar, decifrar, guardar, paraJSON, deJSON, DIAS_GUARDADOS } from '../scripts/backup-lib.mjs';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
class Ts { constructor(d) { this.d = d; } toDate() { return this.d; } static fromDate(d) { return new Ts(d); } }
const dados = {
  'usuarios/u1': { papel: 'admin' },
  'empresas/356': { nome: '356' },
  'empresas/356/lancamentos/a': { valor: 10.5, criadoEm: new Ts(new Date('2026-11-01T10:00:00Z')), lista: [1, { x: new Ts(new Date('2026-01-01T00:00:00Z')) }] },
  'empresas/356/comprovantes/l_a': { dataUrl: 'data:image/png;base64,' + 'A'.repeat(5000) },
  'pessoal/356/movimentos/m': { valor: 7, descricao: 'Mercado' },
};
// banco de mentira com a mesma "cara" do firebase-admin
const ref = p => ({ path: p, id: p.split('/').pop(),
  listCollections: async () => [...new Set(Object.keys(dados).filter(k => k.startsWith(p + '/')).map(k => k.slice(p.length + 1).split('/')[0]))].map(c => col(p + '/' + c)) });
const col = p => ({ path: p, listDocuments: async () => [...new Set(Object.keys(dados).filter(k => k.startsWith(p + '/')).map(k => p + '/' + k.slice(p.length + 1).split('/')[0]))].map(ref) });
const db = { listCollections: async () => [...new Set(Object.keys(dados).map(k => k.split('/')[0]))].map(col),
  getAll: async (...rs) => rs.map(r => ({ ref: r, exists: !!dados[r.path], data: () => dados[r.path] })) };

const docs = await exportar(db);
assert.equal(Object.keys(docs).length, 5, 'exporta todos os documentos, inclusive pessoal/356 sem campos');
assert.deepEqual(docs['empresas/356/lancamentos/a'].criadoEm, { __data: '2026-11-01T10:00:00.000Z' });
assert.deepEqual(docs['empresas/356/lancamentos/a'].lista[1].x, { __data: '2026-01-01T00:00:00.000Z' });
const obj = { formato: 'g356-copia-v1', total: 5, docs };
const tr = cifrar(obj, publicKey);
assert.ok(!tr.toString().includes('Mercado'), 'arquivo trancado não mostra o conteúdo');
assert.deepEqual(decifrar(tr, privateKey), obj, 'destrancar devolve exatamente o que entrou');
const outra = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
assert.throws(() => decifrar(tr, outra.privateKey), 'chave errada não abre');
const mexido = JSON.parse(tr.toString()); mexido.dados = Buffer.from(Buffer.from(mexido.dados, 'base64').map((b, i) => i === 3 ? b ^ 1 : b)).toString('base64');
assert.throws(() => decifrar(Buffer.from(JSON.stringify(mexido)), privateKey), 'arquivo adulterado é recusado');
// guardar: 40 dias seguidos -> 30 diários, 2 mensais (primeiro de cada mês), alerta quando encolhe
const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'bk-'));
let alerta = null;
for (let i = 0; i < 40; i++) { const d = new Date(Date.UTC(2026, 9, 15 + i, 6)).toISOString(); alerta = guardar(pasta, tr, 100, d); }
assert.equal(alerta, null);
assert.equal(fs.readdirSync(path.join(pasta, 'diario')).length, DIAS_GUARDADOS);
assert.deepEqual(fs.readdirSync(path.join(pasta, 'mensal')).sort(), ['2026-10.g356', '2026-11.g356']);
assert.ok(fs.existsSync(path.join(pasta, 'ultimo.g356')));
assert.match(guardar(pasta, tr, 50, '2026-11-24T06:00:00Z') || '', /encolheu de 100 para 50/);
assert.match(guardar(pasta, tr, 0, '2026-11-25T06:00:00Z') || '', /VAZIO/);
assert.equal(JSON.parse(fs.readFileSync(path.join(pasta, 'indice.json'))).at(-1).documentos, 0);
// restaurar: volta o tipo data
const F = { Timestamp: Ts, GeoPoint: class {}, db: { doc: p => ({ p }) } };
const volta = deJSON(docs['empresas/356/lancamentos/a'], F);
assert.ok(volta.criadoEm instanceof Ts && volta.criadoEm.toDate().toISOString() === '2026-11-01T10:00:00.000Z');
assert.equal(paraJSON(null), null);
console.log('backup: 16 ok');
