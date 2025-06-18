"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function ValidacionPage({ params }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const [form, setForm] = useState({
    tiempo_validez: '',
    hora_inicio: '',
    hora_fin: '',
    firma_tecnico: '',
  });
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    if (!id || !token) return;

    fetch(`https://back-abg.onrender.com/api/movilizaciones/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.validacion) {
          setForm(data.validacion);
        }
        setLoading(false);
      })
      .catch((err) => {
        Swal.fire('❌ Error al cargar', err.message, 'error');
        setLoading(false);
      });
  }, [id, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { tiempo_validez, hora_inicio, hora_fin, firma_tecnico } = form;
    if (!tiempo_validez || !hora_inicio || !hora_fin || !firma_tecnico) {
      return Swal.fire('Faltan campos', 'Completa todos los datos', 'warning');
    }

    try {
      const res = await fetch(
        `https://back-abg.onrender.com/api/movilizaciones/${id}/validacion`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await res.json();
      Swal.fire('✅ Validación guardada', '', 'success').then(() =>
        router.push('/dashboard')
      );
    } catch (error) {
      Swal.fire('❌ Error al enviar', error.message, 'error');
    }
  };

  const rechazarMovilizacion = async () => {
    if (!observaciones) {
      return Swal.fire('Observaciones requeridas', 'Debe ingresar las razones del rechazo', 'warning');
    }

    try {
      const res = await fetch(
        `https://back-abg.onrender.com/api/movilizaciones/${id}/rechazar`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ observaciones_tecnico: observaciones }),
        }
      );

      if (!res.ok) throw new Error(`Error ${res.status}`);
      
      await res.json();
      Swal.fire('✅ Movilización rechazada', '', 'success').then(() =>
        router.push('/dashboard')
      );
    } catch (error) {
      Swal.fire('❌ Error al rechazar', error.message, 'error');
    }
  };

  if (loading) return <p className="p-4">Cargando...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-xl font-semibold mb-4">Validación Técnica</h1>
      
      {/* Formulario de validación */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          name="tiempo_validez"
          value={form.tiempo_validez}
          onChange={handleChange}
          placeholder="Tiempo de validez (ej: 5 horas)"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="time"
          name="hora_inicio"
          value={form.hora_inicio}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="time"
          name="hora_fin"
          value={form.hora_fin}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="url"
          name="firma_tecnico"
          value={form.firma_tecnico}
          onChange={handleChange}
          placeholder="URL firma técnico"
          className="w-full border px-3 py-2 rounded"
        />

        <div className="flex justify-between">
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            <Link href="/dashboard" className="block w-full h-full">
              Cancelar
            </Link>
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar Validación
          </button>
        </div>
      </form>

      {/* Sección de rechazo */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-3 text-red-600">Rechazar Movilización</h2>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Motivo del rechazo..."
          className="w-full border px-3 py-2 rounded mb-3 h-24"
        />
        <button 
          onClick={rechazarMovilizacion}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
        >
          Rechazar Movilización
        </button>
      </div>
    </div>
  );
}