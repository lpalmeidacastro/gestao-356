const P='empresas/356/';
const subs=[['importados','Produtos importados',1],['bebidas','Bebidas',2],['cozinha','Cozinha',3],['conveniencia','Conveniência',4],['fornecedores','Fornecedores',5]];
subs.forEach(([id,n,o])=>{window.__M[P+'subsetores/'+id]={nome:n,ordem:o,fixo:id==='fornecedores'};});
window.__M['pessoal/356/categorias/c1']={nome:'Mercado',tipo:'gasto',ordem:1};
const lancs=()=>Object.keys(window.__M).filter(k=>k.startsWith(P+'lancamentos/')).map(k=>window.__M[k]);
const cats=()=>Object.keys(window.__M).filter(k=>k.startsWith(P+'categorias/')).map(k=>window.__M[k]);
const abrir=async()=>{location.hash='#/painel';await wait(500);click('[data-act=lancNovo]');await wait(400);return document.querySelector('form[data-form=lancamento]');};
(async()=>{try{
  await wait(1000);
  let f=await abrir();
  const sel=f.querySelector('[name=categoria]');
  T('select tem + Nova categoria', !!sel.querySelector('option[value=__nova]'));
  T('campo de nome começa escondido', f.querySelector('[data-novacat]')&&f.querySelector('[data-novacat]').classList.contains('hide'));
  chg(f.querySelector('[name=setor]'),'bebidas');
  chg(sel,'__nova'); await wait(100);
  T('campo de nome aparece', f.querySelector('[data-novacat]')&&!f.querySelector('[data-novacat]').classList.contains('hide'));
  f.querySelector('[name=valor]').value='150,00'; f.querySelector('[name=novaCategoria]').value='Embalagens';
  sub(f); await wait(700);
  T('categoria criada no Firebase', cats().some(c=>c.nome==='Embalagens'));
  T('lançamento usa a categoria nova', lancs().some(l=>l.categoria==='Embalagens'&&l.valor===150));
  f=await abrir();
  T('nova categoria aparece na lista', [...f.querySelector('[name=categoria]').options].some(o=>o.text==='Embalagens'));
  // duplicada (sem diferenciar maiúscula)
  const antes=lancs().length;
  chg(f.querySelector('[name=categoria]'),'__nova'); f.querySelector('[name=novaCategoria]').value='mercadoria'; f.querySelector('[name=valor]').value='10'; sub(f); await wait(500);
  T('duplicada bloqueada', lancs().length===antes && /já existe/i.test(f.querySelector('.alert').textContent));
  // nome curto
  f.querySelector('[name=novaCategoria]').value='a'; sub(f); await wait(400);
  T('nome curto bloqueado', lancs().length===antes);
  // pessoal
  f.querySelector('[name=novaCategoria]').value=''; chg(f.querySelector('[name=categoria]'),'Aluguel');
  chg(f.querySelector('[name=setor]'),'__pes'); await wait(100);
  const sp=f.querySelector('[name=categoriaPes]');
  T('pessoal tem + Nova categoria', !!sp.querySelector('option[value=__nova]'));
  chg(sp,'__nova'); await wait(100);
  f.querySelector('[name=novaCategoriaPes]').value='Pet'; f.querySelector('[name=valor]').value='80'; sub(f); await wait(700);
  T('categoria pessoal criada', Object.keys(window.__M).some(k=>k.startsWith('pessoal/356/categorias/')&&window.__M[k].nome==='Pet'&&window.__M[k].tipo==='gasto'));
  T('gasto pessoal usa Pet', Object.keys(window.__M).some(k=>k.startsWith('pessoal/356/movimentos/')&&window.__M[k].categoria==='Pet'));
  // gerenciar
  location.hash='#/empresa'; await wait(700);
  click('[data-act=catsManage]'); await wait(300);
  T('modal lista Embalagens com remover', !!document.querySelector('#modal [data-act=catEmpDel]') && /Embalagens/.test(document.getElementById('modal').innerText));
  click('#modal [data-act=catEmpDel]'); await wait(500);
  T('categoria removida do Firebase', !cats().some(c=>c.nome==='Embalagens'));
  T('lançamento antigo mantém nome', lancs().some(l=>l.categoria==='Embalagens'));
  fim();
}catch(e){out.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]);fim();}})();
