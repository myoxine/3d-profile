// src/utils/cleanAnimations.ts
// Avatar Ready Player Me membawa clip "mixamo.com" yang menyertakan track
// morph-target WAJAH (AvatarEyelashes/AvatarHead/AvatarTeethLower
// .morphTargetInfluences). Mesh-mesh itu tidak dirender di komponen avatar,
// jadi three.js melempar warning "No target node found for track: ...".
// Buang track morph tersebut: animasi TUBUH (skeletal) tetap utuh, console bersih.

import * as THREE from 'three'

export function stripMorphTracks(clips: THREE.AnimationClip[]): THREE.AnimationClip[] {
  return clips.map((clip) => {
    const c = clip.clone()
    c.tracks = c.tracks.filter((t) => !t.name.endsWith('.morphTargetInfluences'))
    return c
  })
}
