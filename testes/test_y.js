// histórico (jornal): toda gravação na empresa/pessoal deixa uma entrada; apagar guarda o conteúdo
const P='empresas/356/', PM='pessoal/356/';
const jornal=raiz=>Object.entries(window.__M).filter(([k])=>k.startsWith(raiz+'jornal/')).map(([k,v])=>({id:k.split('/').pop(),...v}));
(async()=>{try{
  await wait(900);
  T('histórico existe', typeof semArquivo==='function'&&typeof Lidos==='object');
  // gravação direta (doc.set) e por lote (batch)
  await db.doc(P+'lancamentos/j1').set({tipo:'custo',setor:'bebidas',valor:10,data:window.__iso(0),categoria:'Mercadoria',descricao:'J1',forma:'pix'});
  let j=jornal(P).filter(x=>x.caminho===P+'lancamentos/j1');
  T('criar grava no histórico', j.length===1&&j[0].op==='gravar'&&j[0].dados.valor===10);
  T('documento leva a marca jv da entrada', window.__M[P+'lancamentos/j1'].jv===j[0].id);
  T('histórico não leva a marca jv dentro dos dados', !('jv' in j[0].dados));
  await db.doc(P+'lancamentos/j1').update({valor:0});
  j=jornal(P).filter(x=>x.caminho===P+'lancamentos/j1');
  T('editar grava outra entrada (valor antigo continua no histórico)', j.length===2&&j.some(x=>x.dados.valor===10)&&j.some(x=>x.op==='atualizar'&&x.dados.valor===0));
  T('marca jv muda a cada edição', window.__M[P+'lancamentos/j1'].jv!==j.find(x=>x.op==='gravar').id);
  const b=db.batch(); b.set(db.doc(P+'comprovantes/l_j1'),{dataUrl:'data:image/png;base64,AAAA',em:1}); b.update(db.doc(P+'lancamentos/j1'),{temComprovante:true}); await b.commit();
  const jc=jornal(P).find(x=>x.caminho===P+'comprovantes/l_j1');
  T('lote também grava histórico', !!jc&&jornal(P).filter(x=>x.caminho===P+'lancamentos/j1').length===3);
  T('foto não é copiada no histórico (só a marca)', jc&&jc.dados.dataUrl==='(arquivo)'&&window.__M[P+'comprovantes/l_j1'].dataUrl.startsWith('data:'));
  // apagar: guarda o conteúdo que o app conhecia
  await db.doc(P+'lancamentos/j1').get();
  await db.doc(P+'lancamentos/j1').delete();
  const ja=jornal(P).find(x=>x.caminho===P+'lancamentos/j1'&&x.op==='apagar');
  T('apagar grava o conteúdo no histórico', !!ja&&ja.dados&&ja.dados.descricao==='J1'&&!window.__M[P+'lancamentos/j1']);
  // pessoal fica no histórico do pessoal (gerente nunca lê)
  await db.doc(PM+'movimentos/jp').set({tipo:'gasto',valor:5,data:window.__iso(0),categoria:'Mercado',descricao:'JP',forma:'pix'});
  T('pessoal vai para o histórico do pessoal', jornal(PM).some(x=>x.caminho===PM+'movimentos/jp')&&!jornal(P).some(x=>x.caminho===PM+'movimentos/jp'));
  // fora do histórico: usuarios, diagnóstico, avisos, o próprio histórico
  const n=jornal(P).length; await db.doc(P+'_diagnostico/diag-x').set({teste:true}); await db.doc(P+'aparelhos/a1').set({token:'t'});
  T('diagnóstico e aparelhos não entram no histórico', jornal(P).length===n);
  // fluxo real: lançar pelo formulário
  location.hash='#/empresa'; await wait(1200);
  click('[data-act=lancNovo]'); const f=await ate('form[data-form=lancamento]');
  chg(f.querySelector('[name=setor]'),'bebidas'); f.querySelector('[name=valor]').value='33'; f.querySelector('[name=descricao]').value='Pelo form'; sub(f); await wait(900);
  T('lançamento pelo formulário entra no histórico', jornal(P).some(x=>x.dados&&x.dados.descricao==='Pelo form'&&x.por==='u1'));
  T('Lidos tem limite', typeof LIDOS_MAX==='number'&&LIDOS_MAX<=5000);
}catch(e){T('ERRO '+e.message,false);} fim();})();
