// cópia completa (baixar) + registro de erros
const P='empresas/356/', PM='pessoal/356/';
(async()=>{try{
  window.__M[P+'lancamentos/z1']={tipo:'custo',setor:'bebidas',valor:12.5,data:window.__iso(0),categoria:'Mercadoria',descricao:'Z1',criadoEm:{toDate:()=>new Date('2026-11-01T10:00:00Z')}};
  window.__M[PM+'movimentos/zp']={tipo:'gasto',valor:7,data:window.__iso(0),categoria:'Mercado',descricao:'ZP'};
  await wait(900);
  T('função de cópia existe', typeof exportarTudo==='function');
  const c=await exportarTudo();
  T('cópia traz a empresa', c.docs[P+'lancamentos/z1']&&c.docs[P+'lancamentos/z1'].valor===12.5);
  T('cópia traz o pessoal (dono)', !!c.docs[PM+'movimentos/zp']);
  T('datas do servidor viram texto marcado', c.docs[P+'lancamentos/z1'].criadoEm&&c.docs[P+'lancamentos/z1'].criadoEm.__data==='2026-11-01T10:00:00.000Z');
  T('cópia tem formato, total e data', c.formato==='g356-copia-v1'&&c.total===Object.keys(c.docs).length&&/^\d{4}-/.test(c.geradoEm));
  T('cópia inclui fotos (backup completo)', Object.keys(c.docs).some(k=>k.startsWith(P+'comprovantes/')));
  location.hash='#/mais'; await wait(800);
  T('botão Baixar cópia completa no Mais', !!document.querySelector('[data-act=baixarCopia]'));
  // registro de erros
  const antes=Object.keys(window.__M).filter(k=>k.startsWith(P+'erros/')).length;
  window.dispatchEvent(new ErrorEvent('error',{message:'teste de erro X',error:new Error('teste de erro X')}));
  window.dispatchEvent(new ErrorEvent('error',{message:'teste de erro X',error:new Error('teste de erro X')}));
  await wait(300);
  const er=Object.entries(window.__M).filter(([k])=>k.startsWith(P+'erros/')).map(([,v])=>v);
  T('erro do app fica registrado (uma vez só)', er.length===antes+1&&er.some(v=>v.msg==='teste de erro X'&&v.app===APP_VERSAO));
  T('registro de erro não entra no histórico', !Object.values(window.__M).some(v=>v&&v.caminho&&/\/erros\//.test(v.caminho)));
  for(let i=0;i<40;i++) window.dispatchEvent(new ErrorEvent('error',{message:'muitos '+i}));
  await wait(300);
  T('limite de registros por sessão', Object.keys(window.__M).filter(k=>k.startsWith(P+'erros/')).length<=antes+20);
  location.hash='#/diag'; await wait(700);
  T('Diagnóstico tem botão de ver erros', !!document.querySelector('[data-act=verErros]'));
  click('[data-act=verErros]'); await wait(600);
  T('lista de erros aparece', /teste de erro X/.test(document.getElementById('errosOut').innerText));
}catch(e){T('ERRO '+e.message,false);} fim();})();
