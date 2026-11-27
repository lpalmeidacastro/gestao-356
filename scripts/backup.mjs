// Backup diário do banco inteiro (roda no GitHub Actions: .github/workflows/backup-diario.yml).
// Uso: node scripts/backup.mjs <pasta-dos-backups> <arquivo-de-alerta>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportar, cifrar, guardar } from './backup-lib.mjs';
const require = createRequire(import.meta.url);
const admin = require('firebase-admin');
const nota = (t, m) => console.log(`::${t} title=Backup::${String(m).replace(/[\r\n]+/g, ' ').slice(0, 400)}`);
process.on('unhandledRejection', e => { nota('error', 'Erro: ' + ((e && e.code) || '') + ' ' + (e && e.message)); process.exit(1); });

const [pasta, arqAlerta] = process.argv.slice(2);
if (!pasta) { nota('error', 'Falta a pasta dos backups.'); process.exit(1); }
const bruto = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!bruto) { nota('error', 'Falta o segredo FIREBASE_SERVICE_ACCOUNT no GitHub.'); process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(bruto)) });
const db = admin.firestore();

const aqui = path.dirname(fileURLToPath(import.meta.url));
const publica = fs.readFileSync(path.join(aqui, 'backup-chave-publica.pem'), 'utf8');
const quando = new Date().toISOString();
const docs = await exportar(db, m => console.log(m));
const total = Object.keys(docs).length;
const cifrado = cifrar({ formato: 'g356-copia-v1', origem: 'backup-diario', geradoEm: quando, total, docs }, publica);
const alerta = guardar(pasta, cifrado, total, quando);
fs.writeFileSync(path.join(pasta, 'LEIA-ME.md'), fs.readFileSync(path.join(aqui, 'backup-LEIA-ME.md'), 'utf8'));
console.log(`Backup ${quando}: ${total} documentos, ${(cifrado.length / 1024).toFixed(1)} KB (trancado)`);
nota('notice', `${total} documentos guardados`);
if (alerta) { nota('error', alerta); if (arqAlerta) fs.writeFileSync(arqAlerta, alerta); }
