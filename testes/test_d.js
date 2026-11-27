(function(){
const out=[];const T=(n,c)=>out.push((c?'PASS ':'FAIL ')+n);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const click=sel=>{const e=document.querySelector(sel);if(e)e.click();return !!e;};
const txt=()=>document.getElementById('root').innerText;
const sub=f=>f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
const chg=(el,v)=>{el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));};
(async()=>{try{
  await wait(900);
  location.hash='#/boletos'; await wait(600);
  // BOLETO
  click('[data-act=boletoNovo]'); await wait(200);
  let f=document.querySelector('form[data-form=boleto]');
  T('boleto: campo fornecedor existe e escondido', !!f.querySelector('[data-forn].hide'));
  f.querySelector('[name=descricao]').value='NF 100'; f.querySelector('[name=valor]').value='500,00';
  chg(f.querySelector('[name=setor]'),'fornecedores');
  T('boleto: campo aparece em Fornecedores', !f.querySelector('[data-forn]').classList.contains('hide'));
  sub(f); await wait(400);
  T('boleto: exige fornecedor', document.querySelector('form[data-form=boleto] .alert').textContent.includes('fornecedor'));
  chg(f.querySelector('[name=fornecedorId]'),'__novo');
  f.querySelector('[name=novoFornecedor]').value='Atacado Sul';
  sub(f); await wait(600);
  T('boleto: fornecedor novo criado', window.__log.some(l=>l[0]==='set'&&l[1].startsWith('empresas/356/fornecedores/')));
  const gb=[0,window.__log.filter(l=>l[0]==='set'&&l[1].startsWith('empresas/356/boletos/')).pop()];gb[2]=window.__M[gb[1][1]];
  T('boleto: grava fornecedorNome', gb&&gb[2]&&gb[2].fornecedorNome==='Atacado Sul'&&!!gb[2].fornecedorId);
  T('boleto: lista mostra fornecedor', txt().includes('Atacado Sul'));
  // boleto em outro subsetor => sem fornecedor
  click('[data-act=boletoNovo]'); await wait(200);
  f=document.querySelector('form[data-form=boleto]');
  f.querySelector('[name=descricao]').value='Água'; f.querySelector('[name=valor]').value='80,00'; chg(f.querySelector('[name=setor]'),'bebidas');
  sub(f); await wait(500);
  const g2=[0,window.__log.filter(l=>l[0]==='set'&&l[1].startsWith('empresas/356/boletos/')).pop()];g2[2]=window.__M[g2[1][1]];
  T('boleto outro subsetor: fornecedor nulo', g2&&g2[2].fornecedorId===null);
  // CONTA
  click('[data-act=abaConta][data-a=contas]'); await wait(200);
  click('[data-act=contaNova]'); await wait(200);
  f=document.querySelector('form[data-form=conta]');
  T('conta: campo fornecedor existe', !!f.querySelector('[data-forn]'));
  f.querySelector('[name=descricao]').value='Aluguel galpão'; f.querySelector('[name=valor]').value='3000,00'; f.querySelector('[name=dia]').value='10';
  chg(f.querySelector('[name=setor]'),'fornecedores');
  const sel=f.querySelector('[name=fornecedorId]'); const opt=[...sel.options].find(o=>o.text==='Atacado Sul');
  T('conta: fornecedor novo já na lista', !!opt);
  if(opt) chg(sel,opt.value);
  sub(f); await wait(600);
  const gc=[0,window.__log.filter(l=>l[0]==='set'&&l[1].startsWith('empresas/356/contas/')).pop()];gc[2]=window.__M[gc[1][1]];
  T('conta: grava fornecedorNome', gc&&gc[2].fornecedorNome==='Atacado Sul');
  T('conta: lista mostra fornecedor', txt().includes('Atacado Sul'));
  click('[data-act=abaConta][data-a=todas]'); await wait(300);
  T('Todas mostra fornecedor', txt().includes('Atacado Sul'));
  // PESSOAL: sem campo
  location.hash='#/pessoal'; await wait(600);
  const p=document.createElement('pre');p.id='RES';p.textContent=out.join('\n');document.body.appendChild(p);
}catch(e){out.push("ERR "+e.message+" "+(e.stack||"").split("\n")[1]);const p=document.createElement("pre");p.id="RES";p.textContent=out.join("\n");document.body.appendChild(p);}})();
})();
