import re, sys, html
src = open(sys.argv[1], encoding='utf-8', errors='replace').read()
# só o conteúdo principal
m = re.search(r'<body.*', src, re.S); src = m.group(0) if m else src
src = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', src, flags=re.S)
tok = re.compile(r'(https?://(?:youtu\.be/|www\.youtube\.com/(?:watch\?v=|embed/))[\w-]{6,})|>([^<]{2,120})<')
out = []
for m in tok.finditer(src):
    if m.group(1): out.append('URL ' + m.group(1))
    else:
        t = html.unescape(m.group(2)).strip()
        if t and re.search(r'DIA|DESCANSO|OPCIONAL|TREINO|AULA|PARAB|SEMANA|TAREFA|min', t, re.I): out.append('TXT ' + t)
print('\n'.join(out))
