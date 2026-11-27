(function(){
const out=[];const T=(n,c)=>out.push((c?'PASS ':'FAIL ')+n);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const $$=s=>[...document.querySelectorAll(s)];
const click=sel=>{const e=document.querySelector(sel);if(e)e.click();return !!e;};
const txt=()=>document.getElementById('root').innerText;
const set=(f,n,v)=>{const e=f.querySelector('[name='+n+']');e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));};
const sub=f=>{const s=f.querySelector&&f.querySelector('select[name=forma]');if(s&&!s.value)s.value='pix';return f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));};
(async()=>{
  await wait(900);
  location.hash='#/empresa'; await wait(700);
  let t=txt();
  T('seed: 5 subsetores gravados', window.__log.filter(l=>l[0]==='set'&&l[1].startsWith('empresas/356/subsetores/')).length===5);
  T('menu: Empresa e Pessoal', $$('.nav a').some(a=>a.textContent.includes('Empresa'))&&$$('.nav a').some(a=>a.textContent.includes('Pessoal')));
  T('menu: sem Bebidas/Cozinha soltos', !$$('.nav a').some(a=>/Bebidas|Cozinha|Eventos|importados/i.test(a.textContent)));
  T('chips: Todos + 5', $$('[data-act=empSub]').length===6);
  T('título Empresa', document.querySelector('h1').textContent==='Empresa');
  location.hash='#/bebidas'; await wait(500);
  T('#/bebidas abre Empresa filtrada', document.querySelector('h1').textContent==='Empresa · Bebidas' && !!document.querySelector('[data-s=bebidas].on'));
  T('menu mantém Empresa ativa', !!$$('.nav a.on').find(a=>a.textContent.includes('Empresa')));
  click('[data-s=todos]'); await wait(300);
  T('Todos mostra lançamentos de vários subsetores', txt().includes('Caixa do dia 02')&&txt().includes('Casamento'));
  // novo subsetor
  click('[data-act=subsManage]'); await wait(200);
  let f=document.querySelector('form[data-form=subset]'); set(f,'nome','Manutenção'); sub(f); await wait(500);
  T('subsetor Manutenção criado no banco', window.__log.some(l=>l[0]==='set'&&l[1].startsWith('empresas/356/subsetores/')&&!l[1].endsWith('/importados')&&!l[1].endsWith('/bebidas')&&!l[1].endsWith('/cozinha')&&!l[1].endsWith('/eventos')&&!l[1].endsWith('/fornecedores')));
  f=document.querySelector('form[data-form=subset]'); set(f,'nome','manutenção'); sub(f); await wait(300);
  T('nome duplicado barrado', /Já existe/.test(document.getElementById('modal').innerText));
  let ren=document.querySelector('form[data-form=subsetRen][data-id=cozinha]'); set(ren,'nome','Cozinha industrial'); sub(ren); await wait(400);
  T('renomear subsetor', document.getElementById('modal').innerText.includes('Cozinha industrial'));
  click('[data-act=fecharModal]'); await wait(200);
  T('chips: 7 (Todos + 6)', $$('[data-act=empSub]').length===7 && txt().includes('Manutenção') && txt().includes('Cozinha industrial'));
  // fornecedores
  click('[data-s=fornecedores]'); await wait(300);
  T('botão Fornecedores no subsetor Fornecedores', !!document.querySelector('[data-act=fornManage]'));
  click('[data-act=fornManage]'); await wait(200);
  f=document.querySelector('form[data-form=forn]'); set(f,'nome','Distribuidora Boa Safra'); sub(f); await wait(500);
  T('fornecedor cadastrado', window.__log.some(l=>l[0]==='set'&&l[1].startsWith('empresas/356/fornecedores/')));
  click('[data-act=fecharModal]'); await wait(200);
  click('[data-act=lancNovo]'); await wait(300);
  f=document.querySelector('form[data-form=lancamento]');
  T('form: subsetor pré-selecionado Fornecedores', f.querySelector('[name=setor]').value==='fornecedores');
  T('form: campo Fornecedor visível', !f.querySelector('[data-forn]').classList.contains('hide'));
  set(f,'tipo','custo'); 
  set(f,'valor','1.250,00');
  sub(f); await wait(300);
  T('sem fornecedor escolhido: erro', /Escolha o fornecedor/.test(f.querySelector('.alert').textContent));
  const fid=[...f.querySelector('[name=fornecedorId]').options].find(o=>o.textContent.includes('Boa Safra')).value;
  set(f,'fornecedorId',fid); sub(f); await wait(600);
  const gr=Object.entries(window.__M).filter(([k,v])=>k.startsWith('empresas/356/lancamentos/')&&v.fornecedorNome);
  T('custo gravado com fornecedor', gr.length===1 && gr[0][1].setor==='fornecedores' && gr[0][1].fornecedorNome==='Distribuidora Boa Safra' && gr[0][1].valor===1250);
  T('lista mostra fornecedor', txt().includes('Distribuidora Boa Safra'));
  T('painel Gasto por fornecedor', txt().includes('Gasto por fornecedor') && txt().includes('1.250,00'));
  // novo fornecedor inline
  click('[data-act=lancNovo]'); await wait(300);
  f=document.querySelector('form[data-form=lancamento]'); 
  set(f,'fornecedorId','__novo'); T('campo novo fornecedor aparece', !f.querySelector('[data-novoforn]').classList.contains('hide'));
  set(f,'novoFornecedor','Atacado Sol'); set(f,'valor','300,00'); sub(f); await wait(600);
  T('fornecedor criado inline', Object.values(window.__M).some(v=>v.nome==='Atacado Sol'));
  T('segundo custo gravado', Object.values(window.__M).filter(v=>v.fornecedorNome==='Atacado Sol').length===1);
  // subsetor comum não pede fornecedor
  click('[data-s=bebidas]'); await wait(300);
  click('[data-act=lancNovo]'); await wait(300);
  f=document.querySelector('form[data-form=lancamento]');
  T('Bebidas: fornecedor opcional visível', !f.querySelector('[data-forn]').classList.contains('hide') && /opcional/.test(f.querySelector('[data-forn]').innerText));
  set(f,'setor','fornecedores'); T('trocar para Fornecedores mostra campo', !f.querySelector('[data-forn]').classList.contains('hide'));
  click('[data-act=fecharModal]'); await wait(200);
  // novo subsetor aparece no form de boleto
  location.hash='#/boletos'; await wait(500); click('[data-act=boletoNovo]'); await wait(200);
  T('boleto: select de subsetor com Manutenção e Fornecedores', [...document.querySelectorAll('form[data-form=boleto] [name=setor] option')].map(o=>o.textContent).join('|').includes('Manutenção')&&document.querySelector('form[data-form=boleto]').innerText.includes('Subsetor'));
  click('[data-act=fecharModal]'); await wait(100);
  // mobile setores page
  location.hash='#/setores'; await wait(400);
  T('página Setores: Empresa e Pessoal', txt().includes('Empresa')&&txt().includes('Pessoal')&&!txt().includes('Cozinha'));
  location.hash='#/relatorios'; await wait(900);
  T('relatório com chips dinâmicos', txt().includes('Manutenção')&&txt().includes('Fornecedores'));
  location.hash='#/painel'; await wait(900);
  T('painel lista subsetores', txt().includes('Cozinha industrial')||txt().includes('Fornecedores'));
  const pre=document.createElement('pre');pre.id='RES';pre.textContent=out.join('\n');document.body.appendChild(pre);
})().catch(e=>{const pre=document.createElement('pre');pre.id='RES';pre.textContent=out.join('\n')+'\nERRO '+e.stack;document.body.appendChild(pre);});
})();
