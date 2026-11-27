// PDF gerado no app (não depende do Imprimir): pedidos (um, todos, com pagamentos e diferenças), Pessoal, Relatórios, Contas a pagar, Lançamentos
const P='empresas/356/', PM='pessoal/356/';
const espera=async(c,n=30)=>{for(let k=0;k<n&&!c();k++)await wait(200);};
const ts=n=>({toMillis:()=>n});
// texto do PDF: os textos ficam em "(...) Tj"; junta tudo para procurar
const ptxt=()=>{const b=window.__pdf356&&window.__pdf356.bytes; if(!b) return ''; let s=''; for(const c of b) s+=String.fromCharCode(c); return s;};
const tem=(s,t)=>s.replace(/\xa0/g,' ').includes('('+t.replace(/\xa0/g,' '));
const guarda=(n)=>{const b=window.__pdf356.bytes; let s=''; for(const c of b) s+=String.fromCharCode(c); let pre=document.getElementById('PDF_'+n); if(!pre){pre=document.createElement('pre');pre.id='PDF_'+n;pre.style.display='none';document.body.appendChild(pre);} pre.textContent=btoa(s);};
window.__M[P+'fornecedores/F1']={nome:'Distribuidora Sol',tipos:[]};
window.__M[P+'fornecedores/F2']={nome:'Importadora Lua',tipos:[]};
(async()=>{try{
  const hj=window.__iso(0), ont=window.__iso(-1);
  // pedido 1: saquê faltou 2 (pedido 10, chegou 8); pedido 2 ainda sem conferir; pagamento de 300
  window.__M[P+'pedidos/A1']={fornecedorId:'F1',fornecedorNome:'Distribuidora Sol',data:ont,valor:620,itens:[{prodId:'x',nome:'Saquê 720 ml',qtd:10,preco:50,total:500,recebido:true,qtdRecebida:8},{prodId:'y',nome:'Shoyu 1 L',qtd:10,preco:12,total:120,recebido:true,qtdRecebida:10}],entregue:true,entregueEm:hj,obs:'',criadoEm:ts(1000)};
  window.__M[P+'pedidos/A2']={fornecedorId:'F1',fornecedorNome:'Distribuidora Sol',data:hj,valor:90,itens:[{prodId:'z',nome:'Missô 500 g',qtd:3,preco:30,total:90,recebido:false,qtdRecebida:0}],entregue:false,obs:'entregar de manhã',criadoEm:ts(2000)};
  window.__M[P+'pedidos/B1']={fornecedorId:'F2',fornecedorNome:'Importadora Lua',data:hj,valor:45,itens:[{prodId:'w',nome:'Lámen picante',qtd:5,preco:9,total:45,recebido:false,qtdRecebida:0}],entregue:false,obs:'',criadoEm:ts(3000)};
  window.__M[P+'lancamentos/G1']={tipo:'custo',setor:'fornecedores',valor:300,data:hj,categoria:'Mercadoria',descricao:'1ª parcela',forma:'pix',fornecedorId:'F1',fornecedorNome:'Distribuidora Sol',pagForn:true,juros:0,criadoEm:ts(1500)};
  window.__M[PM+'movimentos/m1']={tipo:'gasto',valor:87.5,data:hj,categoria:'Mercado',descricao:'Feira da semana',forma:'pix',criadoEm:ts(10)};
  await wait(1000);
  // ---------- pedidos ----------
  location.hash='#/empresa'; await wait(900);
  await clicaAte('[data-act=setorTab][data-t=pedidos]','#pedForn');
  T('pedidos: botão Baixar PDF', !!document.querySelector('[data-act=pedPdf]'));
  chg(document.querySelector('#pedForn'),'F1'); await wait(400);
  await clicaAte('[data-act=pedPdf]','form[data-form=pedPdf]');
  let f=document.querySelector('form[data-form=pedPdf]');
  T('modal com as 3 opções', ['um','todos','calc'].every(v=>f.querySelector('[name=modo][value='+v+']')));
  T('lista só pedidos do fornecedor escolhido', f.querySelectorAll('[name=pedido] option').length===2);
  f.querySelector('[name=pedido]').value='A1'; f.querySelector('[name=modo][value=um]').checked=true;
  window.__pdf356=null; sub(f); await espera(()=>window.__pdf356);
  let s=ptxt(); guarda('um');
  T('um pedido: arquivo PDF', s.startsWith('%PDF-1.4') && /%%EOF\s*$/.test(s));
  T('um pedido: nome do arquivo', /^Pedido-Distribuidora-Sol-\d{4}-\d\d-\d\d\.pdf$/.test(window.__pdf356.nome));
  T('um pedido: título e produtos', tem(s,'Pedido \xb7 Distribuidora Sol') && tem(s,'Saqu\xea 720 ml') && tem(s,'Shoyu 1 L'));
  T('um pedido: mostra a falta na entrega', tem(s,'faltou R$\xa0100,00'));
  T('um pedido: total pelo que chegou 520', tem(s,'R$\xa0520,00'));
  T('um pedido: não mistura outro pedido', !tem(s,'Miss\xf4'));
  // todos os pedidos do fornecedor
  await clicaAte('[data-act=pedPdf]','form[data-form=pedPdf]');
  f=document.querySelector('form[data-form=pedPdf]'); f.querySelector('[name=modo][value=todos]').checked=true; window.__pdf356=null; sub(f); await espera(()=>window.__pdf356);
  s=ptxt(); guarda('todos');
  T('todos: os 2 pedidos do fornecedor', tem(s,'Saqu\xea 720 ml') && tem(s,'Miss\xf4 500 g') && !tem(s,'L\xe1men'));
  T('todos: produto não conferido aparece "a conferir"', tem(s,'a conferir'));
  T('todos: sem cálculo de pagamentos', !tem(s,'C\xe1lculo do saldo'));
  // com pagamentos e diferenças
  await clicaAte('[data-act=pedPdf]','form[data-form=pedPdf]');
  f=document.querySelector('form[data-form=pedPdf]'); f.querySelector('[name=modo][value=calc]').checked=true; window.__pdf356=null; sub(f); await espera(()=>window.__pdf356);
  s=ptxt(); guarda('calc');
  T('calc: seções de divergências, pagamentos e cálculo', tem(s,'Diverg\xeancias entre o pedido e a entrega') && tem(s,'Pagamentos') && tem(s,'C\xe1lculo do saldo'));
  T('calc: divergência do saquê (pedido 10, chegou 8)', tem(s,'−2') || tem(s,'-2'));
  T('calc: pagamento listado', tem(s,'1\xaa parcela') && tem(s,'R$\xa0300,00'));
  // 620 pedido + 90 pedido = 710; real = 520 + 90 = 610; pago 300 → saldo 310
  T('calc: total pedido 710, devido 610, saldo 310', tem(s,'R$\xa0710,00') && tem(s,'R$\xa0610,00') && tem(s,'R$\xa0310,00'));
  // todos os fornecedores
  chg(document.querySelector('#pedForn'),''); await wait(400);
  await clicaAte('[data-act=pedPdf]','form[data-form=pedPdf]');
  f=document.querySelector('form[data-form=pedPdf]');
  T('todos os fornecedores: lista os 3 pedidos', f.querySelectorAll('[name=pedido] option').length===3);
  f.querySelector('[name=modo][value=calc]').checked=true; window.__pdf356=null; sub(f); await espera(()=>window.__pdf356);
  s=ptxt(); guarda('geral');
  T('todos os fornecedores: os dois fornecedores e o resumo geral', tem(s,'Distribuidora Sol') && tem(s,'Importadora Lua') && tem(s,'Resumo geral'));
  T('PDF com rodapé de página', tem(s,'p\xe1gina 1 de'));
  // ---------- outras telas ----------
  location.hash='#/pessoal'; await wait(1300);
  window.__pdf356=null; click('[data-act=pesPdf]'); await espera(()=>window.__pdf356);
  s=ptxt(); guarda('pes');
  T('pessoal: PDF com o lançamento e os cartões', !!window.__pdf356 && tem(s,'Feira da semana') && tem(s,'Saldo do m\xeas'));
  location.hash='#/relatorios'; await wait(1500);
  window.__pdf356=null; click('[data-act=relPdf]'); await espera(()=>window.__pdf356);
  s=ptxt(); guarda('rel');
  T('relatórios: PDF com os quadros', !!window.__pdf356 && tem(s,'Relat\xf3rio geral') && tem(s,'Juros pagos no m\xeas'));
  location.hash='#/boletos'; await wait(1300);
  T('contas a pagar: botão Baixar PDF', !!document.querySelector('[data-act=contasPdf]'));
  window.__pdf356=null; click('[data-act=contasPdf]'); await espera(()=>window.__pdf356);
  s=ptxt(); guarda('contas');
  T('contas a pagar: PDF gerado', !!window.__pdf356 && tem(s,'Contas a pagar'));
  location.hash='#/empresa'; await wait(900);
  await clicaAte('[data-act=setorTab][data-t=lanc]','[data-act=lancPdf]');
  window.__pdf356=null; click('[data-act=lancPdf]'); await espera(()=>window.__pdf356);
  s=ptxt(); guarda('lanc');
  T('lançamentos: PDF com o pagamento ao fornecedor', !!window.__pdf356 && s.includes('1\xaa parcela'));
  T('nenhuma tela chamou o Imprimir', !window.__imprimiu);
}catch(e){T('ERRO '+e.message,false);} fim();})();
window.print=()=>{window.__imprimiu=true;};
