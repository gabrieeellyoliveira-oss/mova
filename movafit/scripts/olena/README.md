# Atualizar os projetos da Olena (`src/data/programs.ts`)

Os dias e links vêm das páginas públicas de olenastarodubets.com; os títulos e durações, do oEmbed do YouTube.

```bash
D=$(mktemp -d); mkdir -p $D/pages $D/oembed $D/scripts; cp *.py $D/scripts/
for u in projeto-move fit-12dias projeto-elite-2 projeto-glow projeto-shape-up guerreira-fit-6 guerreira-fit-5 guerreira-fit-4 guerreira-fit-3 projeto-start projeto-pluma projeto-bloom projeto-relax spark-2 projeto-flash projeto-eleva royal guerreira-fit-part-1 guerreira-fit-part-2 fitem21dias corpo-fit-60-dias corpo-fit-60-dias-parte-2; do curl -sL -o $D/pages/$u.html https://olenastarodubets.com/$u/; done
python3 -I $D/scripts/parse.py $D $(ls $D/pages | sed 's/.html//')
python3 -I -c "import json,re;d=json.load(open('$D/parsed.json'));print('\n'.join(sorted({re.search(r'youtu.be/(.+)',v).group(1) for ds in d.values() for x in ds for v in x['videos']})))" > $D/ids.txt
(cd $D/oembed && xargs -P 10 -I{} curl -s -m 15 "https://www.youtube.com/oembed?url=https://youtu.be/{}&format=json" -o "{}.json" < ../ids.txt)
python3 -I $D/scripts/gen.py $D $D/programs.json
python3 -I $D/scripts/tots.py $D/programs.json head.ts > ../../src/data/programs.ts
```

Novo projeto: adicione a página no `for` acima e uma linha em `PROGRAMS` de `gen.py`.
