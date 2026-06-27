// src/hooks/useMediaQuery.ts
// Hook kecil untuk bereaksi terhadap CSS media query dari React (di luar Canvas).
// Dipakai untuk layout responsif (menu) & quality tier (mobile) tanpa library.

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange() // sinkronkan saat query berubah
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

// Breakpoint umum yang dipakai di seluruh app.
export const useIsMobile = () => useMediaQuery('(max-width: 640px)')
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)')
// Layar kecil ATAU kasar (jari) — sasaran quality tier hemat GPU.
export const useIsLowPower = () =>
  useMediaQuery('(max-width: 820px), (pointer: coarse)')
