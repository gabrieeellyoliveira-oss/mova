/**
 * Sincronização com o Supabase (o mesmo projeto e a mesma conta do mova).
 *
 * Cada chave local (ex.: `workouts`) vira uma linha em `mova_store` com o prefixo `fit:`
 * (ex.: `fit:workouts`), protegida por RLS. Assim os dados do MOVAFIT ficam ao lado dos
 * do mova sem se misturar. O app lê do navegador (abre na hora e funciona sem internet);
 * as mudanças sobem em lote e as de outros aparelhos chegam por tempo real ou ao voltar à aba.
 */
import { useSyncExternalStore } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { localStorageAdapter, setCloudSink, writeLocal } from './storage'
import { createPersistedStore, hydrateStore, snapshotStores } from '@/store/createStore'
import { resetAll } from '@/store/db'

const TABLE = 'mova_store'
const CLOUD_PREFIX = 'fit:'
/**
 * Chaves que são DO MOVA e o MOVAFIT também usa (sem prefixo): a evolução do corpo.
 * Atualizou num app, aparece no outro. Nunca sobem na "primeira vez" (para não apagar o que o mova já tem)
 * e só podem ser editadas depois de baixar a versão da nuvem (`sharedReady`).
 */
export const SHARED = new Set(['bodyCheckins'])
const toCloud = (key: string) => (SHARED.has(key) ? key : CLOUD_PREFIX + key)
const fromCloud = (key: string) => (key.startsWith(CLOUD_PREFIX) ? key.slice(CLOUD_PREFIX.length) : SHARED.has(key) ? key : null)

/** Já baixou da nuvem nesta sessão (ou está sem nuvem): pode editar os dados compartilhados com o mova. */
let ready = !supabase
const readyListeners = new Set<() => void>()
const setReady = (v: boolean) => { ready = v; readyListeners.forEach((l) => l()) }
export const useSharedReady = () => useSyncExternalStore((l) => { readyListeners.add(l); return () => { readyListeners.delete(l) } }, () => ready)
const LOCAL_ONLY = new Set<string>()
const DIRTY_KEY = 'movafit:sync:dirty'
const OWNER_KEY = 'movafit:sync:owner'

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

function staleEcho(key: string, at?: string) {
  const t = at ? Date.parse(at) : NaN
  const mine = Number.isFinite(t) ? sentAt.get(key) : undefined
  return !!mine && mine.includes(t) && mine[mine.length - 1] !== t
}

/** Chegou uma linha da nuvem (chave já sem o prefixo). */
function apply(key: string, value: unknown, at?: string) {
  if (LOCAL_ONLY.has(key) || dirty.has(key)) return // mudança local ainda não enviada vence
  if (staleEcho(key, at)) return
  if (same(localStorageAdapter.load(key), value)) return
  writeLocal(key, value)
  hydrateStore(key, value)
}

function queue(key: string) {
  if (LOCAL_ONLY.has(key) || !userId) return
  if (SHARED.has(key) && !ready) return // sem a versão da nuvem, não sobrescreve o que está no mova
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
    .map((key) => ({ user_id: userId!, key: toCloud(key), value: localStorageAdapter.load(key), updated_at: now }))
    .filter((r) => r.value !== undefined)
  setState('syncing')
  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'user_id,key' })
  if (error) { setState('offline'); return }
  keys.forEach((k) => sentAt.set(k, [...(sentAt.get(k) ?? []), Date.parse(now)].slice(-10)))
  keys.forEach((k) => { if ((version.get(k) ?? 0) === sent.get(k)) dirty.delete(k) })
  saveDirty()
  setState(dirty.size ? 'syncing' : 'ok')
  if (dirty.size) timer = setTimeout(flush, 800)
}

/** Baixa as linhas do MOVAFIT e as compartilhadas com o mova. Devolve quantas `fit:` existem (0 = primeira vez aqui). */
async function pull(): Promise<number> {
  if (!supabase) return 0
  const [own, shared] = await Promise.all([
    supabase.from(TABLE).select('key, value, updated_at').like('key', `${CLOUD_PREFIX}%`),
    supabase.from(TABLE).select('key, value, updated_at').in('key', [...SHARED]),
  ])
  if (own.error) throw own.error
  if (shared.error) throw shared.error
  ;[...own.data, ...shared.data].forEach((row) => {
    const key = fromCloud(row.key as string)
    if (key) apply(key, row.value, row.updated_at as string | undefined)
  })
  lastPull = Date.now()
  setReady(true)
  return own.data.length
}

const withTimeout = <T,>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])

/** Começa a sincronizar para esta conta. Resolve quando os dados da nuvem já estão na tela. */
export async function startSync(uid: string) {
  if (!supabase || userId === uid) return
  userId = uid
  setState('syncing')
  const owner = (() => { try { return localStorage.getItem(OWNER_KEY) } catch { return null } })()
  if (owner && owner !== uid) { dirty.clear(); saveDirty(); resetAll() }
  try { localStorage.setItem(OWNER_KEY, uid) } catch { /* bloqueado */ }
  setCloudSink(queue)
  try {
    const rows = await withTimeout(pull(), 8000)
    if (rows === 0) {
      snapshotStores().forEach(([k, value]) => {
        if (LOCAL_ONLY.has(k) || SHARED.has(k)) return
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
    .channel(`movafit-${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE, filter: `user_id=eq.${uid}` }, (payload) => {
      const row = payload.new as { key?: string; value?: unknown; updated_at?: string }
      const key = row?.key ? fromCloud(row.key) : null
      if (key) apply(key, row.value, row.updated_at)
    })
    .subscribe()
}

export async function stopSync() {
  await flush().catch(() => {})
  if (channel) await supabase?.removeChannel(channel)
  channel = null
  userId = null
  setCloudSink(null)
  setReady(!supabase)
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
