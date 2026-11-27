(function(){
const out=[];const T=(n,c)=>out.push((c?'PASS ':'FAIL ')+n);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const $$=s=>[...document.querySelectorAll(s)];
const click=sel=>{const e=document.querySelector(sel);if(e)e.click();return !!e;};
const txt=()=>document.getElementById('root').innerText;
(async()=>{
  await wait(800);
  location.hash='#/boletos'; await wait(600);
  let t=txt();
  T('aba Todas ativa por padrão', !!document.querySelector('[data-a=todas].on'));
  T('Todas: boleto Aluguel', t.includes('Aluguel')&&t.includes('boleto'));
  T('Todas: conta Conta de luz', t.includes('Conta de luz'));
  T('Todas: Sky (conta todo mês)', t.includes('Sky')&&t.includes('conta · todo mês'));
  T('3 abas', $$('[data-act=abaConta]').length===3);
  click('[data-f=todos].chip'); await wait(200);
  T('filtro Todos mostra pago (Fornecedor A)', txt().includes('Fornecedor A'));
  click('[data-act=abaConta][data-a=boletos]'); await wait(200);
  T('aba Boletos sem contas', !txt().includes('Conta de luz') && txt().includes('Fornecedor A'));
  click('[data-act=abaConta][data-a=contas]'); await wait(200);
  T('aba Contas agendadas', txt().includes('Conta de luz')&&!txt().includes('Cartão de crédito'));
  click('[data-act=abaConta][data-a=todas]'); await wait(200);
  // pagar conta pela aba Todas
  click('[data-act=contaPagar]'); await wait(200);
  T('modal de pagar conta abre', !!document.querySelector('form[data-form=contaPag]'));
  click('[data-act=fecharModal]'); await wait(100);
  // Pessoal
  location.hash='#/pessoal'; await wait(700);
  T('chip Contas a pagar existe', !!document.querySelector('[data-f=contas]'));
  click('[data-f=contas]'); await wait(700);
  t=txt();
  T('Pessoal contas: Cartão de crédito', t.includes('Cartão de crédito')&&t.includes('Escola'));
  T('Pessoal contas: não mostra contas da empresa', !t.includes('Conta de luz')&&!t.includes('Sky'));
  T('Pessoal contas: sem coluna setor (todo mês)', t.includes('todo mês')&&!t.includes('Geral ·'));
  T('botão + Nova conta', !!document.querySelector('[data-act=contaNova]')&&t.includes('+ Nova conta'));
  click('[data-act=contaNova]'); await wait(200);
  const f=document.querySelector('form[data-form=conta]');
  T('form sem campo setor', !!f && !f.querySelector('[name=setor]'));
  f.querySelector('[name=descricao]').value='Financiamento'; f.querySelector('[name=valor]').value='2.100,00'; f.querySelector('[name=dia]').value='20';
  f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})); await wait(500);
  T('conta pessoal gravada em pessoal/356/contas', window.__log.some(l=>l[0]==='set'&&l[1].startsWith('pessoal/356/contas/')));
  T('NENHUMA gravação da conta pessoal em empresas', !window.__log.some(l=>l[1].startsWith('empresas/356/contas/')&&l[0]==='set'));
  T('lista pessoal mostra Financiamento', txt().includes('Financiamento'));
  // pagar conta pessoal
  click('[data-act=contaPagar]'); await wait(200);
  const g=document.querySelector('form[data-form=contaPag]');
  T('modal pagar pessoal', !!g);
  g.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})); await wait(500);
  T('pagamento pessoal em pessoal/356/contasPag', window.__log.some(l=>l[0]==='set'&&l[1].startsWith('pessoal/356/contasPag/')));
  // voltar a Gastos
  click('[data-f=gasto]'); await wait(300);
  T('chip Gastos volta à lista normal', txt().includes('Movimentos de'));
  // Painel / badge da empresa não conta pessoais
  location.hash='#/painel'; await wait(500);
  T('painel não mostra contas pessoais', !txt().includes('Cartão de crédito')&&!txt().includes('Financiamento'));
  // Relatórios
  location.hash='#/relatorios'; await wait(900);
  T('Relatório Geral tem Freelancers do mês', txt().includes('Freelancers do mês'));
  click('[data-act=relEsc][data-e=bebidas]')||click('[data-e=bebidas]'); await wait(900);
  t=txt();
  T('Relatório de setor sem Freelancers', !t.includes('Freelancers do mês') && t.includes('Boletos do mês'));
  const pre=document.createElement('pre');pre.id='RES';pre.textContent=out.join('\n');document.body.appendChild(pre);
})().catch(e=>{const pre=document.createElement('pre');pre.id='RES';pre.textContent=out.join('\n')+'\nERRO '+e.stack;document.body.appendChild(pre);});
})();
