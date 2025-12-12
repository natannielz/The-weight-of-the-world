import { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, MeshDistortMaterial, Sparkles, Float, Stars, Line } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Glitch, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing'
import * as THREE from 'three'

// ========================================
// SCENE 1: THE GRID - Mechanical Gray World
// ========================================
function TheGrid() {
  const groupRef = useRef()
  const scroll = useScroll()
  const gridLines = useRef([])

  // Create grid geometry
  const gridData = useMemo(() => {
    const lines = []
    const size = 50
    const divisions = 40
    const step = size / divisions

    // Horizontal lines
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      lines.push([
        [-size / 2, 0, i * step],
        [size / 2, 0, i * step]
      ])
    }

    // Vertical lines  
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      lines.push([
        [i * step, 0, -size / 2],
        [i * step, 0, size / 2]
      ])
    }

    return lines
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return

    const t = state.clock.getElapsedTime()
    const scrollOffset = scroll.offset

    // Active from 0 - 0.15
    const active = THREE.MathUtils.smoothstep(scrollOffset, 0, 0.05) * (1 - THREE.MathUtils.smoothstep(scrollOffset, 0.12, 0.18))

    groupRef.current.visible = active > 0.01
    groupRef.current.position.y = -3

    // Slow mechanical movement
    groupRef.current.position.z = (t * 0.5) % 5

    // Fade opacity
    groupRef.current.children.forEach(child => {
      if (child.material) {
        child.material.opacity = active * 0.4
      }
    })
  })

  return (
    <group ref={groupRef}>
      {gridData.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#808080"
          lineWidth={0.5}
          transparent
          opacity={0.3}
        />
      ))}

      {/* Secondary ceiling grid */}
      <group position={[0, 15, 0]} rotation={[Math.PI, 0, 0]}>
        {gridData.slice(0, 20).map((points, i) => (
          <Line
            key={`ceiling-${i}`}
            points={points}
            color="#404040"
            lineWidth={0.3}
            transparent
            opacity={0.15}
          />
        ))}
      </group>

      {/* Ambient particles */}
      <Sparkles
        count={50}
        scale={30}
        size={1}
        speed={0.2}
        opacity={0.3}
        color="#808080"
      />
    </group>
  )
}

