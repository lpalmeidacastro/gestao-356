# Venda do mês, gráficos de gastos, Conveniência e Pessoal no painel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar vendas por um total mensal da loja, adicionar análise gráfica de gastos (empresa e pessoal), arquivar Eventos/criar Conveniência e permitir gasto pessoal pelo "Novo lançamento" do painel.

**Architecture:** Tudo continua em `index.html` (JS puro, padrão Store/render, `data-act`, `data-form`). Gráficos são SVG gerado por funções puras (`graficoPizza`, `graficoLinha`) alimentadas por uma agregação pura (`agregarGastos`). Dados novos cabem nas regras atuais do Firestore.

**Tech Stack:** HTML/CSS/JS sem build, Firebase compat 10.13.0 (Firestore), GitHub Pages, `sw.js` (cache `g356-vN`).

**Spec:** `docs/superpowers/specs/2026-11-24-vendas-mes-e-graficos-design.md`

## Global Constraints
- Nenhuma biblioteca nova; gráficos em SVG inline.
- Pessoal nunca grava nem lê nada em `empresas/`; empresa nunca em `pessoal/`.
- Opção "Pessoal" no painel só para os 2 e-mails fixos (`ehDonoPes()` = e-mail em `ADMINS_PES`, mesmos e-mails da regra).
- Gastos = só `lancamentos` `tipo:'custo'` (empresa) e `movimentos` `tipo:'gasto'` (pessoal). Boletos/contas/freelancers pagos nunca entram.
- Lançamentos `tipo:'venda'` antigos não entram em nenhuma soma; aparecem na lista com etiqueta "venda (antigo)".
- Gráficos: máx. 7 itens + "Outros"; dials variância 3 · movimento 1 · densidade 8; nada com `position:fixed` ou offset negativo; tooltip é uma linha de texto no fluxo, abaixo do gráfico.
- Tokens de cor via CSS variables; testar claro e escuro; PDF (`@media print`) com SVG visível.
- Cada entrega: subir `VERSAO` do `sw.js` (próxima: `g356-v20`), commit + push na `main`, atualizar `claude/mapa-do-projeto.md`.

## Review Focus
1. Mês sem nenhum gasto → gráficos mostram estado vazio ("Nenhum gasto em <mês>"), sem divisão por zero/NaN. (Task 3)
2. Mais de 7 itens no ângulo → 7 maiores + "Outros" somando o resto exatamente. (Task 3)
3. Mês anterior sem gasto num item → coluna "vs. mês anterior" mostra "novo", não "+Infinity%". (Task 3)
4. Gerente abrindo o painel → opção "Pessoal" ausente e `salvarPes` nunca chamado. (Task 5)
5. Mês atual com vendas antigas de teste e sem `vendasMes` → Vendas R$ 0,00 e Margem "—", não negativa infinita. (Task 1)

## Arquivos
- Modify: `index.html` (todas as tasks), `sw.js` (Task 6)
- Test (fora do repo, harness existente): `/tmp/build.py <teste.js> <saida.html>` + `google-chrome --headless=new --no-sandbox --allow-file-access-from-files --virtual-time-budget=25000 --dump-dom`; resultado em `<pre id=RES>`; `window.__M` (dados), `window.__log` (gravações). Testes novos: `/tmp/test_f.js` … `/tmp/test_j.js`. Regressão: `/tmp/test_a.js` (24 PASS), `/tmp/test_b.js` (28 PASS + falha conhecida "renomear subsetor"), `/tmp/test_d.js` (12), `/tmp/test_e.js` (18; ajustar asserts que usam venda).

---

### Task 1: Venda do mês e meta única

**Interfaces:**
- Produces: `colVendasMes()` → `empresas/356/vendasMes`; `carregarVendasMes(mesIni: 'AAAA-MM', mesFim: 'AAAA-MM'): Promise<void>` preenche `Store.s.vendas = { porMes: { 'AAAA-MM': {valor, obs} }, erro }`; `vendaDoMes(mes): number` (0 se ausente); `formVendaMes(mes)`, `salvarVendaMes(f, d)`; ação `vendaMes`; meta em `empresas/356/metas/loja_AAAA-MM` lida por `metaLoja(mes): number`.

