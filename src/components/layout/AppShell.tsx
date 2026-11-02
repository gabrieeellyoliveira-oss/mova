import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { TopNav } from './TopNav'
import { Topbar } from './Topbar'
import { BottomNav } from './BottomNav'
import { Toaster } from './Toaster'
import { FormHost } from '@/components/modals/FormHost'
import { GameWatcher } from '@/components/game/GameWatcher'
import { FocusMode } from '@/components/game/FocusMode'
import { useGoogleCalendarSync } from '@/lib/googleCalendar'

export function AppShell() {
  const { pathname } = useLocation()
  useGoogleCalendarSync()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return (
    <div className="min-h-dvh text-tinta">
      <TopNav />
      <Topbar />
      <main key={pathname} className="w-full px-4 pb-32 pt-5 animate-rise sm:px-6 sm:pt-6 lg:px-8 lg:pb-12 lg:pt-8">
        <Outlet />
      </main>
      <BottomNav />
      <FormHost />
      <Toaster />
      <GameWatcher />
      <FocusMode />
    </div>
  )
}
