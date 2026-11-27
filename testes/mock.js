// Firebase simulado para os testes (dados de exemplo; nada vai para o banco de verdade)
(function(){
const q=new URLSearchParams(location.search); const papel=q.get('papel')||'admin';
const d=new Date(); const p2=n=>String(n).padStart(2,'0');
const iso=(off)=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+off);return x.getFullYear()+'-'+p2(x.getMonth()+1)+'-'+p2(x.getDate());};
const M={}; window.__M=M; window.__iso=iso; let seq=0;
const P='empresas/356/';
M[P+'freelancers/f1']={nome:'Carlos Henrique',funcao:'Churrasqueiro',setor:'eventos',valorCombinado:250,ativo:true};
M[P+'freelancers/f2']={nome:'Mariana Souza',funcao:'Garçonete',setor:'bebidas',valorCombinado:140,ativo:true};
M[P+'freelancers/f3']={nome:'Rafael Dias',funcao:'Auxiliar de cozinha',setor:'cozinha',valorCombinado:120,ativo:true};
M[P+'freelancers/f4']={nome:'Paulo Antigo',funcao:'Garçom',setor:'bebidas',valorCombinado:130,ativo:false};
const hj=iso(0), on=iso(-1), a2=iso(-2);
M[P+'presencas/'+on+'_f1']={data:on,freelaId:'f1',status:'presente',valor:250,pago:true,pagoEm:on};
M[P+'presencas/'+on+'_f2']={data:on,freelaId:'f2',status:'presente',valor:140,pago:false,pagoEm:null};
M[P+'presencas/'+a2+'_f2']={data:a2,freelaId:'f2',status:'faltou',valor:140,pago:false,pagoEm:null};
M[P+'presencas/'+hj+'_f1']={data:hj,freelaId:'f1',status:'presente',valor:250,pago:false,pagoEm:null};

const mes=iso(0).slice(0,7);
M[P+'lancamentos/l1']={tipo:'venda',setor:'bebidas',valor:5200,data:mes+'-02',categoria:'Balcão',descricao:'Caixa do dia 02',temComprovante:false};
M[P+'lancamentos/l2']={tipo:'custo',setor:'bebidas',valor:1800,data:mes+'-03',categoria:'Mercadoria',descricao:'Compra de cerveja',temComprovante:true};
M[P+'lancamentos/l3']={tipo:'venda',setor:'eventos',valor:9000,data:mes+'-04',categoria:'Evento',descricao:'Casamento',temComprovante:false};
M[P+'comprovantes/l_l2']={dataUrl:'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="%23ddd"/></svg>'};
M[P+'produtos/p1']={nome:'Cerveja lata 350 ml',setor:'bebidas',categoria:'Cervejas',unidade:'cx',qtd:20,minimo:10,custoUn:48.5};
M[P+'produtos/p2']={nome:'Gelo 5 kg',setor:'bebidas',categoria:'Gelo',unidade:'un',qtd:3,minimo:8,custoUn:9};
M[P+'produtos/p3']={nome:'Saquê Junmai 720 ml',setor:'importados',categoria:'Importados',unidade:'un',qtd:0,minimo:4,custoUn:62};


M[P+'metas/bebidas_'+mes]={vendas:20000};
const ant=(()=>{const x=new Date(d.getFullYear(),d.getMonth()-1,1);return x.getFullYear()+'-'+p2(x.getMonth()+1);})();
M[P+'energia/'+ant+'_loja1']={mes:ant,loja:'loja1',consumo:1460,injetado:874,semDesconto:2075.11,pagoUsina:611.80,pagoEnel:1212.33};
M[P+'energia/'+ant+'_loja2']={mes:ant,loja:'loja2',consumo:900,injetado:500,semDesconto:1200,pagoUsina:400,pagoEnel:600};
M[P+'energia/'+mes+'_loja1']={mes:mes,loja:'loja1',consumo:1460,injetado:874,semDesconto:2075.11,pagoUsina:611.80,pagoEnel:1212.33};
M[P+'energia/'+mes+'_loja2']={mes:mes,loja:'loja2',consumo:1000,injetado:600,semDesconto:1500,pagoUsina:500,pagoEnel:700};
M[P+'energia/'+mes]={kWh:1,valorUsina:1,valorDistribuidora:2};
M[P+'tarefas/t1']={titulo:'Conferir validade dos importados',setor:'importados',responsavel:'Lucas',prazo:iso(-1),feita:false,feitaEm:null};
M[P+'tarefas/t2']={titulo:'Limpar câmara fria',setor:'cozinha',responsavel:'',prazo:iso(0),feita:false,feitaEm:null};
M[P+'tarefas/t3']={titulo:'Pedir gelo para o evento',setor:'bebidas',responsavel:'Eliana',prazo:iso(5),feita:false,feitaEm:null};
M[P+'tarefas/t4']={titulo:'Trocar lâmpadas',setor:'bebidas',responsavel:'',prazo:'',feita:true,feitaEm:iso(-3)};

