/**
 * Proxy de leitura do Google Agenda (.ics). O navegador não consegue ler o .ics
 * direto do Google (CORS), então esta função busca e devolve o texto.
 * Só aceita endereços do Google Agenda — não é um proxy aberto.
 */
export const config = { runtime: 'edge' }

const ALLOWED = new Set(['calendar.google.com', 'www.google.com'])
const MAX_BYTES = 5_000_000

export default async function handler(req: Request): Promise<Response> {
  const target = new URL(req.url).searchParams.get('url') ?? ''
  let url: URL
  try {
    url = new URL(target)
  } catch {
    return text('Link inválido.', 400)
  }
  if (url.protocol !== 'https:' || !ALLOWED.has(url.hostname) || !url.pathname.startsWith('/calendar/ical/')) return text('Só links do Google Agenda.', 400)

  const res = await fetch(url.toString(), { headers: { accept: 'text/calendar' }, redirect: 'follow' })
  if (!res.ok) return text(`Google respondeu ${res.status}.`, res.status === 404 ? 404 : 502)
  const body = await res.text()
  if (body.length > MAX_BYTES) return text('Agenda grande demais.', 413)
  if (!body.includes('BEGIN:VCALENDAR')) return text('Esse link não é de uma agenda pública ou secreta.', 422)
  return new Response(body, {
    headers: { 'content-type': 'text/calendar; charset=utf-8', 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}

const text = (msg: string, status: number) => new Response(msg, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } })
