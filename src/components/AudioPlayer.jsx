import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AudioPlayer({ started }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  useEffect(() => {
    if (started && audioRef.current) {
      audioRef.current.volume = volume

      const playAudio = async () => {
        try {
          await audioRef.current.play()
          setPlaying(true)
        } catch (err) {
          console.warn("Autoplay prevented by browser:", err)
          setPlaying(false)
        }
      }
      playAudio()
    }
  }, [started])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  // Audio visualizer bars animation
  const bars = [1, 2, 3, 4, 5]

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[150]">
      <audio
        ref={audioRef}
        src="/audio/weight_of_the_world.mp3"
        loop
        preload="auto"
      />

      <AnimatePresence>
        {started && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            {/* Volume Slider */}
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-black/90 border border-[#333] p-3 rounded backdrop-blur-md"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 h-1 accent-[#ffd700] cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ffd700 ${volume * 100}%, #333 ${volume * 100}%)`
                    }}
                  />
                  <div className="text-[10px] text-[#808080] text-center mt-1 font-mono">
                    VOL: {Math.round(volume * 100)}%
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Button */}
            <button
              onClick={toggle}
              className="group flex items-center gap-3 backdrop-blur-md bg-black/60 border border-[#333] px-4 py-2.5 rounded transition-all duration-300 hover:border-[#ffd700]/50 hover:bg-black/80 cursor-pointer"
              style={{
                boxShadow: playing ? '0 0 20px rgba(255, 215, 0, 0.1)' : 'none'
              }}
            >
              {/* Audio Visualizer Bars */}
              <div className="flex items-end gap-0.5 h-4">
                {bars.map((bar, i) => (
                  <motion.div
                    key={i}
                    className={`w-0.5 rounded-full ${playing ? 'bg-[#ffd700]' : 'bg-[#808080]'
                      }`}
                    animate={
                      playing
                        ? {
                          height: [
                            `${4 + Math.random() * 12}px`,
                            `${4 + Math.random() * 12}px`,
                            `${4 + Math.random() * 12}px`
                          ]
                        }
                        : { height: '4px' }
                    }
                    transition={
                      playing
                        ? {
                          duration: 0.3 + Math.random() * 0.2,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          delay: i * 0.1
                        }
                        : { duration: 0.3 }
                    }
                  />
                ))}
              </div>

              {/* Label */}
              <div className="flex flex-col items-start">
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/50 group-hover:text-white/70 transition-colors">
                  {playing ? 'Now Playing' : 'Sound Off'}
                </span>
                <span className="text-[9px] text-[#808080] font-mono">
                  Weight of the World
                </span>
              </div>

              {/* Play/Pause Icon */}
              <div
                className={`w-6 h-6 flex items-center justify-center border rounded-full transition-colors ${playing
                  ? 'border-[#ffd700]/50 text-[#ffd700]'
                  : 'border-[#808080]/50 text-[#808080]'
                  }`}
              >
                {playing ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                    <rect x="1" y="0" width="3" height="10" rx="0.5" />
                    <rect x="6" y="0" width="3" height="10" rx="0.5" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                    <polygon points="2,0 2,10 9,5" />
                  </svg>
                )}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
