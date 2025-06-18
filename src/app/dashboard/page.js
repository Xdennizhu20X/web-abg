'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/slidebar';
import SectionTable from '@/app/components/SectionTable';
import { Diagrama } from '@/app/components/diagrama';
import { useAuth } from '@/context/AuthContext';

export default function DashboardHome() {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const { user } = useAuth();

  useEffect(() => {
    console.log('Usuario:', user);
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-lg text-gray-500 animate-pulse">Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`transition-all duration-300 w-full ${
          isOpen ? 'sm:ml-64 ml-20' : 'sm:ml-20 ml-20'
        }`}
      >
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={toggleSidebar}
          />
        )}

        <main className="p-6 bg-gray-50 h-auto ">
          <h2 className="text-3xl font-bold text-center text-[#6e328a] mb-2">
            Bienvenido al Panel{user?.nombre ? `, ${user.nombre}` : ''}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Este es el panel de gestión de movilización de ganado de ABG.
          </p>
        </main>

        {user.rol === 'admin' && (
          <div className="w-full px-4 pt-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow p-4">
              <h3 className="text-lg font-semibold text-[#6e328a] mb-3">
                Resumen de Actividad
              </h3>
              <Diagrama />
            </div>
          </div>
        )}

        <div className="w-full px-4 pt-4 pb-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow p-4">
            <SectionTable />
          </div>
        </div>
      </div>
    </div>
  );
}
