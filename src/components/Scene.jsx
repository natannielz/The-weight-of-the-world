import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, MeshDistortMaterial, Sparkles, Float, Stars, Line } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Glitch, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing'
import * as THREE from 'three'

// ========================================
// PERFORMANCE UTILITIES
// ========================================

// Detect if mobile for performance optimization
const getIsMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches
}

// ========================================
// SCENE 1: THE GRID - Mechanical Gray World
// ========================================
function TheGrid() {
  const groupRef = useRef()
  const scroll = useScroll()
  const { viewport } = useThree()

  const isMobile = useMemo(() => getIsMobile(), [])
  const gridDivisions = isMobile ? 20 : 40

  // Create grid geometry
  const gridData = useMemo(() => {
    const lines = []
    const size = 50
    const step = size / gridDivisions

    // Horizontal lines
    for (let i = -gridDivisions / 2; i <= gridDivisions / 2; i++) {
      lines.push([
        [-size / 2, 0, i * step],
        [size / 2, 0, i * step]
      ])
    }

    // Vertical lines  
    for (let i = -gridDivisions / 2; i <= gridDivisions / 2; i++) {
      lines.push([
        [i * step, 0, -size / 2],
        [i * step, 0, size / 2]
      ])
    }

    return lines
  }, [gridDivisions])

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

    // Fade opacity (batch update)
    const opacity = active * 0.4
    groupRef.current.traverse(child => {
      if (child.material) {
        child.material.opacity = opacity
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

      {/* Secondary ceiling grid - reduced on mobile */}
      <group position={[0, 15, 0]} rotation={[Math.PI, 0, 0]}>
        {gridData.slice(0, isMobile ? 10 : 20).map((points, i) => (
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
        count={isMobile ? 25 : 50}
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

  const isMobile = useMemo(() => getIsMobile(), [])
  const shardCount = isMobile ? 20 : 40

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
  }, [shardCount])

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

    // BPM sync simulation (~120 BPM = 2 beats per second)
    const bpmSync = Math.sin(t * Math.PI * 2) * 0.5 + 0.5
    const glitchSpike = scrollOffset > 0.28 && scrollOffset < 0.40 ? bpmSync * 0.3 : 0

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return

      const data = shardData[i]

      // Floating animation
      mesh.rotation.x += 0.002 * data.speed
      mesh.rotation.y += 0.003 * data.speed
      mesh.position.y = data.position[1] + Math.sin(t * data.speed + i) * 0.5

      // Distortion based on type and scroll phase with glitch spike
      if (mesh.material) {
        const baseDistort = data.type === 0 ? 0.1 : data.type === 1 ? 0.3 : 0.6
        mesh.material.distort = (baseDistort * phase) + glitchSpike

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

      {/* Connecting sparkles */}
      <Sparkles
        count={isMobile ? 50 : 100}
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
// OPTIMIZED: Reduced particles on mobile
// ========================================
function TheChoir() {
  const groupRef = useRef()
  const particlesRef = useRef()
  const scroll = useScroll()
  const { viewport } = useThree()

  // Performance optimization: reduce particles on mobile
  const isMobile = useMemo(() => getIsMobile(), [])
  const particleCount = isMobile ? 600 : 2000

  // Create tornado of particles
  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
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
    }

    return { positions, colors, count: particleCount }
  }, [particleCount])

  // Frame counter for performance - only update every N frames on mobile
  const frameCounter = useRef(0)

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

    // Scale based on active state
    groupRef.current.scale.setScalar(active)

    // Performance: Skip particle updates on some frames for mobile
    frameCounter.current++
    if (isMobile && frameCounter.current % 2 !== 0) return

    // Animate particles upward
    const positionAttr = particlesRef.current.geometry.attributes.position
    const positions = positionAttr.array

    // Use step for performance (update every Nth particle on mobile)
    const step = isMobile ? 2 : 1

    for (let i = 0; i < particleData.count; i += step) {
      const idx = i * 3
      const x = positions[idx]
      const z = positions[idx + 2]
      const angle = Math.atan2(z, x)
      const radius = Math.sqrt(x * x + z * z)

      positions[idx] = Math.cos(angle + 0.01) * radius
      positions[idx + 2] = Math.sin(angle + 0.01) * radius
      positions[idx + 1] += 0.02 * step

      // Reset if too high
      if (positions[idx + 1] > 8) {
        positions[idx + 1] = -8
      }
    }
    positionAttr.needsUpdate = true
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
          size={isMobile ? 0.1 : 0.08}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Core glow */}
      <mesh>
        <sphereGeometry args={[1, isMobile ? 16 : 32, isMobile ? 16 : 32]} />
        <meshBasicMaterial color="#ff003c" transparent opacity={0.3} />
      </mesh>

      {/* Outer halo - reduced on mobile */}
      <Sparkles
        count={isMobile ? 100 : 300}
        scale={15}
        size={6}
        speed={2}
        opacity={0.6}
        color="#ff003c"
      />

      <Sparkles
        count={isMobile ? 50 : 150}
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

  const isMobile = useMemo(() => getIsMobile(), [])
  const rainCount = isMobile ? 400 : 1000

  // Rain drops
  const rainData = useMemo(() => {
    const positions = new Float32Array(rainCount * 3)

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = Math.random() * 30 - 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }

    return { positions, count: rainCount }
  }, [rainCount])

  useFrame(() => {
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
          size={isMobile ? 0.04 : 0.03}
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
        castShadow={!isMobile}
      />

      {/* Ambient rain sparkles */}
      <Sparkles
        count={isMobile ? 50 : 100}
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
  const isMobile = useMemo(() => getIsMobile(), [])

  useFrame(() => {
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
        count={isMobile ? 100 : 200}
        scale={30}
        size={3}
        speed={0.5}
        opacity={0.5}
        color="#ffd700"
      />

      <Sparkles
        count={isMobile ? 50 : 100}
        scale={20}
        size={5}
        speed={0.3}
        opacity={0.3}
        color="#fff1e6"
      />

      {/* Central glow */}
      <mesh>
        <sphereGeometry args={[3, isMobile ? 32 : 64, isMobile ? 32 : 64]} />
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

  const isMobile = useMemo(() => getIsMobile(), [])

  useFrame((state) => {
    const offset = scroll.offset
    const t = state.clock.getElapsedTime()

    // Glitch section (0.40 - 0.70)
    const isGlitchSection = offset > 0.40 && offset < 0.70
    const glitchIntensity = THREE.MathUtils.smoothstep(offset, 0.45, 0.55)

    // BPM sync for glitch (more intense on beat)
    const bpmPulse = Math.sin(t * Math.PI * 2) > 0.7

    // Random glitch triggers with BPM sync
    setGlitchActive(isGlitchSection && (Math.random() > (0.95 - glitchIntensity * 0.2) || (bpmPulse && glitchIntensity > 0.3)))

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
    <EffectComposer disableNormalPass multisampling={isMobile ? 0 : 8}>
      <Bloom
        luminanceThreshold={0.4}
        mipmapBlur
        intensity={bloomIntensity}
        radius={0.8}
      />
      <Noise opacity={noiseOpacity} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
      {!isMobile && <ChromaticAberration offset={chromaOffset} />}
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
  const { camera, viewport, mouse } = useThree()

  const isMobile = useMemo(() => getIsMobile(), [])

  // Store original camera position
  const originalCameraPos = useRef({ x: 0, y: 0, z: 5 })

  useFrame((state) => {
    const offset = scroll.offset

    // ========================================
    // MOUSE PARALLAX - Camera follows mouse
    // ========================================
    if (!isMobile) {
      const targetX = originalCameraPos.current.x + (state.mouse.x * 0.8)
      const targetY = originalCameraPos.current.y + (state.mouse.y * 0.5)

      // Smooth lerp for mechanical feel
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.03)
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.03)

      // Subtle rotation to follow mouse
      state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, -state.mouse.x * 0.02, 0.03)
      state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, state.mouse.y * 0.02, 0.03)
    }

    // ========================================
    // DYNAMIC BACKGROUND COLOR
    // ========================================
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

      {/* Background Stars - reduced on mobile */}
      <Stars
        radius={100}
        depth={50}
        count={isMobile ? 1500 : 3000}
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
