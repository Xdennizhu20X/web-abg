'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const { login } = useAuth(); // Usamos el contexto de autenticación

  // Verificar si viene del registro pendiente
  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'pending') {
      Swal.fire({
        title: 'Cuenta Pendiente de Aprobación',
        text: 'Tu cuenta ha sido registrada exitosamente, pero está pendiente de aprobación por un administrador. No podrás iniciar sesión hasta que sea aprobada.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f59e0b',
        allowOutsideClick: false
      });
    }
  }, [searchParams]);

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
    } else if (role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'tecnico' || role?.toLowerCase() === 'faenador') {
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

    let title = 'Error';
    let icon = 'error';
    let errorMessage = 'Ocurrió un error al iniciar sesión';

    // Verificar si es un usuario pendiente de aprobación
    if (err.message.includes('pendiente') ||
        err.message.includes('aprobación') ||
        err.message.includes('espera') ||
        err.message.toLowerCase().includes('pending') ||
        err.message.includes('no aprobado') ||
        err.message.includes('cuenta inactiva')) {

      title = 'Cuenta Pendiente';
      icon = 'warning';
      errorMessage = 'Tu cuenta está pendiente de aprobación por un administrador. Por favor espera a que sea activada.';

    } else if (err.message.includes('credentials') || err.message.includes('credenciales')) {
      errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
    } else if (err.message.includes('network') || err.message.includes('conexión')) {
      errorMessage = 'Problema de conexión con el servidor. Intenta nuevamente.';
    } else if (err.message.includes('suspendida') || err.message.includes('bloqueada')) {
      title = 'Cuenta Suspendida';
      icon = 'warning';
      errorMessage = 'Tu cuenta ha sido suspendida. Contacta con un administrador.';
    }

    await Swal.fire({
      title: title,
      text: errorMessage,
      icon: icon,
      confirmButtonText: 'Entendido',
      confirmButtonColor: icon === 'warning' ? '#f59e0b' : '#E10600',
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
        src="/nuevologo.png"
        alt="Logo ABG"
        width={400}
        height={100}
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