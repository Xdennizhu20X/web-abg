import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Obtener datos globales reales de movilizaciones desde el backend
async function obtenerDatosGlobalesMovilizaciones(filtros, token) {
  try {
    const { fechaDesde, fechaHasta } = filtros;

    // Construir parámetros de consulta
    const params = new URLSearchParams();
    if (fechaDesde) params.append('fecha_inicio', fechaDesde);
    if (fechaHasta) params.append('fecha_fin', fechaHasta);

    // Headers con autenticación
    const headers = {
      'Content-Type': 'application/json',
    };

    // Agregar token si está disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Llamada al backend real
    const response = await fetch(
      `http://51.178.31.63:3000/api/movilizaciones/filtrar?${params}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      console.error('Error al obtener movilizaciones del backend:', response.status);

      // Si es 401, intentar sin autenticación (datos públicos)
      if (response.status === 401) {
        console.log('Intentando obtener datos sin autenticación...');
        // Devolver datos simulados o intentar endpoint público si existe
        return {
          totalMovilizaciones: 0,
          totalAnimales: 0,
          totalAves: 0,
          movilizaciones: [],
          message: 'Requiere autenticación'
        };
      }

      throw new Error('Error al obtener datos del servidor');
    }

    const data = await response.json();

    // Si data.data existe, usarlo, si no, usar data directamente
    const movilizaciones = data.data || data || [];

    // Calcular totales
    let totalMovilizaciones = 0;
    let totalAnimales = 0;
    let totalAves = 0;

    if (Array.isArray(movilizaciones)) {
      totalMovilizaciones = movilizaciones.length;

      movilizaciones.forEach(mov => {
        // Contar animales
        if (mov.Animals && Array.isArray(mov.Animals)) {
          mov.Animals.forEach(animal => {
            totalAnimales += (animal.cantidad || 1);
          });
        }

        // Contar aves
        if (mov.Aves && Array.isArray(mov.Aves)) {
          mov.Aves.forEach(ave => {
            totalAves += (ave.total_aves || ave.total || 0);
          });
        }
      });
    }

    console.log('Datos globales calculados:', {
      totalMovilizaciones,
      totalAnimales,
      totalAves,
      fechaDesde,
      fechaHasta
    });

    return {
      totalMovilizaciones,
      totalAnimales,
      totalAves,
      movilizaciones,
    };
  } catch (error) {
    console.error('Error en obtenerDatosGlobalesMovilizaciones:', error);
    // Devolver datos vacíos en caso de error
    return {
      totalMovilizaciones: 0,
      totalAnimales: 0,
      totalAves: 0,
      movilizaciones: [],
    };
  }
}

// Función alternativa para obtener datos públicos o agregados
async function obtenerDatosPublicos() {
  try {
    // Intentar obtener estadísticas públicas si existe tal endpoint
    const response = await fetch(
      'http://51.178.31.63:3000/api/estadisticas/publicas',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('No hay endpoint de estadísticas públicas disponible');
  }

  // Devolver estructura vacía si no hay datos públicos
  return {
    totalMovilizaciones: 0,
    totalAnimales: 0,
    totalAves: 0,
    movilizaciones: [],
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    // Intentar obtener el token de diferentes fuentes
    let token = null;

    // 1. Desde el header de autorización
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Desde las cookies (si se guarda ahí)
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get('token')?.value;
    }

    // 3. Desde query params (menos seguro, pero útil para testing)
    if (!token) {
      token = searchParams.get('token');
    }

    const filtros = { fechaDesde, fechaHasta };

    // Intentar obtener datos con autenticación si hay token
    let data;
    if (token) {
      data = await obtenerDatosGlobalesMovilizaciones(filtros, token);
    } else {
      // Si no hay token, intentar obtener datos públicos
      console.log('No se encontró token, intentando obtener datos públicos...');
      data = await obtenerDatosPublicos();
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error al obtener los datos globales para el gráfico:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener los datos globales para el gráfico',
      error: error.message,
      data: {
        totalMovilizaciones: 0,
        totalAnimales: 0,
        totalAves: 0,
        movilizaciones: []
      }
    }, { status: 200 }); // Devolver 200 con datos vacíos en lugar de 500
  }
}