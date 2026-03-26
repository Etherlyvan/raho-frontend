'use client'

import { LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth }          from '@/hooks/useAuth'
import { ROLE_LABELS }      from '@/lib/utils'
// ↓ Sprint 9: NotificationBell menggantikan tombol Bell statis
import { NotificationBell } from '@/components/layout/NotificationBell'

export function Navbar() {
  const { user, logout, isLoggingOut } = useAuth()
  if (!user) return null

  const displayName = user.fullName ?? user.email
  const initials    = displayName
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shrink-0">
      <div />
      <div className="flex items-center gap-2">
        {/* Sprint 9: Bell dengan badge unread count + dropdown preview */}
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 rounded-full">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xs bg-slate-200 dark:bg-slate-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                {user.fullName ?? user.email}
              </p>
              <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/shared/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profil Saya
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              disabled={isLoggingOut}
              className="text-red-600 dark:text-red-400 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? 'Keluar...' : 'Keluar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
