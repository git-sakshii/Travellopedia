'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'

interface AuthButtonProps {
  closeMenu?: () => void
}

export function AuthButton({ closeMenu }: AuthButtonProps) {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'

  if (isLoading) {
    return (
      <div className="h-9 w-20 rounded-md shimmer" />
    )
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {session.user.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 glass" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {session.user.name && (
                <p className="font-medium">{session.user.name}</p>
              )}
              {session.user.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {session.user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              if (closeMenu) closeMenu()
              signOut({ callbackUrl: '/' })
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 gap-2">
      <Link href="/explore?mode=guest" onClick={closeMenu}>
        <Button variant="outline" size="sm" className="glass">
          Guest Mode
        </Button>
      </Link>
      <Button
        variant="outline"
        size="sm"
        className="glass"
        onClick={() => {
          if (closeMenu) closeMenu()
          signIn()
        }}
      >
        Sign In
      </Button>
    </div>
  )
}
