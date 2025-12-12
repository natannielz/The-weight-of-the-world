import { Canvas } from '@react-three/fiber'
import { ScrollControls, Preload } from '@react-three/drei'
import { useState, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Scene from './components/Scene'
import Overlay from './components/Overlay'
import LandingScreen from './components/LandingScreen'
import AudioPlayer from './components/AudioPlayer'
import CustomCursor from './components/CustomCursor'
import CinematicOverlay from './components/CinematicOverlay'
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

// Skip hint component
function SkipHint({ visible }) {
  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] text-center"
    >
      <div className="bg-black/80 border border-[#333] px-4 py-2 rounded font-mono text-[10px] text-[#808080]">
        Press <span className="text-[#00f0ff]">[S]</span> to skip to the emotional part
      </div>
    </motion.div>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showSkipHint, setShowSkipHint] = useState(false)
  // Skip key handled via document scroll manipulation

  // Keyboard shortcuts
  useEffect(() => {
    if (!started) return

    const handleKeyDown = (e) => {
      // Press 'S' to skip to Scene 3 (The Glitch in the Choir)
      if (e.key === 's' || e.key === 'S') {
        // Find the scroll container and scroll to 40% (Scene 3)
        const scrollElement = document.querySelector('[data-scroll-container]') ||
          document.querySelector('.scroll-container') ||
          document.querySelector('[style*="overflow"]')

        if (scrollElement) {
          const targetScroll = scrollElement.scrollHeight * 0.40
          scrollElement.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          })
        } else {
          // Fallback: try window scroll
          const targetScroll = document.body.scrollHeight * 0.40
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [started])

  // Show skip hint briefly when experience starts
  useEffect(() => {
    if (started) {
      setShowSkipHint(true)
      const timer = setTimeout(() => setShowSkipHint(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [started])

  return (
    <>
      {/* Custom Cursor */}
      {started && <CustomCursor />}

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

      {/* Skip Hint */}
      <AnimatePresence>
        {showSkipHint && <SkipHint visible={showSkipHint} />}
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

        {/* Cinematic Overlays (separated component) */}
        <CinematicOverlay />
      </main>
    </>
  )
}
