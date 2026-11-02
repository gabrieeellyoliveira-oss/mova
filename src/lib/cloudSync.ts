/**
 * Sincronização com o Supabase.
 *
 * Cada chave do armazenamento local (uma coleção ou um store) vira uma linha em
 * `mova_store (user_id, key, value jsonb)`, protegida por RLS. O app continua lendo do
 * navegador (abre na hora e funciona sem internet); as mudanças sobem em lote e as de
 * outros aparelhos chegam por tempo real ou ao voltar para a aba.
 */
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { localStorageAdapter, setCloudSink, writeLocal } from './storage'
import { createPersistedStore, hydrateStore, snapshotStores } from '@/store/createStore'
import { resetAll } from '@/store/db'

const TABLE = 'mova_store'
/** Fica só neste aparelho (cache que se refaz sozinho). */
const LOCAL_ONLY = new Set(['googleCalendarCache'])
const DIRTY_KEY = 'mova:sync:dirty'
const OWNER_KEY = 'mova:sync:owner'

export type SyncState = 'off' | 'syncing' | 'ok' | 'offline'
export const syncStatus = createPersistedStore<{ state: SyncState; at?: string }>('syncStatus', () => ({ state: 'off' }))
LOCAL_ONLY.add('syncStatus')

let userId: string | null = null
let channel: RealtimeChannel | null = null
let timer: ReturnType<typeof setTimeout> | undefined
let lastPull = 0
const version = new Map<string, number>()
/** Horários dos envios feitos por este aparelho (por chave), para ignorar ecos atrasados de envios antigos. */
const sentAt = new Map<string, number[]>()
const dirty = new Set<string>(readDirty())

function readDirty(): string[] {
  try { return JSON.parse(localStorage.getItem(DIRTY_KEY) ?? '[]') } catch { return [] }
}
const saveDirty = () => { try { localStorage.setItem(DIRTY_KEY, JSON.stringify([...dirty])) } catch { /* bloqueado */ } }
const setState = (state: SyncState) => syncStatus.set({ state, at: state === 'ok' ? new Date().toISOString() : syncStatus.get().at })
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Eco atrasado de um envio antigo deste aparelho (chegou depois de um envio mais novo): ignorar. */
function staleEcho(key: string, at?: string) {
  const t = at ? Date.parse(at) : NaN
  const mine = Number.isFinite(t) ? sentAt.get(key) : undefined
  return !!mine && mine.includes(t) && mine[mine.length - 1] !== t
}

function apply(key: string, value: unknown, at?: string) {
  if (LOCAL_ONLY.has(key) || dirty.has(key)) return // mudança local ainda não enviada vence
  if (staleEcho(key, at)) return
  if (same(localStorageAdapter.load(key), value)) return
  writeLocal(key, value)
  hydrateStore(key, value)
}

function queue(key: string) {
  if (LOCAL_ONLY.has(key) || !userId) return
  dirty.add(key)
  version.set(key, (version.get(key) ?? 0) + 1)
  saveDirty()
  clearTimeout(timer)
  timer = setTimeout(flush, 800)
}

/** Envia o que mudou. */
export async function flush() {
  if (!supabase || !userId || !dirty.size) return
  const keys = [...dirty]
  const sent = new Map(keys.map((k) => [k, version.get(k) ?? 0]))
  const now = new Date().toISOString()
  const rows = keys
    .map((key) => ({ user_id: userId!, key, value: localStorageAdapter.load(key), updated_at: now }))
    .filter((r) => r.value !== undefined)
  setState('syncing')
  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'user_id,key' })
  if (error) { setState('offline'); return }
  keys.forEach((k) => sentAt.set(k, [...(sentAt.get(k) ?? []), Date.parse(now)].slice(-10)))
  keys.forEach((k) => { if ((version.get(k) ?? 0) === sent.get(k)) dirty.delete(k) }) // não perde edição feita durante o envio
  saveDirty()
  setState(dirty.size ? 'syncing' : 'ok')
  if (dirty.size) timer = setTimeout(flush, 800)
}

/** Baixa tudo da nuvem. Devolve quantas linhas existem (0 = conta nova). */
async function pull(): Promise<number> {
  if (!supabase) return 0
  const { data, error } = await supabase.from(TABLE).select('key, value, updated_at')
  if (error) throw error
  data.forEach((row) => apply(row.key as string, row.value, row.updated_at as string | undefined))
  lastPull = Date.now()
  return data.length
}

const withTimeout = <T,>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])

/** Começa a sincronizar para esta conta. Resolve quando os dados da nuvem já estão na tela. */
export async function startSync(uid: string) {
  if (!supabase || userId === uid) return
  userId = uid
  setState('syncing')
  // outra conta já usou este navegador: não mistura os dados
  const owner = (() => { try { return localStorage.getItem(OWNER_KEY) } catch { return null } })()
  if (owner && owner !== uid) { dirty.clear(); saveDirty(); resetAll() }
  try { localStorage.setItem(OWNER_KEY, uid) } catch { /* bloqueado */ }
  setCloudSink(queue)
  try {
    const rows = await withTimeout(pull(), 8000)
    if (rows === 0) {
      // primeira vez na nuvem: sobe tudo o que existe neste navegador (inclusive o que nunca foi editado)
      snapshotStores().forEach(([k, value]) => {
        if (LOCAL_ONLY.has(k)) return
        if (localStorageAdapter.load(k) === undefined) writeLocal(k, value)
        dirty.add(k)
      })
      saveDirty()
    }
    await flush()
    if (!dirty.size) setState('ok')
  } catch {
    setState('offline')
  }
  channel = supabase
    .channel(`mova-${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE, filter: `user_id=eq.${uid}` }, (payload) => {
      const row = payload.new as { key?: string; value?: unknown; updated_at?: string }
      if (row?.key) apply(row.key, row.value, row.updated_at)
    })
    .subscribe()
}

export async function stopSync() {
  await flush().catch(() => {})
  if (channel) await supabase?.removeChannel(channel)
  channel = null
  userId = null
  setCloudSink(null)
  setState('off')
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { flush() })
  document.addEventListener('visibilitychange', () => {
    if (!userId) return
    if (document.visibilityState === 'hidden') flush()
    else if (Date.now() - lastPull > 20_000) pull().then(() => setState(dirty.size ? 'syncing' : 'ok')).catch(() => setState('offline'))
  })
}
