/*
Karakter wanita duduk (Sitting). Avatar lengkap bertekstur (12 tekstur):
mata, bulu mata, rambut, pakaian — material asli semua, jadi tidak perlu
diwarnai / dibuat mata manual.
Dibersihkan dari gltfjsx + auto-play klip 'mixamo.com'.
*/

import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import type { JSX } from 'react'
import { useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import type { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    AvatarBody: THREE.SkinnedMesh
    AvatarTeethUpper: THREE.SkinnedMesh
    haircut: THREE.SkinnedMesh
    outfit: THREE.SkinnedMesh
    AvatarEyelashes: THREE.SkinnedMesh
    AvatarHead: THREE.SkinnedMesh
    AvatarTeethLower: THREE.SkinnedMesh
    AvatarLeftEyeball: THREE.SkinnedMesh
    AvatarRightEyeball: THREE.SkinnedMesh
    Hips: THREE.Bone
  }
  materials: {
    AvatarBody: THREE.MeshStandardMaterial
    AvatarTeethUpper: THREE.MeshStandardMaterial
    haircut: THREE.MeshStandardMaterial
    outfit: THREE.MeshStandardMaterial
    AvatarEyelashes: THREE.MeshStandardMaterial
    AvatarHead: THREE.MeshStandardMaterial
    AvatarTeethLower: THREE.MeshStandardMaterial
    AvatarLeftEyeball: THREE.MeshStandardMaterial
    AvatarRightEyeball: THREE.MeshStandardMaterial
  }
}

export function Model(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/models/woman.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    const action = actions['mixamo.com']
    if (!action) return
    action.reset().fadeIn(0.3).play()
    return () => {
      action.fadeOut(0.2)
    }
  }, [actions])

  return (
    <group ref={group} {...props} dispose={null}>
      <group scale={100}>
        <primitive object={nodes.Hips} />
        <skinnedMesh geometry={nodes.AvatarBody.geometry} material={materials.AvatarBody} skeleton={nodes.AvatarBody.skeleton} castShadow />
        <skinnedMesh geometry={nodes.AvatarTeethUpper.geometry} material={materials.AvatarTeethUpper} skeleton={nodes.AvatarTeethUpper.skeleton} />
        <skinnedMesh geometry={nodes.haircut.geometry} material={materials.haircut} skeleton={nodes.haircut.skeleton} castShadow />
        <skinnedMesh geometry={nodes.outfit.geometry} material={materials.outfit} skeleton={nodes.outfit.skeleton} castShadow />
        <skinnedMesh geometry={nodes.AvatarEyelashes.geometry} material={materials.AvatarEyelashes} skeleton={nodes.AvatarEyelashes.skeleton} morphTargetDictionary={nodes.AvatarEyelashes.morphTargetDictionary} morphTargetInfluences={nodes.AvatarEyelashes.morphTargetInfluences} />
        <skinnedMesh geometry={nodes.AvatarHead.geometry} material={materials.AvatarHead} skeleton={nodes.AvatarHead.skeleton} morphTargetDictionary={nodes.AvatarHead.morphTargetDictionary} morphTargetInfluences={nodes.AvatarHead.morphTargetInfluences} castShadow />
        <skinnedMesh geometry={nodes.AvatarTeethLower.geometry} material={materials.AvatarTeethLower} skeleton={nodes.AvatarTeethLower.skeleton} morphTargetDictionary={nodes.AvatarTeethLower.morphTargetDictionary} morphTargetInfluences={nodes.AvatarTeethLower.morphTargetInfluences} />
        <skinnedMesh geometry={nodes.AvatarLeftEyeball.geometry} material={materials.AvatarLeftEyeball} skeleton={nodes.AvatarLeftEyeball.skeleton} />
        <skinnedMesh geometry={nodes.AvatarRightEyeball.geometry} material={materials.AvatarRightEyeball} skeleton={nodes.AvatarRightEyeball.skeleton} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/woman.glb')
