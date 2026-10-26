import { Link } from 'react-router-dom'
import { ExternalLink, Linkedin, Plus, Undo2 } from 'lucide-react'
import { linkedinStore } from '@/store/db'
import { useStore } from '@/store/createStore'
import { today } from '@/utils/date'
import { ratio } from '@/utils/format'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { logLinkedInPost, postsThisMonth, undoLinkedInPost } from '@/components/integrations/linkedin'
import { WidgetHeader } from './WidgetHeader'

/** LinkedIn no painel: perfil, números e posts do mês. */
export function LinkedInWidget() {
  const d = useStore(linkedinStore)
  if (!d.profileUrl)
    return (
      <Card className="flex flex-col">
        <WidgetHeader title="LinkedIn" />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
          <Linkedin size={30} className="text-[#0A66C2]" />
          <p className="text-sm text-vinho/65">Conecte seu perfil pra acompanhar seguidores e posts do mês.</p>
          <Link to="/perfil?secao=conexoes" className="text-sm font-bold text-cereja hover:underline">Conectar LinkedIn →</Link>
        </div>
      </Card>
    )
  const posts = postsThisMonth(d)
  const postedToday = d.posts.includes(today())
  return (
    <Card className="flex flex-col">
      <WidgetHeader title="LinkedIn" to="/perfil?secao=conexoes" linkLabel="Editar" />
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border-2 border-px-line bg-[#0A66C2] text-white shadow-pixel-sm"><Linkedin size={22} /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-tinta">{d.name ?? d.profileUrl.replace(/^https:\/\/www\.linkedin\.com\/(in|company)\//, '')}</p>
          {d.headline && <p className="truncate text-xs text-vinho/60">{d.headline}</p>}
        </div>
        <a href={d.profileUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-cereja hover:underline">Abrir <ExternalLink size={12} /></a>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/60 p-2.5"><p className="font-pixel text-[11px] font-semibold uppercase text-vinho/60">Seguidores</p><p className="text-xl font-extrabold text-vinho">{d.followers?.toLocaleString('pt-BR') ?? '—'}</p></div>
        <div className="rounded-lg bg-white/60 p-2.5"><p className="font-pixel text-[11px] font-semibold uppercase text-vinho/60">Conexões</p><p className="text-xl font-extrabold text-vinho">{d.connections?.toLocaleString('pt-BR') ?? '—'}</p></div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs"><span className="font-semibold text-vinho">Posts no mês</span><span className="font-pixel font-semibold text-vinho">{posts}/{d.postsGoal}</span></div>
        <Progress value={ratio(posts, d.postsGoal)} color="#0A66C2" height={7} className="mt-1" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="soft" onClick={logLinkedInPost}><Plus size={14} /> Publiquei hoje</Button>
        {postedToday && <button onClick={undoLinkedInPost} className="inline-flex items-center gap-1 text-xs font-semibold text-vinho/55 hover:text-vinho"><Undo2 size={12} /> desfazer</button>}
      </div>
    </Card>
  )
}
