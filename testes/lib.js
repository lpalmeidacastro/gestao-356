const out=[];const T=(n,c)=>out.push((c?'PASS ':'FAIL ')+n);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const click=sel=>{const e=document.querySelector(sel);if(e)e.click();return !!e;};
const txt=()=>document.getElementById('root').innerText;
const sub=f=>{const s=f.querySelector&&f.querySelector('select[name=forma]');if(s&&!s.value&&!window.__semForma)s.value='pix';return f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));};
const chg=(el,v)=>{el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));};
const fim=()=>{const p=document.createElement('pre');p.id='RES';p.textContent=out.join('\n');document.body.appendChild(p);};
const mesA=window.__iso(0).slice(0,7);
const mesAdd2=(m,d)=>{const [y,mo]=m.split('-').map(Number);const x=new Date(y,mo-1+d,1);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0');};
// espera um elemento aparecer (evita testes que oscilam por tempo)
const ate=async(sel,ms=4000)=>{const t=performance.now();while(performance.now()-t<ms){const e=document.querySelector(sel);if(e)return e;await wait(50);}return null;};
// clica e espera o resultado; repete o clique se a tela foi redesenhada no meio (elemento antigo some do documento)
const clicaAte=async(sel,alvo,ms=4000)=>{const t=performance.now();while(performance.now()-t<ms){click(sel);for(let i=0;i<6;i++){const e=document.querySelector(alvo);if(e)return e;await wait(50);}}return null;};
