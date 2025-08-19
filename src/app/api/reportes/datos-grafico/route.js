import { NextResponse } from 'next/server';

// Asumo que tienes una función como esta en algún lugar para obtener los datos.
// Por ahora, usaré datos de ejemplo.
async function obtenerDatosMovilizaciones(filtros) {
  // Aquí iría la lógica para consultar tu base de datos
  console.log('Filtrando con:', filtros);
  
  const { fechaDesde, fechaHasta } = filtros;

  // Datos de ejemplo que simulan la respuesta de la base de datos
  const todasLasMovilizaciones = [
    { csmi: 'GU0001', Animals: [{ especie: 'BOVINO', cantidad: 5 }], Aves: [], fecha_movilizacion: '2025-08-05' },
    { csmi: 'GU0002', Animals: [], Aves: [{ especie_ave: 'GALLINA', total_aves: 100 }], fecha_movilizacion: '2025-08-10' },
    { csmi: 'GU0003', Animals: [{ especie: 'BOVINO', cantidad: 10 }], Aves: [], fecha_movilizacion: '2025-08-15' },
    // Datos de otro mes para probar
    { csmi: 'GU0004', Animals: [{ especie: 'PORCINO', cantidad: 20 }], Aves: [], fecha_movilizacion: '2025-07-20' },
  ];

  if (!fechaDesde || !fechaHasta) {
    return todasLasMovilizaciones;
  }

  const desde = new Date(fechaDesde + 'T00:00:00');
  const hasta = new Date(fechaHasta + 'T23:59:59');

  return todasLasMovilizaciones.filter(m => {
    const fechaMov = new Date(m.fecha_movilizacion);
    return fechaMov >= desde && fechaMov <= hasta;
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cedula = searchParams.get('cedula');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    if (!cedula) {
      return NextResponse.json({ message: 'El número de cédula es requerido.' }, { status: 400 });
    }

    const filtros = { cedula, fechaDesde, fechaHasta };
    const movilizaciones = await obtenerDatosMovilizaciones(filtros);

    const totalMovilizaciones = movilizaciones.length;
    const totalAnimales = movilizaciones.reduce((sum, m) => sum + (m.Animals?.length || 0), 0);
    const totalAves = movilizaciones.reduce((sum, m) =>
      sum + (m.Aves?.reduce((aveSum, ave) => aveSum + (ave.total_aves || 0), 0) || 0), 0
    );

    return NextResponse.json({
      success: true,
      data: {
        totalMovilizaciones,
        totalAnimales,
        totalAves,
        movilizaciones,
      },
    });
  } catch (error) {
    console.error('Error al obtener los datos para el gráfico:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener los datos para el gráfico',
      error: error.message,
    }, { status: 500 });
  }
}
