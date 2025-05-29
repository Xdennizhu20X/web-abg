'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: '',
    ci: '',
    email: '',
    password: '',
  });

  const handleRegister = (e) => {
    e.preventDefault();
    console.log('Registrando usuario:', form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4">
      <div className="bg-gray-200/50 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-300">
        
        {/* Logo institucional */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo_abg.png"
            alt="Logo ABG"
            width={220}
            height={80}
            priority
          />
        </div>

        <div className="w-full text-center">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 inline-block text-transparent bg-clip-text mb-4">
            Registro en ABG
          </h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F4C300] focus:outline-none"
              placeholder="Tu nombre completo"
              required
            />
          </div>
                    <div>
            <label className="block text-sm font-medium text-gray-700">Cedula de Identidad</label>
            <input
              type="text"
              value={form.ci}
              onChange={(e) => setForm({ ...form, ci: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F4C300] focus:outline-none"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F4C300] focus:outline-none"
              placeholder="usuario@abg.gob.ec"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-[#F4C300] focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#E10600] hover:bg-red-700 text-white font-medium py-2 rounded-md transition"
          >
            Registrarse
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#0033A0] hover:underline font-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
