# Lembretes (design curto, 26/11/2026)

**Pedido do dono:** aba Lembretes em Controle para lançar compromissos com data e hora, escolher com quanto tempo de antecedência recebe a notificação no celular, marcar concluído, escolher se o não concluído some ou continua nos dias seguintes, e (se der) escolher som, alerta e vibração.

**Decisões do dono:** avisar no minuto certo com Firebase Blaze (Cloud Function + Cloud Scheduler a cada minuto); quem cria escolhe quem recebe (Luiz, Eliana e/ou Lucas); lembrete pessoal fica escondido do Lucas.

**Como ficou:**
- App: rota `#/lembretes` (menu Controle; no celular em Mais). `empresas/356/lembretes` (todos veem) e `pessoal/356/lembretes` (só Luiz e Eliana). Campos: titulo, notas, data, hora, quando (ms, Brasília −03:00), antes (min; null = sem aviso), proxAviso (ms ou null), avisadoEm, para [uids], som, vibrar, fixo, seNao ('fica'|'some'), concluido, concluidoEm, criadoPorUid, criadoEm. `empresas/356/membros/{uid}` (nome, papel, pes) para a lista de quem recebe; cada pessoa grava o seu ao abrir a página.
- Agenda: atrasados que "ficam", hoje (inclusive concluídos hoje), próximos. Concluídos e Todos em filtros.
- Servidor: `funcoes/lembretes` (Cloud Function 2ª geração, Node 20, southamerica-east1) chamada pelo Cloud Scheduler a cada minuto via Pub/Sub `lembretes-minuto`; transação marca `proxAviso:null` com entrada no histórico e manda FCM só aos aparelhos das pessoas escolhidas. Não manda se o compromisso passou há mais de 2 h.
- Aviso: `sw.js` usa `silent` (sem som), `vibrate` e `requireInteraction` (fica na tela). **No iPhone o som, a vibração e o estilo do alerta seguem Ajustes > Notificações > 356 Gestão** (o iOS ignora essas opções por aviso); no Android e no computador valem por lembrete.

**Escolhas minhas:** um aviso por lembrete (antecedência de "na hora" a "1 semana antes" ou sem aviso); horário que já passou não gera aviso; concluir cancela o aviso e reabrir devolve; sem repetição (todo dia/semana) por enquanto.
