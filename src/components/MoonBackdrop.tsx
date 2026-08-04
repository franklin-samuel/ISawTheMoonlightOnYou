import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import './MoonBackdrop.css'

const MOON_TEXTURE_URL =
  'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'

const MOON_POSITION: [number, number, number] = [1.7, 0.5, -1]

// Gera uma textura de halo (gradiente radial) em canvas 2D — sem precisar
// de nenhuma lib de post-processing pra simular o "bloom".
function createGlowTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.Texture()

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  )
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.3, 'rgba(255,238,225,0.65)')
  gradient.addColorStop(0.65, 'rgba(227,166,182,0.22)')
  gradient.addColorStop(1, 'rgba(227,166,182,0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function MoonGlow() {
  const glowTexture = useMemo(() => createGlowTexture(), [])
  const spriteRef = useRef<THREE.Sprite>(null)

  // Leve pulsação, no mesmo espírito do brilho do disco de vinil na UI.
  useFrame((state) => {
    if (!spriteRef.current) return
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.05
    const base = 5.4
    spriteRef.current.scale.set(base * pulse, base * pulse, 1)
  })

  return (
    <sprite ref={spriteRef} position={MOON_POSITION} scale={[5.4, 5.4, 1]}>
      <spriteMaterial
        map={glowTexture}
        color="#f2c9a0"
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}

function Moon() {
  const meshRef = useRef<THREE.Mesh>(null)
  const colorMap = useTexture(MOON_TEXTURE_URL)

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.035
  })

  return (
    <mesh ref={meshRef} position={MOON_POSITION} rotation={[0.15, 0.4, 0]}>
      <sphereGeometry args={[1.75, 48, 48]} />
      <meshStandardMaterial
        map={colorMap}
        roughness={0.5}
        metalness={0.08}
        emissive="#c9a24b"
        emissiveIntensity={0.08}
      />
    </mesh>
  )
}

/**
 * Lua 3D decorativa, fixa atrás de todo o conteúdo do player, com um
 * halo de luz suave ao redor. Não captura clique/toque (pointer-events:
 * none) e não interfere no layout — é puramente visual.
 */
export default function MoonBackdrop() {
  return (
    <div className="moon-backdrop" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 6], fov: 40 }}
      >
        <ambientLight intensity={0.4} color="#e3a6b6" />
        <directionalLight position={[4, 3, 5]} intensity={2} color="#fff7ee" />
        <directionalLight position={[-4, -2, -3]} intensity={0.35} color="#b23a55" />
        <pointLight position={[2.8, 1.3, 2.2]} intensity={0.9} color="#c9a24b" distance={9} />
        <Suspense fallback={null}>
          <MoonGlow />
          <Moon />
        </Suspense>
      </Canvas>
    </div>
  )
}
