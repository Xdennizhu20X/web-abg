import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

const statusStyle = {
  "En revisión": "bg-[#f3eaff] text-[#6e328a] border border-[#6e328a]",
  Aprobado: "bg-[#f3eaff] text-[#6e328a] border border-[#6e328a]",
  Rechazado: "bg-red-200 text-red-800 border border-red-300",
};

const statusIcon = {
  "En revisión": "⚙️",
  Aprobado: "✅",
  Rechazado: "❌",
};

export default function SolicitudesTable({ data: propData, loading: propLoading }) {
  const [localData, setLocalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (!propData) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          const res = await axios.get("http://localhost:3000/api/movilizaciones", {
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

  // Función para normalizar el estado y que coincida con las claves de statusStyle y statusIcon
  const normalizeEstado = (estado) => {
    if (!estado) return "";
    const est = estado.toLowerCase().trim();
    if (est === "en revisión" || est === "en revision") return "En revisión";
    if (est === "aprobado") return "Aprobado";
    if (est === "rechazado") return "Rechazado";
    return estado; // Si hay otros estados, se devuelve tal cual
  };

  if (isLoading)
    return (
      <div className="text-center py-4 text-[#6e328a] font-semibold">
        Cargando datos...
      </div>
    );

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
              <th className="p-4 font-semibold">Técnico</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, idx) => {
              const estadoKey = normalizeEstado(item.estado);

              return (
                <tr
                  key={idx}
                  className="border-t hover:bg-[#f9f5ff] transition duration-200"
                >
                  <td className="p-4 text-gray-800 font-medium">
                    {item.Usuario?.nombre || "—"}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/solicitud/${item.id}`}
                      className="text-[#6e328a] font-medium hover:underline"
                    >
                      Ver solicitud
                    </Link>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        statusStyle[estadoKey] ||
                        "border border-gray-300 text-gray-500"
                      }`}
                    >
                      <span>{statusIcon[estadoKey] || "📄"}</span>
                      {estadoKey}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">
                    {item.fecha_solicitud?.slice(0, 10)}
                  </td>
                  <td className="p-4 text-gray-700">
                    {(estadoKey === "Aprobado" || estadoKey === "Rechazado") &&
                    item.Validacion?.nombre_tecnico
                      ? item.Validacion.nombre_tecnico
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Paginación */}
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
