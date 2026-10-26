/** Diagnóstico temporário: confere a conexão com o Supabase (só informações públicas). */
export const config = { runtime: 'edge' }

export default async function handler(): Promise<Response> {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return Response.json({ configured: false })
  const headers = { apikey: key, authorization: `Bearer ${key}` }
  const settings = await fetch(`${url}/auth/v1/settings`, { headers }).then(async (r) => ({ status: r.status, body: r.ok ? await r.json() : await r.text() })).catch((e) => ({ status: 0, body: String(e) }))
  const table = await fetch(`${url}/rest/v1/mova_store?select=key&limit=1`, { headers }).then(async (r) => ({ status: r.status, body: await r.text() })).catch((e) => ({ status: 0, body: String(e) }))
  const s = settings.body as { disable_signup?: boolean; mailer_autoconfirm?: boolean; external?: { email?: boolean } }
  return Response.json({
    configured: true,
    auth: settings.status === 200 ? { email: s.external?.email, signupEnabled: !s.disable_signup, confirmEmail: !s.mailer_autoconfirm } : settings,
    table: table.status === 200 ? { exists: true, rlsHidesRows: table.body === '[]' } : { exists: false, status: table.status, body: table.body.slice(0, 300) },
  })
}
