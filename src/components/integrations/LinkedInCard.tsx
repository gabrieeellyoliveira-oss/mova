import { useState } from 'react'
import { Linkedin, Unlink } from 'lucide-react'
import { linkedinStore } from '@/store/db'
import { useStore } from '@/store/createStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, FormGrid, Input } from '@/components/ui/Form'
import { normalizeLinkedIn, updateLinkedIn } from './linkedin'

const num = (v: string) => (v.trim() === '' ? undefined : Math.max(0, Number(v.replace(/\D/g, '')) || 0))

/** Conectar o LinkedIn pelo link do perfil (o LinkedIn não libera os dados do perfil para apps pessoais). */
export function LinkedInCard() {
  const d = useStore(linkedinStore)
  const [f, setF] = useState({ url: d.profileUrl, name: d.name ?? '', headline: d.headline ?? '', followers: d.followers?.toString() ?? '', connections: d.connections?.toString() ?? '', postsGoal: String(d.postsGoal) })
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const save = () => {
    setError(null)
    const url = normalizeLinkedIn(f.url)
    if (!url) return setError('Cole o link do seu perfil, tipo linkedin.com/in/seu-nome.')
    updateLinkedIn({ profileUrl: url, name: f.name.trim() || undefined, headline: f.headline.trim() || undefined, followers: num(f.followers), connections: num(f.connections), postsGoal: num(f.postsGoal) ?? 4 })
    setF((p) => ({ ...p, url }))
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }
  const disconnect = () => {
    linkedinStore.set({ profileUrl: '', postsGoal: d.postsGoal, posts: d.posts })
    setF({ url: '', name: '', headline: '', followers: '', connections: '', postsGoal: String(d.postsGoal) })
  }

  return (
    <Card>
      <CardHeader icon={<Linkedin size={18} />} title="LinkedIn" subtitle={d.profileUrl ? 'conectado pelo link do perfil' : 'conecte pelo link do seu perfil'} />
      <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-3">
        <Field label="Link do perfil"><Input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="linkedin.com/in/seu-nome" /></Field>
        <FormGrid>
          <Field label="Nome (opcional)"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Gabi Oliveira" /></Field>
          <Field label="Título (opcional)"><Input value={f.headline} onChange={(e) => setF({ ...f, headline: e.target.value })} placeholder="UX Writer · Design" /></Field>
          <Field label="Seguidores"><Input inputMode="numeric" value={f.followers} onChange={(e) => setF({ ...f, followers: e.target.value })} placeholder="0" /></Field>
          <Field label="Conexões"><Input inputMode="numeric" value={f.connections} onChange={(e) => setF({ ...f, connections: e.target.value })} placeholder="0" /></Field>
        </FormGrid>
        {error && <p role="alert" className="text-sm font-medium text-cereja"><span className="font-bold">! </span>{error}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit">{d.profileUrl ? 'Salvar' : 'Conectar'}</Button>
          {d.profileUrl && <Button variant="ghost" onClick={disconnect}><Unlink size={14} /> Desconectar</Button>}
          {saved && <span className="text-sm font-semibold text-oliva-600">Salvo ✓</span>}
        </div>
        <p className="text-xs text-vinho/55">O LinkedIn não deixa sites pessoais lerem o perfil automaticamente (só apps aprovados pela empresa). Por isso o MOVA guarda o link e os números que você atualiza — e mostra tudo no painel.</p>
      </form>
    </Card>
  )
}
