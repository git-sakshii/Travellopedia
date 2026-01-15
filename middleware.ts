import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl.clone()
    const token = req.nextauth.token
    const isLoggedIn = !!token

    // If logged in and trying to access guest mode, redirect without guest param
    if (isLoggedIn && url.pathname === '/explore' && url.searchParams.get('mode') === 'guest') {
      url.searchParams.delete('mode')
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname
        
        // Public routes - always allowed
        const publicRoutes = [
          '/',
          '/explore',
          '/api/explore',
          '/auth/signin',
          '/api/auth',
        ]
        
        // Check if current path starts with any public route
        const isPublicRoute = publicRoutes.some(route => 
          pathname === route || pathname.startsWith(route + '/')
        )
        
        if (isPublicRoute) {
          return true
        }
        
        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
