/**
 * Cinematic Overlay Effects
 * Separated from App.jsx for cleaner code organization
 */
export default function CinematicOverlay() {
  return (
    <>
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
          backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%)`,
          backgroundSize: '100% 3px'
        }}
      />

      {/* Top gradient for text readability */}
      <div
        className="fixed top-0 left-0 right-0 h-28 pointer-events-none z-25"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)'
        }}
      />

      {/* Bottom gradient for progress bar readability */}
      <div
        className="fixed bottom-0 left-0 right-0 h-28 pointer-events-none z-25"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
        }}
      />
    </>
  )
}
