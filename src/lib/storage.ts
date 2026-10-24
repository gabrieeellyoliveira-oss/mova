/**
 * Camada de persistência do MOVA.
 *
 * Toda leitura/escrita passa por um `StorageAdapter`. Hoje usamos o LocalStorage;
 * para migrar para o Supabase basta implementar o mesmo contrato (ex.: uma tabela
 * por coleção, ou uma tabela `collections(key, value jsonb)`) e trocar o
 * `activeAdapter` abaixo — páginas e componentes não precisam mudar.
 */
export interface StorageAdapter {
  load<T>(key: string): T | undefined
  save<T>(key: string, value: T): void
  remove(key: string): void
  keys(): string[]
}

const PREFIX = 'mova:v1:'

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
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (err) {
      console.warn('[MOVA] não foi possível salvar', key, err)
    }
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
