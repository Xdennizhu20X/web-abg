'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/slidebar'; // Asegúrate de que se llame correctamente "Sidebar"
import SectionTable from '@/app/components/SectionTable';
import { Diagrama } from '@/app/components/diagrama';
import { useAuth } from '@/context/AuthContext'; // Hook de autenticación

export default function DashboardHome() {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const { user } = useAuth(); // Obtener usuario

  useEffect(() => {
    console.log('Usuario:', user); // Para verificar qué datos llegan
  }, [user]);

  // Mostrar pantalla de carga mientras se obtiene el usuario
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="flex">
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
          <h2 className="text-3xl font-semibold text-center bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 inline-block text-transparent bg-clip-text mb-4">
            Bienvenido al Panel{user?.nombre ? `, ${user.nombre}` : ''}
          </h2>
          <p className="text-gray-600">
            Este es el panel de gestión de movilización de ganado de ABG.
          </p>
        </main>

        {/* Solo el admin ve el Diagrama */}
        {user.rol === 'admin' && (
          <div className="w-full p-2">
            <Diagrama />
          </div>
        )}

        <div className="w-full p-2">
          <SectionTable />
        </div>
      </div>
    </div>
  );
}
