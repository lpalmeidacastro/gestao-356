// Regras dos avisos dos Lembretes (sem Firebase: dá para testar no computador).
const TZ = 'America/Sao_Paulo';
const MAX_ATRASO = 2 * 3600000; // se o servidor ficou parado e o compromisso já passou há mais de 2 h, não manda mais
const hm = ms => new Intl.DateTimeFormat('pt-BR', { timeZone:TZ, hour:'2-digit', minute:'2-digit' }).format(ms);
const diaISO = ms => new Intl.DateTimeFormat('en-CA', { timeZone:TZ, year:'numeric', month:'2-digit', day:'2-digit' }).format(ms);

// 'mandar' = manda o aviso agora; 'limpar' = só tira da fila (concluído ou muito atrasado); null = ainda não é hora
function acao(l, agora) {
  if (!l || l.proxAviso == null || !(Number(l.proxAviso) <= agora)) return null;
  if (l.concluido) return 'limpar';
  if (agora > Number(l.quando) + MAX_ATRASO) return 'limpar';
  return 'mandar';
}
function quandoTxt(quando, agora) {
  const min = Math.round((quando - agora) / 60000), h = hm(quando);
  if (min < 0) return `Era às ${h}`;
  if (min <= 1) return `Agora, ${h}`;
  if (min < 60) return `Daqui a ${min} min (${h})`;
  const dq = diaISO(quando);
  if (dq === diaISO(agora)) { const hh = Math.floor(min / 60), mm = min % 60; return `Hoje às ${h} (daqui a ${hh} h${mm ? ' ' + mm + ' min' : ''})`; }
  if (dq === diaISO(agora + 86400000)) return `Amanhã às ${h}`;
  const [, m, d] = dq.split('-');
  return `${d}/${m} às ${h}`;
}
// dados do aviso (FCM só aceita texto); o sw.js do app lê estes campos
function mensagem(l, id, agora) {
  const corpo = quandoTxt(Number(l.quando), agora) + (l.notas ? ' · ' + String(l.notas).slice(0, 120) : '');
  return { titulo:String(l.titulo || 'Lembrete').slice(0, 100), corpo, tag:'lemb-' + id, url:'./#/lembretes',
    som:l.som === false ? '0' : '1', vibrar:l.vibrar === false ? '0' : '1', fixo:l.fixo ? '1' : '0' };
}
// aparelhos (com avisos ativados) das pessoas escolhidas, sem repetir
function tokensPara(aparelhos, para) {
  const quem = new Set(para || []);
  return Array.from(new Set(aparelhos.filter(a => a && a.token && quem.has(a.uid)).map(a => a.token)));
}
module.exports = { acao, quandoTxt, mensagem, tokensPara, MAX_ATRASO };
