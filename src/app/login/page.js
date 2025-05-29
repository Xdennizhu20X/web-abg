'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Iniciando sesión con:', email, password);

    // Aquí puedes agregar lógica real de autenticación con tu backend
    // Por ahora, redirige directamente al dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm border border-gray-200">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo_abg.png"
            alt="Logo ABG"
            width={220}
            height={80}
            priority
          />
        </div>

        <div className='w-full text-center'>
          <h1 className="text-xl font-semibold text-center bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 inline-block text-transparent bg-clip-text mb-4">
            Gestión de movilización de ABG
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F4C300] focus:outline-none"
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
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-[#F4C300] focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#E10600] hover:bg-red-700 text-white font-medium py-2 rounded-md transition"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-5">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-[#0033A0] hover:underline font-semibold">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
