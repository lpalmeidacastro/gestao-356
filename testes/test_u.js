const P='empresas/356/', PM='pessoal/356/';
const ts=n=>({toMillis:()=>n});
const nomes=()=>Array.from(document.querySelectorAll('.brow:not(.hd) .bnome b')).map(b=>b.textContent.trim());
(async()=>{try{
  const hj=window.__iso(0), ont=window.__iso(-1);
  // empresa: A lançado primeiro (data de hoje), B lançado depois (data de ontem), C lançado por último (hoje)
  const L=(id,desc,data,ms)=>window.__M[P+'lancamentos/'+id]={tipo:'custo',setor:'bebidas',valor:10,data,categoria:'Mercadoria',descricao:desc,forma:'pix',criadoEm:ts(ms)};
  L('o1','Primeiro',hj,1000); L('o2','Segundo',ont,2000); L('o3','Terceiro',hj,3000);
  const Q=(id,desc,data,ms)=>window.__M[PM+'movimentos/'+id]={tipo:'gasto',valor:5,data,categoria:'Mercado',descricao:desc,forma:'pix',criadoEm:ts(ms)};
  Q('q1','PPrimeiro',hj,1000); Q('q2','PSegundo',ont,2000); Q('q3','PTerceiro',hj,3000);
  await wait(900);
  location.hash='#/empresa'; await wait(1300);
  let n=nomes().filter(x=>['Primeiro','Segundo','Terceiro'].includes(x));
  T('empresa: data mais recente primeiro; mesma data, último lançado primeiro', n.join()==='Terceiro,Primeiro,Segundo');
  // lançar um novo agora: vai para o topo mesmo com data antiga
  click('[data-act=lancNovo]'); await wait(500);
  let f=document.querySelector('form[data-form=lancamento]');
  chg(f.querySelector('[name=setor]'),'bebidas'); f.querySelector('[name=valor]').value='9'; f.querySelector('[name=descricao]').value='Recém lançado';
  f.querySelector('[name=data]').value=hj; sub(f); await wait(900);
  T('empresa: lançamento novo (mesma data) vai para o topo da data', nomes()[0]==='Recém lançado' || nomes()[0]==='Sem descrição' || /Recém/.test(nomes().join()) && nomes().indexOf('Recém lançado')===0);
  location.hash='#/pessoal'; await wait(1300);
  n=nomes().filter(x=>/^PP|^PS|^PT/.test(x));
  T('pessoal: data mais recente primeiro; mesma data, último lançado primeiro', n.join()==='PTerceiro,PPrimeiro,PSegundo');
  click('[data-act=pesNovo][data-t=gasto]'); await wait(400);
  f=document.querySelector('form[data-form=pessoal]');
  f.querySelector('[name=valor]').value='7'; f.querySelector('[name=descricao]').value='Pessoal novo'; f.querySelector('[name=data]').value=hj; f.querySelector('[name=forma]').value='pix'; sub(f); await wait(900);
  T('pessoal: lançamento novo (mesma data) vai para o topo da data', nomes()[0]==='Pessoal novo');
  // alinhamento: colunas 2..5 centralizadas (cabeçalho e valores), nome à esquerda
  const hd=Array.from(document.querySelectorAll('.brow.hd.fp span')), row=document.querySelector('.brow.fp:not(.hd)');
  const cells=[row.children[0],row.children[1],row.children[2],row.children[3],row.children[4]];
  const ta=e=>getComputedStyle(e).textAlign;
  T('pessoal: cabeçalhos Data/Valor/Forma/Tipo centralizados', [1,2,3,4].every(i=>ta(hd[i])==='center'));
  T('pessoal: valores Data/Valor/Forma/Tipo centralizados', [1,2,3,4].every(i=>ta(cells[i])==='center'));
  T('pessoal: descrição à esquerda', ta(hd[0])!=='center'&&ta(cells[0])!=='center');
  const bst=row.querySelector('.bst'), bd=bst.querySelector('.badge'); const rb=bst.getBoundingClientRect(), rd=bd.getBoundingClientRect();
  T('pessoal: selo Tipo no meio da coluna', Math.abs((rd.left+rd.right)/2-(rb.left+rb.right)/2)<3);
  location.hash='#/empresa'; await wait(1300);
  const hd2=Array.from(document.querySelectorAll('.brow.hd.fp span')), row2=document.querySelector('.brow.fp:not(.hd)');
  T('empresa: cabeçalhos e valores centralizados', [1,2,3,4].every(i=>ta(hd2[i])==='center'&&ta(row2.children[i])==='center'));
}catch(e){T('ERRO '+e.message,false);} fim();})();
