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

    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <motion.div
      className="fixed pointer-events-none z-50 hidden md:block"
      animate={{
        x: mousePosition.x - 150,
        y: mousePosition.y - 150,
        opacity: isVisible ? 0.15 : 0,
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      style={{
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, hsl(160 84% 45% / 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
      }}
    />
  )
}
