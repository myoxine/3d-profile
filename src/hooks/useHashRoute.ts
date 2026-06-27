// src/hooks/useHashRoute.ts
// Deep link dua arah: URL hash <-> view kamera. Buka mis. ".../#experience"
// langsung mendarat di area itu, dan setiap perpindahan view memperbarui hash
// sehingga bisa di-bookmark / di-share.

import { useEffect } from 'react'
import { useFocus, type ViewName } from '../store/useFocus'

// slug URL <-> nama view internal
const VIEW_TO_SLUG: Record<ViewName, string> = {
  overview: 'home',
  photos: 'education',
  desk: 'experience',
  tv: 'video',
  books: 'tutorial',
  shelf: 'contact',
}
const SLUG_TO_VIEW = Object.fromEntries(
  Object.entries(VIEW_TO_SLUG).map(([v, s]) => [s, v as ViewName])
) as Record<string, ViewName>

function viewFromHash(): ViewName | null {
  const slug = window.location.hash.replace(/^#/, '')
  return SLUG_TO_VIEW[slug] ?? null
}

export function useHashRoute() {
  const view = useFocus((s) => s.view)
  const setView = useFocus((s) => s.setView)

  // saat load + saat hash diubah manual (back/forward) -> setel view
  useEffect(() => {
    const apply = () => {
      const v = viewFromHash()
      if (v) setView(v)
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [setView])

  // saat view berubah (klik menu/objek) -> perbarui hash tanpa menambah history
  useEffect(() => {
    const slug = VIEW_TO_SLUG[view]
    if (window.location.hash.replace(/^#/, '') !== slug) {
      window.history.replaceState(null, '', `#${slug}`)
    }
  }, [view])
}