M[P+'boletos/b1']={descricao:'Fornecedor A',setor:'bebidas',vencimento:mes+'-01',valor:1000,pago:true,pagoEm:mes+'-01'};
M[P+'boletos/b2']={descricao:'Aluguel',setor:'geral',vencimento:mes+'-28',valor:3000,pago:false};
M[P+'boletos/b3']={descricao:'Gelo',setor:'bebidas',vencimento:mes+'-02',valor:500,pago:false};

const mprev=(()=>{const x=new Date();x.setMonth(x.getMonth()-1,1);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')})();
M[P+'contas/c1']={descricao:'Conta de luz',setor:'geral',valor:289.9,recorrente:true,dia:10,inicio:mprev,vencimento:null,ativa:true};
M[P+'contas/c2']={descricao:'Sky',setor:'geral',valor:149.9,recorrente:true,dia:31,inicio:mes,vencimento:null,ativa:true};
M[P+'contas/c3']={descricao:'Aluguel da garagem',setor:'geral',valor:600,recorrente:false,dia:null,inicio:null,vencimento:mes+'-27',ativa:true};
M[P+'contasPag/c1_'+mprev]={contaId:'c1',mes:mprev,pago:true,pagoEm:mprev+'-10',valor:301.5};

M['pessoal/356/contas/pc1']={descricao:'Cartão de crédito',setor:'pessoal',valor:1800,recorrente:true,dia:15,inicio:mes,vencimento:null,ativa:true};
M['pessoal/356/contas/pc2']={descricao:'Escola',setor:'pessoal',valor:950,recorrente:true,dia:5,inicio:mes,vencimento:null,ativa:true};
const user={uid:'u1',email:papel==='admin'?'lpacastro@hotmail.com':'g@x.com',emailVerified:true,displayName:'Luiz Paulo'};
window.__log=[];
// classes parecidas com as do Firebase compat (o app troca get/set/update/delete/commit nelas)
class DocumentReference{
 constructor(path){this.path=path;this.id=path.split('/').pop();}
 async get(o){ if(this.path.startsWith('usuarios/')) return {exists:true,id:this.id,data:()=>({papel,nome:'Luiz Paulo',email:user.email})};
  const v=M[this.path]; return v?{exists:true,id:this.id,ref:this,data:()=>v}:{exists:false,id:this.id,ref:this,data:()=>undefined}; }
 async set(v,o){ __log.push(['set',this.path]); const c=JSON.parse(JSON.stringify(v)); M[this.path]=o&&o.merge&&M[this.path]?Object.assign(M[this.path],c):c; }
 async update(v){ __log.push(['update',this.path]); if(!M[this.path])throw new Error('no doc'); Object.assign(M[this.path],JSON.parse(JSON.stringify(v))); }
 async delete(){ __log.push(['delete',this.path]); delete M[this.path]; }
}
class Query{
 constructor(path,fl){this.path=path;this.fl=fl||[];}
 where(k,op,v){return new Query(this.path,this.fl.concat([[k,op,v]]));}
 doc(i){const id=i||('n'+(++seq));return new DocumentReference(this.path+'/'+id);}
 async get(o){const fl=this.fl,path=this.path;const es=Object.entries(M).filter(([k])=>k.startsWith(path+'/')&&!k.slice(path.length+1).includes('/')).filter(([k,v])=>fl.every(([a,op,b])=>op==='=='?v[a]===b:op==='>='?v[a]>=b:op==='<='?v[a]<=b:op==='<'?v[a]<b:true));
  const docs=es.map(([k,v])=>({id:k.split('/').pop(),ref:new DocumentReference(k),data:()=>v})); return {docs,empty:!docs.length,size:docs.length,forEach:f=>docs.forEach(f)};}
}
class CollectionReference extends Query{}
class WriteBatch{
 constructor(){this.ops=[];}
 set(r,v,o){this.ops.push(()=>DocumentReference.prototype.__set.call(r,v,o));return this;}
 update(r,v){this.ops.push(()=>DocumentReference.prototype.__update.call(r,v));return this;}
 delete(r){this.ops.push(()=>DocumentReference.prototype.__delete.call(r));return this;}
 async commit(){for(const o of this.ops)await o();}
}
// cópias "cruas" usadas pelo lote (como no SDK, o lote não passa pelos métodos do documento)
DocumentReference.prototype.__set=DocumentReference.prototype.set;
DocumentReference.prototype.__update=DocumentReference.prototype.update;
DocumentReference.prototype.__delete=DocumentReference.prototype.delete;
const fs=()=>({doc:p=>new DocumentReference(p),collection:p=>new CollectionReference(p),batch:()=>new WriteBatch()});
fs.FieldValue={serverTimestamp:()=>0}; fs.DocumentReference=DocumentReference; fs.Query=Query; fs.CollectionReference=CollectionReference; fs.WriteBatch=WriteBatch;
// o "login" só acontece depois que a página toda carregou (o teste já preparou os dados)
const depoisDeCarregar=f=>document.readyState==='complete'?setTimeout(f,0):window.addEventListener('load',()=>setTimeout(f,0));
const authObj={currentUser:user,onAuthStateChanged(cb){depoisDeCarregar(()=>cb(user))},signOut:async()=>{}};
window.firebase={initializeApp(){},auth:()=>authObj,firestore:fs};
})();
