// src/store/useFocus.ts
// State fokus kamera + overlay, dipakai BERSAMA oleh UI HTML (di luar Canvas)
// dan objek 3D (di dalam Canvas). Pakai zustand karena React Context tidak
// menyeberang batas react-three-fiber.

import { create } from 'zustand'

export type ViewName = 'overview' | 'photos' | 'tv' | 'desk' | 'shelf' | 'books'

type FocusState = {
  view: ViewName
  photo: string | null // src foto yang sedang diperbesar (modal)

  setView: (v: ViewName) => void
  openPhoto: (img: string) => void
  closePhoto: () => void
  reset: () => void
}

export const useFocus = create<FocusState>((set) => ({
  view: 'overview',
  photo: null,

  setView: (view) => set({ view }),
  openPhoto: (photo) => set({ photo, view: 'photos' }),
  closePhoto: () => set({ photo: null }),
  reset: () => set({ view: 'overview', photo: null }),
}))
