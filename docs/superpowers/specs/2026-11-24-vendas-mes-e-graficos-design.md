# Parte 1 · Venda do mês, gráficos de gastos, Conveniência e Pessoal no painel

App 356 Gestão (`index.html` único, JS puro, Firebase compat, GitHub Pages). Dono: Luiz Paulo (não programador). Data: 24/11/2026.

## Intenção e o porquê
O dono não fará conciliação de caixa pelo app. Ele quer lançar **um único valor de vendas por mês (loja inteira)** e ver o balanço vendas − gastos. Quer **enxergar os gastos da loja de vários ângulos** (categoria, subsetor, fornecedor; por dia e por mês) para achar problemas e oportunidades de economia. O mesmo para os gastos pessoais. Também quer lançar gasto pessoal rápido pelo botão do painel.

## Metas
1. Venda = 1 registro por mês, total da loja inteira.
2. Relatórios com gráficos de pizza (% por item) e de linha (R$ por dia de cada item, com alternativa "por mês", últimos 12 meses), escolhendo o ângulo: Categoria | Subsetor | Fornecedor.
3. Tabela de leitura junto dos gráficos (valor, %, comparação com mês anterior, maior gasto).
4. Pessoal com os mesmos gráficos (ângulo só Categoria).
5. Subsetor "Eventos" sai; entra "Conveniência".
6. "Pessoal" como opção de subsetor no "Novo lançamento" do painel.

## Não-metas
- Conciliação de caixa, vendas por subsetor ou por categoria.
- Boletos, contas agendadas e freelancers marcados como pagos **nunca** viram gasto (decisão do dono: ele lança os gastos à mão).
- Auditoria visual e o zoom no celular: são a Parte 2, depois desta.

## Anti-metas (seria falha mesmo funcionando)
- Gráfico que mostre gasto da empresa misturado com pessoal.
- Gerente ver ou lançar qualquer coisa do Pessoal.
- Dados antigos sumirem (Eventos, vendas antigas).
- App ficar pesado/dependente de internet por causa dos gráficos.

## Abordagens consideradas
- **A. Gráficos desenhados pelo próprio app em SVG, sem biblioteca — escolhida pelo dono.** Leve, offline, segue marca e temas, sai certo no PDF. Custo: mais código; interação simples (tocar mostra o valor).
- B. Chart.js por CDN: pronto e com interações, mas mais pesado, depende de internet, cores a ajustar, PDF às vezes corta.
- C. Só tabelas/barras: não atende o pedido. Descartada.

## Decisões do dono
- Venda mensal é **total da loja inteira**.
- Meta de vendas vira **uma só, da loja** (consequência aceita).
- Ângulos do relatório: **Categoria, Subsetor e Fornecedor**, selecionáveis; relatórios detalhados.
- Gastos = só custos lançados à mão.
- Tirar Eventos, criar Conveniência (proposta de arquivar aceita por silêncio: "prossiga").
- Gráficos opção A.

## Desenho

### 1. Venda do mês
- Coleção nova `empresas/356/vendasMes/{AAAA-MM}`: `valor`, `obs` (opcional), `atualizadoPorUid`, `atualizadoEm`. Cabe na regra `empresas/{emp}/{col}/{doc=**}`. Gerente pode registrar/editar; só admin apaga.
- Botão **"Venda do mês"** (no painel e na Empresa > Lançamentos): abre janela com mês (padrão: atual; permite meses passados, não futuros) e valor. Se já existe, abre preenchido para editar.
- O formulário "Novo lançamento" deixa de ter Venda/Custo: passa a ser sempre **gasto** (custo). Categorias de custo continuam.
- **Vendas antigas:** o dono confirmou (24/11) que ainda não lançou vendas reais, só gastos. Lançamentos `tipo:'venda'` (de teste) deixam de entrar nas contas; sem pré-preenchimento nem migração. Se existirem, aparecem na lista com etiqueta "venda (antigo)" e o admin pode apagar. **Todos os gastos já lançados são mantidos como estão.**
- **Meta:** `empresas/356/metas/loja_AAAA-MM` (`vendas`). Card "Meta de vendas" fica na visão "Todos" da Empresa e no painel. Metas antigas por subsetor são ignoradas.
- Painel: KPIs Vendas (do `vendasMes`), Gastos, Resultado, Margem do mês. Cartões por subsetor passam a mostrar só **gasto do mês** do subsetor (e % do total de gastos).

