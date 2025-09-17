'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/slidebar';
import SectionTable from '@/app/components/SectionTable';
import CardsMovilizaciones from '@/app/components/CardsMovilizaciones';
import { Diagrama } from '@/app/components/diagrama';
import { GraficaPastelEstados } from '@/app/components/GraficaPastelEstados';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

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

        <main className="p-6 bg-gray-50 h-auto mx-5 flex flex-wrap justify-center sm:justify-between items-center  ">
          <div className="flex items-center justify-start flex-col ">
          <h2 className="text-3xl font-bold text-start text-[#6e328a] mb-2">
                      Bienvenido al Panel{user?.nombre ? `, ${user.nombre}` : ''}
                    </h2>
                    <p className="text-gray-600   text-start">
                      Este es el panel de gestión de movilización de ganado de ABG.
                    </p>
          </div>
          
          <Image
                  src="/nuevologo.png"
                  alt="Logo ABG"
                  width={300}
                  height={50}
                  priority
                />
        </main>

        {user.rol === 'admin' && (
          <div className="w-full px-4 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow p-4">
                <h3 className="text-lg font-semibold text-[#6e328a] mb-3">
                  Resumen de Actividad
                </h3>
                <Diagrama />
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow p-4">
                <h3 className="text-lg font-semibold text-[#6e328a] mb-3">
                  Estados de Movilizaciones
                </h3>
                <GraficaPastelEstados />
              </div>
            </div>
          </div>
        )}

        <div className="w-full px-4 pt-4 pb-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow p-4">
            {user.rol === 'faenador' ? <CardsMovilizaciones /> : <SectionTable />}
          </div>
        </div>
      </div>
    </div>
  );
}
