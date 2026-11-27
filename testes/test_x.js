// rede lenta / sem internet / versão
const dorme=ms=>new Promise(r=>setTimeout(r,ms));
const nunca=()=>new Promise(()=>{});
const offline=v=>Object.defineProperty(navigator,'onLine',{get:()=>!v,configurable:true});
(async()=>{try{
  await wait(900);
  T('camada de rede existe', typeof lerComPrazo==='function'&&typeof gravarComPrazo==='function'&&typeof Rede==='object');
  Rede.PRAZO_LER=300; Rede.PRAZO_GRAVAR=300;
  const temDoc=r=>r.ok;
  let r=await lerComPrazo(async()=>({ok:1,de:'srv'}),async()=>({ok:1,de:'cache'}),temDoc);
  T('rede boa: usa o servidor', r.de==='srv'&&!Rede.velho);
  let t0=performance.now(); r=await lerComPrazo(nunca,async()=>({ok:1,de:'cache'}),temDoc);
  T('rede lenta: mostra o guardado após o prazo', r.de==='cache'&&performance.now()-t0<1200&&Rede.velho);
  location.hash='#/painel'; await wait(600);
  T('barra avisa internet lenta com Atualizar', /Internet lenta/.test(document.getElementById('redeBar').textContent)&&!!document.querySelector('#redeBar [data-act=recarregar]'));
  Rede.velho=false;
  let fim2=false; lerComPrazo(()=>dorme(700).then(()=>({ok:1,de:'srv'})),async()=>({ok:0}),temDoc).then(x=>fim2=x.de);
  await wait(500); T('guardado vazio: continua esperando o servidor', fim2===false); await wait(500); T('… e usa o servidor quando chega', fim2==='srv');
  let err=null; await lerComPrazo(async()=>{throw {code:'permission-denied'}},async()=>({ok:1}),temDoc).catch(e=>err=e);
  T('erro do servidor não vira dado guardado', err&&err.code==='permission-denied');
  Rede.esperaServidor=1; t0=performance.now(); r=await lerComPrazo(()=>dorme(500).then(()=>({ok:1,de:'srv'})),async()=>({ok:1,de:'cache'}),temDoc); Rede.esperaServidor=0;
  T('comServidor: sempre o servidor', r.de==='srv');
  offline(true); r=await lerComPrazo(nunca,async()=>({ok:1,de:'cache'}),temDoc);
  T('sem internet: guardado na hora', r.de==='cache');
  // gravação sem internet
  let solta; const pS=new Promise(res=>solta=res); t0=performance.now();
  await gravarComPrazo(pS);
  T('sem internet: salvar não trava', performance.now()-t0<150);
  T('barra mostra alteração guardada', /Sem internet/.test(document.getElementById('redeBar').textContent)&&/1 alteração guardada/.test(document.getElementById('redeBar').textContent));
  solta(); await wait(50);
  T('ao enviar, contador zera', Rede.pendentes===0);
  offline(false);
  // online lento + recusa depois
  let rej; const pR=new Promise((_,j)=>rej=j); t0=performance.now();
  await gravarComPrazo(pR);
  T('rede lenta: libera após o prazo', performance.now()-t0>=250&&performance.now()-t0<900);
  rej({code:'permission-denied'}); await wait(100);
  T('recusa tardia aparece como aviso', /não foi aceita/.test(document.body.textContent));
  err=null; await gravarComPrazo(Promise.reject({code:'permission-denied'})).catch(e=>err=e);
  T('recusa rápida chega ao formulário', err&&err.code==='permission-denied');
  // salvar lançamento sem internet pelo formulário real
  offline(true);
  location.hash='#/empresa'; await wait(1200);
  T('ação recarregar existe', typeof acoes.recarregar==='function');
  T('versão do app definida', typeof APP_VERSAO==='string'&&/^g356-v\d+$/.test(APP_VERSAO));
  offline(false);
}catch(e){T('ERRO '+e.message,false);} fim();})();
