'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmarPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:3000/api/auth/reset-password?token=${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nuevaPassword: password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar la contraseña');
      }

      Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        text: data.message,
        timer: 2000,
        timerProgressBar: true,
        willClose: () => {
          router.push('/login');
        },
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">
          Restablecer Contraseña
        </h2>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F4C300] focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Nueva contraseña"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F4C300] focus:outline-none"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
              placeholder="Confirmar contraseña"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E10600] hover:bg-red-700 text-white font-medium py-2 rounded-md transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Actualizando...' : 'Restablecer'}
          </button>
        </form>
      </div>
    </div>
  );
}
