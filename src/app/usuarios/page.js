'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash2, UserCog, Check, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function UsuariosKanban() {
  const [usuarios, setUsuarios] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('http://51.178.31.63:3000/api/usuarios/admin/usuarios', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.data.filter(u => u.estado !== 'pendiente'));
        setPendingUsers(data.data.filter(u => u.estado === 'pendiente'));
      }
    } catch (error) {
      console.error('Error al cargar los usuarios', error);
      Swal.fire('Error', 'No se pudieron cargar los usuarios.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsuarios();
    }
  }, [token]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://51.178.31.63:3000/api/usuarios/admin/usuarios/${id}/aprobar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire('¡Aprobado!', 'El usuario ha sido aprobado.', 'success');
        fetchUsuarios(); // Recargar la lista de usuarios
      } else {
        Swal.fire('Error', data.message || 'No se pudo aprobar el usuario.', 'error');
      }
    } catch (error) {
      console.error('Error al aprobar el usuario:', error);
      Swal.fire('Error', 'Ocurrió un error al intentar aprobar.', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://51.178.31.63:3000/api/usuarios/admin/usuarios/${id}/rechazar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire('¡Rechazado!', 'El usuario ha sido rechazado.', 'success');
        fetchUsuarios(); // Recargar la lista de usuarios
      } else {
        Swal.fire('Error', data.message || 'No se pudo rechazar el usuario.', 'error');
      }
    } catch (error) {
      console.error('Error al rechazar el usuario:', error);
      Swal.fire('Error', 'Ocurrió un error al intentar rechazar.', 'error');
    }
  };

  const handleRoleChange = (usuario) => {
    const newRole = usuario.rol === 'admin' ? 'tecnico' : 'admin';
    Swal.fire({
      title: '¿Cambiar Rol?',
      text: `¿Quieres cambiar el rol de ${usuario.nombre} de ${usuario.rol} a ${newRole}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡cambiar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://51.178.31.63:3000/api/usuarios/admin/usuarios/${usuario.id}` , {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rol: newRole }),
          });
          const data = await res.json();
          if (data.success) {
            Swal.fire('¡Rol Cambiado!', `El rol de ${usuario.nombre} ha sido actualizado.`, 'success');
            fetchUsuarios(); // Recargar la lista de usuarios
          } else {
            Swal.fire('Error', data.message || 'No se pudo cambiar el rol del usuario.', 'error');
          }
        } catch (error) {
          console.error('Error al cambiar el rol del usuario:', error);
          Swal.fire('Error', 'Ocurrió un error al intentar cambiar el rol.', 'error');
        }
      }
    });
  };

  const handleEdit = (usuario) => {
    Swal.fire({
      title: `Editar Usuario: ${usuario.nombre}`,
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${usuario.nombre}">
        <input id="swal-email" class="swal2-input" placeholder="Email" value="${usuario.email}">
        <input id="swal-ci" class="swal2-input" placeholder="CI" value="${usuario.ci}">
        <input id="swal-telefono" class="swal2-input" placeholder="Teléfono" value="${usuario.telefono || ''}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-nombre').value;
        const email = document.getElementById('swal-email').value;
        const ci = document.getElementById('swal-ci').value;
        const telefono = document.getElementById('swal-telefono').value;
        return { nombre, email, ci, telefono };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://51.178.31.63:3000/api/usuarios/admin/usuarios/${usuario.id}`,
           {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(result.value),
          });
          const data = await res.json();
          if (data.success) {
            Swal.fire('¡Actualizado!', 'El usuario ha sido actualizado.', 'success');
            fetchUsuarios(); // Recargar la lista de usuarios
          } else {
            Swal.fire('Error', data.message || 'No se pudo actualizar el usuario.', 'error');
          }
        } catch (error) {
          console.error('Error al actualizar el usuario:', error);
          Swal.fire('Error', 'Ocurrió un error al intentar actualizar.', 'error');
        }
      }
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡elimínalo!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://51.178.31.63:3000/api/usuarios/admin/delete/usuarios/${id}`,
           {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (data.success) {
            Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
            fetchUsuarios(); // Recargar la lista de usuarios
          } else {
            Swal.fire('Error', data.message || 'No se pudo eliminar el usuario.', 'error');
          }
        } catch (error) {
          console.error('Error al eliminar el usuario:', error);
          Swal.fire('Error', 'Ocurrió un error al intentar eliminar.', 'error');
        }
      }
    });
  };

  const roles = ['admin', 'tecnico', 'ganadero', 'faenador'];

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
    faenador: {
      border: 'border-green-500',
      text: 'text-green-600',
      hover: 'hover:bg-green-100',
      bg: 'bg-green-50',
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
          <div key="pendiente" className="bg-white rounded-xl shadow-md p-4 border-t-4 border-gray-500 mb-6">
              <h3 className={`text-xl font-bold text-center mb-4 capitalize text-gray-600`}>
                Usuarios Pendientes
              </h3>
              {pendingUsers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">Sin usuarios pendientes</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`
                        border-l-4 p-4 rounded-r-xl shadow-sm transition
                        border-gray-500 hover:bg-gray-100 bg-gray-50
                      `}
                    >
                      <h4 className="font-semibold text-gray-800 text-lg">{user.nombre}</h4>
                      <p className="text-sm text-gray-600">📧 {user.email}</p>
                      <p className="text-sm text-gray-600">🪪 CI: {user.ci}</p>
                      <p className="text-sm text-gray-600">📞 Tel: {user.telefono || 'No disponible'}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        🗓 Registrado: {new Date(user.fecha_registro).toLocaleDateString()}
                      </p>
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-full transition"
                          aria-label="Aprobar usuario"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                          aria-label="Rechazar usuario"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          {roles.map((rol) => (
            <div key={rol} className="bg-white rounded-xl shadow-md p-4 border-t-4 border-purple-500 mb-6">
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
                      <div className="flex justify-end gap-2 mt-3">
                        {['admin', 'tecnico'].includes(user.rol) && (
                          <button
                            onClick={() => handleRoleChange(user)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition"
                            aria-label="Cambiar rol"
                          >
                            <UserCog size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                          aria-label="Editar usuario"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                          aria-label="Eliminar usuario"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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