// ========================================
// SCENE 2: THE SHARDS - Language Architecture
// ========================================
function TheShards() {
  const groupRef = useRef()
  const scroll = useScroll()
  const meshRefs = useRef([])

  const shardCount = 40

  const shardData = useMemo(() => {
    return Array.from({ length: shardCount }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 15
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ],
      scale: 0.3 + Math.random() * 0.8,
      speed: 0.5 + Math.random() * 2,
      type: i % 3 // 0: English/Logic, 1: Japanese/Nuance, 2: Chaos
    }))
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return

    const t = state.clock.getElapsedTime()
    const scrollOffset = scroll.offset

    // Active from 0.15 - 0.40
    const fadeIn = THREE.MathUtils.smoothstep(scrollOffset, 0.12, 0.18)
    const fadeOut = 1 - THREE.MathUtils.smoothstep(scrollOffset, 0.38, 0.45)
    const active = fadeIn * fadeOut

    groupRef.current.visible = active > 0.01
    groupRef.current.scale.setScalar(active)

    // Phase within section determines distortion
    const phase = THREE.MathUtils.smoothstep(scrollOffset, 0.15, 0.40)

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return

      const data = shardData[i]

      // Floating animation
      mesh.rotation.x += 0.002 * data.speed
      mesh.rotation.y += 0.003 * data.speed
      mesh.position.y = data.position[1] + Math.sin(t * data.speed + i) * 0.5

      // Distortion based on type and scroll phase
      if (mesh.material) {
        // English (Logic) = stays rigid, Chaos = melts most
        const baseDistort = data.type === 0 ? 0.1 : data.type === 1 ? 0.3 : 0.6
        mesh.material.distort = baseDistort * phase

        // Color shift
        const targetColor = data.type === 0
          ? new THREE.Color('#ffffff')
          : data.type === 1
            ? new THREE.Color('#ff9999')
            : new THREE.Color('#00f0ff')

        mesh.material.color.lerp(targetColor, 0.02)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {shardData.map((data, i) => (
        <Float key={i} speed={data.speed} rotationIntensity={1} floatIntensity={0.5}>
          <mesh
            ref={(el) => (meshRefs.current[i] = el)}
            position={data.position}
            rotation={data.rotation}
          >
            <tetrahedronGeometry args={[data.scale, 0]} />
            <MeshDistortMaterial
              speed={3}
              distort={0}
              color="#ffffff"
              wireframe
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}

      {/* Connecting lines between shards */}
      <Sparkles
        count={100}
        scale={25}
        size={2}
        speed={0.3}
        opacity={0.4}
        color="#00f0ff"
      />
    </group>
  )
}

// ========================================
// SCENE 3: THE CHOIR - Glitch Climax
// ========================================
function TheChoir() {
  const groupRef = useRef()
  const particlesRef = useRef()
  const scroll = useScroll()

  // Create tornado of particles
  const particleData = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 8
      const theta = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 15

      positions[i * 3] = Math.cos(theta) * radius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(theta) * radius

      // Color: mostly red (glitch) with some gold (hope)
      const isGold = Math.random() > 0.8
      if (isGold) {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.84
        colors[i * 3 + 2] = 0
      } else {
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0
        colors[i * 3 + 2] = 0.24
      }

      sizes[i] = 0.02 + Math.random() * 0.08
    }

    return { positions, colors, sizes, count }
  }, [])

  useFrame((state) => {
    if (!groupRef.current || !particlesRef.current) return

    const t = state.clock.getElapsedTime()
    const scrollOffset = scroll.offset

    // Active from 0.40 - 0.70
    const fadeIn = THREE.MathUtils.smoothstep(scrollOffset, 0.38, 0.45)
    const fadeOut = 1 - THREE.MathUtils.smoothstep(scrollOffset, 0.68, 0.75)
    const active = fadeIn * fadeOut

    groupRef.current.visible = active > 0.01

    // Rotation creates tornado effect
    groupRef.current.rotation.y = t * 0.8
    groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.15

    // Vibration intensity based on scroll depth
    const intensity = THREE.MathUtils.smoothstep(scrollOffset, 0.45, 0.60)
    const vibrationX = Math.sin(t * 30) * 0.05 * intensity
    const vibrationY = Math.cos(t * 25) * 0.05 * intensity

    groupRef.current.position.x = vibrationX
    groupRef.current.position.y = vibrationY

    // Animate particles upward
    const positionAttr = particlesRef.current.geometry.attributes.position
    const positions = positionAttr.array

    for (let i = 0; i < particleData.count; i++) {
      // Upward spiral movement
      const idx = i * 3
      const x = positions[idx]
      const z = positions[idx + 2]
      const angle = Math.atan2(z, x)
      const radius = Math.sqrt(x * x + z * z)

      positions[idx] = Math.cos(angle + 0.01) * radius
      positions[idx + 2] = Math.sin(angle + 0.01) * radius
      positions[idx + 1] += 0.02

      // Reset if too high
      if (positions[idx + 1] > 8) {
        positions[idx + 1] = -8
      }
    }
    positionAttr.needsUpdate = true

    // Scale based on active state
    groupRef.current.scale.setScalar(active)
  })

  return (
    <group ref={groupRef}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particleData.positions}
            count={particleData.count}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={particleData.colors}
            count={particleData.count}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Core glow */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ff003c" transparent opacity={0.3} />
      </mesh>

      {/* Outer halo */}
      <Sparkles
        count={300}
        scale={15}
        size={6}
        speed={2}
        opacity={0.6}
        color="#ff003c"
      />

      <Sparkles
        count={150}
        scale={12}
        size={8}
        speed={1}
        opacity={0.4}
        color="#ffd700"
      />
    </group>
  )
}

