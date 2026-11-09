import re, sys, json, subprocess, os
SP = sys.argv[1]
def tokens(path):
    return subprocess.run([sys.executable, '-I', os.path.join(SP, 'scripts/tokens.py'), path], capture_output=True, text=True).stdout.splitlines()
def norm(u):
    m = re.search(r'(?:youtu\.be/|v=|embed/)([\w-]{6,})', u)
    return 'https://youtu.be/' + m.group(1) if m else None
res = {}
for slug in sys.argv[2:]:
    days, cur = [], None
    for t in tokens(os.path.join(SP, 'pages', slug + '.html')):
        kind, val = t[:3], t[4:]
        if kind == 'TXT':
            m = re.match(r'^DIA\s*(\d+)\s*$', val, re.I)
            if m:
                cur = {'day': int(m.group(1)), 'videos': [], 'labels': []}; days.append(cur); continue
            if cur is not None: cur['labels'].append(val)
        elif cur is not None:
            u = norm(val)
            if u and u not in cur['videos']: cur['videos'].append(u)
    res[slug] = days
json.dump(res, open(os.path.join(SP, 'parsed.json'), 'w'), ensure_ascii=False, indent=1)
for s, ds in res.items():
    nums = [d['day'] for d in ds]
    print(s, len(ds), 'days', 'seq_ok' if nums == list(range(1, len(nums)+1)) else f'SEQ {nums}', 'novideo:', [d['day'] for d in ds if not d['videos']], 'labels:', sorted({l for d in ds for l in d['labels']})[:8])