- [ ] Step 1: Teste `/tmp/test_f.js`: abrir `#/empresa`, clicar `[data-act=vendaMes]`, preencher valor `48.250,00`, salvar → `__M['empresas/356/vendasMes/'+mesAtual].valor === 48250`; abrir de novo → input mostra `48.250,00` (ou `48250,00`) e salvar `50000` faz `update` (não novo doc). Card "Vendas" mostra `R$ 50.000,00`. Semente com 1 lançamento `tipo:'venda'` de 999 no mês: Vendas continua 50.000 e a linha aparece com "venda (antigo)". Sem `vendasMes` num mês com custos: card Margem mostra "—". Mês futuro no seletor da janela rejeitado com erro "não pode ser no futuro".
- [ ] Step 2: Rodar, ver FAIL.
- [ ] Step 3: Implementar. `formLanc` perde o seg Venda/Custo (sempre `tipo:'custo'`, categorias `CAT_CUSTO`; ação `lancTipo` removida). `salvarLanc` grava sempre `tipo:'custo'`. `setorHTML` (visão Todos) e `painelHTML`/`carregarPainel` passam a usar `vendaDoMes`; custos somam só `tipo:'custo'`. Botão "Venda do mês" ao lado de "+ Novo lançamento" (painel e Empresa). Card de meta único em "Todos" e no painel usando `metaLoja`; edição grava `metas/loja_AAAA-MM`. Cartões de subsetor do painel: gasto do mês + % dos gastos.
- [ ] Step 4: Rodar test_f e regressões a/b/d/e; ajustar asserts de venda em test_e (agora sem seg Venda/Custo). Ver PASS.
- [ ] Step 5: Commit `Venda do mês única e meta da loja`.

### Task 2: Eventos arquivado, Conveniência, Arquivar/Reativar

**Interfaces:**
- Consumes: `carregarSubs`, `aplicarSubs`, `SETORES`, `NOMES`.
- Produces: subsetor com campo `arquivado: boolean`; `SETORES` passa a conter só ativos; `SETORES_TODOS` contém todos (para nomes e relatórios); `migrarConveniencia(): Promise<void>` (só admin, idempotente); ações `subArquivar`, `subReativar`.

- [ ] Step 1: Teste `/tmp/test_g.js`: semente com os 5 subsetores antigos (eventos sem `arquivado`) e admin logado → após carregar, `__M['empresas/356/subsetores/eventos'].arquivado === true` e existe `subsetores/conveniencia` com nome "Conveniência"; chips da Empresa não têm "Eventos" e têm "Conveniência"; select de subsetor do Novo lançamento idem; rodar de novo não cria duplicata. Gerente: nenhuma gravação em `subsetores`. Janela Subsetores (admin): Arquivar Bebidas → some dos chips; Reativar → volta. Um gasto semente em `eventos` aparece no relatório Geral como "Eventos (arquivado)".
- [ ] Step 2: FAIL.
- [ ] Step 3: Implementar. Semente nova: importados, bebidas, cozinha, conveniencia, fornecedores (fornecedores sem botão Arquivar). `nomeSetor(id)` acrescenta " (arquivado)" quando arquivado.
- [ ] Step 4: test_g + regressões PASS.
- [ ] Step 5: Commit `Subsetores: arquivar; Eventos arquivado e Conveniência`.

### Task 3: Agregação e gráficos SVG (funções puras)

**Interfaces:**
- Produces:
  - `agregarGastos(lista: {valor, data, setor?, categoria?, fornecedorNome?}[], angulo: 'categoria'|'subsetor'|'fornecedor', mes: 'AAAA-MM', modo: 'dia'|'mes'): { itens: {nome, cor, total, pct, antes, delta, deltaPct|null, n, maior:{valor,data}|null, media}[], eixo: string[], series: {nome, cor, pontos: number[]}[], total: number, excluido: number }` — `lista` já contém 13 meses (mês − 12 … mês) só de gastos; `itens` do mês escolhido ordenados por total desc, top 7 + "Outros"; `antes` = total do mês anterior; `deltaPct` null quando `antes === 0`; `excluido` = soma sem fornecedor quando `angulo==='fornecedor'`; `eixo` = dias '01'..'31' (modo dia) ou 12 meses 'AAAA-MM' terminando em `mes` (modo mês).
  - `graficoPizza(itens, total): string` (SVG rosca, viewBox fixo, `role="img"` + `aria-label` com o resumo).
  - `graficoLinha(eixo, series): string` (SVG com eixos, ticks Y em formato curto "1,2 mil", pontos com `data-tip="item · rótulo · R$"`).
  - `CORES_SERIE: string[]` (7 variáveis CSS `--s1..--s7` + `--s0` para Outros), definidas em `:root` e `:root[data-tema=claro]`.
  - `analiseHTML(ag, opts: {angulos: string[], angulo, modo, acaoAngulo, acaoModo}): string` (seletores + pizza + linha + linha de tooltip + tabela de leitura).
