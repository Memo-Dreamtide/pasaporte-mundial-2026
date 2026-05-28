"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"

interface TutorialOverlayProps {
  /** CSS selector of the element to spotlight */
  targetSelector: string
  /** Tooltip text to show */
  title: string
  description: string
  /** Position of the tooltip relative to spotlight */
  position?: "top" | "bottom"
  /** Optional action button in tooltip to advance manually */
  actionText?: string
  onAction?: () => void
  /** Skip tutorial */
  onSkip: () => void
  /** Step indicators */
  currentStep: number
  totalSteps: number
}

export default function TutorialOverlay({
  targetSelector,
  title,
  description,
  position = "bottom",
  actionText,
  onAction,
  onSkip,
  currentStep,
  totalSteps,
}: TutorialOverlayProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const findTarget = () => {
      const el = document.querySelector(targetSelector)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        // Measure after scroll settles
        setTimeout(() => {
          const rect = el.getBoundingClientRect()
          setTargetRect(rect)
        }, 400)
      }
    }

    // Initial find with small delay for page to render
    const timer = setTimeout(findTarget, 100)

    const handleResize = () => {
      const el = document.querySelector(targetSelector)
      if (el) setTargetRect(el.getBoundingClientRect())
    }
    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleResize)
    }
  }, [targetSelector])

  if (!targetRect) return null

  // Padding around the spotlight hole
  const pad = 10
  const holeLeft = targetRect.left - pad
  const holeTop = targetRect.top - pad
  const holeWidth = targetRect.width + pad * 2
  const holeHeight = targetRect.height + pad * 2
  const holeRight = holeLeft + holeWidth
  const holeBottom = holeTop + holeHeight

  const vw = window.innerWidth
  const vh = window.innerHeight

  // Tooltip position
  const tooltipLeft = Math.max(16, Math.min(holeLeft, vw - 296))
  const tooltipStyle: React.CSSProperties =
    position === "bottom"
      ? { left: tooltipLeft, top: holeBottom + 12 }
      : { left: tooltipLeft, bottom: vh - holeTop + 12 }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: "none" }}
      >
        {/* 4 overlay panels around the spotlight hole — block clicks but don't dismiss */}
        {/* Top panel */}
        <div
          className="absolute bg-black/85"
          style={{ top: 0, left: 0, right: 0, height: Math.max(0, holeTop), pointerEvents: "auto" }}
        />
        {/* Bottom panel */}
        <div
          className="absolute bg-black/85"
          style={{ top: holeBottom, left: 0, right: 0, bottom: 0, pointerEvents: "auto" }}
        />
        {/* Left panel */}
        <div
          className="absolute bg-black/85"
          style={{ top: holeTop, left: 0, width: Math.max(0, holeLeft), height: holeHeight, pointerEvents: "auto" }}
        />
        {/* Right panel */}
        <div
          className="absolute bg-black/85"
          style={{ top: holeTop, left: holeRight, right: 0, height: holeHeight, pointerEvents: "auto" }}
        />

        {/* Pulsing border around spotlight hole — no pointer events so clicks pass through to real element */}
        <div
          className="absolute border-2 border-red-atlantida rounded-2xl animate-pulse"
          style={{
            left: holeLeft,
            top: holeTop,
            width: holeWidth,
            height: holeHeight,
            pointerEvents: "none",
          }}
        />

        {/* Tooltip card */}
        <motion.div
          className="absolute z-10 w-[280px]"
          style={{ ...tooltipStyle, pointerEvents: "auto" }}
          initial={{ opacity: 0, y: position === "bottom" ? -10 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="bg-bg-elevated border border-border-medium rounded-2xl p-4 shadow-2xl">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mb-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentStep ? "w-5 bg-red-atlantida" : i < currentStep ? "w-3 bg-red-atlantida/40" : "w-3 bg-white/20"
                  }`}
                />
              ))}
            </div>

            <p className="text-white text-sm font-black mb-1">{title}</p>
            <p className="text-white/60 text-xs leading-relaxed">{description}</p>

            {actionText && onAction && (
              <button
                onClick={onAction}
                className="mt-3 w-full py-2.5 rounded-full font-black text-[10px] tracking-wider bg-red-atlantida text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                {actionText}
              </button>
            )}

            <button
              onClick={onSkip}
              className="mt-2 text-white/30 text-[10px] font-bold tracking-wider hover:text-white/50 transition-colors cursor-pointer"
            >
              SALTAR
            </button>
          </div>

          {/* Arrow pointing to spotlight */}
          <div
            className={`absolute left-8 w-3 h-3 bg-bg-elevated border-border-medium rotate-45 ${
              position === "bottom"
                ? "-top-1.5 border-l border-t"
                : "-bottom-1.5 border-r border-b"
            }`}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/** Celebration overlay shown after first prediction */
export function TutorialCelebration({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-red-atlantida/20 flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-red-atlantida">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </motion.div>

        <h2 className="text-4xl font-black text-white mb-5">Ya eres parte del juego</h2>
        <p className="text-white/50 text-lg font-bold mb-4 max-w-[340px] mx-auto leading-relaxed">
          Sigue pronosticando para subir en el ranking global y ganar premios.
        </p>
        <p className="text-white text-base mb-10 max-w-[380px] mx-auto leading-relaxed">
          No olvides revisar tu posicion en el ranking y los puntos obtenidos por partido en pronosticos.
        </p>

        {/* Grupo Financiero Atlántida logo — already white on transparent */}
        <img
          src="/images/logo-grupo-atlantida.png"
          alt="Grupo Financiero Atlántida"
          className="h-14 mx-auto mt-2 mb-10"
        />

        <button
          onClick={onClose}
          className="px-10 py-4 rounded-full font-black text-sm tracking-wider bg-red-atlantida text-white transition-all hover:bg-red-700 cursor-pointer"
        >
          SEGUIR JUGANDO
        </button>
      </motion.div>
    </motion.div>
  )
}
