"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

// Datos por meses del año (Año)
const dataAno = [
  { label: "Ene", solicitudes: 1200, animalesAves: 500, movilizaciones: 700, fechaInicio: "2023-01-01", fechaFin: "2023-01-31" },
  { label: "Feb", solicitudes: 1400, animalesAves: 600, movilizaciones: 800, fechaInicio: "2023-02-01", fechaFin: "2023-02-28" },
  { label: "Mar", solicitudes: 1100, animalesAves: 450, movilizaciones: 650, fechaInicio: "2023-03-01", fechaFin: "2023-03-31" },
  { label: "Abr", solicitudes: 1300, animalesAves: 550, movilizaciones: 750, fechaInicio: "2023-04-01", fechaFin: "2023-04-30" },
  { label: "May", solicitudes: 1500, animalesAves: 650, movilizaciones: 850, fechaInicio: "2023-05-01", fechaFin: "2023-05-31" },
  { label: "Jun", solicitudes: 1700, animalesAves: 700, movilizaciones: 1000, fechaInicio: "2023-06-01", fechaFin: "2023-06-30" },
  { label: "Jul", solicitudes: 1600, animalesAves: 680, movilizaciones: 920, fechaInicio: "2023-07-01", fechaFin: "2023-07-31" },
  { label: "Ago", solicitudes: 1800, animalesAves: 750, movilizaciones: 1050, fechaInicio: "2023-08-01", fechaFin: "2023-08-31" },
  { label: "Sep", solicitudes: 1400, animalesAves: 580, movilizaciones: 820, fechaInicio: "2023-09-01", fechaFin: "2023-09-30" },
  { label: "Oct", solicitudes: 1300, animalesAves: 520, movilizaciones: 780, fechaInicio: "2023-10-01", fechaFin: "2023-10-31" },
  { label: "Nov", solicitudes: 1500, animalesAves: 630, movilizaciones: 870, fechaInicio: "2023-11-01", fechaFin: "2023-11-30" },
  { label: "Dic", solicitudes: 1900, animalesAves: 800, movilizaciones: 1100, fechaInicio: "2023-12-01", fechaFin: "2023-12-31" },
]

// Datos por mes específico
const dataMesEspecifico = (year, month) => {
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const data = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    data.push({
      label: `${day}`,
      solicitudes: Math.floor(Math.random() * 100) + 50,
      animalesAves: Math.floor(Math.random() * 40) + 20,
      movilizaciones: Math.floor(Math.random() * 60) + 30,
      fecha: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }
  
  return {
    monthName: monthNames[month],
    year: year,
    data: data
  };
};

// Datos por año específico
const dataAnoEspecifico = (year) => {
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const data = [];
  
  for (let month = 0; month < 12; month++) {
    data.push({
      label: monthNames[month],
      solicitudes: Math.floor(Math.random() * 1000) + 1000,
      animalesAves: Math.floor(Math.random() * 400) + 200,
      movilizaciones: Math.floor(Math.random() * 600) + 300,
      fechaInicio: `${year}-${String(month + 1).padStart(2, '0')}-01`,
      fechaFin: `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`
    });
  }
  
  return {
    year: year,
    data: data
  };
};

const chartConfig = {
  solicitudes: {
    label: "Solicitudes",
    color: "#6e328a",
  },
  animalesAves: {
    label: "Animales y Aves",
    color: "#FF5733",
  },
  movilizaciones: {
    label: "Movilizaciones",
    color: "#33FF57",
  },
}

export function Diagrama() {
  const [filter, setFilter] = useState("año");
  const [userId, setUserId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState('');

  // Obtener datos según filtro
  let chartData;
  let metaData = {};
  
  if (filter === "mesEspecifico") {
    const result = dataMesEspecifico(selectedYear, selectedMonth);
    chartData = result.data;
    metaData = {
      title: `Datos de ${result.monthName} ${result.year}`,
      description: `Del ${chartData[0].fecha} al ${chartData[chartData.length - 1].fecha}`,
      dateRange: `${chartData[0].fecha} - ${chartData[chartData.length - 1].fecha}`
    };
  } else if (filter === "anoEspecifico") {
    const result = dataAnoEspecifico(selectedYear);
    chartData = result.data;
    metaData = {
      title: `Datos del año ${result.year}`,
      description: `Del ${chartData[0].fechaInicio} al ${chartData[chartData.length - 1].fechaFin}`,
      dateRange: `${chartData[0].fechaInicio} - ${chartData[chartData.length - 1].fechaFin}`
    };
  } else {
    chartData = dataAno;
    metaData = {
      title: "Datos del año actual por meses",
      description: `Del ${dataAno[0].fechaInicio} al ${dataAno[dataAno.length - 1].fechaFin}`,
      dateRange: `${dataAno[0].fechaInicio} - ${dataAno[dataAno.length - 1].fechaFin}`
    };
  }

  // Manejar el cambio de mes y año
  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value, 10));
    setFilter("mesEspecifico");
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value, 10));
    setFilter("anoEspecifico");
  };

  return (
    <Card className="rounded-2xl border-2 bg-white border-black/10">
      <CardHeader>
        <CardTitle>{metaData.title}</CardTitle>
        <CardDescription>
          {metaData.description}
        </CardDescription>
      </CardHeader>

      {/* Input para buscar por Cédula */}
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
      </div>

      {/* Filtros */}
      <div className="flex gap-2 px-6 pb-4 flex-wrap">
        {/* Botones de filtro */}
        <button
          onClick={() => setFilter("año")}
          className={`rounded-md px-3 py-1 text-sm font-semibold ${
            filter === "año" ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}
        >
          Año Actual
        </button>

        {/* Filtro por Mes */}
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

      {/* Rango de fechas */}
      {metaData.dateRange && (
        <div className="px-6 pb-2">
          <p className="text-sm text-gray-600">
            <strong>Rango de fechas:</strong> {metaData.dateRange}
          </p>
        </div>
      )}

      <CardContent className="sm:h-82">
        <ChartContainer config={chartConfig} className="sm:h-82 sm:w-full">
          <BarChart
            data={chartData}
            margin={{
              
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--chart-foreground))"
            />
            <YAxis
              stroke="hsl(var(--chart-foreground))"
              position="insideLeft"
              angle={-90}
              style={{ textAnchor: 'middle' }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />} 
            />
            <Bar
              dataKey="solicitudes"
              fill="#6e328a"
              radius={4}
            />
            <Bar
              dataKey="animalesAves"
              fill="var(--color-animalesAves)"
              radius={4}
            />
            <Bar 
              dataKey="movilizaciones" 
              fill="var(--color-movilizaciones)" 
              radius={4} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {filter === "mesEspecifico"
                ? `Mes específico: ${new Date(0, selectedMonth).toLocaleString('es', { month: 'long' })} ${selectedYear}`
                : `Año específico: ${selectedYear}`}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}