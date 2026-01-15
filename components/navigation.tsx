'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Menu, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { AuthButton } from '@/components/auth/auth-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/explore', label: 'Explore' },
  { href: '/bookmarks', label: 'Bookmarks' },
  { href: '/todos', label: 'Todo List' },
  { href: '/history', label: 'History' },
]

const linkVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
}

const mobileMenuVariants = {
  hidden: { opacity: 0, x: '100%' },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring', damping: 25, stiffness: 200 }
  },
  exit: { 
    opacity: 0, 
    x: '100%',
    transition: { duration: 0.2 }
  },
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const isSignedIn = !!session

  const closeMenu = () => setIsOpen(false)

  return (
    <motion.nav 
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Plane className="h-6 w-6 text-primary" />
              </motion.div>
              <span className="ml-2 text-xl font-bold gradient-text">Travellopedia</span>
            </Link>
            
            {/* Desktop Nav Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  custom={i}
                  variants={linkVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    href={link.href}
                    className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    {link.label}
                    <span className="absolute inset-x-2 -bottom-px h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isSignedIn && (
              <div className="block sm:hidden">
                <AuthButton closeMenu={closeMenu} />
              </div>
            )}
            <ThemeToggle />
            <div className="hidden sm:block">
              <AuthButton closeMenu={closeMenu} />
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden ml-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm sm:hidden z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />
            
            {/* Menu Panel */}
            <motion.div
              className="fixed top-0 right-0 h-full w-[280px] glass border-l border-white/10 sm:hidden z-50 p-6"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-end mb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMenu}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="block px-4 py-3 text-lg font-medium rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                {!isSignedIn && (
                  <div className="pt-4 mt-4 border-t border-white/10">
                    <AuthButton closeMenu={closeMenu} />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
