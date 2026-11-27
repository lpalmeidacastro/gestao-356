#!/bin/bash
# Roda todos os testes no Chrome sem tela. Sai com erro se algum falhar (depois de 1 nova tentativa,
# porque alguns testes dependem de tempo e oscilam quando a máquina está ocupada).
# Uso: bash testes/suite.sh            (todos)   ou   bash testes/suite.sh test_x test_w
cd "$(dirname "$0")"; mkdir -p .saida
CHROME=${CHROME:-$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser)}
LISTA=("$@"); [ ${#LISTA[@]} -eq 0 ] && LISTA=($(ls test_*.js | sed 's/\.js$//'))
roda() {
  python3 build.py "$1.js" ".saida/$1.html" >/dev/null || { echo "ERRO montando $1"; return 1; }
  "$CHROME" --headless=new --no-sandbox --disable-gpu --allow-file-access-from-files --virtual-time-budget=25000 --dump-dom ".saida/$1.html" 2>/dev/null | python3 -c "
import sys,re,html
d=sys.stdin.read(); m=re.search(r'<pre id=\"RES\">(.*?)</pre>',d,re.S); print(html.unescape(m.group(1)) if m else 'FAIL sem resultado')"
}
ruim=0
for t in "${LISTA[@]}"; do
  r=$(roda $t); f=$(echo "$r" | grep -v '^PASS' | grep -v 'renomear subsetor' | grep .)
  if [ -n "$f" ]; then r=$(roda $t); f=$(echo "$r" | grep -v '^PASS' | grep -v 'renomear subsetor' | grep .); fi
  echo "$t: $(echo "$r" | grep -c '^PASS') ok"; [ -n "$f" ] && { echo "$f"; ruim=1; }
done
exit $ruim
