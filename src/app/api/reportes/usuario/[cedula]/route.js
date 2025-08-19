import { NextResponse } from 'next/server';

// Mock de la función que genera el buffer del archivo CSV
async function generarReporteCertificados(filtros) {
  console.log("Generando reporte de usuario con filtros:", filtros);
  // IMPORTANTE: Esta es una función de ejemplo. El buffer que genera no es un archivo .xlsx válido.
  // Debes reemplazar esta lógica con tu implementación real para generar un archivo Excel correcto.
  const dummyBuffer = Buffer.from("Contenido de marcador de posición para el reporte.");
  return dummyBuffer;
}

export async function GET(request, { params }) {
  try {
    const { cedula } = params;
    if (!cedula) {
      return NextResponse.json({ message: 'El número de cédula es requerido.' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    const filtros = { cedula };
    if (fechaDesde) filtros.fechaDesde = fechaDesde;
    if (fechaHasta) filtros.fechaHasta = fechaHasta;

    console.log(`Generando reporte para la cédula: ${cedula} con filtros:`, filtros);
    const buffer = await generarReporteCertificados(filtros);

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="reporte_usuario_${cedula}_${Date.now()}.xlsx"`);

    return new NextResponse(buffer, { status: 200, statusText: 'OK', headers });

  } catch (error) {
    console.error('Error al generar el reporte por cédula:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al generar el reporte por cédula',
      error: error.message,
    }, { status: 500 });
  }
}
