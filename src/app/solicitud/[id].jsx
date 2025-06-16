'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SolicitudDetalle() {
  const router = useRouter();
  const { id } = router.query || {}; // Maneja undefined al inicio

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchSolicitud = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/api/movilizaciones/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSolicitud(res.data);
      } catch (error) {
        console.error("Error al cargar la solicitud:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitud();
  }, [id]);

  if (loading) return <p className="p-4">Cargando...</p>;
  if (!solicitud) return <p className="p-4 text-red-500">No se encontró la solicitud.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Detalle de Solicitud #{solicitud.id}</h2>
      <p><strong>Estado:</strong> {solicitud.estado}</p>
      <p><strong>Fecha:</strong> {solicitud.fecha_solicitud?.slice(0, 10)}</p>
      <p><strong>Granjero:</strong> {solicitud.Usuario?.nombre || "—"}</p>
      <p><strong>Origen:</strong> {solicitud.predio_origen?.nombre || "—"}</p>
      <p><strong>Destino:</strong> {solicitud.predio_destino?.nombre || "—"}</p>
      <p><strong>Animales:</strong></p>
      <ul className="list-disc list-inside">
        {solicitud.Animals?.map((animal, i) => (
          <li key={i}>{animal.especie} - {animal.cantidad}</li>
        )) || <li>No registrados</li>}
      </ul>
      {/* Aquí puedes agregar más detalles como transporte, técnico, etc. */}
    </div>
  );
}
