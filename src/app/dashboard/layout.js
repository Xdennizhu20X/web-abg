
'use client'
import Sidebar from '@/app/components/slidebar'
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function DashboardLayout({ children }) {
  return (
        <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
      <div className="flex min-h-screen ">
      <Sidebar />
      <main className="flex-1 p-4 bg-white overflow-y-scroll sm:pr-0 pr-20 ">{children}</main>
    </div>
    </ProtectedRoute>
    
  )
}
