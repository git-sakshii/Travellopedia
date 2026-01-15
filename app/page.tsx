'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, MapPin, Calendar, Compass } from 'lucide-react'
import { FloatingOrbs } from '@/components/floating-orbs'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const features = [
  { icon: Sparkles, label: 'AI-Powered', desc: 'Smart recommendations' },
  { icon: MapPin, label: 'Destinations', desc: 'Worldwide coverage' },
  { icon: Calendar, label: 'Itineraries', desc: 'Personalized plans' },
  { icon: Compass, label: 'Explore', desc: 'Hidden gems' },
]

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden gradient-bg">
      {/* Animated Background */}
      <FloatingOrbs count={5} />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Hero Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Floating Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Powered by Google Gemini AI
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl mb-6"
        >
          <span className="text-foreground">Your Journey</span>
          <br />
          <span className="gradient-text">Begins Here</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground mb-10"
        >
          Discover your perfect adventure with AI-powered travel recommendations,
          personalized itineraries, and real-time insights.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-4 justify-center mb-16"
        >
          <Link href="/explore">
            <Button 
              size="lg" 
              className="text-lg glow-button bg-gradient-to-r from-purple-600 via-cyan-600 to-pink-600 hover:from-purple-500 hover:via-cyan-500 hover:to-pink-500 border-0"
            >
              Start Planning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/explore?mode=guest">
            <Button
              size="lg"
              variant="outline"
              className="text-lg glass hover:bg-white/10"
            >
              Try as Guest
            </Button>
          </Link>
          <Link href="/bookmarks">
            <Button
              size="lg"
              variant="outline"
              className="text-lg glass hover:bg-white/10"
            >
              Saved Trips
            </Button>
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              className="glass rounded-xl p-4 hover-lift cursor-default"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <feature.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold text-sm">{feature.label}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}