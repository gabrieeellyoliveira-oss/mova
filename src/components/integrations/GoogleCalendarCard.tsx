import { useState } from 'react'
import { CalendarDays, Loader2, RefreshCw, Unlink } from 'lucide-react'
import { googleCalendarCache, integrationsStore } from '@/store/db'
import { useStore } from '@/store/createStore'
import { connectGoogleCalendar, disconnectGoogleCalendar, syncGoogleCalendar } from '@/lib/googleCalendar'
import { toIcsUrl } from '@/lib/ical'
import { addDays, today } from '@/utils/date'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form'

const since = (iso?: string) => {
  if (!iso) return 'nunca'
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  return min < 1 ? 'agora há pouco' : min < 60 ? `há ${min} min` : `há ${Math.round(min / 60)} h`
}

/** Conectar o Google Agenda só com o link da agenda (sem login do Google). */
export function GoogleCalendarCard() {
  const { googleCalendarUrl } = useStore(integrationsStore)
  const cache = useStore(googleCalendarCache)
  const [link, setLink] = useState('')
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const connected = !!googleCalendarUrl && !editing
  const t = today()
  const week = cache.events.filter((e) => e.date >= t && e.date <= addDays(t, 6)).length

  const connect = async () => {
    setError(null)
    if (!toIcsUrl(link)) return setError('Esse link não parece do Google Agenda. Veja o passo a passo abaixo.')
    setBusy(true)
    await connectGoogleCalendar(link)
    setBusy(false)
    setEditing(false)
    setLink('')
  }
  const refresh = async () => { setBusy(true); await syncGoogleCalendar(); setBusy(false) }

  return (
    <Card>
      <CardHeader icon={<CalendarDays size={18} />} title="Google Agenda" subtitle={connected ? 'conectado pelo link · somente leitura' : 'conecte só com o link da agenda'} />
      {connected ? (
        <div className="space-y-3">
          <div className="rounded-lg border-2 border-px-line/20 bg-white/60 p-3">
            <p className="font-semibold text-tinta">{cache.name ?? 'Sua agenda'}</p>
            <p className="text-sm text-vinho/65">{cache.fetchedAt ? `${week} ${week === 1 ? 'evento' : 'eventos'} nos próximos 7 dias · atualizado ${since(cache.fetchedAt)}` : 'Lendo a agenda…'}</p>
            {cache.error && <p role="alert" className="mt-2 text-sm font-medium text-cereja"><span className="font-pixel font-bold">! </span>{cache.error}</p>}
          </div>
          <p className="text-xs text-vinho/55">Os eventos aparecem em Meu dia e na Agenda, com a marca “Google”. Para editar, use o próprio Google Agenda — aqui atualiza sozinho a cada 15 minutos.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={refresh} disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Atualizar agora</Button>
            <Button size="sm" variant="soft" onClick={() => { setLink(googleCalendarUrl); setEditing(true) }}>Trocar link</Button>
            <Button size="sm" variant="ghost" onClick={disconnectGoogleCalendar}><Unlink size={14} /> Desconectar</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <form onSubmit={(e) => { e.preventDefault(); connect() }} className="flex flex-col gap-2 sm:flex-row">
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Cole aqui o link da sua agenda" aria-label="Link do Google Agenda" className="flex-1" />
            <Button type="submit" disabled={!link.trim() || busy}>{busy && <Loader2 size={14} className="animate-spin" />} Conectar</Button>
          </form>
          {error && <p role="alert" className="text-sm font-medium text-cereja"><span className="font-pixel font-bold">! </span>{error}</p>}
          {editing && <button type="button" onClick={() => setEditing(false)} className="text-xs font-semibold text-cereja hover:underline">Cancelar</button>}
          <details className="rounded-lg bg-white/50 p-3 text-sm text-vinho/80">
            <summary className="cursor-pointer font-semibold text-vinho">Como pegar o link</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>No computador, abra o Google Agenda e clique na engrenagem → <b>Configurações</b>.</li>
              <li>À esquerda, em “Configurações das minhas agendas”, clique na sua agenda.</li>
              <li>Em <b>Integrar agenda</b>, copie o <b>Endereço secreto no formato iCal</b> (só quem tem o link vê). Se a agenda for pública, o link público também serve.</li>
              <li>Cole aqui e toque em Conectar.</li>
            </ol>
            <p className="mt-2 text-xs text-vinho/55">O link fica salvo só neste navegador. O MOVA apenas lê os eventos — nada é alterado na sua agenda.</p>
          </details>
        </div>
      )}
    </Card>
  )
}
