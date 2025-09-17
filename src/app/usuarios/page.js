'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash2, UserCog, Check, X, MoreHorizontal, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UsuariosTable() {
  const [usuarios, setUsuarios] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('todos');

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
        fetchUsuarios();
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
        fetchUsuarios();
      } else {
        Swal.fire('Error', data.message || 'No se pudo rechazar el usuario.', 'error');
      }
    } catch (error) {
      console.error('Error al rechazar el usuario:', error);
      Swal.fire('Error', 'Ocurrió un error al intentar rechazar.', 'error');
    }
  };

  const handleRoleChange = (usuario) => {
    Swal.fire({
      title: 'Cambiar Rol',
      text: `Selecciona el nuevo rol para ${usuario.nombre}`,
      input: 'select',
      inputOptions: {
        admin: 'Admin',
        tecnico: 'Técnico',
        ganadero: 'Ganadero',
        faenador: 'Faenador'
      },
      inputValue: usuario.rol,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Cambiar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed && result.value !== usuario.rol) {
        try {
          const res = await fetch(`http://51.178.31.63:3000/api/usuarios/admin/usuarios/${usuario.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rol: result.value }),
          });
          const data = await res.json();
          if (data.success) {
            Swal.fire('¡Rol Cambiado!', `El rol de ${usuario.nombre} ha sido actualizado.`, 'success');
            fetchUsuarios();
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
          const res = await fetch(`http://51.178.31.63:3000/api/usuarios/admin/usuarios/${usuario.id}`, {
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
            fetchUsuarios();
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
          const res = await fetch(`http://51.178.31.63:3000/api/usuarios/admin/delete/usuarios/${id}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (data.success) {
            Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
            fetchUsuarios();
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

  const roleColors = {
    admin: 'warning',
    tecnico: 'info',
    ganadero: 'destructive',
    faenador: 'success',
  };

  const getRoleBadgeVariant = (rol) => {
    return roleColors[rol] || 'default';
  };

  const filteredUsers = usuarios.filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.ci.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedTab === 'todos') return matchesSearch;
    return matchesSearch && user.rol === selectedTab;
  });

  const UserTable = ({ users, isPending = false }) => (
    <div className="overflow-hidden rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>CI</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                {isPending ? 'No hay usuarios pendientes' : 'No se encontraron usuarios'}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{user.nombre}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.ci}</TableCell>
                <TableCell>{user.telefono || 'No registrado'}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.rol)} className="capitalize">
                    {user.rol}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isPending ? (
                    <Badge variant="secondary">Pendiente</Badge>
                  ) : (
                    <Badge variant="outline">Activo</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(user.fecha_registro).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  {isPending ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-md transition"
                        aria-label="Aprobar usuario"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-md transition"
                        aria-label="Rechazar usuario"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(user)}>
                          <UserCog className="mr-2 h-4 w-4" />
                          Cambiar Rol
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
        <p className="text-gray-500 mt-2">Administra los usuarios del sistema y sus permisos</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o CI..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      ) : (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-6">
            <TabsTrigger value="todos">Todos ({usuarios.length})</TabsTrigger>
            <TabsTrigger value="admin">
              Admins ({usuarios.filter(u => u.rol === 'admin').length})
            </TabsTrigger>
            <TabsTrigger value="tecnico">
              Técnicos ({usuarios.filter(u => u.rol === 'tecnico').length})
            </TabsTrigger>
            <TabsTrigger value="ganadero">
              Ganaderos ({usuarios.filter(u => u.rol === 'ganadero').length})
            </TabsTrigger>
            <TabsTrigger value="faenador">
              Faenadores ({usuarios.filter(u => u.rol === 'faenador').length})
            </TabsTrigger>
            <TabsTrigger value="pendientes">
              Pendientes ({pendingUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-6">
            <UserTable users={filteredUsers} />
          </TabsContent>

          <TabsContent value="admin" className="mt-6">
            <UserTable users={filteredUsers} />
          </TabsContent>

          <TabsContent value="tecnico" className="mt-6">
            <UserTable users={filteredUsers} />
          </TabsContent>

          <TabsContent value="ganadero" className="mt-6">
            <UserTable users={filteredUsers} />
          </TabsContent>

          <TabsContent value="faenador" className="mt-6">
            <UserTable users={filteredUsers} />
          </TabsContent>

          <TabsContent value="pendientes" className="mt-6">
            {pendingUsers.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Hay {pendingUsers.length} usuario(s) esperando aprobación. Revisa y aprueba los registros válidos.
                </p>
              </div>
            )}
            <UserTable users={pendingUsers} isPending />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}