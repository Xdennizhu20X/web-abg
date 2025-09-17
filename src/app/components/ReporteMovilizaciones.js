'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function ReporteMovilizaciones() {
  const [movilizaciones, setMovilizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    granjero: ''
  });
  const printRef = useRef();

  useEffect(() => {
    fetchMovilizaciones();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movilizaciones, filters]);

  const fetchMovilizaciones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://51.178.31.63:3000/api/movilizaciones', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMovilizaciones(res.data);
    } catch (error) {
      console.error('Error al cargar movilizaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...movilizaciones];

    if (filters.fechaInicio) {
      filtered = filtered.filter(item =>
        new Date(item.fecha_solicitud) >= new Date(filters.fechaInicio)
      );
    }

    if (filters.fechaFin) {
      filtered = filtered.filter(item =>
        new Date(item.fecha_solicitud) <= new Date(filters.fechaFin)
      );
    }

    if (filters.estado) {
      filtered = filtered.filter(item =>
        item.estado?.toLowerCase().includes(filters.estado.toLowerCase())
      );
    }

    if (filters.granjero) {
      filtered = filtered.filter(item =>
        item.Usuario?.nombre?.toLowerCase().includes(filters.granjero.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const normalizeEstado = (estado) => {
    if (!estado) return 'Sin estado';
    const est = estado.toLowerCase().trim();
    if (est === 'finalizada' || est === 'finalizado') return 'Finalizada';
    if (est === 'alerta') return 'Alerta';
    if (est === 'rechazado') return 'Rechazado';
    if (est === 'aprobado') return 'Aprobado';
    if (est === 'pendiente') return 'Pendiente';
    return estado;
  };

  const getEstadoColor = (estado) => {
    const est = estado?.toLowerCase();
    switch (est) {
      case 'finalizada':
      case 'finalizado':
      case 'aprobado':
        return 'text-green-700';
      case 'pendiente':
        return 'text-yellow-700';
      case 'alerta':
        return 'text-orange-700';
      case 'rechazado':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Granjero', 'Estado', 'Fecha de Solicitud', 'ID', 'Animales', 'Aves'].join(','),
      ...filteredData.map(item => [
        item.Usuario?.nombre || 'Sin nombre',
        normalizeEstado(item.estado),
        item.fecha_solicitud?.slice(0, 10) || 'Sin fecha',
        item.id,
        item.Animals?.length || 0,
        item.Aves?.length || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_movilizaciones_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[#6e328a]">Cargando movilizaciones...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Controles de filtros y acciones - Solo se muestran en pantalla */}
      <div className="print:hidden bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#6e328a] mb-6">Reporte de Movilizaciones</h1>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.fechaInicio}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaInicio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#6e328a] focus:border-[#6e328a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.fechaFin}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaFin: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#6e328a] focus:border-[#6e328a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#6e328a] focus:border-[#6e328a]"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="finalizada">Finalizada</option>
                <option value="alerta">Alerta</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Granjero
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={filters.granjero}
                onChange={(e) => setFilters(prev => ({ ...prev, granjero: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#6e328a] focus:border-[#6e328a]"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#6e328a] text-white rounded-md hover:bg-[#8a4fad] transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar CSV
            </button>

            <div className="text-sm text-gray-600 flex items-center">
              Mostrando {filteredData.length} de {movilizaciones.length} movilizaciones
            </div>
          </div>
        </div>
      </div>

      {/* Contenido imprimible */}
      <div ref={printRef} className="max-w-7xl mx-auto p-6">
        {/* Encabezado del reporte - Solo se muestra al imprimir */}
        <div className="hidden print:block mb-8 text-center border-b border-gray-300 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 relative mr-4">
              <Image
                src="/nuevologo.png"
                alt="Logo ABG"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#6e328a]">
                Agencia de Bioseguridad Galápagos
              </h1>
              <h2 className="text-lg text-gray-700">
                Reporte de Movilizaciones de Ganado
              </h2>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>Fecha de generación: {new Date().toLocaleDateString('es-ES', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}</p>
            <p>Total de registros: {filteredData.length}</p>
          </div>
        </div>

        {/* Tabla de movilizaciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Granjero
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Solicitud
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                  Animales
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                  Aves
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron movilizaciones con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      #{item.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.Usuario?.nombre || 'Sin nombre'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${getEstadoColor(item.estado)}`}>
                        {normalizeEstado(item.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.fecha_solicitud ?
                        new Date(item.fecha_solicitud).toLocaleDateString('es-ES') :
                        'Sin fecha'
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 print:hidden">
                      {item.Animals?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 print:hidden">
                      {item.Aves?.length || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen estadístico - Solo al imprimir */}
        <div className="hidden print:block mt-8 border-t border-gray-300 pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumen por Estado</h3>
              <div className="space-y-2">
                {['pendiente', 'finalizada', 'alerta', 'rechazado'].map(estado => {
                  const count = filteredData.filter(item =>
                    item.estado?.toLowerCase() === estado
                  ).length;
                  return (
                    <div key={estado} className="flex justify-between">
                      <span className="text-gray-700">{normalizeEstado(estado)}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Información General</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total de movilizaciones:</span>
                  <span className="font-medium">{filteredData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total de animales:</span>
                  <span className="font-medium">
                    {filteredData.reduce((sum, item) => sum + (item.Animals?.length || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total de aves:</span>
                  <span className="font-medium">
                    {filteredData.reduce((sum, item) => sum + (item.Aves?.length || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}