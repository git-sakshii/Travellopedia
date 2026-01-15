'use client'

import { motion } from 'framer-motion'

interface FloatingOrbsProps {
  count?: number
}

export function FloatingOrbs({ count = 3 }: FloatingOrbsProps) {
  const orbs = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 300 + 200,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
    color: i % 3 === 0 
      ? 'bg-purple-500/20' 
      : i % 3 === 1 
        ? 'bg-cyan-500/20' 
        : 'bg-pink-500/20'
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full blur-3xl ${orb.color}`}
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 50, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
