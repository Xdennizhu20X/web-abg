import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Obtener datos de movilizaciones filtrados por cédula desde el backend
async function obtenerDatosMovilizacionesPorCi(filtros, token) {
  try {
    const { ci, fechaDesde, fechaHasta } = filtros;

    if (!ci) {
      return {
        totalMovilizaciones: 0,
        totalAnimales: 0,
        totalAves: 0,
        movilizaciones: [],
        message: 'CI no proporcionado'
      };
    }

    // Primero, obtener todas las movilizaciones filtradas por CI
    const params = new URLSearchParams();
    if (fechaDesde) params.append('fecha_inicio', fechaDesde);
    if (fechaHasta) params.append('fecha_fin', fechaHasta);
    if (ci) params.append('ci', ci);

    // Headers con autenticación
    const headers = {
      'Content-Type': 'application/json',
    };

    // Agregar token si está disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const backendUrl = `http://51.178.31.63:3000/api/movilizaciones/filtrar?${params}`;
    console.log('🌐 URL backend:', backendUrl);
    console.log('📋 Headers enviados:', headers);

    // Llamada al backend real
    const response = await fetch(backendUrl, {
        method: 'GET',
        headers,
      }
    );

    console.log('📡 Status respuesta backend:', response.status);
    console.log('✅ Response OK:', response.ok);

    if (!response.ok) {
      console.error('❌ Error al obtener movilizaciones del backend:', response.status);

      // Si es 401, retornar datos vacíos
      if (response.status === 401) {
        console.log('🔒 Error 401 - Requiere autenticación');
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
    console.log('📊 Respuesta completa del backend filtrar:', data);

    // El backend ahora devuelve la estructura { success, data, total }
    const todasLasMovilizaciones = data.data || [];
    console.log('📋 Total movilizaciones recibidas:', todasLasMovilizaciones.length);

    // NUEVA VERIFICACIÓN: Si no hay movilizaciones, intentar consulta sin filtros de fecha para verificar
    if (todasLasMovilizaciones.length === 0) {
      console.log('🔍 === VERIFICACIÓN SIN FILTROS ===');
      try {
        const responseSinFiltros = await fetch(
          `http://51.178.31.63:3000/api/movilizaciones`,
          {
            method: 'GET',
            headers,
          }
        );

        if (responseSinFiltros.ok) {
          const dataSinFiltros = await responseSinFiltros.json();
          console.log('📊 Total movilizaciones SIN filtros:', dataSinFiltros.length || 0);
          console.log('📊 Estructura primera movilización SIN filtros:', dataSinFiltros[0]);
        }
      } catch (err) {
        console.log('❌ Error verificando sin filtros:', err.message);
      }
      console.log('🔍 === FIN VERIFICACIÓN ===');
    }

    // El backend ya devolvió las movilizaciones filtradas por CI
    console.log('✅ Backend filtró correctamente por CI:', ci);
    console.log('📊 Estructura de primera movilización (ejemplo):', todasLasMovilizaciones[0]);

    const movilizacionesFiltradas = todasLasMovilizaciones;
    console.log('🔍 Movilizaciones ya filtradas por backend:', movilizacionesFiltradas.length);

    // Calcular totales
    let totalMovilizaciones = 0;
    let totalAnimales = 0;
    let totalAves = 0;

    if (Array.isArray(movilizacionesFiltradas)) {
      totalMovilizaciones = movilizacionesFiltradas.length;

      movilizacionesFiltradas.forEach(mov => {
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

    console.log(`Datos para CI ${ci}:`, {
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
      movilizaciones: movilizacionesFiltradas,
    };
  } catch (error) {
    console.error('Error en obtenerDatosMovilizacionesPorCi:', error);
    // Devolver datos vacíos en caso de error
    return {
      totalMovilizaciones: 0,
      totalAnimales: 0,
      totalAves: 0,
      movilizaciones: [],
      error: error.message
    };
  }
}

// Función alternativa que busca por usuario_id si tenemos acceso
async function buscarPorUsuario(ci, token) {
  try {
    // Headers con autenticación
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Intentar buscar el usuario por CI primero
    const response = await fetch(
      `http://51.178.31.63:3000/api/usuarios/buscar-por-ci/${ci}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (response.ok) {
      const userData = await response.json();
      return userData.data?.id || null;
    }
    return null;
  } catch (error) {
    console.error('Error buscando usuario por CI:', error);
    return null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ci = searchParams.get('ci');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    console.log('🔍 === API REPORTES/DATOS-GRAFICO DEBUG ===');
    console.log('📝 Request URL:', request.url);
    console.log('📋 Search Params:', {
      ci,
      fechaDesde,
      fechaHasta
    });

    if (!ci) {
      console.log('❌ CI no proporcionado');
      return NextResponse.json({
        success: false,
        message: 'El número de CI es requerido.'
      }, { status: 400 });
    }

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

    console.log('🔑 Token obtenido:', !!token);
    console.log('📋 Authorization header:', authHeader ? 'Present' : 'Missing');

    const filtros = { ci, fechaDesde, fechaHasta };
    console.log('🔍 Filtros a enviar:', filtros);

    const data = await obtenerDatosMovilizacionesPorCi(filtros, token);

    // Si no encontramos movilizaciones, intentar buscar por usuario_id
    if (data.totalMovilizaciones === 0 && token) {
      const usuarioId = await buscarPorUsuario(ci, token);
      if (usuarioId) {
        // Intentar de nuevo con el usuario_id
        console.log(`Intentando búsqueda alternativa con usuario_id: ${usuarioId}`);
        // Aquí podrías hacer otra búsqueda si tienes un endpoint específico para usuario_id
      }
    }

    // Agregar información de debug para ayudar a entender el problema
    const debugInfo = {
      backendResponse: data,
      filtros,
      totalRecibidas: data.movilizaciones?.length || 0,
      primeraMovilizacion: data.movilizaciones?.[0] || null
    };

    return NextResponse.json({
      success: true,
      data: {
        totalMovilizaciones: data.totalMovilizaciones,
        totalAnimales: data.totalAnimales,
        totalAves: data.totalAves,
        movilizaciones: data.movilizaciones,
      },
      debug: debugInfo // Información adicional para debug
    });
  } catch (error) {
    console.error('Error al obtener los datos para el gráfico:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener los datos para el gráfico',
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