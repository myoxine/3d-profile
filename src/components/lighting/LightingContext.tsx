// src/components/lighting/LightingContext.tsx
// Pusat state pencahayaan: dipakai bersama oleh saklar (LightSwitch) dan
// setiap lampu (ceiling / standing / table) serta preset siang/malam.

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type TimeOfDay = 'day' | 'night'

export interface LightingState {
  // status nyala/mati tiap lampu
  ceilingOn: boolean
  standingOn: boolean
  tableOn: boolean
  sofaOn: boolean
  // suasana ruangan (mengikuti dark mode sistem)
  timeOfDay: TimeOfDay

  // aksi
  toggleCeiling: () => void
  toggleStanding: () => void
  toggleTable: () => void
  toggleSofa: () => void
}

const DARK_MODE_QUERY = '(prefers-color-scheme: dark)'

// Baca preferensi dark mode komputer saat pertama render.
function getSystemTimeOfDay(): TimeOfDay {
  if (typeof window === 'undefined' || !window.matchMedia) return 'day'
  return window.matchMedia(DARK_MODE_QUERY).matches ? 'night' : 'day'
}

const LightingContext = createContext<LightingState | null>(null)

export function LightingProvider({ children }: { children: ReactNode }) {
  // Saat dark mode (malam), default-nya lampu PLAFON menyala supaya ruangan
  // tidak gelap; lampu lain tetap mati.
  const startNight = getSystemTimeOfDay() === 'night'
  const [ceilingOn, setCeiling] = useState(startNight)
  const [standingOn, setStanding] = useState(false)
  const [tableOn, setTable] = useState(false)
  const [sofaOn, setSofa] = useState(false)

  // Siang/malam mengikuti dark mode sistem, dan ikut berubah secara live
  // kalau pengguna mengganti tema komputernya.
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getSystemTimeOfDay)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(DARK_MODE_QUERY)
    const handler = (e: MediaQueryListEvent) => {
      setTimeOfDay(e.matches ? 'night' : 'day')
      // ganti ke malam -> nyalakan plafon; ke siang -> matikan (default sesuai mode)
      setCeiling(e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const value = useMemo<LightingState>(
    () => ({
      ceilingOn,
      standingOn,
      tableOn,
      sofaOn,
      timeOfDay,
      toggleCeiling: () => setCeiling((v) => !v),
      toggleStanding: () => setStanding((v) => !v),
      toggleTable: () => setTable((v) => !v),
      toggleSofa: () => setSofa((v) => !v),
    }),
    [ceilingOn, standingOn, tableOn, sofaOn, timeOfDay]
  )

  return (
    <LightingContext.Provider value={value}>
      {children}
    </LightingContext.Provider>
  )
}

export function useLighting() {
  const ctx = useContext(LightingContext)
  if (!ctx) {
    throw new Error('useLighting harus dipakai di dalam <LightingProvider>')
  }
  return ctx
}
