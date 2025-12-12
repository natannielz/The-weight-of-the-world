import { useScroll, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { story } from '../data/story'

// Terminal output for final scene
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

export default function Overlay() {
  const scroll = useScroll()
  const progressRef = useRef()
  const percentRef = useRef()
  const itemRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollPercent, setScrollPercent] = useState(0)

  // Force first item to be visible on mount
  useEffect(() => {
    if (itemRefs.current[0]) {
      itemRefs.current[0].style.opacity = '1'
      itemRefs.current[0].style.visibility = 'visible'
    }
  }, [])

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
    }

    // Animate each item based on scroll
    itemRefs.current.forEach((child, i) => {
      if (!child) return

      const item = story[i]
      if (!item) return

      const itemStart = item.scrollStart
      const itemEnd = item.scrollEnd
      const itemCenter = (itemStart + itemEnd) / 2
      const itemRange = itemEnd - itemStart

      let opacity = 0

      // Calculate visibility with smoother transitions
      const fadeRange = 0.04 // 4% scroll for fade
      const fadeInStart = itemStart - fadeRange
      const fadeInEnd = itemStart + fadeRange
      const fadeOutStart = itemEnd - fadeRange
      const fadeOutEnd = itemEnd + fadeRange

      if (scrollOffset >= fadeInStart && scrollOffset <= fadeOutEnd) {
        if (scrollOffset < fadeInEnd) {
          // Fading in
          opacity = (scrollOffset - fadeInStart) / (fadeInEnd - fadeInStart)
        } else if (scrollOffset > fadeOutStart) {
          // Fading out
          opacity = 1 - (scrollOffset - fadeOutStart) / (fadeOutEnd - fadeOutStart)
        } else {
          // Fully visible
          opacity = 1
        }
      }

      // Special handling for first item - always visible at start
      if (i === 0 && scrollOffset < 0.08) {
        opacity = Math.max(opacity, 1 - (scrollOffset / 0.08))
      }

      // Special handling for last item - stay visible
      if (i === story.length - 1 && scrollOffset > 0.90) {
        opacity = Math.max(opacity, (scrollOffset - 0.90) / 0.05)
      }

      opacity = Math.max(0, Math.min(1, opacity))

      child.style.opacity = String(opacity)
      child.style.visibility = opacity > 0.01 ? 'visible' : 'hidden'

      // Parallax effect (reduced intensity for smoother feel)
      const parallax = (scrollOffset - itemCenter) * 150
      child.style.transform = `translateY(${-parallax}px)`
    })
  })

  // Check if we're at the final scene for terminal
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

              {/* Title - Distressed Serif */}
              <h1
                className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-6 md:mb-8 tracking-wide leading-tight ${item.scene === 'glitch' || item.scene === 'screaming' ? 'glitch-text' : ''
                  } ${item.scene === 'reboot' ? 'text-shadow-gold' : ''
                  }`}
                data-text={item.title}
              >
                {item.title}
              </h1>

              {/* Content Card */}
              <div
                className={`backdrop-blur-xl rounded-lg p-5 md:p-8 shadow-2xl ${item.scene === 'reboot'
                  ? 'bg-black/90 border border-[#ffd700]/40 shadow-[0_0_40px_rgba(255,215,0,0.1)]'
                  : item.scene === 'rain'
                    ? 'bg-[#0a1628]/90 border border-[#00f0ff]/30 shadow-[0_0_40px_rgba(0,240,255,0.1)]'
                    : item.scene === 'glitch' || item.scene === 'screaming'
                      ? 'bg-black/90 border border-[#ff003c]/30 shadow-[0_0_40px_rgba(255,0,60,0.1)]'
                      : 'bg-black/80 border border-white/10'
                  }`}
              >
                <p className="text-[#e0e0e0] text-sm md:text-base font-mono leading-relaxed md:leading-loose whitespace-pre-line text-left">
                  {item.text}
                </p>
              </div>

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

      {/* === DECORATIVE CORNERS === */}
      <div className="fixed top-0 left-0 w-12 h-12 md:w-16 md:h-16 border-l-2 border-t-2 border-[#333] pointer-events-none" />
      <div className="fixed top-0 right-0 w-12 h-12 md:w-16 md:h-16 border-r-2 border-t-2 border-[#333] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-12 h-12 md:w-16 md:h-16 border-l-2 border-b-2 border-[#333] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-12 h-12 md:w-16 md:h-16 border-r-2 border-b-2 border-[#333] pointer-events-none" />

      {/* === SCROLL HINT === */}
      <AnimatePresence>
        {activeIndex === 0 && scrollPercent < 5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 text-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-[#808080] font-mono text-[10px] md:text-xs tracking-widest">
                SCROLL TO PROCEED
              </span>
              <svg
                className="w-4 h-4 text-[#808080]"
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
