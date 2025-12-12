import { useScroll, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { story } from '../data/story'

// ========================================
// SFX UTILITY - Sound Effects
// ========================================
const useSFX = () => {
  const audioContext = useRef(null)

  const initAudio = useCallback(() => {
    if (!audioContext.current && typeof window !== 'undefined') {
      try {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)()
      } catch (e) {
        console.warn('Web Audio API not supported')
      }
    }
  }, [])

  const playBeep = useCallback((frequency = 800, duration = 0.05, volume = 0.1) => {
    if (!audioContext.current) initAudio()
    if (!audioContext.current) return

    try {
      const oscillator = audioContext.current.createOscillator()
      const gainNode = audioContext.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.current.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.value = volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration)

      oscillator.start(audioContext.current.currentTime)
      oscillator.stop(audioContext.current.currentTime + duration)
    } catch (e) {
      // Silent fail
    }
  }, [initAudio])

  const playGlitch = useCallback(() => {
    if (!audioContext.current) initAudio()
    if (!audioContext.current) return

    try {
      const bufferSize = audioContext.current.sampleRate * 0.1
      const buffer = audioContext.current.createBuffer(1, bufferSize, audioContext.current.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3
      }

      const source = audioContext.current.createBufferSource()
      const gainNode = audioContext.current.createGain()

      source.buffer = buffer
      source.connect(gainNode)
      gainNode.connect(audioContext.current.destination)

      gainNode.gain.value = 0.05
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.1)

      source.start()
    } catch (e) {
      // Silent fail
    }
  }, [initAudio])

  return { playBeep, playGlitch, initAudio }
}

// ========================================
// TYPEWRITER TEXT COMPONENT
// ========================================
function TypewriterText({ text, speed = 10, className = '', onComplete }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(interval)
        setIsComplete(true)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-[#00f0ff]"
        >
          ▌
        </motion.span>
      )}
    </span>
  )
}

// ========================================
// TERMINAL OUTPUT
// ========================================
function TerminalOutput({ lines, visible }) {
  const [visibleLines, setVisibleLines] = useState([])

  useEffect(() => {
    if (!visible) {
      setVisibleLines([])
      return
    }

    const timeouts = []
    lines.forEach((line, i) => {
      const timeout = setTimeout(() => {
        setVisibleLines(prev => [...prev, line])
      }, i * 200)
      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(t => clearTimeout(t))
      setVisibleLines([])
    }
  }, [visible, lines])

  if (!visible) return null

  return (
    <div className="mt-8 text-left max-w-2xl mx-auto bg-black/95 border border-[#00f0ff]/50 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)]">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-[#00f0ff]/30">
        <div className="w-3 h-3 rounded-full bg-[#ff003c]" />
        <div className="w-3 h-3 rounded-full bg-[#ffd700]" />
        <div className="w-3 h-3 rounded-full bg-[#00ff00]" />
        <span className="ml-4 text-xs text-[#808080] font-mono">yorha_terminal_v1.24</span>
      </div>

      {/* Terminal Content */}
      <div className="p-6 font-mono">
        {visibleLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className={`text-sm md:text-base mb-2 ${line.startsWith('>')
                ? 'text-[#00f0ff]'
                : line.startsWith('//')
                  ? 'text-[#808080] italic'
                  : 'text-[#ffd700]'
              }`}
          >
            {line || '\u00A0'}
          </motion.div>
        ))}
        {visibleLines.length > 0 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-2.5 h-5 bg-[#00f0ff] mt-2"
          />
        )}
      </div>
    </div>
  )
}

// ========================================
// GLITCH TITLE COMPONENT
// ========================================
function GlitchTitle({ children, active = false, className = '', dataText = '' }) {
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    if (!active) return

    // Random glitch every 3-8 seconds
    const interval = setInterval(() => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 200 + Math.random() * 300)
    }, 3000 + Math.random() * 5000)

    return () => clearInterval(interval)
  }, [active])

  return (
    <h1
      className={`${className} ${isGlitching || active ? 'glitch-text' : ''}`}
      data-text={dataText}
    >
      {children}
    </h1>
  )
}

