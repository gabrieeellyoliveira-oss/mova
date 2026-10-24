import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { BottomNav } from './BottomNav'
import { Toaster } from './Toaster'
import { FormHost } from '@/components/modals/FormHost'

export function AppShell() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return (
    <div className="min-h-dvh bg-creme text-tinta">
      <Sidebar />
      <div className="lg:pl-[232px]">
        <Topbar />
        <main key={pathname} className="w-full px-4 pb-32 pt-5 animate-rise sm:px-6 sm:pt-6 lg:px-4 lg:pb-12">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <FormHost />
      <Toaster />
    </div>
  )
}
