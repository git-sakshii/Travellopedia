'use client'

import { motion } from 'framer-motion'

interface FloatingOrbsProps {
  count?: number
}

export function FloatingOrbs({ count = 3 }: FloatingOrbsProps) {
  const orbs = [
    { size: 400, x: '10%', y: '20%', delay: 0 },
    { size: 300, x: '70%', y: '60%', delay: 2 },
    { size: 350, x: '80%', y: '10%', delay: 4 },
  ].slice(0, count)

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: 'radial-gradient(circle, hsl(160 84% 45% / 0.15) 0%, transparent 70%)',
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