// ========================================
// NIER UI CARD WITH DECORATIVE BORDERS
// ========================================
function NierCard({ children, className = '', scene = '' }) {
  const baseClasses = 'backdrop-blur-xl rounded-lg p-5 md:p-8 shadow-2xl relative'

  const sceneClasses = {
    reboot: 'bg-black/90 border border-[#ffd700]/40 shadow-[0_0_40px_rgba(255,215,0,0.1)]',
    rain: 'bg-[#0a1628]/90 border border-[#00f0ff]/30 shadow-[0_0_40px_rgba(0,240,255,0.1)]',
    glitch: 'bg-black/90 border border-[#ff003c]/30 shadow-[0_0_40px_rgba(255,0,60,0.1)]',
    screaming: 'bg-black/90 border border-[#ff003c]/30 shadow-[0_0_40px_rgba(255,0,60,0.1)]',
    default: 'bg-black/80 border border-white/10'
  }

  const borderColor = scene === 'reboot' ? '#ffd700'
    : scene === 'rain' ? '#00f0ff'
      : scene === 'glitch' || scene === 'screaming' ? '#ff003c'
        : '#dad4bb'

  return (
    <div className={`${baseClasses} ${sceneClasses[scene] || sceneClasses.default} ${className}`}>
      {/* Decorative Corner - Top Left */}
      <div
        className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 pointer-events-none"
        style={{ borderColor }}
      />
      {/* Decorative Corner - Top Right */}
      <div
        className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 pointer-events-none"
        style={{ borderColor }}
      />
      {/* Decorative Corner - Bottom Left */}
      <div
        className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 pointer-events-none"
        style={{ borderColor }}
      />
      {/* Decorative Corner - Bottom Right */}
      <div
        className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 pointer-events-none"
        style={{ borderColor }}
      />

      {/* Horizontal Lines */}
      <div
        className="absolute top-1/2 -left-4 w-3 h-px pointer-events-none"
        style={{ backgroundColor: borderColor, opacity: 0.5 }}
      />
      <div
        className="absolute top-1/2 -right-4 w-3 h-px pointer-events-none"
        style={{ backgroundColor: borderColor, opacity: 0.5 }}
      />

      {children}
    </div>
  )
}

