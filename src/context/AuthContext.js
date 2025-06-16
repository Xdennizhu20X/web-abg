'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Recuperar desde localStorage si ya estaba logueado
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials) => {
    const { token, user } = await loginUser(credentials);
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user.rol;
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
