"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  pendiente: {
    label: "Pendiente",
    color: "#fbbf24",
  },
  finalizado: {
    label: "Finalizado",
    color: "#10b981",
  },
  alerta: {
    label: "Alerta",
    color: "#ef4444",
  },
}

export function GraficaPastelEstados() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No hay token de autenticación')
        }

        const response = await fetch('http://51.178.31.63:3000/api/movilizaciones/estadisticas/estados', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Error al obtener las estadísticas')
        }

        const result = await response.json()

        if (result.success && result.data) {
          // Formatear los datos para el gráfico con nombres en español
          const formattedData = result.data.map(item => ({
            estado: item.estado === 'pendiente' ? 'Pendiente' :
                   item.estado === 'finalizado' ? 'Finalizado' :
                   item.estado === 'alerta' ? 'Alerta' : item.estado,
            total: item.total,
            fill: chartConfig[item.estado]?.color || '#6b7280'
          }))

          setChartData(formattedData)
        } else {
          setChartData([])
        }
      } catch (err) {
        console.error('Error fetching chart data:', err)
        setError(err.message)
        setChartData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calcular el total de movilizaciones
  const totalMovilizaciones = chartData.reduce((sum, entry) => sum + entry.total, 0)

  if (loading) {
    return (
      <Card className="flex flex-col bg-white">
        <CardHeader className="items-center pb-0">
          <CardTitle>Estado de Movilizaciones</CardTitle>
          <CardDescription>Distribución por estado actual</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-pulse text-gray-500">Cargando datos...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="flex flex-col bg-white">
        <CardHeader className="items-center pb-0">
          <CardTitle>Estado de Movilizaciones</CardTitle>
          <CardDescription>Distribución por estado actual</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col bg-white">
        <CardHeader className="items-center pb-0">
          <CardTitle>Estado de Movilizaciones</CardTitle>
          <CardDescription>Distribución por estado actual</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-gray-500">No hay datos disponibles</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col bg-white">
      <CardHeader className="items-center pb-0">
        <CardTitle>Estado de Movilizaciones</CardTitle>
        <CardDescription>Distribución por estado actual</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="estado"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardContent className="flex-1 pb-0">
        <div className="mt-4 flex justify-center">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {chartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="font-medium">{entry.estado}:</span>
                <span className="text-gray-600">{entry.total}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 font-semibold">
                <span>Total:</span>
                <span className="text-[#6e328a]">{totalMovilizaciones}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}