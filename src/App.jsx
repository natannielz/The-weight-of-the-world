import { Canvas } from '@react-three/fiber'
import { ScrollControls, Preload } from '@react-three/drei'
import { useState, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Scene from './components/Scene'
import Overlay from './components/Overlay'
import LandingScreen from './components/LandingScreen'
import AudioPlayer from './components/AudioPlayer'
import { story } from './data/story'

// Loading screen component
function LoadingScreen({ onLoadComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 12
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => onLoadComplete?.(), 300)
          return 100
        }
        return next
      })
    }, 80)

    return () => clearInterval(interval)
  }, [onLoadComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center font-mono"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo/Icon */}
      <motion.div
        className="mb-8"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg className="w-16 h-16 text-[#00f0ff]" viewBox="0 0 32 32" fill="none">
          <polygon
            points="16,2 30,16 16,30 2,16"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="0.75" fill="none" />
          <circle cx="16" cy="16" r="2" fill="currentColor" />
        </svg>
      </motion.div>

      <div className="text-[#00f0ff] text-xs tracking-[0.3em] mb-6">
        LOADING YORHA SYSTEMS
      </div>

      {/* Progress bar */}
      <div className="w-56 h-1 bg-[#1a1a1a] rounded overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00f0ff]/50 via-[#00f0ff] to-[#00f0ff]"
          style={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="text-[#808080] text-[10px] mt-4 tracking-wider">
        {Math.round(Math.min(progress, 100))}%
      </div>

      {/* Loading messages */}
      <motion.div
        className="absolute bottom-12 text-[#333] text-[10px] tracking-wider"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        INITIALIZING EMOTIONAL_CORE_DUMP...
      </motion.div>
    </motion.div>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <LoadingScreen onLoadComplete={() => setIsLoaded(true)} />
        )}
      </AnimatePresence>

      {/* Landing Screen */}
      <AnimatePresence mode="wait">
        {isLoaded && !started && (
          <LandingScreen onEnter={() => setStarted(true)} />
        )}
      </AnimatePresence>

      {/* Main Experience */}
      <main className="w-full h-screen bg-black relative overflow-hidden">
        <AudioPlayer started={started} />

        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
          }}
        >
          <color attach="background" args={['#0a0a0a']} />
          <Suspense fallback={null}>
            <ScrollControls
              pages={story.length}
              damping={0.2}
              distance={1}
            >
              <Scene />
              <Overlay />
            </ScrollControls>
            <Preload all />
          </Suspense>
        </Canvas>

        {/* === CINEMATIC OVERLAYS === */}

        {/* Vignette */}
        <div
          className="fixed inset-0 pointer-events-none z-20"
          style={{
            background: 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.7) 100%)'
          }}
        />

        {/* Film Grain - subtle */}
        <div
          className="fixed inset-0 pointer-events-none z-20 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />

        {/* CRT Scanlines - very subtle */}
        <div
          className="fixed inset-0 pointer-events-none z-30 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%)
            `,
            backgroundSize: '100% 3px'
          }}
        />

        {/* Top/Bottom gradients for text readability */}
        <div
          className="fixed top-0 left-0 right-0 h-28 pointer-events-none z-25"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)'
          }}
        />
        <div
          className="fixed bottom-0 left-0 right-0 h-28 pointer-events-none z-25"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
          }}
        />
      </main>
    </>
  )
}
