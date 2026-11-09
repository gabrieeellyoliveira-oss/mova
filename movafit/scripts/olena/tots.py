import json, sys
progs = json.load(open(sys.argv[1]))
WHY = {
  'gf6': 'Melhor formato para emagrecer: 5 treinos de força por semana alternando pernas/glúteos e braços/costas (descansa um grupo enquanto treina o outro), cardio no fim de alguns treinos e 2 dias de descanso. ~45 min.',
  'gf5': 'O próximo nível: mesma estrutura de 5 dias + 2 de descanso, treinos mais pesados (~50 min). Mais músculo = mais gasto de energia o dia todo.',
  'bloom': 'Para manter o ritmo por mais tempo: 54 dias, ~30 min, 5 treinos por semana com bastante braço e abdômen além de glúteos. Ótimo para virar hábito.',
  'pluma': 'Alternativa leve: 20 min, 5x por semana. Boa para semanas corridas ou para voltar depois de uma pausa.',
}
head = open(sys.argv[2]).read()
body = ['export const PROGRAMS: Program[] = [']
for p in sorted(progs, key=lambda p: -p['fatLossScore']):
    if p['id'] in WHY: p['fatLossWhy'] = WHY[p['id']]
    body.append('  ' + json.dumps(p, ensure_ascii=False) + ',')
body.append(']')
body.append("\n/** Recomendados para emagrecer, na ordem (análise em `components/programs/FatLossGuide.tsx`). */")
body.append("export const RECOMMENDED = ['gf6', 'gf5', 'bloom']")
print(head + '\n'.join(body))
