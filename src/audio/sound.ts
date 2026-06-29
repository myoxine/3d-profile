// src/audio/sound.ts
// SFX UI PROSEDURAL via Web Audio API — tanpa file suara. Tiap bunyi = oscillator
// pendek dengan envelope cepat. Ringan, instan, dan bisa diganti file asli nanti.
//
// Catatan autoplay: browser melarang audio sebelum ada interaksi user, jadi
// AudioContext baru dibuat/di-resume saat pertama kali dibutuhkan (mis. klik).

import { useAudio } from '../store/useAudio'

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

type Tone = {
  freq: number
  dur: number
  type?: OscillatorType
  gain?: number
  /** geser frekuensi (Hz) sepanjang durasi: + naik, - turun */
  sweep?: number
}

function blip({ freq, dur, type = 'sine', gain = 0.05, sweep = 0 }: Tone) {
  if (useAudio.getState().muted) return
  const ac = getCtx()
  if (!ac) return
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (sweep) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + sweep), t + dur)
  // envelope: attack cepat lalu decay halus (hindari klik DC)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.03)
}

// Dua nada berurutan (mis. untuk "fly"/whoosh yang lebih berisi).
function chord(a: Tone, b: Tone, delay = 0.04) {
  blip(a)
  window.setTimeout(() => blip(b), delay * 1000)
}

export const sfx = {
  /** klik tombol UI biasa */
  click: () => blip({ freq: 430, dur: 0.08, type: 'triangle', gain: 0.045, sweep: 90 }),
  /** hover lembut (dipakai hemat) */
  hover: () => blip({ freq: 720, dur: 0.04, type: 'sine', gain: 0.018 }),
  /** kamera terbang ke area (naik) */
  whoosh: () => chord({ freq: 240, dur: 0.18, type: 'sine', gain: 0.04, sweep: 360 }, { freq: 480, dur: 0.12, type: 'sine', gain: 0.025, sweep: 200 }),
  /** buka panel/drawer */
  open: () => chord({ freq: 360, dur: 0.1, type: 'sine', gain: 0.04, sweep: 180 }, { freq: 560, dur: 0.1, type: 'sine', gain: 0.03, sweep: 160 }),
  /** tutup/keluar (turun) */
  close: () => blip({ freq: 480, dur: 0.14, type: 'sine', gain: 0.04, sweep: -260 }),
}

// Dipanggil sekali dari interaksi user pertama agar AudioContext "hangat".
export function primeAudio() {
  getCtx()
}
