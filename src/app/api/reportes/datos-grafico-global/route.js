import { NextResponse } from 'next/server';

// Simula la obtención de datos globales
async function obtenerDatosGlobalesMovilizaciones(filtros) {
  console.log('Filtrando datos globales con:', filtros);
  
  const datosGlobales = {
    totalMovilizaciones: 4,
    totalAnimales: 5,
    totalAves: 213,
    movilizaciones: [ /* Array de movilizaciones detalladas si es necesario */ ],
  };

  return datosGlobales;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    const filtros = { fechaDesde, fechaHasta };
    const data = await obtenerDatosGlobalesMovilizaciones(filtros);

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error al obtener los datos globales para el gráfico:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener los datos globales para el gráfico',
      error: error.message,
    }, { status: 500 });
  }
}
