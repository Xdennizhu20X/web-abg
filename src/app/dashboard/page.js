// app/dashboard/page.js
'use client';

import { useState } from 'react';
import Sidebar from '@/app/components/slidebar';

export default function DashboardHome() {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <main className="p-6 bg-gray-50 min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Bienvenido al Panel</h2>
          <p className="text-gray-600">
            Este es el panel de gestión de movilización de ganado de ABG.
          </p>
        </main>
      </div>
    </div>
  );
}
