// src/store/useAudio.ts
// State suara global (mute) yang dibagikan UI HTML & objek 3D. Pakai zustand
// (lintas batas Canvas) + persist preferensi ke localStorage.

import { create } from 'zustand'

const KEY = 'hadi-3d-muted'

function readMuted(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

type AudioState = {
  muted: boolean
  toggleMute: () => void
}

export const useAudio = create<AudioState>((set) => ({
  muted: readMuted(),
  toggleMute: () =>
    set((s) => {
      const muted = !s.muted
      try {
        window.localStorage.setItem(KEY, muted ? '1' : '0')
      } catch {
        /* abaikan storage error */
      }
      return { muted }
    }),
}))
