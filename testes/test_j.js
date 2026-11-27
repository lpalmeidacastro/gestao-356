window.__M['pessoal/356/categorias/c1']={nome:'Mercado',tipo:'gasto',ordem:1};
window.__M['pessoal/356/categorias/c2']={nome:'Aluguéis recebidos',tipo:'entrada',ordem:2};
(async()=>{try{
  await wait(900);
  const ger=location.search.includes('gerente');
  location.hash='#/painel'; await wait(800);
  click('[data-act=lancNovo]'); await wait(500);
  const f=document.querySelector('form[data-form=lancamento]');
  if(ger){ T('gerente: sem opção Pessoal', !f.querySelector('option[value=__pes]')); fim(); return; }
  T('opção Pessoal existe', !!f.querySelector('option[value=__pes]'));
  chg(f.querySelector('[name=setor]'),'__pes'); await wait(100);
  T('fornecedor escondido', f.querySelector('[data-forn]').classList.contains('hide'));
  const cp=f.querySelector('[name=categoriaPes]');
  T('categorias pessoais visíveis', cp && !cp.closest('[data-catpes]').classList.contains('hide') && [...cp.options].some(o=>o.text==='Mercado') && ![...cp.options].some(o=>o.text==='Aluguéis recebidos'));
  T('categoria empresa escondida', f.querySelector('[data-catemp]').classList.contains('hide'));
  f.querySelector('[name=valor]').value='120,00'; cp.value='Mercado';
  const n0=window.__log.filter(l=>l[1].startsWith('empresas/356/lancamentos/')).length;
  sub(f); await wait(600);
  const pk=window.__log.filter(l=>l[0]==='set'&&l[1].startsWith('pessoal/356/movimentos/')).pop();
  T('gravou no pessoal', pk && window.__M[pk[1]].tipo==='gasto' && window.__M[pk[1]].valor===120 && window.__M[pk[1]].categoria==='Mercado');
  T('nada em empresas/lancamentos', window.__log.filter(l=>l[1].startsWith('empresas/356/lancamentos/')).length===n0);
  T('modal fechou', !document.querySelector('form[data-form=lancamento]'));
  fim();
}catch(e){out.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]);fim();}})();
