'use client';

import { useState } from 'react';
import Sidebar from '@/app/components/slidebar';
import { useAuth } from '@/context/AuthContext';

export default function UsuariosLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const { user } = useAuth();

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

        <main className="p-6 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
