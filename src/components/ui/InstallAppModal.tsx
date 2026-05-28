"use client"

import { motion, AnimatePresence } from "motion/react"

export default function InstallAppModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative z-10 w-full max-w-md bg-bg-elevated border border-border-subtle rounded-3xl p-6 overflow-y-auto max-h-[85vh]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-atlantida/20 flex items-center justify-center mx-auto mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-atlantida">
                <path d="M12 18v-6M12 12l-3 3m3-3l3 3" />
                <rect x="4" y="2" width="16" height="20" rx="3" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-white">Instalar en tu celular</h2>
            <p className="text-white/40 text-xs mt-1">Agrega Pasaporte 2026 a tu pantalla de inicio</p>
          </div>

          {/* Safari Instructions */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 1.5c4.694 0 8.5 3.806 8.5 8.5s-3.806 8.5-8.5 8.5S3.5 16.694 3.5 12 7.306 3.5 12 3.5zM10.5 7l5.5 5-5.5 5L9 15.5l4-3.5-4-3.5z"/>
                </svg>
              </div>
              <p className="text-white text-sm font-bold">Safari (iPhone)</p>
            </div>
            <div className="space-y-2.5 pl-2">
              <Step number={1} text={'Toca el icono de compartir'} icon="share" />
              <Step number={2} text={'Selecciona "Agregar a inicio"'} icon="plus" />
              <Step number={3} text={'Confirma tocando "Agregar"'} icon="check" />
            </div>
          </div>

          <div className="border-t border-white/10 my-4" />

          {/* Chrome Instructions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="4" fill="currentColor"/>
                </svg>
              </div>
              <p className="text-white text-sm font-bold">Chrome (Android / iPhone)</p>
            </div>
            <div className="space-y-2.5 pl-2">
              <Step number={1} text={'Toca el menu (3 puntos arriba)'} icon="dots" />
              <Step number={2} text={'Selecciona "Agregar a inicio"'} icon="plus" />
              <Step number={3} text={'Confirma tocando "Instalar"'} icon="check" />
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-full font-black text-xs tracking-wider bg-red-atlantida text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            ENTENDIDO
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Step({ number, text, icon }: { number: number; text: string; icon: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-red-atlantida/15 flex items-center justify-center shrink-0">
        <span className="text-red-atlantida text-xs font-black">{number}</span>
      </div>
      <div className="flex items-center gap-2 flex-1">
        {icon === "share" && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/50 shrink-0">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        )}
        {icon === "plus" && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/50 shrink-0">
            <rect x="3" y="3" width="18" height="18" rx="3" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        )}
        {icon === "check" && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/50 shrink-0">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
        {icon === "dots" && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 shrink-0">
            <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
          </svg>
        )}
        <span className="text-white/60 text-xs">{text}</span>
      </div>
    </div>
  )
}
