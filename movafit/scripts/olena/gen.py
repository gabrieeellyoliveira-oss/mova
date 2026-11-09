import json, re, os, sys, glob
SP = sys.argv[1]; OUT = sys.argv[2]
parsed = json.load(open(os.path.join(SP, 'parsed.json')))
titles = {}
for f in glob.glob(os.path.join(SP, 'oembed', '*.json')):
    try: titles[os.path.basename(f)[:-5]] = json.load(open(f))['title']
    except Exception: pass
# títulos do site para os 4 sem oEmbed
titles.update({'IeRFLLWHLfY': 'Treino corpo todo - 25 min.', 'YDxVirmd1yM': '45 min. de treino avançado para glúteos e posteriores em casa',
               'niY_sI3Rd9U': 'Treino Isolado de Glúteos e Abdominais - Sem Impacto', 'ns3LYaxIIfg': '25 MIN. Quadriceps e glúteos em casa - Treino intenso'})

PROGRAMS = [
  # id, nome, páginas, min/dia (rótulo, número), nível, resumo
  ('elite', 'Projeto ELITE', ['projeto-elite-2'], '30 min/dia', 30, 'Intermediário/avançado', 'O projeto mais novo (ainda em andamento no site). Treinos de força com cardio no fim, 5 dias por semana.'),
  ('glow', 'Projeto GLOW', ['projeto-glow'], '30 min/dia', 30, 'Todos os níveis', '30 dias com a tarefa diária de cintura + treino do dia.'),
  ('shape-up', 'Projeto SHAPE UP', ['projeto-shape-up'], '10–45 min/dia', 30, 'Todos os níveis', '28 dias combinando glúteos, superiores, abdômen e alongamentos (sem dias de descanso marcados).'),
  ('gf6', 'GUERREIRA FIT 6', ['guerreira-fit-6'], '40–50 min/dia', 45, 'Intermediário', '4 semanas, 5 treinos por semana e 2 de descanso.'),
  ('gf5', 'GUERREIRA FIT 5', ['guerreira-fit-5'], '40–60 min/dia', 50, 'Intermediário', '4 semanas de treinos pesados, 5 por semana.'),
  ('gf4', 'GUERREIRA FIT 4', ['guerreira-fit-4'], '40–50 min/dia', 45, 'Intermediário', '7 semanas de treino, 6 por semana.'),
  ('gf3', 'GUERREIRA FIT 3', ['guerreira-fit-3'], '40–50 min/dia', 45, 'Intermediário', '4 semanas, 6 treinos por semana.'),
  ('gf2', 'GUERREIRA FIT 2', ['guerreira-fit-part-1', 'guerreira-fit-part-2'], '30–45 min/dia', 40, 'Intermediário', '60 dias (partes 1 e 2) de força com cardio extra quase todo dia.'),
  ('start', 'Projeto START', ['projeto-start'], '25–40 min/dia', 30, 'Iniciante', 'Para começar: 4 semanas, ritmo mais leve.'),
  ('pluma', 'Projeto PLUMA', ['projeto-pluma'], '20 min/dia', 20, 'Iniciante', 'Treinos curtos de 20 minutos, leves e eficazes, 5 por semana.'),
  ('bloom', 'Projeto BLOOM', ['projeto-bloom'], '30–40 min/dia', 35, 'Intermediário', 'Projeto longo (54 dias) de 30 minutos, 5 treinos por semana.'),
  ('royal', 'Projeto ROYAL', ['royal'], '30–50 min/dia', 40, 'Intermediário/avançado', '10 semanas, treinos pesados para glúteos e pernas.'),
  ('eleva', 'Projeto ELEVA', ['projeto-eleva'], '15–35 min/dia', 25, 'Todos os níveis', '4 semanas com um treino opcional por semana.'),
  ('move', 'Projeto MOVE', ['projeto-move'], '21 min/dia', 21, 'Todos os níveis', '21 dias de 21 minutos, com cardio + abdômen opcional toda semana.'),
  ('flash', 'Projeto FLASH', ['projeto-flash'], '15 min/dia', 15, 'Todos os níveis', '21 dias de 15 minutos + tarefa diária de cintura.'),
  ('spark', 'Projeto SPARK', ['spark-2'], '10 min/dia', 10, 'Todos os níveis', 'Treinos de 10 minutos para dias corridos.'),
  ('relax', 'Projeto RELAX', ['projeto-relax'], '30 min/dia', 30, 'Todos os níveis', 'Aulas de mobilidade, alongamento e relaxamento.'),
  ('fit21', 'FIT em 21 Dias', ['fitem21dias'], '10–45 min/dia', 30, 'Todos os níveis', '21 dias variados: glúteos, abdômen, cardio e alongamentos.'),
  ('corpo-fit-60', 'CORPO FIT 60 Dias', ['corpo-fit-60-dias', 'corpo-fit-60-dias-parte-2'], '10–45 min/dia', 35, 'Intermediário', '60 dias (partes 1 e 2) com treino do dia + abdômen e cardio.'),
  ('fit-12-dias', 'FIT 12 Dias', ['fit-12dias'], '20–45 min/dia', 30, 'Intermediário', '12 dias alternando glúteos/pernas, superiores e cardio + abdômen.'),
]
PAGE = {'projeto-elite-2': 'projeto-elite-2', 'fitem21dias': 'fitem21dias'}

