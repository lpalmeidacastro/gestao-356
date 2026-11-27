const P='empresas/356/', PM='pessoal/356/';
const ks=pre=>Object.keys(window.__M).filter(k=>k.startsWith(pre));
const espera=async c=>{for(let k=0;k<25&&!c();k++)await wait(300);};
const heads=()=>Array.from(document.querySelectorAll('.brow.hd span')).map(s=>s.textContent.trim());
(async()=>{try{
  window.__semForma=true;
  await wait(1000);
  const nome={dinheiro:'Dinheiro',pix:'Pix',debito:'Cartão de débito',credito:'Cartão de crédito',boleto:'Boleto'};
  // lançamento antigo sem forma
  window.__M[P+'lancamentos/antigo1']={tipo:'custo',setor:'bebidas',valor:11,data:window.__iso(0),categoria:'Outros custos',descricao:'Antigo sem forma',juros:0};
  window.__M[PM+'movimentos/antigoP']={tipo:'gasto',valor:7,data:window.__iso(0),categoria:'Outros gastos',descricao:'Antigo pessoal',juros:0};
  location.hash='#/painel'; await wait(600);
  click('[data-act=lancNovo]'); await wait(500);
  let f=document.querySelector('form[data-form=lancamento]');
  const sel=f.querySelector('select[name=forma]');
  T('empresa: campo forma existe', !!sel);
  T('empresa: 5 opções de forma', sel&&Array.from(sel.options).filter(o=>o.value).map(o=>o.textContent).join('|')===Object.values(nome).join('|'));
  T('empresa: começa em Escolha', sel&&sel.value==='');
  chg(f.querySelector('[name=setor]'),'bebidas'); f.querySelector('[name=valor]').value='55';
  const L0=ks(P+'lancamentos/').length;
  sub(f); await wait(700);
  T('empresa: sem forma não salva e avisa', ks(P+'lancamentos/').length===L0 && /forma de pagamento/i.test(f.querySelector('.alert').textContent));
  sel.value='credito'; sub(f); await espera(()=>ks(P+'lancamentos/').length===L0+1);
  const k=ks(P+'lancamentos/').find(x=>window.__M[x].valor===55);
  T('empresa: grava forma credito', k&&window.__M[k].forma==='credito');
  // lista da empresa
  location.hash='#/empresa'; await wait(1200);
  const h=heads();
  T('empresa: coluna Forma entre Valor e Tipo', h.indexOf('Forma')===h.indexOf('Valor')+1 && h.indexOf('Tipo')===h.indexOf('Forma')+1);
  T('empresa: linha mostra Cartão de crédito', /Cartão de crédito/.test(txt()));
  const rows=Array.from(document.querySelectorAll('.brow:not(.hd)'));
  const antigo=rows.find(r=>/Antigo sem forma/.test(r.textContent));
  T('empresa: antigo mostra traço', antigo&&antigo.querySelector('.bfp')&&antigo.querySelector('.bfp').textContent.trim()==='—');
  // editar mostra forma e permite trocar
  const ed=rows.find(r=>/Cartão de crédito/.test(r.textContent)).querySelector('[data-act=lancEditar]'); ed.click(); await wait(500);
  f=document.querySelector('form[data-form=lancamento]');
  T('empresa: edição traz forma marcada', f.querySelector('[name=forma]').value==='credito');
  chg(f.querySelector('[name=forma]'),'boleto'); sub(f); await espera(()=>window.__M[k].forma==='boleto');
  T('empresa: edição troca para boleto', window.__M[k].forma==='boleto');
  // lançamento antigo editado exige forma
  document.querySelector('.brow:not(.hd) [data-act=lancEditar]'); 
  // pessoal pelo painel
  location.hash='#/painel'; await wait(600);
  click('[data-act=lancNovo]'); await wait(500);
  f=document.querySelector('form[data-form=lancamento]');
  chg(f.querySelector('[name=setor]'),'__pes'); await wait(100);
  f.querySelector('[name=valor]').value='33';
  const M0=ks(PM+'movimentos/').length;
  sub(f); await wait(700);
  T('painel→pessoal: sem forma não salva', ks(PM+'movimentos/').length===M0 && /forma de pagamento/i.test(f.querySelector('.alert').textContent));
  f.querySelector('[name=forma]').value='pix'; sub(f); await espera(()=>ks(PM+'movimentos/').length===M0+1);
  const mk=ks(PM+'movimentos/').find(x=>window.__M[x].valor===33);
  T('painel→pessoal: grava forma pix', mk&&window.__M[mk].forma==='pix');
  // pessoal direto
  location.hash='#/pessoal'; await wait(1000);
  click('[data-act=pesNovo][data-t=gasto]'); await wait(400);
  f=document.querySelector('form[data-form=pessoal]');
  T('pessoal: forma visível no gasto', f.querySelector('[name=forma]')&&!f.querySelector('[data-forma]').classList.contains('hide'));
  f.querySelector('[name=valor]').value='44'; sub(f); await wait(700);
  T('pessoal: sem forma não salva', ks(PM+'movimentos/').find(x=>window.__M[x].valor===44)===undefined && /forma de pagamento/i.test(f.querySelector('.alert').textContent));
  chg(f.querySelector('[name=forma]'),'dinheiro'); sub(f); await espera(()=>ks(PM+'movimentos/').find(x=>window.__M[x].valor===44));
  const pk=ks(PM+'movimentos/').find(x=>window.__M[x].valor===44);
  T('pessoal: grava dinheiro', pk&&window.__M[pk].forma==='dinheiro');
  // entrada não pede forma
  click('[data-act=pesNovo][data-t=entrada]'); await wait(400);
  f=document.querySelector('form[data-form=pessoal]');
  T('pessoal: entrada esconde forma', f.querySelector('[data-forma]').classList.contains('hide'));
  f.querySelector('[name=valor]').value='500'; sub(f); await espera(()=>ks(PM+'movimentos/').find(x=>window.__M[x].valor===500));
  const ek=ks(PM+'movimentos/').find(x=>window.__M[x].valor===500);
  T('pessoal: entrada salva sem forma', ek&&!window.__M[ek].forma);
  // alternar tipo mostra/esconde
  click('[data-act=pesNovo][data-t=gasto]'); await wait(400);
  f=document.querySelector('form[data-form=pessoal]');
  click('#tipoSeg [data-t=entrada]'); await wait(100);
  T('pessoal: trocar para entrada esconde forma', f.querySelector('[data-forma]').classList.contains('hide'));
  click('#tipoSeg [data-t=gasto]'); await wait(100);
  T('pessoal: voltar a gasto mostra forma', !f.querySelector('[data-forma]').classList.contains('hide'));
  document.getElementById('modalFechar')&&0;
  // lista pessoal
  location.hash='#/painel'; await wait(300); location.hash='#/pessoal'; await wait(900);
  const hp=heads();
  T('pessoal: coluna Forma entre Valor e Tipo', hp.indexOf('Forma')===hp.indexOf('Valor')+1 && hp.indexOf('Tipo')===hp.indexOf('Forma')+1);
  const rp=Array.from(document.querySelectorAll('.brow:not(.hd)'));
  T('pessoal: mostra Dinheiro e Pix', /Dinheiro/.test(rp.map(r=>r.textContent).join()) && /Pix/.test(rp.map(r=>r.textContent).join()));
  const ap=rp.find(r=>/Antigo pessoal/.test(r.textContent)); T('pessoal: antigo com traço', ap&&ap.querySelector('.bfp').textContent.trim()==='—');
  const en=rp.find(r=>/Entrada/.test(r.textContent)&&/500/.test(r.textContent)); T('pessoal: entrada com traço', en&&en.querySelector('.bfp').textContent.trim()==='—');
}catch(e){T('ERRO '+e.message,false);} fim();})();
