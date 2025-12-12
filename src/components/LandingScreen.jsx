import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const bootSequence = [
  { text: "BIOS DATE 12/12/2025 03:33:01 VER 1.0A", delay: 0, color: "#808080" },
  { text: "YORHA SYSTEMS - QUANTUM ARCHITECTURE", delay: 150, color: "#00f0ff" },
  { text: "", delay: 250 },
  { text: "CPU : 12-CORE EXISTENTIAL PROCESSOR @ 3.2GHz", delay: 350, color: "#808080" },
  { text: "RAM : 64GB EMOTIONAL_BUFFER.............. OK", delay: 450, color: "#808080" },
  { text: "GPU : TEARS_RENDERING_ENGINE v2.77....... OK", delay: 550, color: "#808080" },
  { text: "", delay: 650 },
  { text: "INITIALIZING VIDEO ADAPTER............... DONE", delay: 750, color: "#00ff00" },
  { text: "LOADING KERNEL........................... DONE", delay: 850, color: "#00ff00" },
  { text: "MOUNTING MEMORY_ARCHIVE.................. DONE", delay: 950, color: "#00ff00" },
  { text: "", delay: 1050 },
  { text: "CHECKING EMOTIONAL INTEGRITY............. 100%", delay: 1150, color: "#ffd700" },
  { text: "", delay: 1250 },
  { text: "█ SYSTEM HALTED.", delay: 1350, color: "#ff003c" },
  { text: "█ AWAITING USER INPUT TO PROCEED...", delay: 1500, color: "#ff003c" }
]

export default function LandingScreen({ onEnter }) {
  const [exiting, setExiting] = useState(false)
  const [bootLines, setBootLines] = useState([])
  const [showButton, setShowButton] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const timeouts = []

    bootSequence.forEach((item, i) => {
      const timeout = setTimeout(() => {
        setBootLines(prev => [...prev, item])
        if (i === bootSequence.length - 1) {
          setTimeout(() => setShowButton(true), 600)
        }
      }, 200 + item.delay)
      timeouts.push(timeout)
    })

    return () => timeouts.forEach(t => clearTimeout(t))
  }, [])

  const handleClick = () => {
    if (exiting) return
    setExiting(true)

    // Try to play boot sound
    try {
      const audio = new Audio('/audio/boot_sound.mp3')
      audio.volume = 0.3
      audio.play().catch(() => { })
    } catch (e) {
      // Silent fail if no audio
    }

    setTimeout(onEnter, 900)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col bg-black font-mono overflow-hidden select-none"
      initial={{ opacity: 1 }}
      animate={
        exiting
          ? {
            opacity: [1, 1, 1, 0],
            scaleX: [1, 1.02, 0.01, 0],
            scaleY: [1, 0.98, 0.01, 0],
            filter: ['brightness(1)', 'brightness(1.5)', 'brightness(3)', 'brightness(0)']
          }
          : { opacity: 1 }
      }
      transition={{ duration: 0.9, ease: 'circIn' }}
    >
      {/* CRT Scanline Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04))
          `,
          backgroundSize: '100% 3px, 4px 100%'
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#000_90%)]" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center p-6 md:p-12 lg:p-16 max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-[#00f0ff]"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="text-[#808080] text-xs tracking-[0.2em]">
            YORHA SYSTEMS BIOS v1.24
          </span>
        </div>

        {/* Boot Sequence Lines */}
        <div className="mb-8 text-xs md:text-sm leading-loose space-y-0.5 min-h-[300px]">
          {bootLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={{ color: line.color || '#808080' }}
            >
              {line.text || '\u00A0'}
            </motion.div>
          ))}

          {/* Blinking Cursor */}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="inline-block w-2 h-4 bg-[#00f0ff] ml-0.5 align-middle"
          />
        </div>

        {/* Initialize Button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mt-4"
            >
              <button
                onClick={handleClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                disabled={exiting}
                className="group relative cursor-pointer disabled:cursor-wait"
              >
                {/* Outer glow effect */}
                <motion.div
                  className="absolute -inset-2 border border-[#00f0ff]/20 rounded"
                  animate={{
                    opacity: hovered ? 0.8 : 0.3,
                    scale: hovered ? 1.02 : 1
                  }}
                  transition={{ duration: 0.2 }}
                />

                {/* Main Button */}
                <div
                  className={`relative px-8 md:px-12 py-4 text-sm md:text-base tracking-[0.15em] font-bold border-2 transition-all duration-200 uppercase ${hovered
                      ? 'bg-[#00f0ff] text-black border-[#00f0ff]'
                      : 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]'
                    }`}
                  style={{
                    boxShadow: hovered
                      ? '0 0 40px rgba(0, 240, 255, 0.5), inset 0 0 20px rgba(0, 240, 255, 0.2)'
                      : '0 0 15px rgba(0, 240, 255, 0.3)'
                  }}
                >
                  [ CLICK TO INITIALIZE SYSTEM ]
                </div>

                {/* Corner decorations */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#00f0ff]" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#00f0ff]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff]" />
              </button>

              {/* Warning text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-xs text-[#ff003c] tracking-[0.2em] flex items-center gap-2"
              >
                <span className="animate-pulse">⚠</span>
                WARNING: EMOTIONAL CONTENT AHEAD
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 p-6 md:p-12 flex justify-between items-end text-[#333] text-[10px] md:text-xs font-mono">
        <div className="space-y-1">
          <div>PROJECT: WEIGHT_OF_THE_WORLD</div>
          <div>TYPE: SCROLLYTELLING_EXPERIENCE</div>
          <div className="text-[#00f0ff]/50">CREATED BY: YONATHAN HEZRON</div>
        </div>
        <div className="text-right space-y-1">
          <div>BUILD: 2025.12.12</div>
          <div className="text-[#808080]">SYSTEM INFORMATION STUDENT</div>
        </div>
      </div>

      {/* Decorative Grid */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00f0ff 1px, transparent 1px),
            linear-gradient(to bottom, #00f0ff 1px, transparent 1px)
          `,
          backgroundSize: '30px 15px'
        }}
      />

      {/* Side decorations */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-2 hidden md:block">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 h-4 bg-[#00f0ff]/20"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  )
}
