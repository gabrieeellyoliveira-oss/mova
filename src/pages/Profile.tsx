import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Download, LogOut, RotateCcw, Upload } from 'lucide-react'
import { cloudEnabled, signOut, useSession } from '@/lib/auth'
import { syncStatus } from '@/lib/cloudSync'
import { useStore } from '@/store/createStore'
import gabi from '@/assets/gabi-e-gata.webp'
import { exportAll, importAll, resetAll, settingsStore } from '@/store/db'
import { useSettings } from '@/hooks/useData'
import { NAV_ITEMS } from '@/data/constants'
import { toast } from '@/hooks/useToast'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input } from '@/components/ui/Form'
import { PixelIcon } from '@/components/game/PixelIcon'
import { GoogleCalendarCard } from '@/components/integrations/GoogleCalendarCard'
import { LinkedInCard } from '@/components/integrations/LinkedInCard'

export default function Profile() {
  const s = useSettings()
  const session = useSession()
  const file = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const sync = useStore(syncStatus)
  const [params] = useSearchParams()
  const connections = useRef<HTMLElement>(null)
  useEffect(() => {
    if (params.get('secao') === 'conexoes') connections.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [params])
  const set = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => settingsStore.set((p) => ({ ...p, [k]: v }))

  const download = () => {
    const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `mova-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-px border-2 border-px-line bg-vinho p-6 text-rosa-50 shadow-pixel sm:p-8">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_360px]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rosa">oi, {s.name}!</p>
            <p className="mt-2 font-display text-6xl leading-[1.05]">Mais movimento,<br />mais vida.</p>
            <p className="mt-3 max-w-md text-sm text-rosa-50/75">O MOVA não existe pra te deixar mais produtiva. Existe pra organizar a vida e sobrar tempo pra vivê-la.</p>
          </div>
          <img src={gabi} alt="" className="mx-auto w-full max-w-[360px] md:-mb-8" />
        </div>
      </section>

      <Card className="lg:hidden">
        <CardHeader title="Todas as áreas" />
        <div className="grid grid-cols-3 gap-2">
          {NAV_ITEMS.map(({ label, path, sprite }) => (
            <Link key={path} to={path} className="flex flex-col items-center gap-1.5 rounded-2xl bg-creme-100 px-2 py-3 text-center text-xs font-semibold text-vinho active:scale-95">
              <PixelIcon name={sprite} size={24} />{label}
            </Link>
          ))}
        </div>
      </Card>

      <section ref={connections} className="scroll-mt-6">
        <h2 className="mb-3 font-heading text-xl uppercase text-vinho">Conexões</h2>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <GoogleCalendarCard />
          <LinkedInCard />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Sobre você" subtitle="salvo automaticamente" />
          <FormGrid>
            <Field label="Como quer ser chamada?"><Input value={s.name} onChange={(e) => set('name', e.target.value)} /></Field>
            <Field label="Orçamento mensal (R$)"><Input type="number" value={s.monthlyBudget} onChange={(e) => set('monthlyBudget', Number(e.target.value))} /></Field>
            <Field label="Horas de estudo por semana"><Input type="number" value={s.weeklyStudyHours} onChange={(e) => set('weeklyStudyHours', Number(e.target.value))} /></Field>
            <Field label="Meta de livros no ano"><Input type="number" value={s.yearlyBooksGoal} onChange={(e) => set('yearlyBooksGoal', Number(e.target.value))} /></Field>
          </FormGrid>
        </Card>
        <Card className="lg:col-span-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-vinho">Acesso</p>
            <p className="text-xs text-vinho/60">Entrou como {session}{cloudEnabled ? ' · conta na nuvem (Supabase)' : ' · acesso só deste navegador'}</p>
          </div>
          <Button variant="soft" onClick={signOut}><LogOut size={16} /> Sair</Button>
        </Card>
        <Card tone="creme">
          <CardHeader title="Seus dados" subtitle={cloudEnabled ? 'salvos na nuvem e neste aparelho' : 'ficam guardados neste navegador'} />
          {cloudEnabled ? (
            <p className="mb-4 text-sm text-vinho/70">
              {sync.state === 'ok' ? `Tudo salvo na nuvem ✓${sync.at ? ` · ${new Date(sync.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}`
                : sync.state === 'syncing' ? 'Salvando na nuvem…'
                : sync.state === 'offline' ? 'Sem conexão com a nuvem agora — está tudo salvo aqui e eu envio assim que voltar.'
                : 'Entre na sua conta para sincronizar.'}
              {' '}Abra o MOVA em outro aparelho com o mesmo e-mail e seus dados estarão lá.
            </p>
          ) : (
            <p className="mb-4 text-sm text-vinho/70">Faça um backup de vez em quando — ou leve tudo para outro aparelho.</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={download}><Download size={16} /> Exportar backup</Button>
            <Button variant="soft" onClick={() => file.current?.click()}><Upload size={16} /> Importar</Button>
            <Button variant="danger" onClick={() => {
              if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); return }
              resetAll(); setConfirmReset(false); toast('Dados de exemplo restaurados')
            }} className={confirmReset ? 'bg-cereja text-quente hover:bg-cereja' : ''}>
              <RotateCcw size={16} /> {confirmReset ? 'Tem certeza? Clique de novo' : 'Restaurar exemplo'}
            </Button>
          </div>
          <input ref={file} type="file" accept="application/json" hidden onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            try { importAll(JSON.parse(await f.text())); toast('Backup importado ✓') } catch { toast('Não consegui ler esse arquivo', { kind: 'info' }) }
            e.target.value = ''
          }} />
        </Card>
      </div>
    </div>
  )
}
