'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { registerUser } from '../../lib/api';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: '',
    ci: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'tecnico'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Usamos el contexto de autenticación

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones básicas
    if (!form.nombre || !form.ci || !form.email || !form.password) {
      setError('Todos los campos son obligatorios');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('El formato del email no es válido');
      setIsLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    const ciRegex = /^\d{10}$/;
    if (!ciRegex.test(form.ci)) {
      setError('La cédula debe tener exactamente 10 dígitos');
      setIsLoading(false);
      return;
    }

    try {
      // Registrar al usuario
      const registerResponse = await registerUser(form);

      // Iniciar sesión automáticamente después del registro
      await login({
        email: form.email,
        password: form.password
      });

      await Swal.fire({
        title: '¡Registro exitoso!',
        text: 'Tu cuenta ha sido creada correctamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#E10600',
      });

      // Redirigir al dashboard
      router.push('/dashboard');
      
    } catch (err) {
      setError(err.message || 'Ocurrió un error al registrarse');
      console.error('Register error:', err);
      
      await Swal.fire({
        title: 'Error',
        text: err.message || 'Ocurrió un error al registrarse',
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
  <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200">
    
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
      <h1 className="text-2xl font-bold text-[#6e328a] mb-4 tracking-tight">
        Registro de Técnico
      </h1>
    </div>

    {error && (
      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
        {error}
      </div>
    )}

    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
        <input
          type="text"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e328a]/60 focus:outline-none transition"
          placeholder="Tu nombre completo"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Cédula de Identidad</label>
        <input
          type="text"
          value={form.ci}
          onChange={(e) => setForm({ ...form, ci: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e328a]/60 focus:outline-none transition"
          placeholder="Tu número de cédula"
          required
          maxLength="10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e328a]/60 focus:outline-none transition"
          placeholder="usuario@abg.gob.ec"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
        <input
          type="tel"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e328a]/60 focus:outline-none transition"
          placeholder="0987654321"
          pattern="[\d\s+-]{7,15}"
          title="Número de teléfono (7-15 dígitos, puede incluir +, - o espacios)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e328a]/60 focus:outline-none transition"
          required
          minLength="6"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-[#6e328a] hover:bg-[#58266f] text-white font-semibold py-2 rounded-lg transition-all ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Registrando...' : 'Registrarse como Técnico'}
      </button>
    </form>

    <p className="text-sm text-center text-gray-600 mt-5">
      ¿Ya tienes cuenta?{' '}
      <Link href="/login" className="text-[#6e328a] hover:underline font-semibold">
        Inicia sesión
      </Link>
    </p>
  </div>
</div>

  );
}