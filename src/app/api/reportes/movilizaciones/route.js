import { NextResponse } from 'next/server';

// Mock de la función que genera el buffer del archivo Excel
async function generarReporteCertificados(filtros) {
  console.log("Generando reporte con filtros:", filtros);
  // IMPORTANTE: Esta es una función de ejemplo. El buffer que genera no es un archivo .xlsx válido.
  // Debes reemplazar esta lógica con tu implementación real para generar un archivo Excel correcto.
  const dummyBuffer = Buffer.from("Contenido de marcador de posición para el reporte.");
  return dummyBuffer;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filtros = Object.fromEntries(searchParams.entries());

    // --- LÓGICA DE FILTROS DE FECHA ---
    const { año, mes, mesDesde, mesHasta } = filtros;

    if (año) {
      const year = parseInt(año, 10);
      delete filtros.año;
      delete filtros.mes;
      delete filtros.mesDesde;
      delete filtros.mesHasta;

      if (mes) { // 1. Filtro por mes específico
        const month = parseInt(mes, 10);
        filtros.fechaDesde = new Date(year, month - 1, 1);
        filtros.fechaHasta = new Date(year, month, 0, 23, 59, 59, 999);
      } else if (mesDesde && mesHasta) { // 2. Filtro por rango de meses
        const startMonth = parseInt(mesDesde, 10);
        const endMonth = parseInt(mesHasta, 10);
        filtros.fechaDesde = new Date(year, startMonth - 1, 1);
        filtros.fechaHasta = new Date(year, endMonth, 0, 23, 59, 59, 999);
      } else { // 3. Filtro por año completo
        filtros.fechaDesde = new Date(year, 0, 1);
        filtros.fechaHasta = new Date(year, 11, 31, 23, 59, 59, 999);
      }
    }
    // --- FIN DE LA LÓGICA DE FECHAS ---

    console.log('Generando reporte con filtros procesados:', filtros);
    const buffer = await generarReporteCertificados(filtros);

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="reporte_movilizaciones_${Date.now()}.xlsx"`);

    return new NextResponse(buffer, { status: 200, statusText: 'OK', headers });

  } catch (error) {
    console.error('Error al generar el reporte:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al generar el reporte',
      error: error.message,
    }, { status: 500 });
  }
}