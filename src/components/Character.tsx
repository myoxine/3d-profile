/*
Karakter pria mengetik (Typing). Avatar lengkap bertekstur (17 tekstur):
mata, bulu mata, kacamata, rambut, pakaian — semua sudah punya material asli,
jadi tidak perlu diwarnai/dibuat mata-alis manual.
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
    glasses: THREE.SkinnedMesh
    haircut: THREE.SkinnedMesh
    outfit_bottom: THREE.SkinnedMesh
    outfit_shoes: THREE.SkinnedMesh
    outfit_top: THREE.SkinnedMesh
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
    glasses: THREE.MeshStandardMaterial
    haircut: THREE.MeshStandardMaterial
    outfit_bottom: THREE.MeshStandardMaterial
    outfit_shoes: THREE.MeshStandardMaterial
    outfit_top: THREE.MeshStandardMaterial
    AvatarEyelashes: THREE.MeshStandardMaterial
    AvatarHead: THREE.MeshStandardMaterial
    AvatarTeethLower: THREE.MeshStandardMaterial
    AvatarLeftEyeball: THREE.MeshStandardMaterial
    AvatarRightEyeball: THREE.MeshStandardMaterial
  }
}

export function Model(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/models/character.glb')
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
        <skinnedMesh geometry={nodes.glasses.geometry} material={materials.glasses} skeleton={nodes.glasses.skeleton} />
        <skinnedMesh geometry={nodes.haircut.geometry} material={materials.haircut} skeleton={nodes.haircut.skeleton} castShadow />
        <skinnedMesh geometry={nodes.outfit_bottom.geometry} material={materials.outfit_bottom} skeleton={nodes.outfit_bottom.skeleton} castShadow />
        <skinnedMesh geometry={nodes.outfit_shoes.geometry} material={materials.outfit_shoes} skeleton={nodes.outfit_shoes.skeleton} castShadow />
        <skinnedMesh geometry={nodes.outfit_top.geometry} material={materials.outfit_top} skeleton={nodes.outfit_top.skeleton} castShadow />
        <skinnedMesh geometry={nodes.AvatarEyelashes.geometry} material={materials.AvatarEyelashes} skeleton={nodes.AvatarEyelashes.skeleton} morphTargetDictionary={nodes.AvatarEyelashes.morphTargetDictionary} morphTargetInfluences={nodes.AvatarEyelashes.morphTargetInfluences} />
        <skinnedMesh geometry={nodes.AvatarHead.geometry} material={materials.AvatarHead} skeleton={nodes.AvatarHead.skeleton} morphTargetDictionary={nodes.AvatarHead.morphTargetDictionary} morphTargetInfluences={nodes.AvatarHead.morphTargetInfluences} castShadow />
        <skinnedMesh geometry={nodes.AvatarTeethLower.geometry} material={materials.AvatarTeethLower} skeleton={nodes.AvatarTeethLower.skeleton} morphTargetDictionary={nodes.AvatarTeethLower.morphTargetDictionary} morphTargetInfluences={nodes.AvatarTeethLower.morphTargetInfluences} />
        <skinnedMesh geometry={nodes.AvatarLeftEyeball.geometry} material={materials.AvatarLeftEyeball} skeleton={nodes.AvatarLeftEyeball.skeleton} />
        <skinnedMesh geometry={nodes.AvatarRightEyeball.geometry} material={materials.AvatarRightEyeball} skeleton={nodes.AvatarRightEyeball.skeleton} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/character.glb')
