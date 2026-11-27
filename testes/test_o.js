const P='empresas/356/', PM='pessoal/356/';
[['importados','Produtos importados',1],['bebidas','Bebidas',2],['cozinha','Cozinha',3],['conveniencia','Conveniência',4],['fornecedores','Fornecedores',5]].forEach(([id,n,o])=>{window.__M[P+'subsetores/'+id]={nome:n,ordem:o,fixo:id==='fornecedores'};});
{const o=FileReader.prototype.readAsDataURL;FileReader.prototype.readAsDataURL=function(f){if(f.__n===undefined)return o.call(this,f);const self=this;setTimeout(()=>{Object.defineProperty(self,'result',{value:'data:'+f.type+';base64,'+btoa('A'.repeat(f.__n))});if(self.onload)self.onload();},50);};}
const pdf=(n,nm)=>{const f=new File(['x'],nm||'extrato.pdf',{type:'application/pdf'});f.__n=n;return f;};
const img=async()=>{const c=document.createElement('canvas');c.width=300;c.height=200;c.getContext('2d').fillRect(0,0,300,200);return new File([await new Promise(r=>c.toBlob(r,'image/png'))],'nota.png',{type:'image/png'});};
const setF=(inp,files)=>{const dt=new DataTransfer();files.forEach(x=>dt.items.add(x));inp.files=dt.files;};
const ks=pre=>Object.keys(window.__M).filter(k=>k.startsWith(pre));
const espera=async c=>{for(let k=0;k<25&&!c();k++)await wait(300);};
(async()=>{try{
  await wait(1000);
  const L0=ks(P+'lancamentos/').length, C0=ks(P+'comprovantes/l_').length, M0=ks(PM+'movimentos/').length, A0=ks(PM+'anexos/').length;
  location.hash='#/painel'; await wait(600);
  click('[data-act=lancNovo]'); await wait(500);
  let f=document.querySelector('form[data-form=lancamento]');
  T('campo foto da nota visível', f.querySelector('[data-anxemp]')&&!f.querySelector('[data-anxemp]').classList.contains('hide'));
  T('campo pessoal escondido', f.querySelector('[data-anxpes]')&&f.querySelector('[data-anxpes]').classList.contains('hide'));
  chg(f.querySelector('[name=setor]'),'bebidas');
  f.querySelector('[name=valor]').value='120'; setF(f.querySelector('[name=fotoNota]'),[await img()]);
  sub(f); await espera(()=>ks(P+'comprovantes/l_').length===C0+1);
  const lk=ks(P+'lancamentos/').find(k=>window.__M[k].valor===120);
  T('lançamento com temComprovante', lk&&window.__M[lk].temComprovante===true);
  T('foto salva em comprovantes', window.__M[P+'comprovantes/l_'+lk.split('/').pop()] && /^data:image\/jpeg/.test(window.__M[P+'comprovantes/l_'+lk.split('/').pop()].dataUrl));
  // PDF na nota da empresa recusado
  click('[data-act=lancNovo]'); await wait(500);
  f=document.querySelector('form[data-form=lancamento]'); f.querySelector('[name=valor]').value='30';
  setF(f.querySelector('[name=fotoNota]'),[pdf(100)]); sub(f); await wait(900);
  T('empresa recusa PDF', ks(P+'lancamentos/').length===L0+1 && /foto/i.test(f.querySelector('.alert').textContent));
  // pessoal pelo painel
  chg(f.querySelector('[name=setor]'),'__pes'); await wait(100);
  T('campo pessoal aparece', !f.querySelector('[data-anxpes]').classList.contains('hide') && f.querySelector('[data-anxemp]').classList.contains('hide'));
  setF(f.querySelector('[name=anexosPes]'),[pdf(500),await img()]); sub(f);
  await espera(()=>ks(PM+'anexos/').length===A0+2);
  const mk=ks(PM+'movimentos/').find(k=>window.__M[k].nAnexos===2);
  T('gasto pessoal com 2 anexos', mk&&window.__M[mk].nAnexos===2 && ks(PM+'anexos/').slice(A0).every(k=>window.__M[k].movId===mk.split('/').pop()));
  // formulário do Pessoal
  location.hash='#/pessoal'; await wait(900);
  click('[data-act=pesNovo]'); await wait(400);
  f=document.querySelector('form[data-form=pessoal]');
  T('form pessoal tem campo de arquivos', !!f.querySelector('[name=anexosPes]'));
  f.querySelector('[name=valor]').value='15';
  setF(f.querySelector('[name=anexosPes]'),[1,2,3,4,5,6].map(i=>pdf(10,'a'+i+'.pdf'))); sub(f); await wait(900);
  T('mais de 5 recusado', ks(PM+'movimentos/').length===M0+1 && /5/.test(f.querySelector('.alert').textContent));
  setF(f.querySelector('[name=anexosPes]'),[pdf(900000)]); sub(f); await wait(900);
  T('PDF grande recusado', ks(PM+'movimentos/').length===M0+1 && /grande/i.test(f.querySelector('.alert').textContent));
  setF(f.querySelector('[name=anexosPes]'),[pdf(10,'conta.pdf')]); sub(f);
  await espera(()=>ks(PM+'movimentos/').length===M0+2);
  T('salvo com 1 anexo', ks(PM+'anexos/').length===A0+3 && ks(PM+'movimentos/').some(k=>window.__M[k].nAnexos===1));
  // edição não mostra campo
  const id=mk.split('/').pop();
  click('[data-act=pesEditar][data-id="'+id+'"]'); await wait(300);
  T('edição sem campo de arquivo', !document.querySelector('form[data-form=pessoal] [name=anexosPes]'));
  fim();
}catch(e){out.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]);fim();}})();
