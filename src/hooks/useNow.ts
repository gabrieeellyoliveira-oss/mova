import { useEffect, useState } from 'react'

/** Re-renderiza periodicamente (para cumprimentos e "hoje" que mudam com o tempo) */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
