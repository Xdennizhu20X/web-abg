'use client';

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/app/components/slidebar';
import { useState } from 'react';
import ReporteMovilizaciones from '@/app/components/ReporteMovilizaciones';

export default function ReportesPage() {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-lg text-gray-500 animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`transition-all duration-300 w-full print:ml-0 ${
          isOpen ? 'sm:ml-64 ml-20' : 'sm:ml-20 ml-20'
        }`}
      >
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 sm:hidden print:hidden"
            onClick={toggleSidebar}
          />
        )}

        <main className="min-h-screen">
          <ReporteMovilizaciones />
        </main>
      </div>
    </div>
  );
}