"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
  className?: string
}

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  duration = 0.6,
  className = "",
}: FadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const directionOffset = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
    none: {},
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(4px)", ...directionOffset[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
