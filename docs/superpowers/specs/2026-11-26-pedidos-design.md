# Pedidos a fornecedores (design curto, 26/11/2026)

**Pedido do dono:** aba "Pedidos" para escolher o fornecedor, lançar o pedido (quantidade, produto, preço, total), conferir a entrega com visto por produto e quantidade, ver o total de pedidos do fornecedor e ir abatendo pagamentos em partes, tudo com data. Produtos e preços cadastrados por fornecedor para não digitar de novo.

**Decisões do dono:** pagamento vira gasto nos Lançamentos; conferência = visto + quantidade recebida; pagamentos abatem do total do fornecedor (não de cada pedido); gerente vê e usa (só admin apaga).

**Abordagem:** aba Pedidos na Empresa (ao lado de Lançamentos, Estoque, Tarefas).
- `empresas/356/fornProdutos/{id}`: fornecedorId, nome, preco.
- `empresas/356/pedidos/{id}`: fornecedorId, fornecedorNome, data, itens [{prodId, nome, qtd, preco, total, recebido, qtdRecebida}], valor, obs, entregue, entregueEm.
- Pagamento = lançamento de gasto (`tipo:'custo'`, subsetor Fornecedores, categoria Mercadoria, forma obrigatória) com `pagForn:true`. Uma fonte só: aparece nos gastos e abate o saldo.
- Saldo = soma dos pedidos − soma dos pagamentos (`pagForn`) do fornecedor. Gastos antigos lançados à mão não abatem.
- Regras do banco: não mudam (as coleções novas caem na regra geral da empresa, com histórico).

**Escolhas minhas:** o saldo usa o total pedido (se faltar produto, a tela mostra "faltou N produto" e o dono edita o pedido se não vai pagar a falta); preço que mudou no pedido atualiza o cadastro (caixa marcada, dá para desmarcar); produto novo pode ser criado dentro do pedido; editar o pedido mantém a conferência dos produtos que continuam; data do pedido, da entrega e do pagamento não podem ser no futuro.

**Fora agora:** entrega não mexe no Estoque; pedidos não entram na busca nem nos relatórios (os pagamentos entram, como gastos).
