import { Link } from 'react-router-dom'
import { ExternalLink, Linkedin, Plus, Undo2 } from 'lucide-react'
import { linkedinStore } from '@/store/db'
import { useStore } from '@/store/createStore'
import { today } from '@/utils/date'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { logLinkedInPost, postingAdvice, undoLinkedInPost } from '@/components/integrations/linkedin'
import { WidgetHeader } from './WidgetHeader'

/** LinkedIn no painel: perfil, números e a análise de quando postar de novo. */
export function LinkedInWidget() {
  const d = useStore(linkedinStore)
  if (!d.profileUrl)
    return (
      <Card className="flex flex-col">
        <WidgetHeader title="LinkedIn" />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
          <Linkedin size={30} className="text-[#0C0A0E]" />
          <p className="text-sm text-vinho/65">Conecte seu perfil pra acompanhar seguidores e saber quando postar.</p>
          <Link to="/perfil?secao=conexoes" className="text-sm font-bold text-cereja hover:underline">Conectar LinkedIn →</Link>
        </div>
      </Card>
    )
  const advice = postingAdvice(d.posts)
  const postedToday = d.posts.includes(today())
  return (
    <Card className="flex flex-col">
      <WidgetHeader title="LinkedIn" to="/perfil?secao=conexoes" linkLabel="Editar" />
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#0C0A0E] text-white"><Linkedin size={22} /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-tinta">{d.name ?? d.profileUrl.replace(/^https:\/\/www\.linkedin\.com\/(in|company)\//, '')}</p>
          {d.headline && <p className="truncate text-xs text-vinho/60">{d.headline}</p>}
        </div>
        <a href={d.profileUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-cereja hover:underline">Abrir <ExternalLink size={12} /></a>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-rosa-50 p-3"><p className="text-[11px] font-semibold uppercase text-vinho/60">Seguidores</p><p className="text-xl font-extrabold text-vinho">{d.followers?.toLocaleString('pt-BR') ?? '—'}</p></div>
        <div className="rounded-2xl bg-rosa-50 p-3"><p className="text-[11px] font-semibold uppercase text-vinho/60">Conexões</p><p className="text-xl font-extrabold text-vinho">{d.connections?.toLocaleString('pt-BR') ?? '—'}</p></div>
      </div>
      <div className="mt-3 rounded-2xl border-2 border-ink bg-lavanda-100 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-tinta/60">Próximo post</p>
        <p className="mt-1 font-serif text-2xl font-bold">{advice.when} <span className="font-sans text-sm font-semibold text-tinta/60">· 8h–10h</span></p>
        <p className="mt-1.5 text-sm leading-snug text-tinta/75">{advice.reason}</p>
        {advice.rhythm && <p className="mt-2 text-xs text-tinta/55">{advice.rhythm}</p>}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="soft" onClick={logLinkedInPost}><Plus size={14} /> Publiquei hoje</Button>
        {postedToday && <button onClick={undoLinkedInPost} className="inline-flex items-center gap-1 text-xs font-semibold text-vinho/55 hover:text-vinho"><Undo2 size={12} /> desfazer</button>}
      </div>
    </Card>
  )
}
