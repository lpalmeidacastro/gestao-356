(function(){
const out=[];const T=(n,c)=>out.push((c?'PASS ':'FAIL ')+n);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const click=sel=>{const e=document.querySelector(sel);if(e)e.click();return !!e;};
const txt=()=>document.getElementById('root').innerText;
const sub=f=>{const s=f.querySelector&&f.querySelector('select[name=forma]');if(s&&!s.value)s.value='pix';return f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));};
const chg=(el,v)=>{el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));};
const last=(pre)=>{const k=window.__log.filter(l=>l[0]==='set'&&l[1].startsWith(pre)).pop();return k?window.__M[k[1]]:null;};
(async()=>{try{
  await wait(900);
  location.hash='#/boletos'; await wait(600);
  click('[data-act=boletoNovo]'); await wait(200);
  let f=document.querySelector('form[data-form=boleto]');
  T('boleto: O que é visível fora de Fornecedores', !f.querySelector('[data-desc]').classList.contains('hide'));
  chg(f.querySelector('[name=setor]'),'fornecedores');
  T('boleto: O que é some em Fornecedores', f.querySelector('[data-desc]').classList.contains('hide'));
  f.querySelector('[name=valor]').value='1000,00'; f.querySelector('[name=juros]').value='50,00';
  chg(f.querySelector('[name=fornecedorId]'),'__novo'); f.querySelector('[name=novoFornecedor]').value='Atacado Norte';
  sub(f); await wait(600);
  let b=last('empresas/356/boletos/');
  T('boleto: descricao = nome do fornecedor', b&&b.descricao==='Atacado Norte'&&b.juros===50);
  T('boleto: lista mostra fornecedor em destaque sem duplicar', /Atacado Norte/.test(txt())&&!/Atacado Norte · Atacado Norte/.test(txt())&&!/Fornecedores · Atacado Norte/.test(txt()));
  // marcar pago hoje
  const bid=window.__log.filter(l=>l[0]==='set'&&l[1].startsWith('empresas/356/boletos/')).pop()[1].split('/').pop();
  document.querySelector('[data-act=pagar][data-id="'+bid+'"]').click(); await wait(400);
  // juros inválido
  click('[data-act=boletoNovo]'); await wait(200);
  f=document.querySelector('form[data-form=boleto]');
  f.querySelector('[name=descricao]').value='Teste'; f.querySelector('[name=valor]').value='100,00'; f.querySelector('[name=juros]').value='500';
  sub(f); await wait(300);
  T('juros maior que valor barrado', document.querySelector('form[data-form=boleto] .alert').textContent.includes('juros'));
  
  // conta agendada paga com juros
  click('#modal [data-act=fecharModal]'); 
  location.hash='#/boletos'; await wait(300);
  click('[data-act=abaConta][data-a=contas]'); await wait(200);
  click('[data-act=contaNova]'); await wait(200);
  f=document.querySelector('form[data-form=conta]');
  chg(f.querySelector('[name=setor]'),'fornecedores');
  T('conta: O que é some em Fornecedores', f.querySelector('[data-desc]').classList.contains('hide'));
  const sel=f.querySelector('[name=fornecedorId]'); chg(sel,[...sel.options].find(o=>o.text==='Atacado Norte').value);
  f.querySelector('[name=valor]').value='300,00'; f.querySelector('[name=dia]').value='1';
  sub(f); await wait(600);
  let c=last('empresas/356/contas/');
  T('conta: descricao = fornecedor', c&&c.descricao==='Atacado Norte');
  click('[data-act=contaPagar]'); await wait(200);
  f=document.querySelector('form[data-form=contaPag]');
  T('pagar conta tem campo juros', !!f.querySelector('[name=juros]'));
  f.querySelector('[name=juros]').value='20,00'; sub(f); await wait(500);
  const cp=last('empresas/356/contasPag/'); T('contasPag guarda juros', cp&&cp.juros===20);
  // lançamento custo com juros
  location.hash='#/empresa'; await wait(500);
  click('[data-act=lancNovo]')||click('[data-act=novoLanc]')||click('[data-act=lancNovo2]'); await wait(200);
  f=document.querySelector('form[data-form=lancamento]');
  
  
  T('lançamento: juros aparece em custo', !f.querySelector('[data-juros]').classList.contains('hide'));
  chg(f.querySelector('[name=setor]'),'bebidas');
  f.querySelector('[name=valor]').value='400,00'; f.querySelector('[name=juros]').value='15,50';
  sub(f); await wait(500);
  const lz=last('empresas/356/lancamentos/'); T('lançamento grava juros', lz&&lz.juros===15.5&&lz.tipo==='custo');
  // relatório
  location.hash='#/relatorios'; await wait(1200);
  const rt=txt();
  T('relatório tem quadro de juros', rt.includes('Juros pagos no mês'));
  T('relatório soma juros 15,50 + 50,00 + 20,00 = 85,50', /85,50/.test(rt));
  // pessoal
  location.hash='#/pessoal'; await wait(900);
  click('[data-act=pesNovo][data-t=gasto]'); await wait(200);
  f=document.querySelector('form[data-form=pessoal]');
  T('pessoal: juros visível em gasto', !f.querySelector('[data-juros]').classList.contains('hide'));
  f.querySelector('[name=valor]').value='200,00'; f.querySelector('[name=juros]').value='8,00'; sub(f); await wait(500);
  const pz=last('pessoal/356/movimentos/'); T('pessoal grava juros', pz&&pz.juros===8);
  const pt=txt(); T('pessoal tem quadro de juros', pt.includes('Juros pagos no mês'));
  T('pessoal soma 8,00 (sem juros da empresa)', /8,00/.test(pt)&&!/85,50/.test(pt));
  const p=document.createElement('pre');p.id='RES';p.textContent=out.join('\n');document.body.appendChild(p);
}catch(e){out.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]);const p=document.createElement('pre');p.id='RES';p.textContent=out.join('\n');document.body.appendChild(p);}})();
})();
