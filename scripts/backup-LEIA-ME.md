# Backups do 356 App

Este branch guarda os backups automáticos do banco (todo dia de madrugada, pelo GitHub Actions).

- `ultimo.g356`: o mais recente.
- `diario/AAAA-MM-DD.g356`: um por dia, os últimos 30 dias.
- `mensal/AAAA-MM.g356`: o primeiro de cada mês, guardado para sempre.
- `indice.json`: lista de todos os backups (dia, quantidade de documentos, tamanho).

Os arquivos estão **trancados** (AES-256 + RSA-4096). Só abrem com a "chave de abrir"
(`chave-de-abrir-backup-356.pem`), que fica com o dono, fora do GitHub.

Para abrir: `node scripts/abrir-backup.mjs ultimo.g356 chave-de-abrir-backup-356.pem`
Para devolver ao banco: `scripts/restaurar.mjs` (só mostra o que faria, a menos que receba `--aplicar`).
