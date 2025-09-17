"use client"

import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  totalMovilizaciones: {
    label: "Movilizaciones",
    color: "#6e328a",
  },
  totalAnimales: {
    label: "Animales",
    color: "#FF5733",
  },
  totalAves: {
    label: "Aves",
    color: "#33FF57",
  },
}

export function Diagrama() {
  const [filter, setFilter] = useState("año");
  const [userId, setUserId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Obtener token del localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!userId) {
        // --- Lógica para datos globales ---
        try {
          // Headers con autenticación si está disponible
          const headers = {
            'Content-Type': 'application/json'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(`/api/reportes/datos-grafico-global`, {
            headers
          });
          const result = await response.json();
          if (result.success) {
            const data = result.data;
            const formattedData = [
              { name: "Movilizaciones", total: data.totalMovilizaciones },
              { name: "Animales", total: data.totalAnimales },
              { name: "Aves", total: data.totalAves },
            ];
            setChartData(formattedData);
            setMetaData({
              title: "HOJAS DE MOVILIZACIÓN",
              description: ""
            });
          } else {
            setError(result.message);
            setChartData([]);
            setMetaData({ title: "Error", description: result.message });
          }
        } catch (err) {
          setError("Error de conexión al obtener los datos globales.");
          setChartData([]);
          setMetaData({ title: "Error", description: "No se pudo conectar al servidor." });
        } finally {
          setLoading(false);
        }
        return; // Termina la ejecución para no pasar a la lógica de usuario
      }

      // --- Lógica para datos por cédula ---
      let fechaDesde, fechaHasta;

      if (filter === "mesEspecifico") {
        fechaDesde = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        fechaHasta = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      } else if (filter === "anoEspecifico" || filter === "año") {
        const year = filter === "año" ? new Date().getFullYear() : selectedYear;
        fechaDesde = `${year}-01-01`;
        fechaHasta = `${year}-12-31`;
      }

      try {
        const params = new URLSearchParams({
          ci: userId,
          fechaDesde,
          fechaHasta,
        });

        // Headers con autenticación si está disponible
        const headers = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const requestUrl = `/api/reportes/datos-grafico?${params}`;

        // LOGS DE DEBUG
        console.log('🔍 === BÚSQUEDA POR CÉDULA DEBUG ===');
        console.log('📝 Parámetros de búsqueda:', {
          cedula: userId,
          fechaDesde,
          fechaHasta,
          filter,
          selectedYear,
          selectedMonth
        });
        console.log('🌐 URL de solicitud:', requestUrl);
        console.log('📋 Headers:', headers);
        console.log('🔑 Token presente:', !!token);

        const response = await fetch(requestUrl, {
          headers
        });

        console.log('📡 Status de respuesta:', response.status);
        console.log('✅ Response OK:', response.ok);

        const result = await response.json();

        console.log('📊 Respuesta completa del backend:', result);
        console.log('✔️ Success:', result.success);
        console.log('📈 Data:', result.data);
        console.log('❌ Message:', result.message);
        console.log('🔧 Debug Info:', result.debug);
        console.log('🔍 === FIN DEBUG ===');

        if (result.success) {
          const data = result.data;
          const formattedData = [
            { name: "Movilizaciones", total: data.totalMovilizaciones },
            { name: "Animales", total: data.totalAnimales },
            { name: "Aves", total: data.totalAves },
          ];
          setChartData(formattedData);
          setMetaData({
            title: `Datos para Cédula: ${userId}`,
            description: `Resultados del ${fechaDesde} al ${fechaHasta}`,
            dateRange: `${fechaDesde} - ${fechaHasta}`
          });
        } else {
          setError(result.message);
          setChartData([]);
          setMetaData({ title: "Error", description: result.message });
        }
      } catch (err) {
        console.log('❌ === ERROR EN BÚSQUEDA POR CÉDULA ===');
        console.log('🚨 Error completo:', err);
        console.log('📝 Error message:', err.message);
        console.log('📚 Error stack:', err.stack);
        console.log('❌ === FIN ERROR ===');

        setError("Error de conexión al obtener los datos.");
        setChartData([]);
        setMetaData({ title: "Error", description: "No se pudo conectar al servidor." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, filter, selectedMonth, selectedYear]);

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value, 10));
    setFilter("mesEspecifico");
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value, 10));
    setFilter("anoEspecifico");
  };
  
  const handleSearch = () => {
      // La búsqueda se activa con el useEffect al cambiar userId
      console.log("Buscando...");
  }

  const handleDownloadGlobalReport = () => {
    const params = new URLSearchParams({
      año: selectedYear,
    });
    const url = `http://51.178.31.63:3000/api/reportes/movilizaciones?${params}`;
    window.open(url, '_blank');
  };

  const handleDownloadUserReport = () => {
    if (!userId) return;

    let fechaDesde, fechaHasta;
    if (filter === "mesEspecifico") {
      fechaDesde = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      fechaHasta = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    } else if (filter === "anoEspecifico" || filter === "año") {
      const year = filter === "año" ? new Date().getFullYear() : selectedYear;
      fechaDesde = `${year}-01-01`;
      fechaHasta = `${year}-12-31`;
    }

    const params = new URLSearchParams();
    if (fechaDesde) params.append('fechaDesde', fechaDesde);
    if (fechaHasta) params.append('fechaHasta', fechaHasta);

    const url = `http://51.178.31.63:3000/api/reportes/usuario/${userId}?${params}`;
    window.open(url, '_blank');
  };

  const hasData = chartData.length > 0 && chartData.some((item) => item.total > 0);

  return (
    <Card className="rounded-2xl bg-white">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{metaData.title || "Estadísticas de Movilización"}</CardTitle>
            {metaData.description && <CardDescription>{metaData.description}</CardDescription>}
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownloadGlobalReport} className="rounded-md px-3 py-1 text-sm font-semibold bg-green-600 text-white">
              Reporte Global
            </button>
            {userId && (
              <button onClick={handleDownloadUserReport} className="rounded-md px-3 py-1 text-sm font-semibold bg-blue-600 text-white">
                Reporte Usuario
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <div className="flex flex-wrap items-center gap-2 pl-4 pr-3 pb-4">
        <label htmlFor="userId" className="text-sm font-semibold">Buscar por Cédula:</label>
        <input
          id="userId"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border px-2 py-1 rounded-md"
          placeholder="Ej: 1234567890"
        />
        <button onClick={handleSearch} className="rounded-md px-3 py-1 text-sm font-semibold bg-purple-600 text-white">
            Buscar
        </button>
      </div>

      {userId && (
        <>
          <div className="flex gap-2 px-6 pb-4 flex-wrap">
            <button
              onClick={() => setFilter("año")}
              className={`rounded-md px-3 py-1 text-sm font-semibold ${
                filter === "año" ? "bg-purple-600 text-white" : "bg-gray-200"
              }`}
            >
              Año Actual
            </button>

            <button
              onClick={() => setFilter("anoEspecifico")}
              className={`rounded-md px-3 py-1 text-sm font-semibold ${
                filter === "anoEspecifico" ? "bg-purple-600 text-white" : "bg-gray-200"
              }`}
            >
              Todo el Año
            </button>

            <div className="flex gap-2">
              <select 
                value={selectedMonth} 
                onChange={handleMonthChange} 
                className="border px-2 py-1 rounded-md text-sm font-semibold"
              >
                {[...Array(12).keys()].map((month) => (
                  <option key={month} value={month}>
                    {new Date(0, month).toLocaleString('es', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select 
                value={selectedYear} 
                onChange={handleYearChange} 
                className="border px-2 py-1 rounded-md text-sm font-semibold"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {metaData.dateRange && (
            <div className="px-6 pb-2">
              <p className="text-sm text-gray-600">
                <strong>Rango de fechas:</strong> {metaData.dateRange}
              </p>
            </div>
          )}
        </>
      )}

      <CardContent className="sm:h-82">
        {loading ? (
          <div className="flex items-center justify-center h-full">Cargando...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">{error}</div>
        ) : hasData ? (
          <ChartContainer config={chartConfig} className="sm:h-82 sm:w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="hsl(var(--chart-foreground))"
              />
              <YAxis
                stroke="hsl(var(--chart-foreground))"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />} 
              />
              <Bar dataKey="total" radius={4}>
                <Cell fill="var(--color-totalMovilizaciones)" />
                <Cell fill="var(--color-totalAnimales)" />
                <Cell fill="var(--color-totalAves)" />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full p-4 border-2 border-dashed border-red-400 rounded-lg bg-red-50">
            <p className="text-red-700 font-semibold">
              {userId ? "No se encontraron movilizaciones para los filtros seleccionados." : "No hay datos globales disponibles."}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Año: 2025
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}