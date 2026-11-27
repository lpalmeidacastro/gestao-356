# Monta uma página de teste: index.html com o Firebase simulado (mock.js) + lib.js + o teste.
# Uso: python3 testes/build.py testes/test_x.js saida.html
import re, sys, os
aqui = os.path.dirname(os.path.abspath(__file__))
raiz = os.path.dirname(aqui)
mock = open(os.path.join(aqui, 'mock.js'), encoding='utf-8').read()
h = open(os.path.join(raiz, 'index.html'), encoding='utf-8').read()
h = re.sub(r'<script src="https://www.gstatic[^\n]*</script>\n', '', h)
assert "<script>\n'use strict';" in h
# "// HOJE=AAAA-MM-DD" na 1ª linha do teste congela a data do app (para testes que dependem do dia)
pre = ''
t0 = open(sys.argv[1], encoding='utf-8').readline()
mh = re.match(r'// HOJE=(\d{4})-(\d{2})-(\d{2})', t0)
if mh:
    y, mo, d = map(int, mh.groups())
    pre = f"(function(){{const F=new Date({y},{mo-1},{d},12).getTime(),R=Date;class D extends R{{constructor(...a){{a.length?super(...a):super(F);}}static now(){{return F;}}}}window.Date=D;}})();\n"
h = h.replace("<script>\n'use strict';", '<script>\n' + pre + mock + "\n</script>\n<script>\n'use strict';", 1)
nome = os.path.basename(sys.argv[1])
teste = open(sys.argv[1], encoding='utf-8').read()
if nome not in ('test_a.js', 'test_b.js', 'test_d.js', 'test_e.js'):  # os antigos já trazem seus auxiliares
    teste = open(os.path.join(aqui, 'lib.js'), encoding='utf-8').read() + '\n' + teste
h = h.replace('</body>', '<script>' + teste + '</script></body>')
open(sys.argv[2], 'w', encoding='utf-8').write(h)
