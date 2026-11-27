// HOJE=2026-11-15
// Lembretes: lançar com data e hora, antecedência do aviso, para quem, som/vibração, concluir, some ou fica
const P='empresas/356/', PM='pessoal/356/';
const ks=pre=>Object.keys(window.__M).filter(k=>k.startsWith(pre));
const docs=pre=>ks(pre).map(k=>({k,...window.__M[k]}));
const espera=async(c,n=25)=>{for(let k=0;k<n&&!c();k++)await wait(200);};
const ms=(d,h)=>Date.parse(d+'T'+h+':00-03:00');
window.__M[P+'membros/u2']={nome:'Eliana',papel:'admin',pes:true};
window.__M[P+'membros/u3']={nome:'Lucas',papel:'gerente',pes:false};
window.__M[P+'lembretes/A1']={titulo:'Pagar contador',data:'2026-11-13',hora:'10:00',quando:ms('2026-11-13','10:00'),antes:15,proxAviso:null,para:['u1'],som:true,vibrar:true,fixo:false,seNao:'fica',concluido:false,concluidoEm:null};
window.__M[P+'lembretes/A2']={titulo:'Ligar para a gráfica',data:'2026-11-13',hora:'11:00',quando:ms('2026-11-13','11:00'),antes:15,proxAviso:null,para:['u1'],som:true,vibrar:true,fixo:false,seNao:'some',concluido:false,concluidoEm:null};
window.__M[P+'lembretes/F1']={titulo:'Inventário do estoque',data:'2026-11-20',hora:'08:00',quando:ms('2026-11-20','08:00'),antes:60,proxAviso:ms('2026-11-20','07:00'),para:['u1','u3'],som:true,vibrar:true,fixo:false,seNao:'fica',concluido:false,concluidoEm:null};
(async()=>{try{
  await wait(1000);
  T('menu Controle tem Lembretes', !!document.querySelector('a[href="#/lembretes"]'));
  location.hash='#/lembretes'; await ate('[data-act=lembNovo]',5000); await wait(400);
  T('página abre com botão Novo lembrete', !!document.querySelector('[data-act=lembNovo]'));
  T('atrasado que fica aparece na agenda', /Pagar contador/.test(txt()) && /Atrasad/.test(txt()));
  T('atrasado que some não aparece na agenda', !/Ligar para a gráfica/.test(txt()));
  T('futuro aparece na agenda', /Inventário do estoque/.test(txt()));
  T('grava o meu nome na lista de pessoas', window.__M[P+'membros/u1'] && window.__M[P+'membros/u1'].nome==='Luiz Paulo');
  click('[data-act=lembFiltro][data-f=todos]'); await wait(300);
  T('Todos mostra o que sumiu', /Ligar para a gráfica/.test(txt()));
  click('[data-act=lembFiltro][data-f=agenda]'); await wait(300);
  // novo lembrete
  let f=await clicaAte('[data-act=lembNovo]','form[data-form=lembrete]');
  T('formulário tem data, hora, antecedência e opções', f && f.querySelector('[name=data]').value==='2026-11-15' && !!f.querySelector('[name=hora]') && !!f.querySelector('[name=antes]') && !!f.querySelector('[name=som]') && !!f.querySelector('[name=vibrar]') && !!f.querySelector('[name=seNao]'));
  T('por padrão avisa só para mim', f.querySelector('[name=para][value=u1]').checked && !f.querySelector('[name=para][value=u2]').checked);
  const L0=ks(P+'lembretes/').length;
  sub(f); await wait(400);
  T('sem título não grava', ks(P+'lembretes/').length===L0 && /título|o que/i.test(f.querySelector('.alert').textContent));
  f.querySelector('[name=titulo]').value='Reunião com fornecedor';
  f.querySelector('[name=hora]').value='14:30';
  f.querySelector('[name=antes]').value='15';
  f.querySelector('[name=para][value=u2]').checked=true;
  f.querySelector('[name=som]').checked=false;
  f.querySelector('[name=seNao][value=some]').checked=true;
  f.querySelector('[name=notas]').value='levar a lista de preços';
  sub(f); await espera(()=>ks(P+'lembretes/').length===L0+1);
  const r=docs(P+'lembretes/').find(x=>x.titulo==='Reunião com fornecedor');
  T('grava data, hora e momento certo (horário de Brasília)', r && r.data==='2026-11-15' && r.hora==='14:30' && r.quando===ms('2026-11-15','14:30'));
  T('grava quando avisar (15 min antes)', r && r.antes===15 && r.proxAviso===ms('2026-11-15','14:15'));
  T('grava para quem, som, vibração e regra de não concluído', r && r.para.join()==='u1,u2' && r.som===false && r.vibrar===true && r.seNao==='some' && r.notas==='levar a lista de preços' && r.concluido===false);
  await wait(300);
  T('lista mostra o lembrete com a hora', /Reunião com fornecedor/.test(txt()) && /14:30/.test(txt()));
  // concluir e reabrir
  const rid=r.k.split('/').pop();
  await clicaAte(`[data-act=lembFeito][data-id="${rid}"]`,'body'); await espera(()=>window.__M[r.k].concluido===true);
  T('concluir grava data e tira o aviso', window.__M[r.k].concluido===true && window.__M[r.k].concluidoEm==='2026-11-15' && window.__M[r.k].proxAviso===null);
  await wait(300);
  click(`[data-act=lembFeito][data-id="${rid}"]`); await espera(()=>window.__M[r.k].concluido===false);
  T('reabrir volta o aviso', window.__M[r.k].concluido===false && window.__M[r.k].proxAviso===ms('2026-11-15','14:15'));
  // editar mantém criadoEm
  window.__M[r.k].criadoEm=777;
  f=await clicaAte(`[data-act=lembEditar][data-id="${rid}"]`,'form[data-form=lembrete]');
  T('editar traz os dados', f.querySelector('[name=titulo]').value==='Reunião com fornecedor' && f.querySelector('[name=hora]').value==='14:30' && !f.querySelector('[name=som]').checked && f.querySelector('[name=seNao][value=some]').checked);
  f.querySelector('[name=antes]').value='60'; sub(f); await espera(()=>window.__M[r.k].antes===60);
  T('editar recalcula o aviso e mantém criadoEm', window.__M[r.k].proxAviso===ms('2026-11-15','13:30') && window.__M[r.k].criadoEm===777);
  // sem aviso
  f=await clicaAte('[data-act=lembNovo]','form[data-form=lembrete]');
  f.querySelector('[name=titulo]').value='Conferir caixa'; f.querySelector('[name=hora]').value='18:00'; f.querySelector('[name=antes]').value='';
  sub(f); await espera(()=>docs(P+'lembretes/').some(x=>x.titulo==='Conferir caixa'));
  const sa=docs(P+'lembretes/').find(x=>x.titulo==='Conferir caixa');
  T('sem aviso não agenda notificação', sa && sa.antes===null && sa.proxAviso===null);
  // horário que já passou não avisa
  f=await clicaAte('[data-act=lembNovo]','form[data-form=lembrete]');
  f.querySelector('[name=titulo]').value='Coisa de ontem'; f.querySelector('[name=data]').value='2026-11-14'; f.querySelector('[name=hora]').value='10:00';
  sub(f); await espera(()=>docs(P+'lembretes/').some(x=>x.titulo==='Coisa de ontem'));
  T('horário que já passou não manda aviso', docs(P+'lembretes/').find(x=>x.titulo==='Coisa de ontem').proxAviso===null);
  // pessoal
  f=await clicaAte('[data-act=lembNovo]','form[data-form=lembrete]');
  T('dono pode marcar como pessoal', !!f.querySelector('[name=pessoal]'));
  f.querySelector('[name=pessoal]').checked=true; f.querySelector('[name=pessoal]').dispatchEvent(new Event('change',{bubbles:true})); await wait(100);
  T('pessoal esconde o Lucas da lista de quem recebe', f.querySelector('[name=para][value=u3]').closest('.hide')!==null);
  f.querySelector('[name=titulo]').value='Aniversário da sogra'; f.querySelector('[name=hora]').value='20:00';
  f.querySelector('[name=para][value=u3]').checked=true;
  sub(f); await espera(()=>ks(PM+'lembretes/').length===1);
  const lp=docs(PM+'lembretes/')[0];
  T('pessoal grava na área pessoal, sem o Lucas', lp && lp.titulo==='Aniversário da sogra' && !lp.para.includes('u3') && !docs(P+'lembretes/').some(x=>x.titulo==='Aniversário da sogra'));
  await wait(300);
  T('pessoal aparece com selo', /Aniversário da sogra/.test(txt()) && /Pessoal/.test(txt()));
  // mais (celular)
  location.hash='#/mais'; await wait(500);
  T('Mais tem Lembretes', !!document.querySelector('.lista a[href="#/lembretes"]'));
  T('cópia completa inclui lembretes', COLS_EMP.includes('lembretes') && COLS_PES.includes('lembretes') && COLS_EMP.includes('membros'));
}catch(e){T('ERRO '+e.message+' '+(e.stack||'').split('\n')[1],false);} fim();})();
