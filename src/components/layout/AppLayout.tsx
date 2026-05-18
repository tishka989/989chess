import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="gradient-mesh min-h-dvh">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-24 md:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