// ========================================
// SCENE 4: THE RAIN - Shared Trauma / Personal
// ========================================
function TheRain() {
  const groupRef = useRef()
  const rainRef = useRef()
  const scroll = useScroll()

  // Rain drops
  const rainData = useMemo(() => {
    const count = 1000
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = Math.random() * 30 - 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }

    return { positions, count }
  }, [])

  useFrame((state) => {
    if (!groupRef.current || !rainRef.current) return

    const scrollOffset = scroll.offset

    // Active from 0.70 - 0.92
    const fadeIn = THREE.MathUtils.smoothstep(scrollOffset, 0.68, 0.75)
    const fadeOut = 1 - THREE.MathUtils.smoothstep(scrollOffset, 0.90, 0.95)
    const active = fadeIn * fadeOut

    groupRef.current.visible = active > 0.01
    groupRef.current.scale.setScalar(active)

    // Animate rain falling
    const positionAttr = rainRef.current.geometry.attributes.position
    const positions = positionAttr.array

    for (let i = 0; i < rainData.count; i++) {
      const idx = i * 3 + 1 // y position
      positions[idx] -= 0.3 // Fall speed

      // Reset if below view
      if (positions[idx] < -15) {
        positions[idx] = 15
      }
    }
    positionAttr.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      {/* Rain particles */}
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={rainData.positions}
            count={rainData.count}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#00f0ff"
          size={0.03}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Volumetric spotlight on text area */}
      <spotLight
        position={[0, 10, 5]}
        angle={0.4}
        penumbra={0.8}
        intensity={3}
        color="#00f0ff"
        castShadow
      />

      {/* Ambient rain sparkles */}
      <Sparkles
        count={100}
        scale={20}
        size={2}
        speed={3}
        opacity={0.3}
        color="#00f0ff"
      />

      {/* Fog/mist effect */}
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color="#0a1628" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// ========================================
// SCENE 5: SYSTEM REBOOT - White Transcendence
// ========================================
function SystemReboot() {
  const groupRef = useRef()
  const scroll = useScroll()

  useFrame((state) => {
    if (!groupRef.current) return

    const scrollOffset = scroll.offset

    // Active from 0.92 - 1.0
    const active = THREE.MathUtils.smoothstep(scrollOffset, 0.90, 0.95)

    groupRef.current.visible = active > 0.01
    groupRef.current.scale.setScalar(active)
  })

  return (
    <group ref={groupRef}>
      {/* Gentle rising particles */}
      <Sparkles
        count={200}
        scale={30}
        size={3}
        speed={0.5}
        opacity={0.5}
        color="#ffd700"
      />

      <Sparkles
        count={100}
        scale={20}
        size={5}
        speed={0.3}
        opacity={0.3}
        color="#fff1e6"
      />

      {/* Central glow */}
      <mesh>
        <sphereGeometry args={[3, 64, 64]} />
        <meshBasicMaterial color="#fff1e6" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

// ========================================
// POST-PROCESSING EFFECTS
// ========================================
function Effects() {
  const scroll = useScroll()
  const [glitchActive, setGlitchActive] = useState(false)
  const [chromaOffset, setChromaOffset] = useState(new THREE.Vector2(0, 0))
  const [bloomIntensity, setBloomIntensity] = useState(1.5)
  const [noiseOpacity, setNoiseOpacity] = useState(0.15)

  useFrame(() => {
    const offset = scroll.offset

    // Glitch section (0.40 - 0.70)
    const isGlitchSection = offset > 0.40 && offset < 0.70
    const glitchIntensity = THREE.MathUtils.smoothstep(offset, 0.45, 0.55)

    // Random glitch triggers
    setGlitchActive(isGlitchSection && Math.random() > (0.95 - glitchIntensity * 0.2))

    // Chromatic aberration
    const chromaVal = 0.001 + glitchIntensity * 0.008
    setChromaOffset(new THREE.Vector2(chromaVal, chromaVal))

    // Bloom for ending section
    const endingBloom = THREE.MathUtils.smoothstep(offset, 0.90, 0.98)
    setBloomIntensity(1.5 + endingBloom * 3)

    // Noise variation
    const rainSection = offset > 0.70 && offset < 0.92
    setNoiseOpacity(rainSection ? 0.25 : 0.15)
  })

  return (
    <EffectComposer disableNormalPass>
      <Bloom
        luminanceThreshold={0.4}
        mipmapBlur
        intensity={bloomIntensity}
        radius={0.8}
      />
      <Noise opacity={noiseOpacity} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
      <ChromaticAberration offset={chromaOffset} />
      <Glitch
        delay={[1.5, 3.5]}
        duration={[0.6, 1.0]}
        strength={[0.3, 1.0]}
        active={glitchActive}
        mode={GlitchMode.SPORADIC}
      />
    </EffectComposer>
  )
}

// ========================================
// MAIN SCENE COMPONENT
// ========================================
export default function Scene() {
  const scroll = useScroll()
  const bgRef = useRef()
  const { scene } = useThree()

  useFrame(() => {
    const offset = scroll.offset

    // Dynamic background color based on scene
    let targetColor = new THREE.Color('#0a0a0a')

    if (offset < 0.15) {
      // The Gray - pure void
      targetColor = new THREE.Color('#0a0a0a')
    } else if (offset < 0.40) {
      // Architecture - slight blue tint
      targetColor.lerp(new THREE.Color('#0a0a12'), (offset - 0.15) * 4)
    } else if (offset < 0.70) {
      // Glitch Choir - red/dark
      const glitchIntensity = (offset - 0.40) * 3.33
      targetColor = new THREE.Color('#0a0a0a').lerp(new THREE.Color('#1a0508'), glitchIntensity)
    } else if (offset < 0.92) {
      // Rain - deep blue
      targetColor = new THREE.Color('#051118')
    } else {
      // System Reboot - white fade
      const whiteness = (offset - 0.92) * 12.5
      targetColor = new THREE.Color('#051118').lerp(new THREE.Color('#fff1e6'), Math.min(whiteness, 1))
    }

    if (bgRef.current) {
      bgRef.current.color.lerp(targetColor, 0.05)
    }
  })

  return (
    <>
      <color ref={bgRef} attach="background" args={['#0a0a0a']} />

      {/* Global Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#fff1e6" />

      {/* Background Stars - always visible but fade */}
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={3}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Scene Components */}
      <TheGrid />
      <TheShards />
      <TheChoir />
      <TheRain />
      <SystemReboot />

      {/* Post-Processing */}
      <Effects />
    </>
  )
}
