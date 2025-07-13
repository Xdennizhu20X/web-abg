'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Recuperar desde localStorage si ya estaba logueado
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setMounted(true); // Set mounted to true after localStorage is read
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
    // Only render children if the component has mounted on the client
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {mounted && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
