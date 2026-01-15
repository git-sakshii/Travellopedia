'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function CursorGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Don't render on mobile/touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null
  }

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 hidden md:block"
      animate={{
        background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.1), transparent 80%)`,
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      style={{ opacity: isVisible ? 1 : 0 }}
    />
  )
}