// ========================================
// MAIN OVERLAY COMPONENT
// ========================================
export default function Overlay() {
  const scroll = useScroll()
  const progressRef = useRef()
  const itemRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollPercent, setScrollPercent] = useState(0)
  const [useTypewriter, setUseTypewriter] = useState(true)
  const previousScene = useRef('')

  const { playBeep, playGlitch, initAudio } = useSFX()

  // Initialize audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAudio()
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
    window.addEventListener('click', handleInteraction)
    window.addEventListener('keydown', handleInteraction)
    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [initAudio])

  // Force first item to be visible on mount
  useEffect(() => {
    if (itemRefs.current[0]) {
      itemRefs.current[0].style.opacity = '1'
      itemRefs.current[0].style.visibility = 'visible'
    }
  }, [])

  // Play glitch sound when entering glitch scene
  useEffect(() => {
    const currentScene = story[activeIndex]?.scene
    if (currentScene === 'glitch' && previousScene.current !== 'glitch') {
      playGlitch()
    }
    previousScene.current = currentScene || ''
  }, [activeIndex, playGlitch])

  useFrame(() => {
    const scrollOffset = scroll.offset || 0

    // Update scroll percentage state (throttled)
    const newPercent = Math.round(scrollOffset * 100)
    if (newPercent !== scrollPercent) {
      setScrollPercent(newPercent)
    }

    // Update progress bar directly via ref (no re-render)
    if (progressRef.current) {
      progressRef.current.style.width = `${scrollOffset * 100}%`
    }

    // Find active story item
    const currentActiveIndex = story.findIndex((item, i) => {
      const nextItem = story[i + 1]
      if (nextItem) {
        return scrollOffset >= item.scrollStart && scrollOffset < nextItem.scrollStart
      }
      return scrollOffset >= item.scrollStart
    })

    if (currentActiveIndex !== activeIndex && currentActiveIndex !== -1) {
      setActiveIndex(currentActiveIndex)
      // Disable typewriter after first scroll to improve UX
      if (scrollPercent > 10) {
        setUseTypewriter(false)
      }
    }

    // Animate each item based on scroll
    itemRefs.current.forEach((child, i) => {
      if (!child) return

      const item = story[i]
      if (!item) return

      const itemStart = item.scrollStart
      const itemEnd = item.scrollEnd
      const itemCenter = (itemStart + itemEnd) / 2

      let opacity = 0

      // Calculate visibility with smoother transitions
      const fadeRange = 0.04
      const fadeInStart = itemStart - fadeRange
      const fadeInEnd = itemStart + fadeRange
      const fadeOutStart = itemEnd - fadeRange
      const fadeOutEnd = itemEnd + fadeRange

      if (scrollOffset >= fadeInStart && scrollOffset <= fadeOutEnd) {
        if (scrollOffset < fadeInEnd) {
          opacity = (scrollOffset - fadeInStart) / (fadeInEnd - fadeInStart)
        } else if (scrollOffset > fadeOutStart) {
          opacity = 1 - (scrollOffset - fadeOutStart) / (fadeOutEnd - fadeOutStart)
        } else {
          opacity = 1
        }
      }

      // Special handling for first item
      if (i === 0 && scrollOffset < 0.08) {
        opacity = Math.max(opacity, 1 - (scrollOffset / 0.08))
      }

      // Special handling for last item
      if (i === story.length - 1 && scrollOffset > 0.90) {
        opacity = Math.max(opacity, (scrollOffset - 0.90) / 0.05)
      }

      opacity = Math.max(0, Math.min(1, opacity))

      child.style.opacity = String(opacity)
      child.style.visibility = opacity > 0.01 ? 'visible' : 'hidden'

      // Parallax effect
      const parallax = (scrollOffset - itemCenter) * 150
      child.style.transform = `translateY(${-parallax}px)`
    })
  })

  const showTerminal = activeIndex === story.length - 1

  return (
    <Html fullscreen className="pointer-events-none select-none" zIndexRange={[100, 0]}>
      {/* === TOP HEADER === */}
      <header className="fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00f0ff] rounded-full animate-pulse shadow-[0_0_8px_#00f0ff]" />
          <span className="text-white/50 font-mono text-[10px] md:text-xs tracking-[0.15em]">
            NIER: AUTO_DATA // ARCHIVE_01
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/50 font-mono text-[10px] md:text-xs tracking-[0.15em]">
            YONATHAN_SYS_LOG
          </span>
          <div className="hidden md:flex items-end gap-0.5 h-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-[#00f0ff]/40"
                animate={{
                  height: [4, 8 + Math.random() * 8, 4],
                }}
                transition={{
                  duration: 0.8 + Math.random() * 0.4,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        </div>
      </header>

      {/* === SYSTEM INTEGRITY UPLOAD BAR === */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-2xl z-50">
        <div className="text-[10px] text-[#808080] font-mono tracking-[0.15em] mb-2 flex justify-between">
          <span>{'>'} SYSTEM_INTEGRITY_UPLOAD...</span>
          <span className="text-[#ffd700]">{scrollPercent}%</span>
        </div>
        <div className="h-2 bg-black/80 border border-[#333] rounded-sm overflow-hidden backdrop-blur-sm">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-[#ffd700]/60 via-[#ffd700] to-[#ffd700] shadow-[0_0_15px_#ffd700]"
            style={{ width: '0%', transition: 'width 0.1s linear' }}
          />
        </div>
        {/* Tick marks */}
        <div className="absolute inset-x-0 top-[26px] flex justify-between px-0.5 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-px h-2 bg-[#333]" />
          ))}
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="w-full h-full relative">
        {story.map((item, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className="absolute inset-0 flex items-center justify-center p-4 md:p-8 lg:p-12"
            style={{
              willChange: 'opacity, transform',
              opacity: i === 0 ? 1 : 0,
              visibility: i === 0 ? 'visible' : 'hidden'
            }}
          >
            <div className="max-w-3xl w-full text-center">
              {/* System Note */}
              {item.systemNote && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.2 }}
                  className="text-[#00f0ff] text-[10px] md:text-xs font-mono tracking-[0.2em] mb-4"
                >
                  <span className="animate-pulse">[</span>
                  {item.systemNote}
                  <span className="animate-pulse">]</span>
                </motion.p>
              )}

              {/* Subtitle */}
              {item.subtitle && (
                <p className="text-[#c5a059] text-xs md:text-sm font-mono tracking-[0.15em] uppercase mb-3 md:mb-4">
                  <span className="text-[#808080]">{'>'}</span> {item.subtitle}
                </p>
              )}

              {/* Title with Glitch Effect */}
              <GlitchTitle
                className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-6 md:mb-8 tracking-wide leading-tight ${item.scene === 'reboot' ? 'text-shadow-gold' : ''
                  }`}
                active={item.scene === 'glitch' || item.scene === 'screaming'}
                dataText={item.title}
              >
                {item.title}
              </GlitchTitle>

              {/* Content Card with Nier UI Borders */}
              <NierCard scene={item.scene}>
                <p className="text-[#e0e0e0] text-sm md:text-base font-mono leading-relaxed md:leading-loose whitespace-pre-line text-left">
                  {activeIndex === i && useTypewriter && i === 0 ? (
                    <TypewriterText
                      text={item.text}
                      speed={8}
                      className="text-[#e0e0e0]"
                    />
                  ) : (
                    item.text
                  )}
                </p>
              </NierCard>

              {/* Terminal Output for Final Scene */}
              {item.terminal && (
                <TerminalOutput
                  lines={item.terminal}
                  visible={showTerminal && i === story.length - 1}
                />
              )}

              {/* Blinking Cursor */}
              <div className="mt-5 md:mt-6">
                <motion.span
                  className="inline-block w-2.5 h-5 md:h-6 bg-[#c5a059]"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* === SIDE INDICATORS === */}
      <div className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-1.5">
        {story.map((item, i) => (
          <div
            key={i}
            className={`w-1 transition-all duration-300 rounded-full ${i === activeIndex
                ? 'h-8 bg-[#ffd700] shadow-[0_0_10px_#ffd700]'
                : i < activeIndex
                  ? 'h-4 bg-white/40'
                  : 'h-4 bg-white/20'
              }`}
            title={item.title}
          />
        ))}
      </div>

      {/* === DECORATIVE CORNERS (smaller to avoid collision) === */}
      <div className="fixed top-0 left-0 w-8 h-8 md:w-12 md:h-12 border-l border-t border-[#333]/50 pointer-events-none" />
      <div className="fixed top-0 right-0 w-8 h-8 md:w-12 md:h-12 border-r border-t border-[#333]/50 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-8 h-8 md:w-12 md:h-12 border-l border-b border-[#333]/50 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-8 h-8 md:w-12 md:h-12 border-r border-b border-[#333]/50 pointer-events-none" />

      {/* === SCROLL HINT (disappears quickly) === */}
      <AnimatePresence>
        {activeIndex === 0 && scrollPercent < 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.7, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-[#808080]/70 font-mono text-[9px] md:text-[10px] tracking-widest">
                SCROLL
              </span>
              <svg
                className="w-3 h-3 text-[#808080]/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === SCENE INDICATOR (Mobile) === */}
      <div className="fixed bottom-16 left-4 z-40 md:hidden">
        <div className="text-[10px] font-mono text-[#808080] tracking-wider">
          <span className="text-[#ffd700]">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span className="mx-1">/</span>
          <span>{String(story.length).padStart(2, '0')}</span>
        </div>
      </div>
    </Html>
  )
}
