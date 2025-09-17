import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Obtener datos de movilizaciones filtrados por cédula desde el backend
async function obtenerDatosMovilizacionesPorCedula(filtros, token) {
  try {
    const { cedula, fechaDesde, fechaHasta } = filtros;

    if (!cedula) {
      return {
        totalMovilizaciones: 0,
        totalAnimales: 0,
        totalAves: 0,
        movilizaciones: [],
        message: 'Cédula no proporcionada'
      };
    }

    // Primero, obtener todas las movilizaciones
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

      // Si es 401, retornar datos vacíos
      if (response.status === 401) {
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
    const todasLasMovilizaciones = data.data || data || [];

    // Filtrar por cédula del usuario (puede estar en el Usuario relacionado)
    const movilizacionesFiltradas = todasLasMovilizaciones.filter(mov => {
      // Verificar si la movilización pertenece al usuario con la cédula especificada
      // Puede venir de diferentes formas según la estructura
      if (mov.Usuario) {
        return mov.Usuario.ci === cedula ||
               mov.Usuario.cedula === cedula ||
               mov.Usuario.identificacion === cedula;
      }
      // También verificar en el solicitante si existe
      if (mov.cedula_solicitante) {
        return mov.cedula_solicitante === cedula;
      }
      // Verificar en predios si tienen información del propietario
      if (mov.predio_origen) {
        return mov.predio_origen.propietario_ci === cedula ||
               mov.predio_origen.ci_propietario === cedula;
      }
      return false;
    });

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

    console.log(`Datos para cédula ${cedula}:`, {
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
    console.error('Error en obtenerDatosMovilizacionesPorCedula:', error);
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
async function buscarPorUsuario(cedula, token) {
  try {
    // Headers con autenticación
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Intentar buscar el usuario por cédula primero
    const response = await fetch(
      `http://51.178.31.63:3000/api/usuarios/buscar-por-cedula/${cedula}`,
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
    console.error('Error buscando usuario por cédula:', error);
    return null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cedula = searchParams.get('cedula');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    if (!cedula) {
      return NextResponse.json({
        success: false,
        message: 'El número de cédula es requerido.'
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

    const filtros = { cedula, fechaDesde, fechaHasta };
    const data = await obtenerDatosMovilizacionesPorCedula(filtros, token);

    // Si no encontramos movilizaciones, intentar buscar por usuario_id
    if (data.totalMovilizaciones === 0 && token) {
      const usuarioId = await buscarPorUsuario(cedula, token);
      if (usuarioId) {
        // Intentar de nuevo con el usuario_id
        console.log(`Intentando búsqueda alternativa con usuario_id: ${usuarioId}`);
        // Aquí podrías hacer otra búsqueda si tienes un endpoint específico para usuario_id
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalMovilizaciones: data.totalMovilizaciones,
        totalAnimales: data.totalAnimales,
        totalAves: data.totalAves,
        movilizaciones: data.movilizaciones,
      },
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