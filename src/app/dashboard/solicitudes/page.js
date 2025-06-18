// app/solicitudes/page.js
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/slidebar';
import SolicitudesTable from '@/app/components/SectionTable';
import { useAuth } from '@/context/AuthContext';
import axios from "axios";
import Swal from 'sweetalert2';

export default function SolicitudesPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined)
      );
      
      const queryParams = Object.keys(filteredParams).length > 0 
        ? `?${new URLSearchParams(filteredParams).toString()}`
        : '';
      
      // Asegúrate de incluir el parámetro para traer la relación con el técnico
      const url = `http://localhost:3000/api/movilizaciones/filtrar${queryParams}`;
      console.log("URL completa de la solicitud:", url);
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Datos recibidos del backend:", res.data);
      
      // Transforma los datos si es necesario
      const formattedData = res.data.map(item => ({
        ...item,
        // Asegúrate de que la propiedad del técnico esté accesible
        tecnicoNombre: item.Validacion?.nombre_tecnico || item.Tecnico?.nombre || null
      }));
      
      setData(formattedData);
      
      // Resto de tu código...
    } catch (error) {
      // Manejo de errores...
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyFilters = () => {
    console.log("Filtros antes de normalizar:", filters); // [DEBUG]
    
    const normalizedFilters = {
      ...filters,
      estado: filters.estado?.toLowerCase()
    };
    
    const cleanFilters = Object.fromEntries(
      Object.entries(normalizedFilters).filter(([_, v]) => v && v !== '')
    );

    console.log("Filtros que se aplicarán:", cleanFilters); // [DEBUG]
    
    setAppliedFilters(cleanFilters);
    fetchData(cleanFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    setAppliedFilters({});
    fetchData();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    console.log(`Filtro cambiado: ${name} = ${value}`); // [DEBUG]
  };

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`transition-all duration-300 w-full ${isOpen ? 'sm:ml-64 ml-20' : 'sm:ml-20 ml-20'}`}>
        {isOpen && (
          <div className="fixed inset-0 bg-black/20 z-40 sm:hidden" onClick={toggleSidebar} />
        )}
        <main className="p-4 bg-gray-50 h-auto">
          <h1 className="text-2xl font-bold text-[#6e328a] mb-4">Solicitudes</h1>
          
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6e328a] mb-1">Estado</label>
                <select
                  name="estado"
                  value={filters.estado || ""}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Todos</option>
                  <option value="pendiente">En revisión</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6e328a] mb-1">Nombre granjero</label>
                <input
                  type="text"
                  name="nombre"
                  value={filters.nombre || ""}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Buscar por nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6e328a] mb-1">Fecha inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={filters.fecha_inicio || ""}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6e328a] mb-1">Fecha fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={filters.fecha_fin || ""}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Limpiar
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-[#6e328a] text-white rounded-md hover:bg-blue-700"
              >
                Filtrar
              </button>
            </div>
          </div>

          <SolicitudesTable data={data} loading={loading} />
        </main>
      </div>
    </div>
  );
}