TASK = re.compile(r'tarefa|afinar (a )?cintura|aquecimento|boas vindas|parab[ée]ns', re.I)
def clean(t):
    t = re.split(r'\s[|｜]\s', t)[0]
    t = re.sub(r'^Projeto \w+ - TREINO \d+:\s*', '', t, flags=re.I)
    t = re.sub(r'\s*[/–-]\s*(BLOOM|ROYAL|GF\d|ELITE|PLUMA|START|GLOW|SPARK|FLASH|ELEVA)\b.*$', '', t, flags=re.I)
    t = re.sub(r'\s+', ' ', t).strip(' -–|')
    return t[:90]
def mins(t):
    m = re.findall(r'(\d{1,2})\s*min', t, re.I); return sum(int(x) for x in m[:1]) if m else None
CATS = [
    ('alongamento', r'along|flexib|relax|postura|mobilidade|purifica|respira|pilates|yoga'),
    ('cardio', r'hiit|cardio|queima|aer[óo]b|tabata|suar|fat burn|emagrec'),
    ('corpo', r'full ?body|corpo (todo|inteiro|completo)'),
    ('pernas', r'gl[úu]te|perna|quadr|coxa|posterior|inferior|bumbum|anca'),
    ('bracos', r'superior|bra[çc]o|costas|ombro|peito|tr[íi]ceps|b[íi]ceps'),
    ('abdomen', r'abd|barriga|core|cintura|ventre'),
]
def focus(t):
    t = t.lower()
    hits = [(m.start(), i, k) for i, (k, rx) in enumerate(CATS) for m in [re.search(rx, t)] if m]
    return min(hits)[2] if hits else 'corpo'
def vid(u): return u.rsplit('/', 1)[1]

out = []
for pid, name, pages, mlabel, mdef, level, summary in PROGRAMS:
    days = []
    for pg in pages:
        seq = parsed[pg]
        # para no primeiro número fora de ordem (repetições no fim da página)
        for i, d in enumerate(seq):
            if i and d['day'] != seq[i-1]['day'] + 1: break
            days.append(d)
    # tira os dias "em breve" do fim (sem vídeo e sem descanso)
    while days and not days[-1]['videos'] and not any('DESCANSO' in l.upper() for l in days[-1]['labels'][:3]): days.pop()
    res = []
    for d in days:
        labels = [l for l in d['labels'][:3]]
        rest = any('DESCANSO' in l.upper() for l in labels)
        optional = bool(labels) and 'OPCIONAL' in labels[0].upper()
        vs = d['videos']
        main = [v for v in vs if not TASK.search(titles.get(vid(v), ''))] or vs
        title = clean(titles.get(vid(main[0]), '')) if main and not rest else None
        mm = [mins(titles.get(vid(v), '')) for v in main] if not rest else []
        total = sum(x for x in mm if x) if any(mm) else None
        f = focus(' '.join(titles.get(vid(v), '') for v in main[:1])) if not rest and main else None
        item = {'day': d['day'], 'videos': vs}
        if rest: item['rest'] = True
        if optional and not rest: item['optional'] = True
        if title: item['title'] = title
        if total: item['minutes'] = total
        if f: item['focus'] = f
        res.append(item)
    url = 'https://olenastarodubets.com/' + pages[0] + '/'
    out.append({'id': pid, 'name': name, 'url': url, 'minutesLabel': mlabel, 'minutesPerDay': mdef, 'level': level, 'summary': summary, 'days': res})

# análise para emagrecer
for p in out:
    train = [d for d in p['days'] if not d.get('rest')]
    weeks = max(1, len(p['days']) / 7)
    c = {k: sum(1 for d in train if d.get('focus') == k) for k in ['pernas', 'bracos', 'corpo', 'cardio', 'abdomen', 'alongamento']}
    strength = c['pernas'] + c['bracos'] + c['corpo']
    c['comCardio'] = sum(1 for d in train if re.search(CATS[1][1], ' '.join(titles.get(vid(v), '') for v in d['videos']).lower()))
    p['mix'] = c
    p['perWeek'] = round(len(train) / weeks, 1)
    p['avgMinutes'] = round(sum(d.get('minutes') or p['minutesPerDay'] for d in train) / max(1, len(train)))
    sw, cw = strength / weeks, max(c['cardio'], c['comCardio']) / weeks
    score = 0
    score += 3 - min(3, abs(sw - 3.5))           # força 3–4x/semana
    score += 0 if cw < 0.5 else 1 if cw < 1 else 2 if cw <= 4 else 1.5   # cardio 1–4x/semana
    score += 1.5 if 4 <= p['perWeek'] <= 6 else 0.5  # frequência com descanso
    score += 1.5 if 25 <= p['avgMinutes'] <= 50 else 0.5
    score += 1 if c['bracos'] + c['corpo'] >= weeks else 0   # corpo todo, não só glúteo
    p['fatLossScore'] = round(score / 9 * 10, 1)
json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
for p in sorted(out, key=lambda p: -p['fatLossScore']):
    print(f"{p['fatLossScore']:>4} {p['id']:<13} dias={len(p['days']):>2} /sem={p['perWeek']} min={p['avgMinutes']} mix={p['mix']}")
