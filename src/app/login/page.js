'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Usamos el contexto de autenticación

 const handleLogin = async (e) => {
  e.preventDefault();

  // Validaciones básicas
  if (!email || !password) {
    setError('Email y contraseña son obligatorios');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError('El formato del email no es válido');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    const role = await login({ email, password });

    // Vaciar los campos
    setEmail('');
    setPassword('');

    await Swal.fire({
      title: '¡Bienvenido!',
      text: 'Has iniciado sesión correctamente',
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#E10600',
    });

    if (role?.toLowerCase() === 'ganadero') {
      await Swal.fire({
        title: 'Acceso denegado',
        text: 'No tienes permisos para acceder al sistema web. Contacta con un técnico.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#E10600',
      });
      return;
    } else if (role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'tecnico') {
      // Alerta de espera antes de redirigir
      await Swal.fire({
        title: 'Redirigiendo...',
        text: 'Por favor espera mientras te llevamos al panel de control.',
        icon: 'info',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        willClose: () => {
          router.push('/dashboard');
        }
      });
    } else {
      await Swal.fire({
        title: 'Rol no reconocido',
        text: `Tu rol "${role}" no tiene permisos de acceso.`,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#E10600',
      });
    }

  } catch (err) {
    console.error('Error en login:', err);

    let errorMessage = 'Ocurrió un error al iniciar sesión';
    if (err.message.includes('credentials')) {
      errorMessage = 'Credenciales incorrectas';
    } else if (err.message.includes('network')) {
      errorMessage = 'Problema de conexión con el servidor';
    }

    await Swal.fire({
      title: 'Error',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#E10600',
    });

  } finally {
    setIsLoading(false);
  }
};

  return (
<div className="min-h-screen flex items-center justify-center bg-white px-4">
  <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm border border-gray-200">
    <div className="flex justify-center mb-6">
      <Image
        src="/logo_abg.png"
        alt="Logo ABG"
        width={200}
        height={80}
        priority
      />
    </div>

    <h1 className="text-xl font-semibold text-center text-[#6e328a] mb-6">
      Gestión de movilización de ABG
    </h1>

    {error && (
      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
        {error}
      </div>
    )}

    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6e328a] focus:outline-none"
          placeholder="usuario@abg.gob.ec"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-[#6e328a] focus:outline-none"
          required
          minLength="6"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-[#6e328a] hover:bg-[#5b2771] text-white font-medium py-2 rounded-md transition duration-200 ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>

    <p className="text-sm text-center text-gray-600 mt-5">
      ¿No tienes cuenta?{' '}
      <Link href="/register" className="text-[#6e328a] hover:underline font-medium">
        Regístrate
      </Link>
    </p>
    <p className="text-sm text-center mt-3">
      <Link href="/forgot-password" className="text-[#6e328a] hover:underline">
        ¿Olvidaste tu contraseña?
      </Link>
    </p>
  </div>
</div>

  );
}