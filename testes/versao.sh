#!/bin/bash
# Confere que a versão do app (index.html) e do service worker (sw.js) são iguais.
# Se não forem, quem já tem o app instalado não recebe a versão nova.
cd "$(dirname "$0")/.."
a=$(grep -oE "APP_VERSAO = '[^']+'" index.html | cut -d"'" -f2)
b=$(grep -oE "^const VERSAO = '[^']+'" sw.js | cut -d"'" -f2)
if [ -z "$a" ] || [ "$a" != "$b" ]; then echo "ERRO: APP_VERSAO ($a) diferente de VERSAO do sw.js ($b)"; exit 1; fi
# a versão precisa mudar quando o index.html muda (compara com o envio anterior, se houver)
if git rev-parse -q --verify HEAD~1 >/dev/null 2>&1 && ! git diff --quiet HEAD~1 HEAD -- index.html; then
  antes=$(git show HEAD~1:sw.js | grep -oE "^const VERSAO = '[^']+'" | cut -d"'" -f2)
  if [ "$antes" = "$b" ]; then echo "ERRO: index.html mudou mas a versão continua $b (troque VERSAO e APP_VERSAO)"; exit 1; fi
fi
echo "versão ok: $a"
