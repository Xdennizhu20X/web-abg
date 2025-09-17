// lib/api.js
const API_BASE_URL = "http://51.178.31.63:3000/api";

export const loginUser = async (credentials) => {
  console.log("Enviando credenciales:", credentials);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  console.log("Estado de la respuesta:", response.status);

  let data;
  try {
    data = await response.json();
    console.log("Respuesta del backend (JSON):", data);
  } catch (error) {
    console.error("Error al parsear JSON:", error);
    throw new Error('Error al interpretar la respuesta del servidor');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }

  const token = data.data?.token;
  const usuario = data.data?.usuario;

  if (!token || token.split('.').length !== 3) {
    console.error("Token no válido o no presente:", token);
    throw new Error('Token inválido recibido del servidor');
  }

  // Ya no se decodifica el token, usamos directamente los datos reales
  return {
    token,
    user: usuario // ← Incluye nombre, email, rol, id, etc.
  };
};




export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const responseData = await response.json();

  console.log('Response status:', response.status);
  console.log('Response data:', responseData);

  // Verificar si es un registro exitoso pero pendiente de aprobación
  // Primero verificar en el mensaje de respuesta
  const isPendingUser = responseData.message && (
    responseData.message.includes('pendiente') ||
    responseData.message.includes('aprobación') ||
    responseData.message.includes('espera') ||
    responseData.message.includes('aprobar') ||
    responseData.message.includes('administrador') ||
    responseData.message.toLowerCase().includes('pending') ||
    responseData.message.includes('revisar') ||
    responseData.message.includes('activar')
  );

  // Si la respuesta indica que es un registro pendiente, tratarlo como éxito
  if (isPendingUser) {
    return {
      success: true,
      isPending: true,
      message: responseData.message || 'Usuario registrado, esperando aprobación del administrador',
      data: responseData.data || null
    };
  }

  // Si la respuesta es exitosa (200/201)
  if (response.ok || response.status === 201) {
    return {
      success: true,
      isPending: false,
      message: responseData.message || 'Usuario registrado exitosamente',
      data: responseData.data || null
    };
  }

  // Si es un error real, lanzar excepción
  throw new Error(responseData.message || 'Error al registrar usuario');
};

export const logoutUser = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cerrar sesión');
  }

  return await response.json();
};
