// Abre (destranca) um arquivo de backup .g356 e grava o JSON com todos os dados.
// Uso: node scripts/abrir-backup.mjs <backup.g356> <chave-de-abrir-backup-356.pem> [saida.json]
import fs from 'node:fs';
import { decifrar } from './backup-lib.mjs';
const [arq, chave, saida] = process.argv.slice(2);
if (!arq || !chave) { console.error('Uso: node scripts/abrir-backup.mjs <backup.g356> <chave.pem> [saida.json]'); process.exit(1); }
const obj = decifrar(fs.readFileSync(arq), fs.readFileSync(chave, 'utf8'));
const destino = saida || arq.replace(/\.g356$/, '') + '.json';
fs.writeFileSync(destino, JSON.stringify(obj, null, 1));
console.log(`Aberto: ${obj.total} documentos de ${obj.geradoEm} -> ${destino}`);
