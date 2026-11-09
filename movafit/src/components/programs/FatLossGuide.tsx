import { useState } from 'react'
import { ChevronDown, Flame } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PROGRAMS, RECOMMENDED } from '@/data/programs'

/** Semana modelo para emagrecer treinando em casa. */
const WEEK = [
  { day: 'Seg', what: 'Força: pernas e glúteos', why: 'grandes músculos = mais gasto e mais músculo', tone: 'bg-lavanda' },
  { day: 'Ter', what: 'Cardio + abdômen', why: '20–30 min, pode ser HIIT', tone: 'bg-px-gold-soft' },
  { day: 'Qua', what: 'Força: superiores ou corpo todo', why: 'braços, costas, ombros', tone: 'bg-salvia-200' },
  { day: 'Qui', what: 'Força: pernas e glúteos', why: 'repetir o estímulo na semana', tone: 'bg-lavanda' },
  { day: 'Sex', what: 'Corpo todo ou HIIT', why: 'treino mais intenso da semana', tone: 'bg-px-gold-soft' },
  { day: 'Sáb', what: 'Caminhada longa (opcional)', why: '40–60 min, ritmo de conversa', tone: 'bg-salvia-200' },
  { day: 'Dom', what: 'Descanso', why: 'o músculo cresce no descanso', tone: 'bg-quente' },
]

const RULES = [
  {
    title: 'O que emagrece é o déficit calórico',
    text: 'Gastar um pouco mais do que come, todos os dias: cerca de 300–500 kcal a menos. O treino ajuda, mas sozinho não compensa a alimentação. Ritmo saudável: perder 0,5–1% do peso por semana.',
  },
  {
    title: 'Força 3–4x por semana é o centro',
    text: 'Treino de força (glúteos, pernas, corpo todo) faz você perder gordura e não músculo — é o que deixa o corpo mais firme e definido. Progrida: mais repetições, mais carga, elástico mais forte ou menos descanso.',
  },
  {
    title: 'Cardio 2–3x + passos todo dia',
    text: 'Cardio/HIIT curto complementa. Mas o maior gasto "escondido" são os passos: mire 7–10 mil por dia. Uma caminhada depois do almoço já ajuda muito.',
  },
  {
    title: 'Abdominal não seca a barriga',
    text: 'Não existe perda de gordura localizada. A barriga diminui quando a gordura do corpo todo diminui. O abdominal fortalece e melhora a postura — continue, mas sem esperar que ele "queime" a barriga.',
  },
  {
    title: 'Proteína e sono',
    text: 'Proteína em todas as refeições (cerca de 1,6–2 g por kg de peso por dia) protege o músculo e dá saciedade. Dormir 7–9 horas controla a fome no dia seguinte.',
  },
  {
    title: 'Meça do jeito certo',
    text: 'A balança varia 1–2 kg com água, sal e o ciclo menstrual. Pese 1x por semana (mesmo dia, de manhã, em jejum), meça a cintura a cada 2 semanas e tire foto a cada 4. Olhe a tendência, não o dia.',
  },
]

export function FatLossGuide({ onStart, activeId }: { onStart: (id: string) => void; activeId?: string }) {
  const [open, setOpen] = useState(false)
  const recs = RECOMMENDED.map((id) => PROGRAMS.find((p) => p.id === id)).filter(Boolean) as typeof PROGRAMS

  return (
    <section className="overflow-hidden rounded-[2rem] border-2 border-ink bg-ink text-ink-fg shadow-pixel">
      <div className="p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-salvia"><Flame size={14} /> foco: emagrecer</p>
        <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Como montar seu treino para emagrecer</h2>
        <p className="mt-2 max-w-3xl text-ink-fg/80">
          Analisei os {PROGRAMS.length} projetos gratuitos da Olena, dia por dia, pelo título de cada vídeo. Para perder gordura, os melhores juntam
          <b> força 3–4x por semana</b> (pernas e também superiores), <b>cardio</b> e <b>dias de descanso</b>. Cada projeto ganhou uma nota de 0 a 10.
          Na maioria deles o cardio é pouco (só no fim de alguns treinos), então <b>some caminhadas</b> nos dias de descanso. Minha sugestão, na ordem:
        </p>

        <ol className="mt-5 grid gap-3 lg:grid-cols-3">
          {recs.map((p, i) => (
            <li key={p.id} className="flex flex-col rounded-3xl border-2 border-ink-fg/20 bg-ink-soft p-4">
              <span className="font-serif text-sm font-bold text-lavanda">{i + 1}º · {i === 0 ? 'comece por aqui' : i === 1 ? 'depois' : 'para subir o nível'}</span>
              <span className="mt-1 flex items-baseline justify-between gap-2 font-serif text-xl font-bold">{p.name}<span className="font-sans text-xs font-semibold text-salvia">{p.fatLossScore.toLocaleString('pt-BR')}/10</span></span>
              <span className="text-xs text-ink-fg/60">{p.days.length} dias · {p.perWeek}x/semana · ~{p.avgMinutes} min</span>
              <span className="mt-1 flex-1 text-sm text-ink-fg/75">{p.fatLossWhy ?? p.summary}</span>
              <button
                type="button"
                disabled={activeId === p.id}
                onClick={() => onStart(p.id)}
                className="mt-3 inline-flex h-10 w-fit items-center rounded-full border-2 border-lavanda bg-lavanda px-4 text-sm font-semibold text-ink hover:brightness-105 disabled:border-salvia disabled:bg-salvia"
              >
                {activeId === p.id ? 'Fazendo agora' : 'Ver e começar'}
              </button>
            </li>
          ))}
        </ol>
        {(() => {
          const light = PROGRAMS.find((p) => p.id === 'pluma')
          return light?.fatLossWhy ? (
            <p className="mt-4 text-sm text-ink-fg/70">
              <b className="text-ink-fg">Semana corrida?</b> {light.fatLossWhy}{' '}
              <button type="button" onClick={() => onStart(light.id)} className="font-semibold text-lavanda underline underline-offset-4">Ver o PLUMA</button>
            </p>
          ) : null
        })()}
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between border-t-2 border-ink-fg/15 px-6 py-4 text-left font-semibold hover:bg-ink-fg/5 sm:px-8"
      >
        Por que assim? A semana ideal e as 6 regras
        <ChevronDown size={20} className={cn('transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="space-y-6 bg-quente p-6 text-ink sm:p-8">
          <div>
            <h3 className="font-serif text-xl font-bold">A semana ideal</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-7">
              {WEEK.map((w) => (
                <div key={w.day} className={cn('rounded-2xl border-2 border-ink p-3', w.tone)}>
                  <p className="font-serif text-lg font-bold">{w.day}</p>
                  <p className="text-sm font-semibold leading-tight">{w.what}</p>
                  <p className="mt-1 text-xs text-ink/65">{w.why}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink/60">Os projetos da Olena já seguem mais ou menos esse ritmo. Se um dia de força cair no fim de semana, tudo bem: o que importa é o total da semana.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {RULES.map((r, i) => (
              <div key={r.title} className="rounded-3xl border-2 border-ink bg-quente p-4">
                <p className="font-serif text-lg font-bold"><span className="text-salvia-deep">{i + 1}.</span> {r.title}</p>
                <p className="mt-1 text-sm text-ink/75">{r.text}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink/55">São orientações gerais, não substituem nutricionista ou médico — principalmente se você tiver alguma condição de saúde.</p>
        </div>
      )}
    </section>
  )
}
