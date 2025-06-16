'use client';

import { useEffect, useState } from 'react';

export default function UsuariosKanban() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) return;

    const fetchUsuarios = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/usuarios/admin/usuarios', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setUsuarios(data.data);
        }
      } catch (error) {
        console.error('Error al cargar los usuarios', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [token]);

  const roles = ['admin', 'tecnico', 'ganadero'];

  // Asignación manual de colores para Tailwind (evita uso dinámico incompatible)
  const roleColors = {
    admin: {
      border: 'border-yellow-300',
      text: 'text-yellow-300',
      hover: 'hover:bg-yellow-100',
      bg: 'bg-yellow-50',
    },
    tecnico: {
      border: 'border-blue-500',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-100',
      bg: 'bg-blue-50',
    },
    ganadero: {
      border: 'border-red-500',
      text: 'text-red-600',
      hover: 'hover:bg-red-100',
      bg: 'bg-red-50',
    },
  };

  const groupedUsers = roles.reduce((acc, rol) => {
    acc[rol] = usuarios.filter(user => user.rol === rol);
    return acc;
  }, {});

  return (
    <>
      <h2 className="text-3xl font-semibold text-center bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 inline-block text-transparent bg-clip-text mb-4">Usuarios del Sistema</h2>

      {loading ? (
        <p className="text-gray-600">Cargando usuarios...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((rol) => (
            <div key={rol} className="bg-white rounded-xl  shadow-md p-4 border-t-4 border-purple-500 mb-6">
              <h3 className={`text-xl font-bold text-center mb-4 capitalize ${roleColors[rol].text}`}>
                {rol}s
              </h3>
              {groupedUsers[rol].length === 0 ? (
                <p className="text-gray-500 text-sm text-center">Sin usuarios</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {groupedUsers[rol].map((user) => (
                    <div
                      key={user.id}
                      className={`
                        border-l-4 p-4 rounded-r-xl shadow-sm transition
                        ${roleColors[rol].border} ${roleColors[rol].hover} bg-gray-50
                      `}
                    >
                      <h4 className="font-semibold text-gray-800 text-lg">{user.nombre}</h4>
                      <p className="text-sm text-gray-600">📧 {user.email}</p>
                      <p className="text-sm text-gray-600">🪪 CI: {user.ci}</p>
                      <p className="text-sm text-gray-600">📞 Tel: {user.telefono || 'No disponible'}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        🗓 Registrado: {new Date(user.fecha_registro).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
