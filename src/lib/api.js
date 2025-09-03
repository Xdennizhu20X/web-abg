// lib/api.js
const API_BASE_URL = "https://51.178.31.63:3000/api";

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

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al registrar usuario');
  }

  return await response.json();
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
