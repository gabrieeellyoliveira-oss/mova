/**
 * Camada de persistência do MOVAFIT.
 *
 * Toda leitura/escrita passa por um `StorageAdapter` (LocalStorage), então o app abre
 * na hora e funciona sem internet. Quando o Supabase está ligado, cada gravação também
 * vai para a tabela `mova_store` com o prefixo `fit:` (ver `lib/cloudSync.ts`).
 */
export interface StorageAdapter {
  load<T>(key: string): T | undefined
  save<T>(key: string, value: T): void
  remove(key: string): void
  keys(): string[]
}

const PREFIX = 'movafit:v1:'

/** Quem quer saber de cada gravação (a sincronização com o Supabase). */
let cloudSink: ((key: string) => void) | null = null
export const setCloudSink = (sink: ((key: string) => void) | null) => { cloudSink = sink }

/** Grava só no navegador, sem avisar a nuvem (usado ao baixar dados do Supabase). */
export function writeLocal<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (err) {
    console.warn('[MOVAFIT] não foi possível salvar', key, err)
  }
}

export const localStorageAdapter: StorageAdapter = {
  load<T>(key: string) {
    try {
      const raw = window.localStorage.getItem(PREFIX + key)
      return raw ? (JSON.parse(raw) as T) : undefined
    } catch {
      return undefined
    }
  },
  save<T>(key: string, value: T) {
    writeLocal(key, value)
    cloudSink?.(key)
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(PREFIX + key)
    } catch {
      /* ignore */
    }
  },
  keys() {
    try {
      return Object.keys(window.localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .map((k) => k.slice(PREFIX.length))
    } catch {
      return []
    }
  },
}

/** Fallback em memória (aba anônima, armazenamento bloqueado etc.) */
export const memoryAdapter = (): StorageAdapter => {
  const mem = new Map<string, string>()
  return {
    load: (k) => (mem.has(k) ? JSON.parse(mem.get(k)!) : undefined),
    save: (k, v) => void mem.set(k, JSON.stringify(v)),
    remove: (k) => void mem.delete(k),
    keys: () => [...mem.keys()],
  }
}

export const activeAdapter: StorageAdapter = localStorageAdapter
