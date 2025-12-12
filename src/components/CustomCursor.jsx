import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Custom Nier-style Mechanical Cursor
 * Follows mouse with slight delay (lerp) for mechanical feel
 */
export default function CustomCursor() {
  const cursorRef = useRef(null)
  const cursorDotRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Store mouse position
  const mousePos = useRef({ x: 0, y: 0 })
  const cursorPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Only enable on desktop
    if (window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    setIsVisible(true)

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    const handleMouseEnter = (e) => {
      const target = e.target
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        setIsHovering(true)
      }
    }

    const handleMouseLeave = () => setIsHovering(false)

    // Lerp animation for smooth follow
    let animationFrame
    const animate = () => {
      // Lerp factor - lower = more delay/mechanical feel
      const lerp = 0.15

      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * lerp
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * lerp

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px)`
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${mousePos.current.x}px, ${mousePos.current.y}px)`
      }

      animationFrame = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseover', handleMouseEnter)
    document.addEventListener('mouseout', handleMouseLeave)

    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseover', handleMouseEnter)
      document.removeEventListener('mouseout', handleMouseLeave)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  if (!isVisible) return null

  return (
    <>
      {/* Hide default cursor */}
      <style>{`
        * { cursor: none !important; }
      `}</style>

      {/* Outer ring - follows with delay */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      >
        <motion.div
          className={`relative flex items-center justify-center transition-all duration-150 ${isClicking ? 'scale-75' : isHovering ? 'scale-150' : 'scale-100'
            }`}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: 'linear' }
          }}
        >
          {/* Main ring */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            {/* Outer dashed circle */}
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke={isHovering ? '#ffd700' : '#00f0ff'}
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={0.6}
            />
            {/* Inner circle */}
            <circle
              cx="20"
              cy="20"
              r="12"
              stroke={isHovering ? '#ffd700' : '#00f0ff'}
              strokeWidth="0.5"
              opacity={0.4}
            />
            {/* Corner brackets */}
            <path
              d="M8 8 L8 14 M8 8 L14 8"
              stroke={isHovering ? '#ffd700' : '#00f0ff'}
              strokeWidth="1.5"
              opacity={0.8}
            />
            <path
              d="M32 8 L32 14 M32 8 L26 8"
              stroke={isHovering ? '#ffd700' : '#00f0ff'}
              strokeWidth="1.5"
              opacity={0.8}
            />
            <path
              d="M8 32 L8 26 M8 32 L14 32"
              stroke={isHovering ? '#ffd700' : '#00f0ff'}
              strokeWidth="1.5"
              opacity={0.8}
            />
            <path
              d="M32 32 L32 26 M32 32 L26 32"
              stroke={isHovering ? '#ffd700' : '#00f0ff'}
              strokeWidth="1.5"
              opacity={0.8}
            />
          </svg>
        </motion.div>
      </div>

      {/* Center dot - follows instantly */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      >
        <div
          className={`rounded-full transition-all duration-100 ${isClicking
              ? 'w-2 h-2 bg-[#ff003c]'
              : isHovering
                ? 'w-3 h-3 bg-[#ffd700]'
                : 'w-1.5 h-1.5 bg-[#00f0ff]'
            }`}
          style={{
            boxShadow: isHovering
              ? '0 0 10px #ffd700, 0 0 20px #ffd700'
              : '0 0 8px #00f0ff'
          }}
        />
      </div>
    </>
  )
}
