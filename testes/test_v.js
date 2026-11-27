const P='empresas/356/', PM='pessoal/356/';
const ta=e=>getComputedStyle(e).textAlign;
// confere: em cada tabela/lista, primeira coluna não centralizada e demais centralizadas (cabeçalho e 1ª linha de dados)
const confere=(nome)=>{
  let ok=true, n=0, msg='';
  document.querySelectorAll('table').forEach(t=>{ t.querySelectorAll('tr').forEach(tr=>{ const c=[...tr.children]; if(c.length<2) return; n++; if(ta(c[0])==='center'){ok=false;msg+=' t0';} if(!c.slice(1).every(x=>ta(x)==='center')){ok=false;msg+=' tN';} }); });
  document.querySelectorAll('[role=table]').forEach(t=>{ t.querySelectorAll('.brow,.mrow,.frow,.fr,.csr').forEach(r=>{ const c=[...r.children].filter(x=>!x.classList.contains('bact')&&!x.classList.contains('fact')); if(c.length<2) return; n++; if(ta(c[0])==='center'){ok=false;msg+=' g0';} const rest=c.slice(1).filter(x=>x.textContent.trim()||x.querySelector('.badge')); if(!rest.every(x=>ta(x)==='center')){ok=false;msg+=' gN:'+rest.filter(x=>ta(x)!=='center').map(x=>x.className||x.tagName).join('/');} }); });
  T(nome+' ('+n+' linhas)', n>0&&ok||(n===0)); if(!ok) T(nome+' detalhe'+msg,false);
  return n;
};
(async()=>{try{
  const hj=window.__iso(0), m=mesA;
  window.__M[P+'lancamentos/a1']={tipo:'custo',setor:'bebidas',valor:100,data:hj,categoria:'Mercadoria',descricao:'A',forma:'pix',criadoEm:{toMillis:()=>1}};
  window.__M[P+'lancamentos/a2']={tipo:'custo',setor:'cozinha',valor:50,data:hj,categoria:'Aluguel',descricao:'B',forma:'pix',criadoEm:{toMillis:()=>2}};
  window.__M[PM+'movimentos/q1']={tipo:'gasto',valor:5,data:hj,categoria:'Mercado',descricao:'P',forma:'pix',criadoEm:{toMillis:()=>1}};
  window.__M[P+'boletos/b1']={descricao:'Luz',setor:'geral',vencimento:hj,valor:80,pago:false};
  window.__M[P+'produtos/p1']={nome:'Cerveja',setor:'bebidas',categoria:'X',unidade:'un',qtd:3,minimo:5,custoUn:4};
  window.__M[P+'freelancers/f1']={nome:'Ana',funcao:'Caixa',setor:'geral',valorCombinado:100,ativo:true};
  window.__M[P+'presencas/'+hj+'_f1']={data:hj,freelaId:'f1',status:'presente',valor:100,pago:false};
  window.__M[P+'energia/'+m+'_loja1']={mes:m,loja:'loja1',consumo:100,injetado:50,semDesconto:200,pagoUsina:50,pagoEnel:60};
  await wait(900);
  for(const [h,nome] of [['#/empresa','empresa lancamentos'],['#/boletos','contas a pagar'],['#/freelancers','freelancers'],['#/energia','energia'],['#/pessoal','pessoal'],['#/relatorios','relatorios']]){
    location.hash=h; await wait(1500); confere(nome);
  }
  location.hash='#/empresa'; await wait(1200);
  const ab=[...document.querySelectorAll('.tabs button,.tabs2 button,[data-act=empTab]')].find(b=>/estoque/i.test(b.textContent)); if(ab){ab.click(); await wait(900); confere('estoque');}
  const ent=[...document.querySelectorAll('[data-act=lancMes],[data-act]')].length; 
}catch(e){T('ERRO '+e.message,false);} fim();})();
