import { Inter, Outfit } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth/auth-provider'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Toaster } from '@/components/ui/toaster'
import { CursorGlow } from '@/components/cursor-glow'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit'
})

export const metadata = {
  title: 'Travellopedia - AI Travel Planner',
  description: 'Discover your perfect adventure with AI-powered travel recommendations, personalized itineraries, and real-time insights.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <CursorGlow />
            <div className="flex flex-col min-h-screen relative">
              <Navigation />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}