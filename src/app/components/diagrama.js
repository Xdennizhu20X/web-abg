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

// Datos para cada filtro

// Datos por días de la semana (Semana)
const dataSemana = [
  { label: "Lun", desktop: 30 },
  { label: "Mar", desktop: 50 },
  { label: "Mié", desktop: 70 },
  { label: "Jue", desktop: 40 },
  { label: "Vie", desktop: 90 },
  { label: "Sáb", desktop: 60 },
  { label: "Dom", desktop: 20 },
]

// Datos por semanas del mes (Mes)
const dataMes = [
  { label: "Semana 1", desktop: 250 },
  { label: "Semana 2", desktop: 300 },
  { label: "Semana 3", desktop: 280 },
  { label: "Semana 4", desktop: 350 },
]

// Datos por meses del año (Año)
const dataAno = [
  { label: "Ene", desktop: 1200 },
  { label: "Feb", desktop: 1400 },
  { label: "Mar", desktop: 1100 },
  { label: "Abr", desktop: 1300 },
  { label: "May", desktop: 1500 },
  { label: "Jun", desktop: 1700 },
  { label: "Jul", desktop: 1600 },
  { label: "Ago", desktop: 1800 },
  { label: "Sep", desktop: 1400 },
  { label: "Oct", desktop: 1300 },
  { label: "Nov", desktop: 1500 },
  { label: "Dic", desktop: 1900 },
]

const chartConfig = {
  desktop: {
    label: "Solicitudes", // Changed label to Solicitudes
    color: "#6e328a",
  },
}

export function Diagrama() {
  const [filter, setFilter] = useState("mes");
  const [dataType, setDataType] = useState('movilizaciones'); // 'movilizaciones' or 'animales'

  // Escoger datos según filtro
  const chartData =
    filter === "semana" ? dataSemana : filter === "mes" ? dataMes : dataAno;

  return (
    <Card className="rounded-2xl border-2 border-black/10">
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle> {/* Changed title to Bar Chart */}
        <CardDescription>
          Showing total visitors for the last{" "}
          {filter === "semana"
            ? "week"
            : filter === "mes"
            ? "month by weeks"
            : "year by months"}
        </CardDescription>
      </CardHeader>

      {/* Data Type Filter Buttons */}
      <div className="flex items-center gap-2 px-6 pb-4">
        <button
          onClick={() => setDataType('movilizaciones')}
          className={`rounded-md px-3 py-1 text-sm font-semibold ${dataType === 'movilizaciones' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
        >
          Movilizaciones
        </button>
        <button
          onClick={() => setDataType('animales')}
          className={`rounded-md px-3 py-1 text-sm font-semibold ${dataType === 'animales' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
        >Animales y Aves</button>
      </div>
      {/* Botones filtro */}
      <div className="flex gap-2 px-6 pb-4">
        {["semana", "mes", "año"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item === "año" ? "año" : item)}
            className={`rounded-md px-3 py-1 text-sm font-semibold ${
              filter === (item === "año" ? "año" : item)
                ? "bg-purple-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <CardContent className="sm:h-82">
        <ChartContainer config={chartConfig} className="sm:h-82 sm:w-full">
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
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
              dataKey="desktop"
              fill="var(--color-desktop)"
              radius={4} // Added radius for rounded bars
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
              {filter === "semana"
                ? "Last week"
                : filter === "mes"
                ? "Current month by weeks"
                : "Current year by months"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}