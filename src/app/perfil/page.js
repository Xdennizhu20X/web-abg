'use client';

import { useEffect, useState } from 'react';
import { User, Mail, ShieldCheck, Phone, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PerfilPage() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchPerfil = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://51.178.31.63:3000/api/usuarios/perfil', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsuario(data.data);
        // Inicializar el formulario con los datos del perfil
        setFormData({
          nombre: data.data.nombre,
          email: data.data.email,
          telefono: data.data.telefono || '',
        });
      } else {
        Swal.fire('Error', 'No se pudo cargar el perfil.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un error al cargar el perfil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`http://51.178.31.63:3000/api/usuarios/admin/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire('¡Actualizado!', 'Tu perfil ha sido actualizado.', 'success');
        fetchPerfil(); // Recargar datos para reflejar los cambios
      } else {
        Swal.fire('Error', data.message || 'No se pudo actualizar el perfil.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un error al intentar actualizar.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Cargando perfil...</p>;
  }

  if (!usuario) {
    return <p className="text-center text-red-500">No se pudo cargar la información del perfil.</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna de información del usuario */}
        <div className="lg:col-span-1 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-md">
              <User className="text-white" size={64} />
            </div>
            <span className="absolute bottom-1 right-1 bg-white rounded-full px-2 py-1 text-xs font-semibold text-purple-700 shadow-sm capitalize">
              {usuario.rol}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{usuario.nombre}</h2>
          <p className="text-md text-gray-500">CI: {usuario.ci}</p>
          <div className="mt-4 border-t border-gray-200 w-full"></div>
          <div className="mt-4 space-y-3 text-gray-700 self-start">
             <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-purple-500" />
              <span>ID: {usuario.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-purple-500" />
              <span>{usuario.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-purple-500" />
              <span>{usuario.telefono || 'No disponible'}</span>
            </div>
          </div>
        </div>

        {/* Columna de edición de perfil */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Editar Información</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                id="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 transition-colors"
              >
                <Save size={18} className="mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
