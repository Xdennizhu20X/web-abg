import { NextResponse } from 'next/server';

// Mock de la función que genera el buffer del archivo Excel
async function generarReporteCertificados(filtros) {
  console.log("Generando reporte con filtros:", filtros);
  // En un caso real, aquí se usaría una librería como exceljs.
  // Por ahora, generamos un CSV válido.
  const csvHeader = "ID,Usuario,Origen,Destino,Fecha\n";
  const csvRow1 = `1,${filtros.cedula},Granja San Pedro,Faenamiento Santa Cruz,2025-08-17\n`;
  const csvContent = csvHeader + csvRow1;
  const dummyBuffer = Buffer.from(csvContent, 'utf-8');
  return dummyBuffer;
}

export async function GET(request, { params }) {
  try {
    const { cedula } = params;
    if (!cedula) {
      return NextResponse.json({ message: 'El número de cédula es requerido.' }, { status: 400 });
    }

    console.log(`Generando reporte para la cédula: ${cedula}`);
    const buffer = await generarReporteCertificados({ cedula });

    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('Content-Disposition', `attachment; filename="reporte_usuario_${cedula}_${Date.now()}.csv"`);

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
