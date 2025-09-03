
'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';

export default function CardsMovilizaciones({ data: propData, loading: propLoading }) {
  const router = useRouter();
  const [localData, setLocalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    if (!propData) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          const res = await axios.get("https://51.178.31.63:3000/api/movilizaciones", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLocalData(res.data);
        } catch (error) {
          console.error("Error al cargar movilizaciones:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [propData]);

  const data = propData || localData;
  const isLoading = propLoading ?? loading;

  const handleViewPDF = async (id) => {
    try {
      setDownloading(prev => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `https://51.178.31.63:3000/api/movilizaciones/${id}/certificado`,
        {
          headers: { Authorization: `Bearer ${token}` },
          method: 'GET'
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar el certificado');
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      
      window.open(pdfUrl, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      
    } catch (error) {
      console.error(`Error al visualizar PDF para solicitud ${id}:`, error);
      alert(`Error: ${error.message}`);
    } finally {
      setDownloading(prev => ({ ...prev, [id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4 text-[#6e328a] font-semibold">
        Cargando datos...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">No hay movilizaciones para mostrar.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {data.map((item) => {
        const isDownloading = downloading[item.id] || false;
        return (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg text-[#6e328a]">{item.Usuario?.nombre || "—"}</h3>
              <p className="text-sm text-gray-500">{new Date(item.fecha_solicitud).toLocaleDateString()}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => handleViewPDF(item.id)}
                className="text-[#6e328a] font-medium hover:underline cursor-pointer text-sm"
                disabled={isDownloading}
              >
                {isDownloading ? 'Cargando...' : 'Ver Certificado'}
              </button>
              <button
                onClick={() => router.push(`/finalizar-guia/${item.id}`)}
                className="bg-[#6e328a] text-white px-3 py-1 rounded text-xs hover:bg-[#8a4fad] transition duration-200"
              >
                Finalizar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
