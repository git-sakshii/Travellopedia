'use client'

import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin, Plane, Heart } from 'lucide-react'
import Link from 'next/link'

const footerLinks = {
  quickLinks: [
    { href: '/explore', label: 'Explore' },
    { href: '/bookmarks', label: 'Bookmarks' },
    { href: '/todos', label: 'Todo List' },
    { href: '/history', label: 'History' },
  ],
  support: [
    { href: '/help', label: 'Help Center' },
    { href: '/privacy', label: 'Privacy Policy' },
  ],
}

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-bg opacity-50" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative container mx-auto px-4 py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold gradient-text">Travellopedia</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your AI-powered travel companion for creating unforgettable journeys around the world.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">
              Connect
            </h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg glass hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-white/10 mt-8 pt-8 text-center"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            © {new Date().getFullYear()} Travellopedia. Made with 
            <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
            for travelers.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
