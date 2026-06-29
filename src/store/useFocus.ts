// src/store/useFocus.ts
// State fokus kamera + overlay, dipakai BERSAMA oleh UI HTML (di luar Canvas)
// dan objek 3D (di dalam Canvas). Pakai zustand karena React Context tidak
// menyeberang batas react-three-fiber.

import { create } from 'zustand'

export type ViewName = 'overview' | 'photos' | 'tv' | 'desk' | 'shelf' | 'books'
export type PanelName = 'series' | null

type FocusState = {
  view: ViewName
  photo: string | null // src foto yang sedang diperbesar (modal)
  panel: PanelName // drawer samping yang aktif
  series: number | null // index series tutorial yang sedang dibuka
  touring: boolean // sedang menjalankan tour otomatis

  setView: (v: ViewName) => void
  openPhoto: (img: string) => void
  closePhoto: () => void
  openSeries: (i: number) => void // fokus books + drawer daftar artikel
  closePanel: () => void
  startTour: () => void
  stopTour: () => void
  reset: () => void
}

export const useFocus = create<FocusState>((set) => ({
  view: 'overview',
  photo: null,
  panel: null,
  series: null,
  touring: false,

  setView: (view) => set({ view }),
  openPhoto: (photo) => set({ photo, view: 'photos' }),
  closePhoto: () => set({ photo: null }),
  openSeries: (series) => set({ panel: 'series', series, view: 'books' }),
  closePanel: () => set({ panel: null, series: null }),
  startTour: () => set({ touring: true, panel: null, series: null, photo: null }),
  stopTour: () => set({ touring: false }),
  reset: () => set({ view: 'overview', photo: null, panel: null, series: null, touring: false }),
}))
