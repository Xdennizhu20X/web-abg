'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  LayoutDashboard,
  Truck,
  Users,
  Settings,
  LogOut,
  ClipboardList,
  Menu,
} from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [pendientesCount, setPendientesCount] = useState(0);

  useEffect(() => {
    const fetchPendientesCount = async () => {
      try {
        const response = await axios.get('https://back-abg.onrender.com/api/movilizaciones/pendientes/count');
        setPendientesCount(response.data.totalPendientes);
      } catch (error) {
        console.error('Error al obtener el conteo de pendientes:', error);
      }
    };

    fetchPendientesCount();
  }, []);

  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 shadow-md fixed top-0 left-0 z-50 transition-all duration-300
        ${isOpen ? 'w-64' : 'w-20'} sm:w-${isOpen ? '64' : '20'}
      `}
    >
      {/* Encabezado */}
      <div className={`flex items-center p-4 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <h1 className="text-xl font-bold text-[#6e328a] tracking-wide">ABG Panel</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-[#6e328a] transition"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="px-2 space-y-2 mt-4">
        <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" isOpen={isOpen} />
        <SidebarLink
          href="/dashboard/solicitudes"
          icon={ClipboardList}
          label="Solicitudes"
          isOpen={isOpen}
          badge={pendientesCount}
        />

        {user?.rol === 'admin' && (
          <SidebarLink href="/usuarios" icon={Users} label="Usuarios" isOpen={isOpen} />
        )}

        <SidebarLink href="/configuracion" icon={Settings} label="Configuración" isOpen={isOpen} />

        <button
          onClick={handleLogout}
          className={`flex items-center text-red-600 hover:bg-red-50 rounded w-full p-2 mt-6 transition ${
            isOpen ? 'justify-start' : 'justify-center'
          }`}
        >
          <LogOut className="h-5 w-5" />
          {isOpen && <span className="ml-3 font-medium">Cerrar sesión</span>}
        </button>
      </nav>
    </aside>
  );
}

function SidebarLink({ href, icon: Icon, label, isOpen, badge }) {
  return (
    <Link
      href={href}
      className={`flex items-center text-gray-700 hover:bg-blue-50 rounded p-2 transition ${
        isOpen ? 'justify-start' : 'justify-center'
      }`}
    >
      <Icon className="h-5 w-5" />
      {isOpen && (
        <span className="ml-3 flex items-center gap-2 font-medium text-sm">
          {label}
          {badge > 0 && (
            <span className="bg-[#6e328a] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
