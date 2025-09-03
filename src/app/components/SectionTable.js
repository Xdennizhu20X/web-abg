import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from 'next/navigation';

const statusStyle = {
  "En revisión": "bg-[#f3eaff] text-[#6e328a] border border-[#6e328a]",
  "Finalizada": "bg- text-[#155724] border border-[#c3e6cb]",
  "Alerta": "bg-[#fff3cd] text-[#856404] border border-[#ffeeba]",
  "Rechazado": "bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb]",
};

const statusIcon = {
  "En revisión": "⚙️",
  "Finalizada": "✅",
  "Alerta": "⚠️",
  "Rechazado": "❌",
};

export default function SolicitudesTable({ data: propData, loading: propLoading }) {
  const router = useRouter();
  const [localData, setLocalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  const normalizeEstado = (estado) => {
    if (!estado) return "";
    const est = estado.toLowerCase().trim();
    if (est === "finalizada") return "Finalizada";
    if (est === "alerta") return "Alerta";
    if (est === "rechazado") return "Rechazado";
    if (est === "aprobado") return "Aprobado";
    if (est === "pendiente") return "En revisión";
    return estado;
  };

  const handleDownloadPDF = async (id) => {
    try {
      setDownloading(prev => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("token");
      
      // Descargar el PDF directamente sin verificar estado
      const response = await fetch(
        `https://51.178.31.63:3000/api/movilizaciones/${id}/certificado`,
        {
          headers: { Authorization: `Bearer ${token}` },
          method: 'GET'
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al descargar el certificado');
      }

      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'certificado.pdf'; // nombre por defecto
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Obtener el blob y crear enlace de descarga
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      link.style.display = 'none'; // Ocultar el enlace
      
      document.body.appendChild(link);
      link.click();

      // Limpieza
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        setDownloading(prev => ({ ...prev, [id]: false }));
      }, 100);

    } catch (error) {
      console.error(`Error al descargar PDF para solicitud ${id}:`, error);
      alert(`Error: ${error.message}`);
      setDownloading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleViewPDF = async (id) => {
    try {
      setDownloading(prev => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("token");
      
      // Obtener el PDF
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

      // Crear una URL para el blob del PDF
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      
      // Abrir el PDF en una nueva pestaña
      window.open(pdfUrl, '_blank');
      
      // Liberar la URL cuando ya no sea necesaria
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
      <div className="text-center py-4 text-gray-500">No hay solicitudes para mostrar.</div>
    );
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-md bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-white text-left text-[#6e328a] uppercase text-xs border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold">Granjero</th>
              <th className="p-4 font-semibold">Solicitud</th>
              <th className="p-4 font-semibold">Estado</th>
              <th className="p-4 font-semibold">Fecha</th>
              <th className="p-4 font-semibold">Certificado</th>
              <th className="p-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => {
              const estadoKey = normalizeEstado(item.estado);
              const isDownloading = downloading[item.id] || false;

              return (
                <tr
                  key={item.id}
                  className="border-t hover:bg-[#f9f5ff] transition duration-200"
                >
                  <td className="p-4 text-gray-800 font-medium">
                    {item.Usuario?.nombre || "—"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleViewPDF(item.id)}
                      className="text-[#6e328a] font-medium hover:underline cursor-pointer"
                    >
                      Ver certificado
                    </button>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        statusStyle[estadoKey] ||
                        "border border-gray-300 text-gray-100 bg-[#34BC40]"
                      }`}
                    >
                      <span>{statusIcon[estadoKey] || "✅"}</span>
                      {estadoKey}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">
                    {item.fecha_solicitud?.slice(0, 10)}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDownloadPDF(item.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded text-xs bg-[#6e328a] text-white hover:bg-[#8a4fad] transition duration-200`}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generando...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Descargar
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => router.push(`/finalizar-guia/${item.id}`)}
                      className="bg-[#6e328a] text-white px-3 py-1 rounded text-xs hover:bg-[#8a4fad] transition duration-200"
                    >
                      Finalizar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Paginación (se mantiene igual) */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-gray-50 text-xs text-gray-600 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <span>Filas por página:</span>
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-gray-700"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 15].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded hover:bg-[#e3d9ff] transition ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#6e328a]"
              }`}
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded hover:bg-[#e3d9ff] transition ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#6e328a]"
              }`}
            >
              ‹
            </button>
            <span className="px-2 text-gray-700">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded hover:bg-[#e3d9ff] transition ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#6e328a]"
              }`}
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded hover:bg-[#e3d9ff] transition ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#6e328a]"
              }`}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}