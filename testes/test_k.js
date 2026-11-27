const P='empresas/356/';
[['importados','Produtos importados',1],['bebidas','Bebidas',2],['cozinha','Cozinha',3],['eventos','Eventos',4],['conveniencia','Conveniência',4],['fornecedores','Fornecedores',5]].forEach(([id,n,o])=>{window.__M[P+'subsetores/'+id]={nome:n,ordem:o,fixo:id==='fornecedores',arquivado:id==='eventos'};});
window.__M[P+'boletos/bx']={descricao:'Som do evento',setor:'eventos',vencimento:mesA+'-20',valor:800,pago:false};
window.__M[P+'lancamentos/lx']={tipo:'custo',setor:'eventos',valor:77,data:mesA+'-05',categoria:'Outros custos',descricao:'Decoração'};
window.__M[P+'tarefas/tx']={titulo:'Montar palco',setor:'eventos',responsavel:'',prazo:'',feita:false};
(async()=>{try{
  await wait(1000);
  location.hash='#/boletos'; await ate('[data-act=abaConta][data-a=boletos]');
  click('[data-act=abaConta][data-a=boletos]'); await ate('[data-act=boletoEditar][data-id=bx]');
  let f=await clicaAte('[data-act=boletoEditar][data-id=bx]','form[data-form=boleto]');
  T('boleto arquivado: select mantém eventos', f.querySelector('[name=setor]').value==='eventos');
  sub(f); await wait(500);
  T('boleto continua em eventos', window.__M[P+'boletos/bx'].setor==='eventos');
  location.hash='#/empresa'; await wait(700);
  click('[data-act=lancEditar][data-id=lx]'); await wait(200);
  f=document.querySelector('form[data-form=lancamento]');
  T('lançamento arquivado: select mantém eventos', f&&f.querySelector('[name=setor]').value==='eventos');
  if(f){sub(f); await wait(500);}
  T('lançamento continua em eventos', window.__M[P+'lancamentos/lx'].setor==='eventos');
  click('[data-act=setorTab][data-t=tarefas]'); await wait(300);
  click('[data-act=tarEditar][data-id=tx]'); await wait(200);
  f=document.querySelector('form[data-form=tarefa]');
  T('tarefa arquivada: select mantém eventos', f&&f.querySelector('[name=setor]').value==='eventos');
  if(f){sub(f); await wait(500);}
  T('tarefa continua em eventos', window.__M[P+'tarefas/tx'].setor==='eventos');
  click('#modal [data-act=fecharModal]');
  // relatório atualiza após venda do mês
  location.hash='#/relatorios'; await wait(1000);
  location.hash='#/painel'; await wait(800);
  click('[data-act=vendaMes]'); await wait(200);
  f=document.querySelector('form[data-form=vendaMes]'); f.querySelector('[name=valor]').value='12345'; sub(f); await wait(500);
  location.hash='#/relatorios'; await wait(1000);
  T('relatório mostra venda nova', /Vendas\s*R\$\s*12\.345,00/.test(txt()));
  fim();
}catch(e){out.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]);fim();}})();