- [ ] Step 1: Teste `/tmp/test_h.js` chamando as funções puras direto: 9 categorias → 8 itens com o 8º "Outros" = soma exata dos 2 menores; total = soma; mês vazio → `itens=[]`, `total=0`, e `analiseHTML` contém "Nenhum gasto"; item sem gasto no mês anterior → `deltaPct === null` e tabela mostra "novo"; modo dia de novembro → `eixo.length === 30`; modo mês → 12 rótulos terminando no mês; ângulo fornecedor exclui sem fornecedor e `excluido` correto; `graficoPizza` devolve `<svg` sem `NaN`; `graficoLinha` com todos zeros não tem `NaN`.
- [ ] Step 2: FAIL.
- [ ] Step 3: Implementar. Tooltip: listener delegado em `[data-tip]` (click e mouseover) escreve no `.tipline` irmão do gráfico. Tabela: ▲ em `var(--errt)` quando subiu, ▼ em `var(--ok)` quando caiu.
- [ ] Step 4: PASS.
- [ ] Step 5: Commit `Gráficos SVG de gastos (pizza, linha, tabela)`.

### Task 4: Análise nos Relatórios (empresa) e no Pessoal

**Interfaces:**
- Consumes: `agregarGastos`, `analiseHTML` (Task 3); `vendaDoMes`, `metaLoja` (Task 1); `SETORES_TODOS` (Task 2).
- Produces: estado `Store.s.rel.ang` ('categoria'|'subsetor'|'fornecedor', padrão 'categoria'), `Store.s.rel.modo` ('dia'|'mes'); `Store.s.pes.modo`; `carregarRel` carrega custos de 13 meses; `carregarGastosPes(mes)` carrega movimentos gasto de 13 meses em `Store.s.pes.hist`.
- [ ] Step 1: Teste `/tmp/test_i.js`: sementes de custos em 3 categorias, 2 subsetores, 1 fornecedor, em out e nov. `#/relatorios`: cards Vendas/Gastos/Resultado/Margem usam `vendasMes`; existe "Gastos por subsetor" e não existe "Vendas por categoria"; seção "Análise de gastos" com pizza e linha; clicar "Subsetor" muda legenda para nomes de subsetores; "Fornecedor" mostra nota "não entram nesta visão"; "Por mês" mostra 12 rótulos; relatório de um subsetor esconde o botão "Subsetor". `#/pessoal`: análise com só "Categoria"; nenhuma leitura de `empresas/` disparada pela tela Pessoal e nenhum gasto da empresa nos totais.
- [ ] Step 2: FAIL.
- [ ] Step 3: Implementar. Consulta: `colLanc().where('data','>=', mesAdd(mes,-12)+'-01').where('data','<', mesAdd(mes,1)+'-01')`, filtrar `tipo==='custo'`; igual em `pessoal/356/movimentos` com `tipo==='gasto'`. Remover painel "Vendas por categoria" e "Lançamentos do mês" passa a listar só custos. Cards de subsetor no relatório: gasto do mês, vs. mês anterior, nº lançamentos, maior gasto.
- [ ] Step 4: PASS + regressões; gerar PDF de teste (`--print-to-pdf`) e conferir que o SVG aparece.
- [ ] Step 5: Commit `Relatórios e Pessoal: análise de gastos por ângulo e período`.

### Task 5: "Pessoal" no Novo lançamento do painel

**Interfaces:**
- Consumes: `formPes`, `salvarPes`, `opcoesCat`, `jurosCampo`.
- Produces: `ADMINS_PES: string[]` (os 2 e-mails das regras), `ehDonoPes(): boolean`; `formLanc` inclui `<option value="__pes">Pessoal</option>` só se `ehDonoPes()`; ao escolher, o form troca para os campos de gasto pessoal e o submit chama `salvarPes` com `tipo:'gasto'`.
- [ ] Step 1: Teste `/tmp/test_j.js`: admin dono → painel, "+ Novo lançamento", select tem "Pessoal"; escolher → some Fornecedor e categorias viram as pessoais; salvar 120,00 → gravação em `pessoal/356/movimentos/` com `tipo:'gasto'` e nenhuma em `empresas/356/lancamentos/`. Gerente → opção ausente (`option[value=__pes]` não existe).
- [ ] Step 2: FAIL.
- [ ] Step 3: Implementar (garantir `Store.s.pes.cats` carregado ao abrir o form; se vazio, oferecer "Sem categoria").
- [ ] Step 4: PASS + regressões.
- [ ] Step 5: Commit `Painel: lançar gasto pessoal pelo Novo lançamento`.

### Task 6: Publicar e verificar

- [ ] Step 1: `VERSAO = 'g356-v20'` no `sw.js`.
- [ ] Step 2: Capturas headless (claro/escuro, 1360 e 390 px) de Empresa, Relatórios (3 ângulos, dia/mês) e Pessoal; conferir sem sobreposição nem texto cortado.
- [ ] Step 3: Rodar todos os testes (a, b, d, e, f, g, h, i, j); só a falha conhecida de b.
- [ ] Step 4: Commit + push na `main`; confirmar sha em `api.github.com/repos/lpalmeidacastro/gestao-356/commits/main`.
- [ ] Step 5: Atualizar `claude/mapa-do-projeto.md` (venda do mês, `vendasMes`, `metas/loja_*`, `arquivado`, Conveniência, análise, Pessoal no painel, sw v20).
