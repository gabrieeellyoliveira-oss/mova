import { useEffect, useState } from 'react'

/** Fortaleza (CE) — cidade dos lugares cadastrados da Gabi. */
const LAT = -3.73
const LON = -38.52
const KEY = 'mova:weather'
const TTL = 30 * 60_000

export interface Weather { temp: number; code: number; at: number }

/** Temperatura atual (Open-Meteo, sem chave). Se falhar, simplesmente não mostra. */
export function useWeather(): Weather | null {
  const [w, setW] = useState<Weather | null>(() => {
    try {
      const c = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Weather | null
      return c && Date.now() - c.at < TTL ? c : null
    } catch { return null }
  })
  useEffect(() => {
    if (w) return
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&timezone=America%2FFortaleza`
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const next = { temp: Math.round(d.current.temperature_2m), code: d.current.weather_code as number, at: Date.now() }
        setW(next)
        try { sessionStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
      })
      .catch(() => {})
  }, [w])
  return w
}

/** Códigos WMO → tipo de ícone */
export const weatherKind = (code: number) => (code <= 1 ? 'sol' : code <= 3 ? 'nuvem' : code >= 51 ? 'chuva' : 'nuvem')
