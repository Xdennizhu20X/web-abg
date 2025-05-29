
'use client'
import Sidebar from '@/app/components/slidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 bg-gray-100">{children}</main>
    </div>
  )
}