### 2. Relatórios (Empresa)
- Cards Geral: Vendas (com % da meta), Gastos, Resultado (vendas − gastos), Margem.
- "Resultado por subsetor" vira **"Gastos por subsetor"** (gasto, % do total, vs. mês anterior). Some "Vendas por categoria".
- No relatório de um subsetor: cards só de gastos (gasto do mês, vs. mês anterior, nº de lançamentos, maior gasto); gráficos filtrados para o subsetor; ângulo Subsetor fica escondido.
- **Seção "Análise de gastos"**:
  - Seletor de ângulo: Categoria | Subsetor | Fornecedor. Seletor de período: Por dia | Por mês.
  - **Pizza (rosca)**: % de cada item no mês escolhido, com legenda (nome, R$, %). Máximo 7 fatias; o resto vira "Outros".
  - **Linha**: "Por dia" = dias 1..fim do mês no eixo X, R$ gasto no dia no eixo Y, uma linha por item (os mesmos até 7 + Outros). "Por mês" = últimos 12 meses terminando no mês escolhido, R$ por mês por item. Tocar/passar num ponto mostra "item · data · R$" numa linha de texto abaixo do gráfico (no fluxo normal, sem posição fixa).
  - **Tabela de leitura**: item | gasto no mês | % | vs. mês anterior (R$ e %, ▲ vermelho se subiu, ▼ verde se caiu) | nº de lançamentos | maior gasto (valor e data) | média por lançamento.
  - **Ângulo Fornecedor**: considera só gastos com fornecedor (subsetor Fornecedores). Mostra nota: "R$ X em gastos sem fornecedor não entram nesta visão".
  - Juros: o quadro de juros existente continua.
- Dados: o relatório já lê lançamentos do mês; passa a ler **custos dos últimos 12 meses** numa consulta `data >= início` e `< fim do mês seguinte` em `lancamentos` (filtra `tipo === 'custo'` no app). Os gráficos são só de gastos (vendas não entram nos gráficos).
- PDF: gráficos saem como SVG estático, no tema claro de impressão.

### 3. Pessoal
- Seção "Análise de gastos" igual, ângulo só **Categoria**, com Por dia | Por mês (12 meses de `pessoal/356/movimentos`, só `tipo:'gasto'`). Contas pessoais pagas **não** entram (mesma regra: só lançados à mão). Entradas continuam como hoje.

### 4. Eventos → Conveniência
- Subsetor ganha campo `arquivado` (bool). Arquivado: some de chips, formulários, painel e "Gastos por subsetor" de meses sem gasto; meses com gasto mostram "Eventos (arquivado)".
- O dono confirmou (24/11) que **Eventos não tem nada lançado** (nem boletos, contas, freelancers, produtos ou tarefas). Por isso arquivar basta, sem reatribuir dados; se aparecer algo em Eventos, ele continua visível com o nome "Eventos (arquivado)" onde estiver listado.
- Migração única feita pelo primeiro admin que abrir a versão nova: marca `eventos.arquivado = true` e cria `conveniencia` (nome "Conveniência", ordem após Cozinha) se não existir. Os padrões de semente passam a ser Importados, Bebidas, Cozinha, Conveniência, Fornecedores.
- Na janela "Subsetores": botão Arquivar/Reativar (só admin) para os não fixos — permite repetir isso no futuro sem apagar dados.

### 5. "Pessoal" no Novo lançamento do painel
- No select Subsetor do "Novo lançamento", última opção "Pessoal", **só para os 2 e-mails fixos das regras (Luiz e Eliana)**, não para qualquer admin (decisão do Claude, para casar com a regra do Firestore).
- Ao escolher: o formulário troca os campos (some fornecedor; categorias passam a ser as pessoais; juros continua) e ao salvar grava em `pessoal/356/movimentos` com `tipo:'gasto'` (mesma função `salvarPes`).

### 6. Visual (para esta parte)
- Dials: variância 3 · movimento 1 · densidade 8.
- Paleta de séries: 7 cores distintas derivadas da marca + neutros, validadas nos dois temas (contraste ≥ 3:1 contra o fundo do cartão), mais cinza para "Outros". Cor nunca é a única pista: legenda com nome e valor.
- Cores de estado (vermelho subiu / verde caiu) só no texto da tabela.

## O que fica para o construtor
- Algoritmo de escala/ticks dos eixos, formato curto de R$ no eixo (ex.: "1,2 mil").
- Disposição exata no celular (pizza acima da linha; tabela com rolagem horizontal se precisar).
- Nome e estrutura das funções, testes automáticos (harness atual com Firebase simulado).
- Atualizar o mapa do projeto ao fim.

## Decisões tomadas pelo Claude (conferir)
- Venda do mês aceita meses passados, não futuros; gerente pode registrar.
- Ângulo Fornecedor só considera gastos com fornecedor, com nota do valor excluído.
- Máximo 7 itens + "Outros" nos gráficos.
- Arquivar/Reativar subsetor na janela Subsetores (só admin).
- Opção Pessoal no painel só para os 2 e-mails fixos.
- Cartões de subsetor do painel mostram gasto do mês e % dos gastos.
