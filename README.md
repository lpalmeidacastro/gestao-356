# Gestão 356

App de gestão da 356 (empresa) e da vida pessoal do casal. Site: https://lpalmeidacastro.github.io/gestao-356/

## Como funciona

- `index.html`: o app inteiro (HTML, CSS e JavaScript puro, sem build).
- `sw.js`: service worker. Guarda o app no aparelho para abrir na hora, mesmo sem internet.
- Banco: Firebase Firestore, projeto `gestao-356`, servidor em São Paulo (`southamerica-east1`).
  Cada aparelho também guarda uma cópia do que já abriu e o que foi lançado sem internet (envia quando a internet volta).
- Regras de acesso do banco: publicadas no console do Firebase (não ficam aqui, porque o repositório é público).

## Proteção dos dados

1. **Histórico de toda gravação** (`empresas/356/jornal` e `pessoal/356/jornal`): cada criação, edição ou exclusão grava junto uma entrada com o conteúdo, quem e quando. As regras do banco recusam edição sem essa entrada, e ninguém altera nem apaga o histórico.
2. **Backup diário automático** (`.github/workflows/backup-diario.yml`, 03:17 de Brasília): exporta o banco inteiro, tranca com a chave pública (`scripts/backup-chave-publica.pem`) e guarda no branch `backups` (30 dias + 1 por mês para sempre) e como artefato do GitHub (90 dias). Se o banco encolher de repente, o job falha e o GitHub avisa por e-mail.
3. **Cópia manual**: no app, Mais > "Baixar cópia completa" (só Luiz e Eliana).

A "chave de abrir" os backups (`chave-de-abrir-backup-356.pem`) fica com o dono, fora do GitHub. Sem ela os backups trancados não abrem.

- Abrir um backup: `node scripts/abrir-backup.mjs ultimo.g356 chave-de-abrir-backup-356.pem`
- Devolver ao banco: `node scripts/restaurar.mjs copia.json` (só mostra o que faria; `--aplicar` grava; nunca apaga nada; sem `--sobrescrever` só recria o que foi apagado)

## Regra de envio

A cada mudança no `index.html`, troque **as duas** versões para o mesmo valor novo:
`const VERSAO = 'g356-vN'` no `sw.js` e `const APP_VERSAO = 'g356-vN'` no `index.html`.
Sem isso, quem já tem o app instalado não recebe a versão nova. O teste automático confere.

## Testes

- `bash testes/suite.sh`: testes do app no Chrome sem tela, com um Firebase simulado (`testes/mock.js`).
- `node testes/backup.test.mjs`: testes do backup.
- Rodam sozinhos a cada envio (`.github/workflows/testes.yml`).

## Outros

- `.github/workflows/avisos-9h.yml` + `scripts/avisos.mjs`: avisos diários das 9h (contas da empresa que vencem no dia).
- `docs/superpowers/`: desenhos e planos de funcionalidades.
