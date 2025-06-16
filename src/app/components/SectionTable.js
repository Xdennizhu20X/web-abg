import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

const statusStyle = {
  "en revisión": "border border-gray-300 text-gray-700",
  aprobado: "border border-green-400 text-green-700 bg-green-50",
  rechazado: "border border-red-400 text-red-700 bg-red-50",
};

const statusIcon = {
  "en revisión": "⚙️",
  aprobado: "✅",
  rechazado: "❌",
};

export default function SolicitudesTable({ data: propData, loading: propLoading }) {
  const [localData, setLocalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Si no se pasa data desde fuera, carga la data localmente (para dashboard por ejemplo)
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

  // Usar los datos que vengan por props, o los que se cargaron localmente
  const data = propData || localData;
  const isLoading = propLoading ?? loading;

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  if (isLoading) return <div className="text-center py-4">Cargando datos...</div>;

  if (!data || data.length === 0) {
    return <div className="text-center py-4">No hay solicitudes para mostrar.</div>;
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-3">Granjero</th>
              <th className="p-3">Solicitud</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Técnico</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">
                  {item.Usuario?.nombre || "—"}
                </td>
                <td className="p-3">
                  <Link
                    href={`/solicitud/${item.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver solicitud
                  </Link>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle[item.estado] || "border text-gray-500"}`}
                  >
                    <span>{statusIcon[item.estado] || "📄"}</span>
                    {item.estado}
                  </span>
                </td>
                <td className="p-3 text-gray-700">
                  {item.fecha_solicitud?.slice(0, 10)}
                </td>
                <td className="p-3 text-gray-700">
                  {(item.estado === "aprobado" || item.estado === "rechazado") && item.Validacion?.nombre_tecnico
                    ? item.Validacion.nombre_tecnico
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 bg-gray-50 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>Filas por página:</span>
            <select
              className="border rounded px-2 py-1"
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
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>‹</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>›</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
